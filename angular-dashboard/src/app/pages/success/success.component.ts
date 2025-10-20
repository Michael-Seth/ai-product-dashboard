import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <!-- Success Icon -->
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <!-- Success Message -->
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
      <p class="text-lg text-gray-600 mb-8">
        Thank you for your purchase. Your order has been confirmed and will be shipped soon.
      </p>

      <!-- Order Details -->
      <div class="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h2 class="font-semibold text-gray-900 mb-4">Order Details</h2>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Order Number:</span>
            <span class="font-medium">#{{ orderNumber }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Order Date:</span>
            <span class="font-medium">{{ orderDate | date:'short' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Estimated Delivery:</span>
            <span class="font-medium">{{ deliveryDate | date:'mediumDate' }}</span>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <div class="bg-blue-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 class="font-semibold text-blue-900 mb-3">What's Next?</h3>
        <ul class="space-y-2 text-sm text-blue-800">
          <li class="flex items-start space-x-2">
            <svg class="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span>You'll receive an email confirmation shortly</span>
          </li>
          <li class="flex items-start space-x-2">
            <svg class="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span>We'll send tracking information when your order ships</span>
          </li>
          <li class="flex items-start space-x-2">
            <svg class="w-4 h-4 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span>Your order will be delivered in 2-3 business days</span>
          </li>
        </ul>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-4">
        <a 
          routerLink="/products" 
          class="inline-block bg-brand text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors"
        >
          Continue Shopping
        </a>
        <div>
          <button class="text-brand hover:text-brand-dark font-medium">
            View Order Details
          </button>
        </div>
      </div>

      <!-- Customer Support -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <p class="text-gray-600 text-sm mb-4">
          Need help with your order?
        </p>
        <div class="flex justify-center space-x-6 text-sm">
          <a href="#" class="text-brand hover:text-brand-dark font-medium">
            Contact Support
          </a>
          <a href="#" class="text-brand hover:text-brand-dark font-medium">
            Track Your Order
          </a>
          <a href="#" class="text-brand hover:text-brand-dark font-medium">
            Return Policy
          </a>
        </div>
      </div>
    </div>
  `
})
export class SuccessComponent {
  orderNumber = this.generateOrderNumber();
  orderDate = new Date();
  deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  private generateOrderNumber(): string {
    return 'TS' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
}