import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Category {
  name: string;
  description: string;
  image: string;
  productCount: number;
  slug: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Shop by Category
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our carefully curated categories of premium technology products. 
          Find exactly what you're looking for with our organized collections.
        </p>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          *ngFor="let category of categories" 
          class="group cursor-pointer"
          [routerLink]="['/category', category.slug]"
        >
          <div class="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <!-- Category Image -->
            <div class="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              <img 
                [src]="category.image" 
                [alt]="category.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              >
              <div class="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300"></div>
              <div class="absolute bottom-4 left-4 text-white">
                <span class="bg-brand px-3 py-1 rounded-full text-sm font-medium">
                  {{ category.productCount }} Products
                </span>
              </div>
            </div>

            <!-- Category Info -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">
                {{ category.name }}
              </h3>
              <p class="text-gray-600 mb-4">
                {{ category.description }}
              </p>
              
              <div class="flex items-center text-brand font-medium group-hover:text-brand-dark transition-colors">
                <span>Shop {{ category.name }}</span>
                <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Featured Categories -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Categories</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            *ngFor="let category of featuredCategories" 
            class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 text-center cursor-pointer"
            [routerLink]="['/category', category.slug]"
          >
            <div class="w-12 h-12 bg-brand bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
            </div>
            <h4 class="font-semibold text-gray-900 text-sm">{{ category.name }}</h4>
            <p class="text-xs text-gray-500 mt-1">{{ category.productCount }} items</p>
          </div>
        </div>
      </div>

      <!-- Category Benefits -->
      <div class="mt-16 bg-gray-50 rounded-2xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Why Shop by Category?</h2>
          <p class="text-gray-600">Make your shopping experience more efficient and enjoyable</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Easy Discovery</h3>
            <p class="text-gray-600 text-sm">Find products faster with organized categories</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">Quality Assured</h3>
            <p class="text-gray-600 text-sm">Curated products in each category</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-brand rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">AI Recommendations</h3>
            <p class="text-gray-600 text-sm">Get personalized suggestions within each category</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoriesComponent {
  categories: Category[] = [
    {
      name: 'Laptops',
      description: 'High-performance laptops for work, gaming, and creativity. From ultrabooks to gaming rigs.',
      image: 'https://via.placeholder.com/400x250/f3f4f6/374151?text=Laptops',
      productCount: 4,
      slug: 'laptops'
    },
    {
      name: 'Smartphones',
      description: 'Latest smartphones with cutting-edge technology, cameras, and performance.',
      image: 'https://via.placeholder.com/400x250/f3f4f6/374151?text=Smartphones',
      productCount: 2,
      slug: 'smartphones'
    },
    {
      name: 'Accessories',
      description: 'Essential tech accessories including headphones, mice, keyboards, and more.',
      image: 'https://via.placeholder.com/400x250/f3f4f6/374151?text=Accessories',
      productCount: 2,
      slug: 'accessories'
    }
  ];

  featuredCategories: Category[] = [
    { name: 'Gaming', description: '', image: '', productCount: 12, slug: 'gaming' },
    { name: 'Audio', description: '', image: '', productCount: 8, slug: 'audio' },
    { name: 'Tablets', description: '', image: '', productCount: 6, slug: 'tablets' },
    { name: 'Wearables', description: '', image: '', productCount: 4, slug: 'wearables' }
  ];
}