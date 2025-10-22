/**
 * Entry point for the Web Component version of the React Recommender
 * This file registers the custom element and makes it available for use in Angular
 */

import { RecommenderElement } from './web-component/RecommenderElement';
import './styles.css';

// Register the custom element directly when the script loads
try {
  if (typeof customElements !== 'undefined') {
    const existingElement = customElements.get('react-recommender');
    if (!existingElement) {
      customElements.define('react-recommender', RecommenderElement);
      // Verify registration
      const verifyElement = customElements.get('react-recommender');
    } else {
    }
  } else {
    console.error('❌ customElements API not available');
  }
} catch (error) {
  console.error('❌ Failed to register react-recommender:', error);
  if (error instanceof Error) {
    console.error('❌ Error details:', error.message, error.stack);
  }
}

// Export the element class for manual registration if needed
export { RecommenderElement };

// Export a registration function as default
export default function() {
};
