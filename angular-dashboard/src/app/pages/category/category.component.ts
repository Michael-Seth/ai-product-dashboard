import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Product } from '@ai-product-dashboard/shared-types';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-8">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li><a routerLink="/categories" class="hover:text-brand">Categories</a></li>
          <li><span class="mx-2">/</span></li>
          <li class="text-gray-900 capitalize">{{ categoryName }}</li>
        </ol>
      </nav>

      <!-- Category Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4 capitalize">
          {{ categoryName }}
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{ getCategoryDescription() }}
        </p>
        <div class="mt-4">
          <span class="bg-brand bg-opacity-10 text-brand px-4 py-2 rounded-full text-sm font-medium">
            {{ products.length }} Products Available
          </span>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-8 flex flex-wrap gap-4 justify-center">
        <button 
          (click)="setSortBy('name')"
          [class]="sortBy === 'name' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium hover:bg-brand hover:text-white transition-colors"
        >
          Name
        </button>
        <button 
          (click)="setSortBy('price-low')"
          [class]="sortBy === 'price-low' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium hover:bg-brand hover:text-white transition-colors"
        >
          Price: Low to High
        </button>
        <button 
          (click)="setSortBy('price-high')"
          [class]="sortBy === 'price-high' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium hover:bg-brand hover:text-white transition-colors"
        >
          Price: High to Low
        </button>
        <button 
          (click)="setSortBy('rating')"
          [class]="sortBy === 'rating' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-700'"
          class="px-4 py-2 rounded-lg font-medium hover:bg-brand hover:text-white transition-colors"
        >
          Highest Rated
        </button>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" *ngIf="sortedProducts.length > 0">
        <div 
          *ngFor="let product of sortedProducts" 
          class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
          (click)="viewProduct(product)"
        >
          <!-- Product Image -->
          <div class="aspect-square bg-gray-100 relative overflow-hidden">
            <img 
              [src]="product.image || '/api/placeholder/300/300'" 
              [alt]="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            >
            <div class="absolute top-3 right-3" *ngIf="product.originalPrice">
              <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Sale
              </span>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-6">
            <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors">
              {{ product.name }}
            </h3>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">
              {{ product.description }}
            </p>
            
            <!-- Rating -->
            <div class="flex items-center mb-3" *ngIf="product.rating">
              <div class="flex items-center">
                <span *ngFor="let star of getStars(product.rating)" class="text-yellow-400">★</span>
                <span class="text-gray-300" *ngFor="let star of getEmptyStars(product.rating)">★</span>
              </div>
              <span class="text-sm text-gray-500 ml-2">({{ product.reviews }})</span>
            </div>
            
            <!-- Price and Actions -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-2xl font-bold text-gray-900">
                  \${{ product.price }}
                </span>
                <span class="text-sm text-gray-500 line-through" *ngIf="product.originalPrice">
                  \${{ product.originalPrice }}
                </span>
              </div>
              
              <button 
                (click)="addToCart(product, $event)"
                class="bg-brand text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="sortedProducts.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-4.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"></path>
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">No products found</h2>
        <p class="text-gray-600 mb-6">We're working on adding more products to this category.</p>
        <a routerLink="/products" class="bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors">
          Browse All Products
        </a>
      </div>

      <!-- Category Features -->
      <div class="mt-16 bg-gray-50 rounded-2xl p-8" *ngIf="sortedProducts.length > 0">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Why Choose Our {{ categoryName }}?</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Premium Quality</h3>
            <p class="text-gray-600 text-sm">Hand-picked products from trusted brands</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Best Prices</h3>
            <p class="text-gray-600 text-sm">Competitive pricing with regular deals</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Fast Shipping</h3>
            <p class="text-gray-600 text-sm">Quick delivery with tracking included</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CategoryComponent implements OnInit, OnDestroy {
  categoryName = '';
  products: Product[] = [];
  sortBy = 'name';
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.params.subscribe(params => {
        this.categoryName = params['name'];
        this.loadCategoryProducts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadCategoryProducts(): void {
    this.productService.getProductsByCategory(this.categoryName).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading category products:', error);
      }
    });
  }

  get sortedProducts(): Product[] {
    const sorted = [...this.products];
    
    switch (this.sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  }

  setSortBy(sortType: string): void {
    this.sortBy = sortType;
  }

  getCategoryDescription(): string {
    const descriptions: { [key: string]: string } = {
      'laptops': 'Discover our premium collection of laptops designed for work, gaming, and creativity.',
      'smartphones': 'Explore the latest smartphones with cutting-edge technology and innovative features.',
      'accessories': 'Essential tech accessories to enhance your digital lifestyle and productivity.',
      'gaming': 'High-performance gaming gear for the ultimate gaming experience.',
      'audio': 'Premium audio equipment for music lovers and professionals.',
      'tablets': 'Versatile tablets for work, entertainment, and creative projects.',
      'wearables': 'Smart wearables to track your fitness and stay connected.'
    };
    
    return descriptions[this.categoryName] || `Browse our selection of ${this.categoryName} products.`;
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product);
  }
}