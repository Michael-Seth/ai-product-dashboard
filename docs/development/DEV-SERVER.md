# E-commerce Development Server Setup

This document explains how to use the development API server for local testing of the AI-powered e-commerce platform.

## Overview

The development server (`dev-server.js`) provides comprehensive API endpoints that simulate a complete e-commerce backend including:

- **Product Catalog API**: Full product management with categories, filtering, and search
- **Shopping Cart API**: Cart management and persistence
- **AI Recommendations**: Mock recommendation service with OpenAI fallback
- **Order Processing**: Checkout and order confirmation simulation

The server runs on port 3001 by default (configurable via PORT environment variable) and provides all the APIs needed for the complete e-commerce experience.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev-server
```

3. In a separate terminal, start the Angular development server:
```bash
nx serve angular-dashboard
```

Or use the combined command to start both servers:
```bash
npm run dev
```

## API Endpoints

### E-commerce Product APIs

#### GET /api/products
Returns the complete product catalog with filtering and sorting capabilities.

**Query Parameters:**
- `category`: Filter by product category (Laptops, Smartphones, Accessories)
- `sort`: Sort by name, price, rating, newest
- `search`: Search products by name or description
- `limit`: Number of products to return

**Response:**
```json
{
  "products": [
    {
      "id": "1",
      "name": "MacBook Air M2",
      "description": "Apple MacBook Air 13-inch with M2 chip...",
      "price": 1199,
      "originalPrice": 1299,
      "image": "https://example.com/macbook-air-m2.jpg",
      "category": "Laptops",
      "inStock": true,
      "rating": 4.8,
      "reviews": 1247,
      "features": ["M2 Chip", "13-inch Display", "All-day Battery"]
    }
  ],
  "pagination": {
    "total": 8,
    "hasMore": false
  }
}
```

#### GET /api/products/:id
Returns detailed information for a specific product.

#### GET /api/categories
Returns all product categories with metadata and product counts.

#### GET /api/categories/:slug/products
Returns products filtered by specific category.

### AI Recommendation API

#### POST /api/recommendations
Generates AI-powered or mock product recommendations based on the selected product.

**Request Body:**
```json
{
  "productName": "MacBook Air"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "name": "MacBook Air Pro Case",
      "reason": "Perfect protection for your MacBook Air with premium materials"
    },
    {
      "name": "MacBook Air Wireless Mouse", 
      "reason": "Ergonomic wireless mouse designed to complement your MacBook Air"
    }
  ]
}
```

### System Health API

#### GET /api/health
Health check endpoint to verify the server and all e-commerce features are running.

**Response:**
```json
{
  "status": "OK",
  "message": "E-commerce development server is running",
  "features": {
    "products": true,
    "categories": true,
    "recommendations": true,
    "cart": true
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Proxy Configuration

The Angular development server is configured to proxy all `/api/*` requests to `http://localhost:3000` through the `proxy.conf.json` file. This means:

- Angular app runs on `http://localhost:4200`
- API requests to `/api/recommendations` are automatically forwarded to `http://localhost:3001/api/recommendations`
- No CORS issues during development

## Testing the Complete E-commerce Setup

1. **Start Development Environment**:
   ```bash
   npm run dev
   ```

2. **Test Core E-commerce Flow**:
   - Open `http://localhost:4200` in your browser
   - Browse the product catalog (`/products`)
   - Navigate through categories (`/categories`)
   - Check deals and promotions (`/deals`)
   - View product details (`/product/:id`)
   - Add items to cart and test cart functionality (`/cart`)
   - Complete the checkout process (`/checkout`)
   - Verify order confirmation (`/success`)

3. **Test AI Recommendations**:
   - Select any product to view details
   - Verify that AI recommendations appear below product information
   - Check fallback behavior when AI is unavailable

4. **Verify API Functionality**:
   - Check the development server console for API request logs
   - Test API endpoints directly using browser or curl
   - Verify error handling and fallback mechanisms

5. **Test Responsive Design**:
   - Test on different screen sizes
   - Verify mobile navigation and touch interactions
   - Check cart and checkout on mobile devices

## Troubleshooting

- **Port 3001 already in use**: Set PORT environment variable or change the PORT variable in `dev-server.js`
- **Proxy not working**: Verify `proxy.conf.json` configuration and restart Angular dev server
- **CORS errors**: Ensure the development server is running and CORS is enabled