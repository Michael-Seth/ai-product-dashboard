# Contributing to AI-Powered E-commerce Platform

Thank you for your interest in contributing to our AI-powered e-commerce platform! This document provides guidelines and information for contributors.

## 🎯 Overview

This project is a modern e-commerce platform showcasing micro-frontend architecture with Angular and React, enhanced with AI-powered product recommendations. We welcome contributions that improve the shopping experience, enhance performance, or add new e-commerce features.

## 🚀 Quick Start for Contributors

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Basic knowledge of Angular, React, and TypeScript

### Setup Development Environment

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/ai-product-dashboard.git
   cd ai-product-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Environment**:
   ```bash
   npm run dev
   ```

4. **Verify Setup**:
   - Open http://localhost:4200
   - Test all e-commerce features (products, cart, checkout)
   - Verify AI recommendations are working

## 📋 Types of Contributions

### 🛍️ E-commerce Features
- **Product Management**: Enhanced product catalog, search, filtering
- **Shopping Cart**: Improved cart functionality, persistence, performance
- **Checkout Process**: Better UX, validation, payment integration
- **User Experience**: Mobile optimization, accessibility improvements
- **Performance**: Loading speed, bundle optimization, caching

### 🤖 AI & Recommendations
- **AI Integration**: Enhanced OpenAI integration, new AI providers
- **Recommendation Logic**: Better recommendation algorithms
- **Fallback Systems**: Improved mock recommendations, error handling
- **Performance**: Faster recommendation loading, caching strategies

### 🏗️ Architecture & Technical
- **Micro-frontend**: Better Angular/React integration
- **Build System**: Nx optimization, build performance
- **Testing**: Unit tests, integration tests, e2e tests
- **Documentation**: Code documentation, guides, examples

### 🎨 UI/UX Improvements
- **Design System**: Consistent components, design tokens
- **Responsive Design**: Mobile-first improvements
- **Accessibility**: WCAG compliance, screen reader support
- **Animations**: Smooth transitions, loading states

## 🔧 Development Workflow

### Branch Naming Convention
```
feature/add-product-reviews
bugfix/cart-persistence-issue
enhancement/mobile-checkout-ux
docs/api-documentation-update
```

### Commit Message Format
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(cart): add persistent cart with localStorage
fix(checkout): resolve form validation errors
docs(api): update product endpoint documentation
style(products): improve mobile product grid layout
perf(recommendations): optimize AI recommendation loading
test(cart): add unit tests for cart service
```

### Development Process

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**:
   - Follow coding standards (see below)
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**:
   ```bash
   # Run all tests
   npm run test
   
   # Test specific project
   nx test angular-dashboard
   nx test react-recommender
   
   # Run integration tests
   npm run test:integration
   
   # Test build
   npm run build:all
   ```

4. **Lint and Format**:
   ```bash
   # Lint all projects
   npm run lint
   
   # Format code
   npm run format
   ```

5. **Commit and Push**:
   ```bash
   git add .
   git commit -m "feat(cart): add persistent cart with localStorage"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**:
   - Use the PR template
   - Include screenshots for UI changes
   - Reference related issues
   - Add reviewers

## 📝 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Proper typing and naming
interface ProductFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
}

class ProductService {
  private readonly products$ = new BehaviorSubject<Product[]>([]);
  
  getFilteredProducts(filter: ProductFilter): Observable<Product[]> {
    return this.products$.pipe(
      map(products => this.applyFilter(products, filter))
    );
  }
  
  private applyFilter(products: Product[], filter: ProductFilter): Product[] {
    // Implementation
  }
}

// ❌ Avoid: Any types and unclear naming
class Service {
  data: any;
  
  getData(): any {
    return this.data;
  }
}
```

### Angular Component Guidelines

```typescript
// ✅ Good: Proper component structure
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    // Initialization logic
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }
}
```

### React Component Guidelines

```typescript
// ✅ Good: Proper React component with hooks
interface RecommenderProps {
  product: Product;
  onRecommendationClick: (product: Product) => void;
}

export const Recommender: React.FC<RecommenderProps> = ({
  product,
  onRecommendationClick
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await recommendationApi.getRecommendations(product);
        setRecommendations(result.recommendations);
      } catch (err) {
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [product]);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return (
    <div className="recommendations">
      {recommendations.map(rec => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onClick={onRecommendationClick}
        />
      ))}
    </div>
  );
};
```

### CSS/SCSS Guidelines

```scss
// ✅ Good: BEM methodology and consistent naming
.product-card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &__image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px 8px 0 0;
  }
  
  &__content {
    padding: 16px;
  }
  
  &__title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-primary);
  }
  
  &__price {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-primary);
  }
  
  &--featured {
    border: 2px solid var(--color-accent);
  }
}

// ❌ Avoid: Unclear naming and no structure
.card {
  padding: 10px;
}

.title {
  color: blue;
}
```

## 🧪 Testing Guidelines

### Unit Testing

```typescript
// Angular component test
describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let cartService: jasmine.SpyObj<CartService>;
  
  beforeEach(() => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['addToCart']);
    
    TestBed.configureTestingModule({
      declarations: [ProductCardComponent],
      providers: [
        { provide: CartService, useValue: cartServiceSpy }
      ]
    });
    
    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
  });
  
  it('should emit addToCart event when button clicked', () => {
    const mockProduct: Product = { /* mock data */ };
    component.product = mockProduct;
    
    spyOn(component.addToCart, 'emit');
    
    component.onAddToCart();
    
    expect(component.addToCart.emit).toHaveBeenCalledWith(mockProduct);
  });
});

// React component test
describe('Recommender', () => {
  const mockProduct: Product = { /* mock data */ };
  const mockOnClick = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should display recommendations when loaded', async () => {
    const mockRecommendations = [/* mock data */];
    
    jest.spyOn(recommendationApi, 'getRecommendations')
      .mockResolvedValue({ recommendations: mockRecommendations });
    
    render(
      <Recommender 
        product={mockProduct} 
        onRecommendationClick={mockOnClick} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Recommendation 1')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing

```typescript
// Cross-framework integration test
describe('Angular-React Integration', () => {
  it('should pass product data from Angular to React widget', async () => {
    const mockProduct: Product = { /* mock data */ };
    
    // Set up Angular component
    const fixture = TestBed.createComponent(ProductDetailPageComponent);
    const component = fixture.componentInstance;
    component.selectedProduct = mockProduct;
    
    fixture.detectChanges();
    
    // Wait for React widget to load
    await waitFor(() => {
      const reactWidget = fixture.nativeElement.querySelector('react-recommender');
      expect(reactWidget).toBeTruthy();
      expect(reactWidget.getAttribute('product')).toContain(mockProduct.name);
    });
  });
});
```

## 📚 Documentation Standards

### Code Documentation

```typescript
/**
 * Service for managing shopping cart state and persistence.
 * 
 * Provides methods for adding, removing, and updating cart items,
 * with automatic localStorage persistence for cart recovery.
 * 
 * @example
 * ```typescript
 * constructor(private cartService: CartService) {}
 * 
 * addProduct(product: Product) {
 *   this.cartService.addToCart({
 *     id: product.id,
 *     name: product.name,
 *     price: product.price,
 *     quantity: 1
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  /**
   * Observable stream of current cart items.
   * Emits whenever cart contents change.
   */
  readonly cartItems$: Observable<CartItem[]>;
  
  /**
   * Adds a product to the shopping cart.
   * 
   * If the product already exists in the cart, increases quantity.
   * Automatically persists changes to localStorage.
   * 
   * @param item - The cart item to add
   * @throws {Error} When item validation fails
   */
  addToCart(item: CartItem): void {
    // Implementation
  }
}
```

### README Updates

When adding new features, update relevant documentation:

```markdown
## 🆕 New Feature: Product Reviews

### Overview
Added comprehensive product review system with ratings and comments.

### Usage
```typescript
// Get product reviews
const reviews = await productService.getProductReviews(productId);

// Add new review
await productService.addReview(productId, {
  rating: 5,
  comment: 'Great product!',
  userId: 'user123'
});
```

### API Endpoints
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add new review
```

## 🔍 Code Review Guidelines

### For Contributors

**Before Submitting PR**:
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Proper error handling implemented
- [ ] Accessibility considerations addressed

**PR Description Should Include**:
- Clear description of changes
- Screenshots for UI changes
- Breaking changes (if any)
- Testing instructions
- Related issue numbers

### For Reviewers

**Review Checklist**:
- [ ] Code quality and standards compliance
- [ ] Test coverage for new functionality
- [ ] Performance implications
- [ ] Security considerations
- [ ] Accessibility compliance
- [ ] Documentation completeness
- [ ] Breaking changes properly documented

**Review Comments**:
- Be constructive and specific
- Suggest improvements with examples
- Acknowledge good practices
- Ask questions for clarification

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Bug Description**
A clear description of what the bug is.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What you expected to happen.

**Actual Behavior**
What actually happened.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. Windows 10, macOS 12]
- Browser: [e.g. Chrome 96, Firefox 95]
- Node.js version: [e.g. 18.12.0]
- npm version: [e.g. 8.19.2]

**Additional Context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Problem Statement**
What problem does this feature solve?

**Proposed Solution**
How would you like this feature to work?

**Alternative Solutions**
Any alternative approaches you've considered.

**Additional Context**
Screenshots, mockups, or examples that help explain the feature.

**Implementation Considerations**
Any technical considerations or constraints.
```

## 🏆 Recognition

### Contributors Hall of Fame
We recognize contributors in our README and maintain a contributors list.

### Contribution Types
- 💻 Code contributions
- 📖 Documentation improvements
- 🐛 Bug reports and fixes
- 💡 Feature suggestions
- 🎨 Design improvements
- 🧪 Testing improvements
- 🌐 Translations (future)

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Code Reviews**: For feedback on contributions

### Development Help
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system understanding
- See [API.md](./API.md) for API documentation

### Contact Maintainers
- Create an issue for technical questions
- Use discussions for general questions
- Tag maintainers in PRs for urgent reviews

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to our AI-powered e-commerce platform! 🚀**

Your contributions help make online shopping better for everyone. Whether you're fixing bugs, adding features, or improving documentation, every contribution matters.

Happy coding! 💻✨