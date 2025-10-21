/**
 * Entry point for the Web Component version of the React Recommender
 * This file registers the custom element and makes it available for use in Angular
 */

import { RecommenderElement } from './web-component/RecommenderElement';
import './styles.css';

// Register the custom element directly when the script loads
console.log('🚀 Registering react-recommender web component...');

try {
  if (typeof customElements !== 'undefined') {
    if (!customElements.get('react-recommender')) {
      customElements.define('react-recommender', RecommenderElement);
      console.log('✅ react-recommender web component registered successfully');
    } else {
      console.log('⚠️ react-recommender already registered');
    }
  } else {
    console.error('❌ customElements API not available');
  }
} catch (error) {
  console.error('❌ Failed to register react-recommender:', error);
}

// Export the element class for manual registration if needed
export { RecommenderElement };

// Export a registration function as default
export default function() {
  console.log('Manual registration function called');
};
