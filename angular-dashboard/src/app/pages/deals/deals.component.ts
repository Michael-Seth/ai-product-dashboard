import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Product } from '@ai-product-dashboard/shared-types';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: Date;
  products: Product[];
  type: 'flash' | 'daily' | 'weekly' | 'clearance';
}

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <div class="inline-block mb-4 px-4 py-2 bg-red-100 border border-red-200 rounded-full">
          <span class="text-sm font-medium text-red-600">🔥 Limited Time Offers</span>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Amazing Deals & Discounts
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Don't miss out on these incredible savings! Limited time offers on premium tech products.
        </p>
      </div>

      <!-- Deal Categories -->
      <div class="mb-12">
        <div class="flex flex-wrap justify-center gap-4">
          <button 
            *ngFor="let type of dealTypes"
            (click)="setActiveType(type.key)"
            [class]="activeType === type.key ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700'"
            class="px-6 py-3 rounded-lg font-medium hover:bg-brand hover:text-white transition-colors flex items-center gap-2"
          >
            <span>{{ type.icon }}</span>
            <span>{{ type.label }}</span>
          </button>
        </div>
      </div>

      <!-- Flash Deals Banner -->
      <div class="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white mb-12" *ngIf="activeType === 'flash'">
        <div class="text-center">
          <h2 class="text-3xl font-bold mb-4">⚡ Flash Sale</h2>
          <p class="text-xl mb-6">Up to 50% off - Limited time only!</p>
          <div class="flex justify-center items-center space-x-4 text-2xl font-bold">
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <span>{{ timeLeft.hours }}</span>
              <div class="text-sm font-normal">Hours</div>
            </div>
            <span>:</span>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <span>{{ timeLeft.minutes }}</span>
              <div class="text-sm font-normal">Minutes</div>
            </div>
            <span>:</span>
            <div class="bg-white bg-opacity-20 rounded-lg p-3">
              <span>{{ timeLeft.seconds }}</span>
              <div class="text-sm font-normal">Seconds</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Deals Grid -->
      <div class="space-y-12">
        <div *ngFor="let deal of filteredDeals" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <!-- Deal Header -->
          <div class="bg-gradient-to-r from-brand to-brand-dark p-6 text-white">
            <div class="flex justify-between items-center">
              <div>
                <h2 class="text-2xl font-bold mb-2">{{ deal.title }}</h2>
                <p class="text-brand-light">{{ deal.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-3xl font-bold">{{ deal.discount }}% OFF</div>
                <div class="text-sm text-brand-light">
                  Valid until {{ deal.validUntil | date:'mediumDate' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Products in Deal -->
          <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div 
                *ngFor="let product of deal.products" 
                class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer group"
                (click)="viewProduct(product)"
              >
                <!-- Product Image -->
                <div class="aspect-square bg-white rounded-lg mb-4 overflow-hidden">
                  <img 
                    [src]="product.image || '/api/placeholder/200/200'" 
                    [alt]="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  >
                </div>

                <!-- Product Info -->
                <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                  {{ product.name }}
                </h3>
                
                <!-- Price with Discount -->
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <div class="text-lg font-bold text-gray-900">
                      \${{ getDiscountedPrice(product.price, deal.discount) }}
                    </div>
                    <div class="text-sm text-gray-500 line-through">
                      \${{ product.price }}
                    </div>
                  </div>
                  <div class="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                    Save \${{ getSavings(product.price, deal.discount) }}
                  </div>
                </div>

                <!-- Add to Cart Button -->
                <button 
                  (click)="addToCart(product, $event)"
                  class="w-full bg-brand text-white py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Signup -->
      <div class="mt-16 bg-gray-900 rounded-2xl p-8 text-white text-center">
        <h2 class="text-2xl font-bold mb-4">Never Miss a Deal!</h2>
        <p class="text-gray-300 mb-6">Subscribe to get notified about flash sales and exclusive offers.</p>
        <div class="flex max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="Enter your email"
            class="flex-1 px-4 py-3 rounded-l-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
          >
          <button class="bg-brand px-6 py-3 rounded-r-lg font-medium hover:bg-brand-dark transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  `
})
export class DealsComponent implements OnInit {
  activeType = 'flash';
  timeLeft = { hours: 23, minutes: 45, seconds: 30 };
  allProducts: Product[] = [];

  dealTypes = [
    { key: 'flash', label: 'Flash Sale', icon: '⚡' },
    { key: 'daily', label: 'Daily Deals', icon: '📅' },
    { key: 'weekly', label: 'Weekly Specials', icon: '📆' },
    { key: 'clearance', label: 'Clearance', icon: '🏷️' }
  ];

  deals: Deal[] = [
    {
      id: '1',
      title: 'Flash Sale - Tech Essentials',
      description: 'Limited time offer on premium laptops and accessories',
      discount: 25,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      products: [],
      type: 'flash'
    },
    {
      id: '2',
      title: 'Daily Deal - Smartphones',
      description: 'Today only - save big on latest smartphones',
      discount: 15,
      validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      products: [],
      type: 'daily'
    },
    {
      id: '3',
      title: 'Weekly Special - Audio Gear',
      description: 'This week only - premium audio accessories',
      discount: 30,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      products: [],
      type: 'weekly'
    },
    {
      id: '4',
      title: 'Clearance Sale - Last Chance',
      description: 'Final markdowns on select items',
      discount: 40,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      products: [],
      type: 'clearance'
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.startCountdown();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe(products => {
      this.allProducts = products;
      this.assignProductsToDeals();
    });
  }

  private assignProductsToDeals(): void {
    // Assign products to different deals
    this.deals[0].products = this.allProducts.filter(p => p.category === 'Laptops').slice(0, 4);
    this.deals[1].products = this.allProducts.filter(p => p.category === 'Smartphones');
    this.deals[2].products = this.allProducts.filter(p => p.category === 'Accessories');
    this.deals[3].products = this.allProducts.slice(0, 3); // Mix of products for clearance
  }

  private startCountdown(): void {
    setInterval(() => {
      if (this.timeLeft.seconds > 0) {
        this.timeLeft.seconds--;
      } else if (this.timeLeft.minutes > 0) {
        this.timeLeft.minutes--;
        this.timeLeft.seconds = 59;
      } else if (this.timeLeft.hours > 0) {
        this.timeLeft.hours--;
        this.timeLeft.minutes = 59;
        this.timeLeft.seconds = 59;
      }
    }, 1000);
  }

  get filteredDeals(): Deal[] {
    return this.deals.filter(deal => deal.type === this.activeType);
  }

  setActiveType(type: string): void {
    this.activeType = type;
  }

  getDiscountedPrice(originalPrice: number, discount: number): number {
    return Math.round((originalPrice * (1 - discount / 100)) * 100) / 100;
  }

  getSavings(originalPrice: number, discount: number): number {
    return Math.round((originalPrice * (discount / 100)) * 100) / 100;
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
    console.log('Added to cart:', product.name);
  }
}