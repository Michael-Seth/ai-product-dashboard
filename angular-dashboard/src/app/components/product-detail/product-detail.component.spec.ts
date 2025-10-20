import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailComponent } from './product-detail.component';
import { ProductService } from '../../services/product.service';
import { Product } from '@ai-product-dashboard/shared-types';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let productService: ProductService;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Laptop',
    description: 'A test laptop for testing purposes',
    price: 999,
    imageUrl: 'https://example.com/test-image.jpg'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [ProductService]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when no product is selected', () => {
    fixture.detectChanges();
    
    expect(component.selectedProduct).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('No Product Selected');
  });

  it('should display product details when a product is selected', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    expect(component.selectedProduct).toEqual(mockProduct);
    expect(fixture.nativeElement.textContent).toContain(mockProduct.name);
    expect(fixture.nativeElement.textContent).toContain(mockProduct.description);
    expect(fixture.nativeElement.textContent).toContain(mockProduct.price.toString());
  });

  it('should update when selected product changes', () => {
    // Start with no product
    fixture.detectChanges();
    expect(component.selectedProduct).toBeNull();
    
    // Select a product
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    expect(component.selectedProduct).toEqual(mockProduct);
    
    // Clear selection
    productService.selectProduct(null);
    fixture.detectChanges();
    expect(component.selectedProduct).toBeNull();
  });

  it('should display product image with correct attributes', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    const imageElement = fixture.nativeElement.querySelector('img');
    expect(imageElement).toBeTruthy();
    expect(imageElement.src).toBe(mockProduct.imageUrl);
    expect(imageElement.alt).toBe(mockProduct.name);
  });

  it('should display product price with currency formatting', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain(`$${mockProduct.price}`);
    expect(fixture.nativeElement.textContent).toContain('USD');
  });

  it('should display product ID', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain(`#${mockProduct.id}`);
  });

  it('should unsubscribe on destroy', () => {
    // Test that the component can be destroyed without errors
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should have action buttons when product is selected', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    const addToCartButton = Array.from(buttons).find((btn: any) => 
      btn.textContent.includes('Add to Cart')
    );
    const wishlistButton = Array.from(buttons).find((btn: any) => 
      btn.textContent.includes('Add to Wishlist')
    );
    
    expect(addToCartButton).toBeTruthy();
    expect(wishlistButton).toBeTruthy();
  });

  it('should display product specifications section', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Specifications');
    expect(fixture.nativeElement.textContent).toContain('Product ID:');
    expect(fixture.nativeElement.textContent).toContain('Category:');
    expect(fixture.nativeElement.textContent).toContain('Availability:');
    expect(fixture.nativeElement.textContent).toContain('Shipping:');
  });

  it('should display rating information', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    const ratingElement = fixture.nativeElement.querySelector('.text-yellow-400');
    expect(ratingElement).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('4.8');
  });

  it('should have proper fade-in animation classes', () => {
    productService.selectProduct(mockProduct);
    fixture.detectChanges();
    
    const fadeInElements = fixture.nativeElement.querySelectorAll('.fade-in');
    expect(fadeInElements.length).toBeGreaterThan(0);
    
    const fadeInDelayedElements = fixture.nativeElement.querySelectorAll('.fade-in-delayed');
    expect(fadeInDelayedElements.length).toBeGreaterThan(0);
  });

  it('should handle multiple product selections correctly', () => {
    const product1 = mockProduct;
    const product2: Product = {
      id: 2,
      name: 'Another Laptop',
      description: 'Another test laptop',
      price: 1299,
      imageUrl: 'https://example.com/image2.jpg'
    };

    // Select first product
    productService.selectProduct(product1);
    fixture.detectChanges();
    expect(component.selectedProduct).toEqual(product1);
    expect(fixture.nativeElement.textContent).toContain(product1.name);

    // Select second product
    productService.selectProduct(product2);
    fixture.detectChanges();
    expect(component.selectedProduct).toEqual(product2);
    expect(fixture.nativeElement.textContent).toContain(product2.name);
    expect(fixture.nativeElement.textContent).not.toContain(product1.name);
  });
});