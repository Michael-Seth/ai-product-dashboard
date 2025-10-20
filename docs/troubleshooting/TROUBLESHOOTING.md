# E-commerce Platform Troubleshooting Guide

This guide provides solutions to common issues you might encounter while developing, building, or deploying the AI-powered e-commerce platform, including shopping cart, checkout, and product catalog issues.

## Table of Contents

- [Development Issues](#development-issues)
- [E-commerce Feature Issues](#e-commerce-feature-issues)
- [Shopping Cart Issues](#shopping-cart-issues)
- [Checkout & Payment Issues](#checkout--payment-issues)
- [Product Catalog Issues](#product-catalog-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [API Issues](#api-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Testing Issues](#testing-issues)
- [Environment Issues](#environment-issues)

## E-commerce Feature Issues

### Shopping Cart Not Persisting

**Problem**: Cart items disappear when refreshing the page or navigating

**Solutions**:
1. **Check localStorage functionality**:
   ```javascript
   // Test localStorage in browser console
   localStorage.setItem('test', 'value');
   console.log(localStorage.getItem('test'));
   ```

2. **Verify CartService implementation**:
   ```typescript
   // Check if CartService is properly injected
   constructor(private cartService: CartService) {
     this.cartService.cartItems$.subscribe(items => {
       console.log('Cart items:', items);
     });
   }
   ```

3. **Check for localStorage errors**:
   ```typescript
   // Verify localStorage is available
   if (typeof Storage !== 'undefined') {
     // localStorage is available
   } else {
     // Fallback to session storage or memory
   }
   ```

### Product Images Not Loading

**Problem**: Product images show broken image icons or placeholders

**Solutions**:
1. **Check image URLs**:
   ```typescript
   // Verify image URLs are valid
   const testImage = new Image();
   testImage.onload = () => console.log('Image loaded');
   testImage.onerror = () => console.log('Image failed');
   testImage.src = 'your-image-url';
   ```

2. **Implement image fallback**:
   ```html
   <!-- Add fallback image -->
   <img [src]="product.image" 
        (error)="onImageError($event)"
        alt="{{product.name}}">
   ```

3. **Check CORS policy**:
   - Ensure image URLs allow cross-origin requests
   - Use placeholder images for development

### Category Navigation Not Working

**Problem**: Category links don't navigate or show wrong products

**Solutions**:
1. **Check routing configuration**:
   ```typescript
   // Verify routes are properly configured
   const routes: Routes = [
     { path: 'categories', component: CategoriesComponent },
     { path: 'category/:name', component: CategoryComponent }
   ];
   ```

2. **Verify category service**:
   ```typescript
   // Check category filtering logic
   getCategoryProducts(categoryName: string) {
     return this.products.filter(p => 
       p.category.toLowerCase() === categoryName.toLowerCase()
     );
   }
   ```

## Shopping Cart Issues

### Cart Counter Not Updating

**Problem**: Cart item count in header doesn't update when items are added

**Solutions**:
1. **Check service subscription**:
   ```typescript
   // Ensure proper subscription to cart changes
   ngOnInit() {
     this.cartService.cartItems$.subscribe(items => {
       this.cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
     });
   }
   ```

2. **Verify BehaviorSubject usage**:
   ```typescript
   // CartService should use BehaviorSubject
   private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
   cartItems$ = this.cartItemsSubject.asObservable();
   ```

### Add to Cart Button Not Working

**Problem**: Clicking "Add to Cart" doesn't add items to cart

**Solutions**:
1. **Check event binding**:
   ```html
   <!-- Verify proper event binding -->
   <button (click)="addToCart(product)" 
           [disabled]="!product.inStock">
     Add to Cart
   </button>
   ```

2. **Verify addToCart method**:
   ```typescript
   addToCart(product: Product) {
     console.log('Adding to cart:', product);
     this.cartService.addToCart({
       id: product.id,
       name: product.name,
       price: product.price,
       quantity: 1,
       image: product.image
     });
   }
   ```

## Checkout & Payment Issues

### Checkout Form Validation Errors

**Problem**: Form validation not working or showing incorrect errors

**Solutions**:
1. **Check form validation setup**:
   ```typescript
   // Verify reactive form validation
   checkoutForm = this.fb.group({
     firstName: ['', [Validators.required, Validators.minLength(2)]],
     email: ['', [Validators.required, Validators.email]],
     address: ['', Validators.required]
   });
   ```

2. **Check validation display**:
   ```html
   <!-- Show validation errors properly -->
   <div *ngIf="checkoutForm.get('email')?.invalid && checkoutForm.get('email')?.touched">
     <span *ngIf="checkoutForm.get('email')?.errors?.['required']">
       Email is required
     </span>
   </div>
   ```

### Order Submission Failing

**Problem**: Checkout form submission doesn't work or shows errors

**Solutions**:
1. **Check form submission**:
   ```typescript
   onSubmit() {
     if (this.checkoutForm.valid) {
       console.log('Form data:', this.checkoutForm.value);
       // Process order
     } else {
       console.log('Form is invalid');
       this.markFormGroupTouched(this.checkoutForm);
     }
   }
   ```

2. **Verify navigation to success page**:
   ```typescript
   // Ensure proper navigation after order
   processOrder() {
     // Process order logic
     this.router.navigate(['/success'], { 
       queryParams: { orderId: 'ORDER123' }
     });
   }
   ```

## Product Catalog Issues

### Product Search Not Working

**Problem**: Search functionality doesn't return results or shows errors

**Solutions**:
1. **Check search implementation**:
   ```typescript
   searchProducts(query: string) {
     return this.products.filter(product =>
       product.name.toLowerCase().includes(query.toLowerCase()) ||
       product.description.toLowerCase().includes(query.toLowerCase())
     );
   }
   ```

2. **Verify search input binding**:
   ```html
   <!-- Check search input binding -->
   <input [(ngModel)]="searchQuery" 
          (input)="onSearchChange()"
          placeholder="Search products...">
   ```

### Product Filtering Not Working

**Problem**: Category or price filters don't filter products correctly

**Solutions**:
1. **Check filter logic**:
   ```typescript
   filterProducts() {
     let filtered = this.allProducts;
     
     if (this.selectedCategory) {
       filtered = filtered.filter(p => p.category === this.selectedCategory);
     }
     
     if (this.sortBy === 'price-low') {
       filtered = filtered.sort((a, b) => a.price - b.price);
     }
     
     this.filteredProducts = filtered;
   }
   ```

2. **Verify filter UI updates**:
   ```typescript
   onCategoryChange(category: string) {
     this.selectedCategory = category;
     this.filterProducts();
   }
   ```

## Development Issues

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::4200`

**Solutions**:
```bash
# Option 1: Kill the process using the port
npx kill-port 4200

# Option 2: Use a different port
nx serve angular-dashboard --port 4201

# Option 3: Find and kill the process manually (Windows)
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Option 3: Find and kill the process manually (macOS/Linux)
lsof -ti:4200 | xargs kill -9
```

### CORS Errors During Development

**Problem**: `Access to fetch at 'http://localhost:3001/api/recommendations' from origin 'http://localhost:4200' has been blocked by CORS policy`

**Solutions**:
1. **Ensure dev server is running**:
   ```bash
   npm run dev-server
   ```

2. **Check proxy configuration**:
   ```json
   // angular-dashboard/proxy.conf.json
   {
     "/api/*": {
       "target": "http://localhost:3001",
       "secure": false,
       "changeOrigin": true,
       "logLevel": "debug"
     }
   }
   ```

3. **Restart Angular dev server**:
   ```bash
   nx serve angular-dashboard
   ```

### TypeScript Compilation Errors

**Problem**: `Cannot find module 'shared-types'` or similar import errors

**Solutions**:
1. **Build shared libraries first**:
   ```bash
   nx build shared-types
   nx build shared-api
   ```

2. **Check tsconfig paths**:
   ```json
   // tsconfig.base.json
   {
     "paths": {
       "@ai-product-dashboard/shared-types": ["shared-types/src/index.ts"],
       "@ai-product-dashboard/shared-api": ["shared-api/src/index.ts"]
     }
   }
   ```

3. **Clear Nx cache**:
   ```bash
   nx reset
   ```

### Hot Reload Not Working

**Problem**: Changes not reflected in browser during development

**Solutions**:
1. **Check file watchers**:
   ```bash
   # Increase file watcher limit (Linux)
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Restart development servers**:
   ```bash
   # Kill all processes and restart
   npm run dev
   ```

3. **Clear browser cache**:
   - Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser cache and cookies

## Build Issues

### React Web Component Build Failures

**Problem**: `Cannot resolve module 'react-recommender'` during Angular build

**Solutions**:
1. **Build in correct order**:
   ```bash
   npm run build:react-web-component
   npm run build:angular
   ```

2. **Check build output**:
   ```bash
   # Verify web component files exist
   ls -la dist/react-recommender-web-component/
   ```

3. **Clean and rebuild**:
   ```bash
   rm -rf dist/
   npm run build:all
   ```

### Memory Issues During Build

**Problem**: `JavaScript heap out of memory` during build

**Solutions**:
1. **Increase Node.js memory**:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build:all
   ```

2. **Build projects individually**:
   ```bash
   npm run build:react-web-component
   npm run build:angular
   npm run build:react
   ```

### TypeScript Strict Mode Errors

**Problem**: TypeScript compilation errors in strict mode

**Solutions**:
1. **Fix type definitions**:
   ```typescript
   // Add proper typing
   interface Product {
     id: number;
     name: string;
     description: string;
     price: number;
     imageUrl: string;
   }
   ```

2. **Add null checks**:
   ```typescript
   // Before
   const product = getProduct();
   console.log(product.name);

   // After
   const product = getProduct();
   if (product) {
     console.log(product.name);
   }
   ```

## Runtime Issues

### React Widget Not Appearing

**Problem**: React recommendation widget doesn't render in Angular app

**Solutions**:
1. **Check browser console for errors**:
   - Look for Web Component registration errors
   - Check for JavaScript loading failures

2. **Verify Web Component files are loaded**:
   ```javascript
   // Check in browser console
   console.log(customElements.get('react-recommender'));
   ```

3. **Check Angular template**:
   ```html
   <!-- Ensure proper attribute binding -->
   <react-recommender [attr.product]="selectedProductJson"></react-recommender>
   ```

4. **Verify build output**:
   ```bash
   # Check if web component files exist
   ls -la dist/angular-dashboard/browser/react-recommender*
   ```

### Recommendations Not Loading

**Problem**: Recommendation widget shows loading state indefinitely

**Solutions**:
1. **Check API server status**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check browser network tab**:
   - Look for failed API requests
   - Check request/response details

3. **Test API directly**:
   ```bash
   curl -X POST http://localhost:3001/api/recommendations \
     -H "Content-Type: application/json" \
     -d '{"productName": "MacBook Air"}'
   ```

4. **Check console for errors**:
   - Look for network errors
   - Check for CORS issues

### Product Selection Not Working

**Problem**: Clicking products doesn't update the detail view or recommendations

**Solutions**:
1. **Check Angular service**:
   ```typescript
   // Verify ProductService is working
   constructor(private productService: ProductService) {
     this.productService.selectedProduct$.subscribe(product => {
       console.log('Selected product:', product);
     });
   }
   ```

2. **Check event binding**:
   ```html
   <!-- Verify event binding in template -->
   <div (click)="onProductClick(product)">
   ```

3. **Check JSON serialization**:
   ```typescript
   // Verify JSON conversion
   onProductSelected(product: Product) {
     console.log('Product:', product);
     this.selectedProductJson = JSON.stringify(product);
     console.log('JSON:', this.selectedProductJson);
   }
   ```

## API Issues

### OpenAI API Errors

**Problem**: API returns errors or timeouts

**Solutions**:
1. **Check API key**:
   ```bash
   # Verify environment variable is set
   echo $OPENAI_API_KEY
   ```

2. **Test API key validity**:
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. **Check rate limits**:
   - Review OpenAI dashboard for usage
   - Implement request throttling if needed

4. **Verify fallback behavior**:
   ```bash
   # Test without API key (should use mock data)
   unset OPENAI_API_KEY
   npm run dev-server
   ```

### API Timeout Issues

**Problem**: API requests timing out

**Solutions**:
1. **Check network connectivity**:
   ```bash
   ping api.openai.com
   ```

2. **Increase timeout values**:
   ```javascript
   // In api/recommendations.js
   const result = await Promise.race([
     recommendProducts(mockProduct),
     new Promise((_, reject) => 
       setTimeout(() => reject(new Error('Timeout')), 60000) // Increase to 60s
     )
   ]);
   ```

3. **Check server logs**:
   - Look for timeout errors in console
   - Check for network connectivity issues

### Mock Data Not Working

**Problem**: Fallback to mock data not functioning

**Solutions**:
1. **Check mock function**:
   ```javascript
   // Test mock function directly
   const mockRecommendations = mockRecommend('MacBook Air');
   console.log(mockRecommendations);
   ```

2. **Verify fallback logic**:
   ```javascript
   // Check error handling in API
   catch (error) {
     console.log('Falling back to mock data');
     return { recommendations: mockRecommend(product.name) };
   }
   ```

## Deployment Issues

### Vercel Build Failures

**Problem**: Build fails on Vercel deployment

**Solutions**:
1. **Check build command**:
   ```json
   // vercel.json or package.json
   {
     "scripts": {
       "build": "npm run build:all"
     }
   }
   ```

2. **Verify Node.js version**:
   ```json
   // package.json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **Check environment variables**:
   - Verify `OPENAI_API_KEY` is set in Vercel dashboard
   - Check for any missing environment variables

4. **Review build logs**:
   - Check Vercel deployment logs for specific errors
   - Look for memory or timeout issues

### Static Asset Issues

**Problem**: Static assets not loading in production

**Solutions**:
1. **Check asset paths**:
   ```html
   <!-- Use relative paths -->
   <script src="./react-recommender.umd.js"></script>
   ```

2. **Verify build output**:
   ```bash
   # Check if assets are in correct location
   ls -la dist/angular-dashboard/browser/
   ```

3. **Check Vercel configuration**:
   ```json
   // vercel.json
   {
     "rewrites": [
       { "source": "/react-recommender-web-component/(.*)", "destination": "/react-recommender-web-component/$1" }
     ]
   }
   ```

### API Routes Not Working

**Problem**: API endpoints return 404 in production

**Solutions**:
1. **Check API file location**:
   ```
   api/
   └── recommendations.js  # Must be in api/ directory
   ```

2. **Verify Vercel configuration**:
   ```json
   // vercel.json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" }
     ]
   }
   ```

3. **Check function exports**:
   ```javascript
   // api/recommendations.js
   module.exports = async (req, res) => {
     // Function implementation
   };
   ```

## Performance Issues

### Slow Initial Load

**Problem**: Application takes too long to load initially

**Solutions**:
1. **Check bundle sizes**:
   ```bash
   # Analyze bundle sizes
   npx webpack-bundle-analyzer dist/angular-dashboard/browser/
   ```

2. **Implement code splitting**:
   ```typescript
   // Lazy load components
   const LazyComponent = lazy(() => import('./LazyComponent'));
   ```

3. **Optimize images**:
   ```html
   <!-- Use optimized placeholder images -->
   <img src="https://via.placeholder.com/300x200?text=Product" alt="Product" />
   ```

4. **Enable compression**:
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "Cache-Control", "value": "public, max-age=31536000" }
         ]
       }
     ]
   }
   ```

### Memory Leaks

**Problem**: Application memory usage increases over time

**Solutions**:
1. **Check for unsubscribed observables**:
   ```typescript
   // Angular component
   ngOnDestroy() {
     this.subscription.unsubscribe();
   }
   ```

2. **Verify React component cleanup**:
   ```typescript
   // React component
   useEffect(() => {
     return () => {
       // Cleanup function
     };
   }, []);
   ```

3. **Check Web Component cleanup**:
   ```typescript
   // Web Component
   disconnectedCallback() {
     if (this.root) {
       this.root.unmount();
       this.root = null;
     }
   }
   ```

## Testing Issues

### Tests Failing

**Problem**: Unit or integration tests failing

**Solutions**:
1. **Check test environment**:
   ```bash
   # Ensure test dependencies are installed
   npm install
   ```

2. **Update test configuration**:
   ```json
   // jest.config.js
   {
     "testEnvironment": "jsdom",
     "setupFilesAfterEnv": ["<rootDir>/src/test-setup.ts"]
   }
   ```

3. **Mock external dependencies**:
   ```typescript
   // Mock API calls in tests
   jest.mock('@ai-product-dashboard/shared-api', () => ({
     recommendProducts: jest.fn().mockResolvedValue({
       recommendations: mockRecommendations
     })
   }));
   ```

### Integration Tests Failing

**Problem**: Cross-framework integration tests not working

**Solutions**:
1. **Check test setup**:
   ```bash
   # Run integration tests with proper setup
   npm run test:integration
   ```

2. **Verify test environment**:
   ```typescript
   // integration-tests/test-setup.ts
   import 'jsdom-global/register';
   import { TextEncoder, TextDecoder } from 'util';
   global.TextEncoder = TextEncoder;
   global.TextDecoder = TextDecoder;
   ```

3. **Check Web Component registration**:
   ```typescript
   // Ensure Web Component is registered in tests
   beforeAll(() => {
     require('../react-recommender/src/web-component');
   });
   ```

## Environment Issues

### Node.js Version Conflicts

**Problem**: Different Node.js versions causing issues

**Solutions**:
1. **Use Node Version Manager**:
   ```bash
   # Install and use correct Node.js version
   nvm install 18
   nvm use 18
   ```

2. **Check .nvmrc file**:
   ```bash
   # Create .nvmrc file
   echo "18" > .nvmrc
   nvm use
   ```

### Package Version Conflicts

**Problem**: Dependency version conflicts

**Solutions**:
1. **Clear package cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check for peer dependency warnings**:
   ```bash
   npm ls
   ```

3. **Update dependencies**:
   ```bash
   npm update
   ```

### Environment Variable Issues

**Problem**: Environment variables not loading

**Solutions**:
1. **Check .env file location**:
   ```bash
   # Ensure .env is in project root
   ls -la .env
   ```

2. **Verify variable names**:
   ```bash
   # Check exact variable name
   grep OPENAI_API_KEY .env
   ```

3. **Test variable loading**:
   ```javascript
   // Test in Node.js
   console.log(process.env.OPENAI_API_KEY);
   ```

## Getting Additional Help

### Debug Mode

Enable comprehensive debugging:

```bash
# Development
DEBUG=true npm run dev

# Testing
DEBUG=true npm run test

# Build
DEBUG=true npm run build:all
```

### Log Analysis

Check logs in different environments:

1. **Browser Console**: F12 → Console tab
2. **Server Logs**: Check terminal output
3. **Vercel Logs**: Check deployment logs in Vercel dashboard
4. **Network Tab**: Check API requests and responses

### Common Debug Commands

```bash
# Check project structure
npx nx graph

# Analyze dependencies
npm ls --depth=0

# Check for security vulnerabilities
npm audit

# Check TypeScript configuration
npx tsc --noEmit

# Lint all projects
npm run lint
```

### When to Seek Help

If you've tried the solutions above and still have issues:

1. Check the [GitHub Issues](link-to-issues) for similar problems
2. Review the [API Documentation](./API.md) for API-specific issues
3. Check the [Architecture Documentation](./ARCHITECTURE.md) for design questions
4. Create a new issue with:
   - Detailed error messages
   - Steps to reproduce
   - Environment information
   - Relevant log outputs

Remember to include your environment details when reporting issues:
- Node.js version: `node --version`
- npm version: `npm --version`
- Operating system
- Browser version (for runtime issues)