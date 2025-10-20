# React Recommender Web Component

This directory contains the Web Component wrapper for the React Recommender widget, allowing it to be embedded in Angular applications.

## Files

- `RecommenderElement.tsx` - Main Web Component class extending HTMLElement
- `index.ts` - Exports and auto-registration of the custom element
- `types.d.ts` - TypeScript declarations for Angular integration
- `test.html` - Standalone test page for the Web Component
- `angular-integration-example.md` - Integration guide for Angular
- `README.md` - This file

## Features

✅ **Custom Element Class**: Extends HTMLElement with proper lifecycle methods  
✅ **React Rendering**: Handles React component rendering within custom element  
✅ **JSON Attribute Parsing**: Parses product data from JSON string attributes  
✅ **Redux Provider Wrapper**: Wraps Recommender component with Redux store  
✅ **Custom Element Registration**: Registers as 'react-recommender' element  
✅ **Attribute Observation**: Responds to product attribute changes  
✅ **Proper Cleanup**: Unmounts React components on disconnection  

## Usage

### Build the Web Component

```bash
npx nx build-web-component react-recommender
```

### Use in HTML

```html
<!-- Load the Web Component -->
<script type="module" src="react-recommender.mjs"></script>
<link rel="stylesheet" href="react-recommender.css">

<!-- Use the custom element -->
<react-recommender></react-recommender>

<!-- With product data -->
<react-recommender product='{"id":1,"name":"MacBook Air","description":"...","price":1199,"imageUrl":"..."}'></react-recommender>
```

### Use in Angular

```typescript
// Configure Angular to recognize custom elements
@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent {
  selectedProduct: Product | null = null;
  
  get selectedProductJson(): string | null {
    return this.selectedProduct ? JSON.stringify(this.selectedProduct) : null;
  }
}
```

```html
<react-recommender [attr.product]="selectedProductJson"></react-recommender>
```

## API

### Attributes

- `product` (string): JSON string representation of a Product object

### Product Interface

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}
```

## Implementation Details

- **No Shadow DOM**: Uses regular DOM for Tailwind CSS compatibility
- **Independent State**: Maintains its own Redux store instance
- **Error Handling**: Graceful handling of invalid JSON attributes
- **Responsive**: Inherits responsive behavior from Recommender component
- **Loading States**: Shows loading spinners and error messages
- **Empty States**: Displays helpful messages when no product is selected

## Requirements Satisfied

- ✅ 4.1: React widget embedded as Web Component in Angular
- ✅ 4.2: Selected product passed from Angular to React as JSON attributes  
- ✅ 4.3: Widget maintains independent state and API calls