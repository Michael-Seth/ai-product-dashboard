# E-commerce Platform Deployment Guide

## Production Deployment

This AI-powered e-commerce platform is optimized for deployment to Vercel with comprehensive e-commerce features including product catalog, shopping cart, checkout process, and AI recommendations.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. **Domain Setup**: Configure custom domain for production (optional)
4. **Analytics Setup**: Configure analytics for e-commerce tracking (optional)

### Deployment Steps

1. **Connect Repository**:
   - Import your repository to Vercel
   - Select the `ai-product-dashboard` directory as the root

2. **Configure Environment Variables**:
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add: `OPENAI_API_KEY` with your OpenAI API key value

3. **Build Configuration**:
   - Build Command: `npm run build:all`
   - Output Directory: `dist/angular-dashboard/browser`
   - Install Command: `npm install`
   - Node.js Version: 18.x (recommended)

4. **Deploy**:
   - Vercel will automatically build and deploy the complete e-commerce platform
   - The Angular e-commerce app will be served at the root URL
   - All e-commerce pages will be available: `/products`, `/categories`, `/deals`, `/cart`, `/checkout`
   - API endpoints will be available at `/api/recommendations`, `/api/health`, and `/api/products`

### Build Process

The deployment builds three components in the correct order:

1. **React Web Component**: `npm run build:react-web-component`
   - Outputs to `dist/react-recommender-web-component/`
   - Creates UMD and ES modules for the recommendation widget
   - **Must be built first** as Angular depends on these files

2. **Angular Dashboard**: `npm run build:angular`
   - Outputs to `dist/angular-dashboard/browser/`
   - Main application served at root URL
   - Dynamically loads React web component at runtime

3. **React Standalone**: `npm run build:react`
   - Outputs to `dist/react-recommender/`
   - Standalone React app (optional)

### Dynamic Loading

The Angular application now dynamically loads the React web component to avoid build-time dependencies:

- CSS is loaded from `/react-recommender.css`
- JavaScript is loaded from `/react-recommender.umd.js`
- Includes error handling and loading states
- Graceful fallback if web component fails to load

### API Endpoints

#### E-commerce APIs
- **GET /api/products**: Get all products with filtering and sorting
  - Query params: `category`, `sort`, `limit`, `search`
  - Response: Product catalog with pagination

- **GET /api/products/:id**: Get detailed product information
  - Response: Complete product details with specifications

- **GET /api/categories**: Get all product categories
  - Response: Category list with product counts

- **GET /api/categories/:slug/products**: Get products by category
  - Response: Category-specific product listings

#### AI & Utility APIs
- **POST /api/recommendations**: Get AI-powered product recommendations
  - Body: `{ "productName": "MacBook Air" }`
  - Response: `{ "recommendations": [{ "name": "...", "reason": "..." }] }`

- **GET /api/health**: Health check endpoint
  - Response: `{ "status": "OK", "message": "...", "timestamp": "..." }`

### E-commerce Features & Fallback Behavior

#### Core E-commerce Functionality
- **Product Catalog**: Complete product browsing with search and filters
- **Shopping Cart**: Persistent cart with localStorage backup
- **Checkout Process**: Multi-step checkout with form validation
- **Category Navigation**: Organized product discovery
- **Deal Management**: Flash sales and promotional pricing
- **Order Confirmation**: Complete purchase flow with success tracking

#### Robust Fallback Systems
- **AI Recommendations**: Automatic fallback to smart mock recommendations when OpenAI unavailable
- **Product Data**: Graceful handling of missing product information
- **Image Loading**: Placeholder images for failed loads
- **Cart Persistence**: localStorage backup for cart data
- **Network Errors**: Comprehensive error handling with user-friendly messages
- **Component Crashes**: Error boundaries prevent entire application crashes
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Mobile Optimization**: Responsive design for all device types

### Static Assets

- Angular app assets are served from `/dist/angular-dashboard/browser/`
- React web component assets are served from `/react-recommender-web-component/`
- All static assets have long-term caching headers

### Troubleshooting

1. **Build Failures**: Ensure all dependencies are installed and TypeScript compiles without errors
2. **API Errors**: Check that the OpenAI API key is correctly set in environment variables
3. **CORS Issues**: API endpoints include proper CORS headers for cross-origin requests
4. **Missing Assets**: Verify that the build process completes successfully for all three components

### Local Testing

To test the production build locally:

```bash
# Build all components
npm run build:all

# Serve the Angular app
npx serve dist/angular-dashboard/browser

# Test API endpoints (requires separate server)
node dev-server.js
```