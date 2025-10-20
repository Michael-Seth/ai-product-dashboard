import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Product } from '@ai-product-dashboard/shared-types';
import { Recommender } from '../app/components/Recommender';
import { ErrorBoundary } from '../app/components/ErrorBoundary';
import { setupStore } from '../store';

/**
 * Web Component wrapper for the React Recommender widget
 * Allows embedding the React component in Angular applications
 */
export class RecommenderElement extends HTMLElement {
  private root: Root | null = null;
  private store = setupStore();
  private renderTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.style.display = 'block';
    this.style.width = '100%';
    console.log('RecommenderElement constructor called');
  }

  /**
   * Observed attributes that trigger attributeChangedCallback
   */
  static get observedAttributes() {
    return ['product'];
  }

  /**
   * Called when the element is added to the DOM
   */
  connectedCallback() {
    console.log('RecommenderElement connected to DOM');
    try {
      this.render();
    } catch (error) {
      console.error('Error in connectedCallback:', error);
      this.renderErrorFallback('Failed to initialize recommendation widget');
    }
  }

  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback() {
    console.log('RecommenderElement disconnected from DOM');
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
    try {
      if (this.root) {
        this.root.unmount();
        this.root = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log(`RecommenderElement attribute ${name} changed from ${oldValue} to ${newValue}`);
    if (name === 'product' && oldValue !== newValue) {
      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout);
      }
      
      this.renderTimeout = setTimeout(() => {
        try {
          this.render();
        } catch (error) {
          console.error('Error in attributeChangedCallback:', error);
          this.renderErrorFallback('Failed to update recommendations');
        }
      }, 100);
    }
  }

  /**
   * Parse the product attribute from JSON string with validation
   */
  private parseProduct(): Product | null {
    const productAttr = this.getAttribute('product');
    
    if (!productAttr) {
      return null;
    }

    try {
      const parsed = JSON.parse(productAttr);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Product must be an object');
      }

      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('Product must have a valid name');
      }

      console.log('Parsed product:', parsed);
      return parsed as Product;
    } catch (error) {
      console.error('Failed to parse product attribute:', error, 'Raw value:', productAttr);
      return null;
    }
  }

  /**
   * Render a simple error fallback directly to the DOM
   */
  private renderErrorFallback(message: string) {
    this.innerHTML = `
      <div style="
        padding: 1rem;
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 0.5rem;
        color: #991b1b;
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <div style="font-weight: 600; margin-bottom: 0.5rem;">
          Recommendation Widget Error
        </div>
        <div style="font-size: 0.875rem; margin-bottom: 0.75rem;">
          ${message}
        </div>
        <button 
          onclick="window.location.reload()" 
          style="
            padding: 0.5rem 1rem;
            background-color: #dc2626;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
          "
        >
          Reload Page
        </button>
      </div>
    `;
  }

  /**
   * Render the React component within the Web Component
   */
  private render() {
    console.log('RecommenderElement render called');
    
    try {
      if (!this.root) {
        // Clear any existing content
        this.innerHTML = '';
        
        // Create a container div for React
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        
        this.appendChild(container);
        this.root = createRoot(container);
      }

      // Parse product data from attribute with validation
      const product = this.parseProduct();

      // Custom error boundary fallback for web component context
      const errorFallback = (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <div className="text-red-800 font-semibold mb-2">
            Widget Error
          </div>
          <div className="text-red-700 text-sm mb-3">
            The recommendation widget encountered an error and needs to be reloaded.
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );

      // Render React component with error boundary protection
      this.root.render(
        <ErrorBoundary fallback={errorFallback}>
          <Provider store={this.store}>
            <ErrorBoundary fallback={errorFallback}>
              <div className="w-full h-full">
                <Recommender product={product} />
              </div>
            </ErrorBoundary>
          </Provider>
        </ErrorBoundary>
      );
    } catch (error) {
      console.error('Critical error in render method:', error);
      this.renderErrorFallback('Critical rendering error occurred');
    }
  }
}