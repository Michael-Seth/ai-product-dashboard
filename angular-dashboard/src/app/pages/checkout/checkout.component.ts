import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Checkout Form -->
        <div class="space-y-8">
          <!-- Shipping Information -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="shippingInfo.firstName"
                    name="firstName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    [(ngModel)]="shippingInfo.lastName"
                    name="lastName"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  [(ngModel)]="shippingInfo.email"
                  name="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  required
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  [(ngModel)]="shippingInfo.address"
                  name="address"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  required
                >
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    [(ngModel)]="shippingInfo.city"
                    name="city"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input 
                    type="text" 
                    [(ngModel)]="shippingInfo.state"
                    name="state"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input 
                    type="text" 
                    [(ngModel)]="shippingInfo.zipCode"
                    name="zipCode"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
              </div>
            </form>
          </div>

          <!-- Payment Information -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  [(ngModel)]="paymentInfo.cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  required
                >
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    [(ngModel)]="paymentInfo.expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="text" 
                    [(ngModel)]="paymentInfo.cvv"
                    name="cvv"
                    placeholder="123"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                    required
                  >
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="paymentInfo.cardholderName"
                  name="cardholderName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
                  required
                >
              </div>
            </form>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <!-- Cart Items -->
          <div class="space-y-3 mb-6">
            <div *ngFor="let item of cartItems" class="flex items-center space-x-3">
              <img 
                [src]="item.product.image || '/api/placeholder/60/60'" 
                [alt]="item.product.name"
                class="w-12 h-12 object-cover rounded"
              >
              <div class="flex-1">
                <p class="font-medium text-sm">{{ item.product.name }}</p>
                <p class="text-gray-600 text-xs">Qty: {{ item.quantity }}</p>
              </div>
              <p class="font-semibold text-sm">\${{ item.product.price * item.quantity }}</p>
            </div>
          </div>

          <!-- Totals -->
          <div class="space-y-3 border-t pt-4">
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
            (click)="placeOrder()"
            [disabled]="isProcessing"
            class="w-full bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors mt-6 disabled:opacity-50"
          >
            {{ isProcessing ? 'Processing...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  isProcessing = false;

  shippingInfo = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };

  paymentInfo = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  };

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/cart']);
      }
    });
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  getTax(): number {
    return Math.round(this.getSubtotal() * 0.08 * 100) / 100;
  }

  getShipping(): number {
    return this.getSubtotal() >= 50 ? 0 : 9.99;
  }

  getTotal(): number {
    return Math.round((this.getSubtotal() + this.getTax() + this.getShipping()) * 100) / 100;
  }

  placeOrder(): void {
    this.isProcessing = true;
    setTimeout(() => {
      this.cartService.clearCart();
      this.router.navigate(['/success']);
    }, 2000);
  }
}