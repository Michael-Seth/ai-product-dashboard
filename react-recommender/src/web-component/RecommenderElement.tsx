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
  private _product: Product | null = null;

  constructor() {
    super();
    console.log('RecommenderElement constructor called');
  }

  /**
   * Property setter for product (alternative to attribute)
   */
  set product(value: Product | null) {
    console.log('Product property setter called:', value);
    this._product = value;
    if (this.isConnected) {
      this.render();
    }
  }

  get product(): Product | null {
    return this._product || this.parseProduct();
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
    // Render if we have a product (either from attribute or property)
    if (this.hasAttribute('product') || this._product) {
      try {
        this.render();
      } catch (error) {
        console.error('ror in connectedCallback:', error);
        this.renderErrorFallback('Failed to initialize recommendation widget');
      }
    } else {
      console.log('Waiting for product...');
    }
  }

  /**
   * Called when the element is removed from the DOM
   */
  disconnectedCallback() {
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
      console.error('ror during cleanup:', error);
    }
  }

  /**
   * Called when observed attributes change
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    console.log('attributeChangedCallback called:', { name, oldValue: oldValue?.substring(0, 50), newValue: newValue?.substring(0, 50) });
    
    if (name === 'product' && oldValue !== newValue) {
      console.log('Product attribute changed, scheduling render...');

      if (this.renderTimeout) {
        clearTimeout(this.renderTimeout);
      }

      this.renderTimeout = setTimeout(() => {
        try {
          console.log('Calling render from attributeChangedCallback...');
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

    console.log('Parsing product attribute:', productAttr);

    if (!productAttr) {
      console.log('No product attribute found');
      return null;
    }

    try {
      const parsed = JSON.parse(productAttr);
      console.log('Successfully parsed product:', parsed);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('oduct must be an object');
      }

      if (!parsed.name || typeof parsed.name !== 'string') {
        throw new Error('oduct must have a valid name');
      }
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
    try {
      console.log('Rendering web component...');

      if (!this.root) {
        console.log('Creating new React root...');

        this.innerHTML = '';

        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';

        this.appendChild(container);
        this.root = createRoot(container);
      }

      // Use _product property if set, otherwise parse from attribute
      const product = this._product || this.parseProduct();
      console.log('Product for rendering:', product);
      console.log('Product source:', this._product ? 'property' : 'attribute');

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

      console.log('Rendering React component with product:', product);
      this.root.render(
        <ErrorBoundary>
          <Provider store={this.store}>
            <div className="w-full">
              {product ? (
                <Recommender product={product} />
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>Loading recommendations...</p>
                </div>
              )}
            </div>
          </Provider>
        </ErrorBoundary>
      );
      console.log('React component rendered successfully');
    } catch (error) {
      console.error('Critical error in render method:', error);
      this.renderErrorFallback('Critical rendering error occurred');
    }
  }
}