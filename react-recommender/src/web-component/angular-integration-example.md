# Angular Integration Example

This document shows how to integrate the React Recommender Web Component into an Angular application.

## 1. Build the Web Component

First, build the Web Component version:

```bash
npx nx build-web-component react-recommender
```

This creates the files in `dist/react-recommender-web-component/`:
- `react-recommender.mjs` - ES module version
- `react-recommender.umd.js` - UMD version  
- `react-recommender.css` - Styles

## 2. Include in Angular

### Option A: Copy files to Angular assets

Copy the built files to your Angular app's assets folder:

```bash
cp dist/react-recommender-web-component/* angular-dashboard/src/assets/
```

### Option B: Reference from dist (development)

Reference the files directly from the dist folder in your Angular app.

## 3. Load the Web Component

In your Angular `index.html` or component:

```html
<!-- Load the Web Component script -->
<script type="module" src="assets/react-recommender.mjs"></script>
<link rel="stylesheet" href="assets/react-recommender.css">
```

## 4. Configure Angular for Custom Elements

In your Angular module or component, configure Angular to recognize custom elements:

```typescript
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  // ... other config
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
```

## 5. Use in Angular Template

```html
<!-- Basic usage -->
<react-recommender></react-recommender>

<!-- With product data -->
<react-recommender [attr.product]="selectedProductJson"></react-recommender>
```

## 6. Component Integration

```typescript
export class AppComponent {
  selectedProduct: Product | null = null;
  
  get selectedProductJson(): string | null {
    return this.selectedProduct ? JSON.stringify(this.selectedProduct) : null;
  }
  
  onProductSelected(product: Product) {
    this.selectedProduct = product;
  }
}
```

## 7. Template Example

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Product List -->
  <div>
    <app-product-list (productSelected)="onProductSelected($event)"></app-product-list>
  </div>
  
  <!-- Product Detail -->
  <div>
    <app-product-detail [product]="selectedProduct"></app-product-detail>
  </div>
  
  <!-- React Recommender Widget -->
  <div>
    <react-recommender [attr.product]="selectedProductJson"></react-recommender>
  </div>
</div>
```

## Notes

- The Web Component automatically handles JSON parsing of the `product` attribute
- The component maintains its own Redux store and state
- Tailwind CSS classes work because the component doesn't use Shadow DOM
- The component will show appropriate loading, error, and empty states