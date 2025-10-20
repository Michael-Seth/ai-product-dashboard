import { RecommenderElement } from './RecommenderElement';

/**
 * Register the custom element as 'react-recommender'
 * This allows Angular to use <react-recommender product="..."></react-recommender>
 */
export function registerRecommenderElement() {
  try {
    if (!customElements.get('react-recommender')) {
      customElements.define('react-recommender', RecommenderElement);
      console.log('✅ Successfully registered custom element: react-recommender');
    } else {
      console.log('ℹ️ Custom element react-recommender already registered');
    }
  } catch (error) {
    console.error('❌ Failed to register react-recommender custom element:', error);
    
    // Provide fallback error handling
    if (error instanceof Error) {
      if (error.message.includes('already defined')) {
        console.log('ℹ️ Custom element react-recommender was already defined elsewhere');
      } else if (error.message.includes('constructor')) {
        console.error('💥 Constructor error in RecommenderElement:', error);
      } else {
        console.error('🔥 Unknown registration error:', error.message);
      }
    }
    
    // Don't throw - allow the application to continue
    // The error will be handled at the component level
  }
}

// Auto-register when this module is imported with error handling
try {
  registerRecommenderElement();
} catch (criticalError) {
  console.error('💀 Critical error during web component initialization:', criticalError);
  
  // Create a fallback error element
  if (!customElements.get('react-recommender-error')) {
    class ErrorElement extends HTMLElement {
      connectedCallback() {
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
              Web Component Error
            </div>
            <div style="font-size: 0.875rem; margin-bottom: 0.75rem;">
              Failed to initialize recommendation widget
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
              "
            >
              Reload Page
            </button>
          </div>
        `;
      }
    }
    
    try {
      customElements.define('react-recommender', ErrorElement);
      console.log('🚨 Registered fallback error element as react-recommender');
    } catch (fallbackError) {
      console.error('💥 Even fallback registration failed:', fallbackError);
    }
  }
}

export { RecommenderElement };