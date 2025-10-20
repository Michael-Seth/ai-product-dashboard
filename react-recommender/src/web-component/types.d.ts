/**
 * TypeScript declarations for the React Recommender Web Component
 * This helps Angular recognize the custom element
 */

import { Product } from '@ai-product-dashboard/shared-types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'react-recommender': {
        product?: string; // JSON string representation of Product
      };
    }
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'react-recommender': HTMLElement & {
      product: string | null;
    };
  }
}

export {};