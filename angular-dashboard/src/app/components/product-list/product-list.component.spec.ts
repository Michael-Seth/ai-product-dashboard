import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { Product } from '@ai-product-dashboard/shared-types';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productService: ProductService;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test description 1',
      price: 999,
      imageUrl: 'https://example.com/image1.jpg'
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Test description 2',
      price: 1299,
      imageUrl: 'https://example.com/image2.jpg'
    }
  ];

  beforeEach(async () => {
    const productServiceMock = {
      getProducts: jest.fn().mockReturnValue(mockProducts),
      selectProduct: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        { provide: ProductService, useValue: productServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    component.ngOnInit();
    
    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual(mockProducts);
  });

  it('should display products in template', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const productCards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(productCards.length).toBe(2);

    const firstProductName = fixture.nativeElement.querySelector('h3');
    expect(firstProductName.textContent).toContain('Test Product 1');
  });

  it('should emit product selection and call service on click', () => {
    const emitSpy = jest.spyOn(component.productSelected, 'emit');
    component.ngOnInit();
    fixture.detectChanges();

    const firstProduct = mockProducts[0];
    component.onProductClick(firstProduct);

    expect(productService.selectProduct).toHaveBeenCalledWith(firstProduct);
    expect(emitSpy).toHaveBeenCalledWith(firstProduct);
  });

  it('should handle product click from template', () => {
    const onProductClickSpy = jest.spyOn(component, 'onProductClick');
    component.ngOnInit();
    fixture.detectChanges();

    const firstProductCard = fixture.nativeElement.querySelector('.product-card');
    firstProductCard.click();

    expect(onProductClickSpy).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('should display product price with dollar sign', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const priceElement = fixture.nativeElement.querySelector('.text-xl.font-bold');
    expect(priceElement.textContent).toContain('$999');
  });

  it('should apply hover classes for styling', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const productCard = fixture.nativeElement.querySelector('.product-card');
    expect(productCard.classList).toContain('group');
    expect(productCard.classList).toContain('relative');
    expect(productCard.classList).toContain('overflow-hidden');
    
    // Check that hover effects are applied to child elements
    const productImage = fixture.nativeElement.querySelector('img');
    expect(productImage.classList).toContain('group-hover:scale-110');
    expect(productImage.classList).toContain('transition-transform');
    
    const selectButton = fixture.nativeElement.querySelector('button');
    expect(selectButton.classList).toContain('hover:scale-105');
    expect(selectButton.classList).toContain('transition-all');
  });

  it('should display product images with correct attributes', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const images = fixture.nativeElement.querySelectorAll('img');
    expect(images.length).toBe(2);

    images.forEach((img: HTMLImageElement, index: number) => {
      expect(img.src).toBe(mockProducts[index].imageUrl);
      expect(img.alt).toBe(mockProducts[index].name);
    });
  });

  it('should display product descriptions', () => {
    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(mockProducts[0].description);
    expect(fixture.nativeElement.textContent).toContain(mockProducts[1].description);
  });

  it('should display star ratings for all products', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const starRatings = fixture.nativeElement.querySelectorAll('.text-yellow-400');
    expect(starRatings.length).toBe(2); // One for each product

    const ratingTexts = fixture.nativeElement.querySelectorAll('.text-xs.text-gray-500');
    expect(ratingTexts.length).toBe(2);
    ratingTexts.forEach((rating: HTMLElement) => {
      expect(rating.textContent).toContain('(4.8)');
    });
  });

  it('should have View buttons for all products', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const viewButtons = fixture.nativeElement.querySelectorAll('button');
    expect(viewButtons.length).toBe(2);

    viewButtons.forEach((button: HTMLElement) => {
      expect(button.textContent?.trim()).toContain('View');
      expect(button.classList).toContain('bg-brand');
    });
  });

  it('should handle empty products array gracefully', () => {
    // Mock the service to return empty array
    jest.spyOn(productService, 'getProducts').mockReturnValue([]);
    
    component.ngOnInit();
    fixture.detectChanges();

    const productCards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(productCards.length).toBe(0);
    expect(component.products).toEqual([]);
  });

  it('should apply fade-in animation with staggered delays', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const productCards = fixture.nativeElement.querySelectorAll('.product-card');
    expect(productCards[0].classList).toContain('fade-in');
    expect(productCards[1].classList).toContain('fade-in');

    // Check animation delays are applied
    expect(productCards[0].style.animationDelay).toBe('0s');
    expect(productCards[1].style.animationDelay).toBe('0.1s');
  });
});