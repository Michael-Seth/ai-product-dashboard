import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Product } from '@ai-product-dashboard/shared-types';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="product">
      <!-- Breadcrumb -->
      <nav class="mb-8">
        <ol class="flex items-center space-x-2 text-sm text-gray-500">
          <li><a routerLink="/products" class="hover:text-brand">Products</a></li>
          <li><span class="mx-2">/</span></li>
          <li class="text-gray-900">{{ product.name }}</li>
        </ol>
      </nav>

      <!-- Product Details -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <!-- Product Images -->
        <div class="space-y-4">
          <div class="aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img 
              [src]="product.image || '/api/placeholder/600/600'" 
              [alt]="product.name"
              class="w-full h-full object-cover"
            >
          </div>
          <!-- Thumbnail images could go here -->
        </div>

        <!-- Product Info -->
        <div class="space-y-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h1>
            <p class="text-lg text-gray-600">{{ product.description }}</p>
          </div>

          <!-- Price -->
          <div class="flex items-baseline space-x-4">
            <span class="text-4xl font-bold text-gray-900">\${{ product.price }}</span>
            <span class="text-xl text-gray-500 line-through" *ngIf="product.originalPrice">
              \${{ product.originalPrice }}
            </span>
            <span class="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full" *ngIf="product.originalPrice">
              Save \${{ (product.originalPrice || 0) - product.price }}
            </span>
          </div>

          <!-- Features -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Key Features</h3>
            <ul class="space-y-2">
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-gray-700">Premium build quality</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-gray-700">Latest technology</span>
              </li>
              <li class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-gray-700">1-year warranty included</span>
              </li>
            </ul>
          </div>

          <!-- Quantity and Add to Cart -->
          <div class="space-y-4">
            <div class="flex items-center space-x-4">
              <label class="text-sm font-medium text-gray-700">Quantity:</label>
              <div class="flex items-center border border-gray-300 rounded-lg">
                <button 
                  (click)="decreaseQuantity()"
                  class="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  -
                </button>
                <span class="px-4 py-2 border-x border-gray-300">{{ quantity }}</span>
                <button 
                  (click)="increaseQuantity()"
                  class="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  +
                </button>
              </div>
            </div>

            <div class="flex space-x-4">
              <button 
                (click)="addToCart()"
                class="flex-1 bg-brand text-white py-3 px-6 rounded-lg font-medium hover:bg-brand-dark transition-colors flex items-center justify-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
                </svg>
                <span>Add to Cart</span>
              </button>
              <button class="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Shipping Info -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-sm text-gray-700">Free shipping on orders over $50</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-sm text-gray-700">Estimated delivery: 2-3 business days</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Recommendations Section -->
      <div class="border-t border-gray-200 pt-16">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">You Might Also Like</h2>
          <p class="text-gray-600">AI-powered recommendations based on this product</p>
        </div>
        
        <!-- React Recommender Widget -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          @if (webComponentError) {
            <div class="text-center py-8">
              <p class="text-gray-500 mb-4">Unable to load recommendations</p>
              <button 
                (click)="loadReactWebComponent()"
                class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
              >
                Retry
              </button>
            </div>
          } @else if (!webComponentLoaded) {
            <div class="text-center py-8">
              <div class="loading-spinner mx-auto mb-4"></div>
              <p class="text-gray-600">Loading AI recommendations...</p>
            </div>
          } @else {
            <react-recommender [attr.product]="productJson"></react-recommender>
          }
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div class="loading-spinner mx-auto mb-4"></div>
      <p class="text-gray-600">Loading product details...</p>
    </div>
  `
})
export class ProductDetailPageComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  quantity = 1;
  webComponentLoaded = false;
  webComponentError = false;
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
        const productId = params['id'];
        this.loadProduct(productId);
      })
    );

    this.loadReactWebComponent();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.router.navigate(['/products']);
      }
    });
  }

  async loadReactWebComponent(): Promise<void> {
    try {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/react-recommender.css';
      cssLink.onerror = () => {
        console.warn('React web component CSS not found');
      };
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = '/react-recommender.umd.js';
      script.async = true;
      
      script.onload = () => {
        this.webComponentLoaded = true;
      };
      
      script.onerror = () => {
        this.webComponentError = true;
      };
      
      document.head.appendChild(script);
    } catch (error) {
      this.webComponentError = true;
    }
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity);
      // You could add a success toast here
      console.log(`Added ${this.quantity} ${this.product.name}(s) to cart`);
    }
  }

  get productJson(): string {
    return this.product ? JSON.stringify(this.product) : '';
  }
}