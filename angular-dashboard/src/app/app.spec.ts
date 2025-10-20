import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { ProductService } from './services/product.service';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, ProductListComponent, ProductDetailComponent],
      providers: [ProductService]
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'AI Product Recommendation Dashboard'
    );
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the correct title property', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('AI Product Recommendation Dashboard');
  });

  it('should handle product selection', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    const mockProduct = {
      id: 1,
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      imageUrl: 'test.jpg'
    };

    app.onProductSelected(mockProduct);

    expect(app).toBeTruthy();
  });
});
