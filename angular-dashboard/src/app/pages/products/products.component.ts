import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '@ai-product-dashboard/shared-types';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Products
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our curated collection of premium technology products, each carefully selected for quality and innovation.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-8 flex flex-wrap gap-4 justify-center">
        <button class="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand-dark transition-colors">
          All Products
        </button>
        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          Laptops
        </button>
        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          Smartphones
        </button>
        <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
          Accessories
        </button>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          *ngFor="let product of products" 
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
            <div class="absolute top-3 right-3">
              <span class="bg-brand text-white text-xs px-2 py-1 rounded-full font-medium">
                New
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

      <!-- Loading State -->
      <div *ngIf="products.length === 0" class="text-center py-12">
        <div class="loading-spinner mx-auto mb-4"></div>
        <p class="text-gray-600">Loading amazing products...</p>
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
export class ProductsComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation(); // Prevent navigation when clicking add to cart
    this.cartService.addToCart(product);
  }
}