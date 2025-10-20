import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div *ngIf="cartItems.length === 0" class="text-center py-16">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"></path>
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p class="text-gray-600 mb-6">Start shopping to add items to your cart</p>
        <a routerLink="/products" class="bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors">
          Continue Shopping
        </a>
      </div>

      <div *ngIf="cartItems.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-2 space-y-4">
          <div *ngFor="let item of cartItems" class="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4">
            <img 
              [src]="item.product.image || '/api/placeholder/100/100'" 
              [alt]="item.product.name"
              class="w-20 h-20 object-cover rounded-lg"
            >
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900">{{ item.product.name }}</h3>
              <p class="text-gray-600 text-sm">{{ item.product.description | slice:0:100 }}...</p>
              <p class="text-lg font-bold text-gray-900 mt-2">\${{ item.product.price }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <button 
                (click)="updateQuantity(item.product.id, item.quantity - 1)"
                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <span class="w-8 text-center">{{ item.quantity }}</span>
              <button 
                (click)="updateQuantity(item.product.id, item.quantity + 1)"
                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
            <button 
              (click)="removeItem(item.product.id)"
              class="text-red-500 hover:text-red-700 p-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-semibold">\${{ getSubtotal() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping</span>
              <span class="font-semibold">{{ getSubtotal() >= 50 ? 'Free' : '$9.99' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Tax</span>
              <span class="font-semibold">\${{ getTax() }}</span>
            </div>
            <hr class="my-4">
            <div class="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>\${{ getTotal() }}</span>
            </div>
          </div>
          <button 
            routerLink="/checkout"
            class="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors mt-6"
          >
            Proceed to Checkout
          </button>
          <a 
            routerLink="/products"
            class="block text-center text-brand hover:text-brand-dark mt-4 font-medium"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    </div>
  `
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateQuantity(productId: string, quantity: number): void {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getTax(): number {
    return Math.round(this.getSubtotal() * 0.08 * 100) / 100; // 8% tax
  }

  getShipping(): number {
    return this.getSubtotal() >= 50 ? 0 : 9.99;
  }

  getTotal(): number {
    return Math.round((this.getSubtotal() + this.getTax() + this.getShipping()) * 100) / 100;
  }
}