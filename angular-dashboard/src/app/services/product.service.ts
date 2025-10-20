import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product } from '@ai-product-dashboard/shared-types';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly products: Product[] = [
    {
      id: '1',
      name: 'MacBook Air M2',
      description:
        'Apple MacBook Air 13-inch with M2 chip, 8GB RAM, 256GB SSD. Ultra-thin design with all-day battery life and stunning Retina display.',
      price: 1199,
      originalPrice: 1299,
      image:
        'https://cdn.pixabay.com/photo/2016/11/21/16/27/laptop-1846277_1280.jpg',
      category: 'Laptops',
      inStock: true,
      rating: 4.8,
      reviews: 1247,
    },
    {
      id: '2',
      name: 'Dell XPS 13',
      description:
        'Dell XPS 13 laptop with Intel Core i7, 16GB RAM, 512GB SSD. Premium build quality with InfinityEdge display and exceptional performance.',
      price: 1299,
      image:
        'https://media.wired.com/photos/60f72daa3b922f01a2083b7e/1:1/w_1226,h_1226,c_limit/Gear-Dell-XPS-13-2021.jpg',
      category: 'Laptops',
      inStock: true,
      rating: 4.6,
      reviews: 892,
    },
    {
      id: '3',
      name: 'ThinkPad X1 Carbon',
      description:
        'Lenovo ThinkPad X1 Carbon Gen 10 with Intel Core i5, 16GB RAM, 256GB SSD. Business-grade durability and security features.',
      price: 1449,
      originalPrice: 1599,
      image:
        'https://helios-i.mashable.com/imagery/articles/00mPy0H4xKkro2tJCsK5lYz/images-2.fill.size_2000x1125.v1725487255.jpg',
      category: 'Laptops',
      inStock: true,
      rating: 4.7,
      reviews: 634,
    },
    {
      id: '4',
      name: 'HP Spectre x360',
      description:
        'HP Spectre x360 2-in-1 laptop with Intel Core i7, 16GB RAM, 1TB SSD. Convertible design with touch screen and premium materials.',
      price: 1399,
      image: 'https://cdn.mos.cms.futurecdn.net/Y6kAGm3QkqxXUH9JijdCi.jpg',
      category: 'Laptops',
      inStock: true,
      rating: 4.5,
      reviews: 423,
    },
    {
      id: '5',
      name: 'iPhone 15 Pro',
      description:
        'Apple iPhone 15 Pro with A17 Pro chip, 128GB storage, Pro camera system. Titanium design with Action Button.',
      price: 999,
      originalPrice: 1099,
      image:
        'https://media.cnn.com/api/v1/images/stellar/prod/iphone-15-pro-review-iphone-15-pro-max-and-iphone-15-pro-hero-cnnu.jpg?c=16x9&q=h_833,w_1480,c_fill',
      category: 'Smartphones',
      inStock: true,
      rating: 4.9,
      reviews: 2156,
    },
    {
      id: '6',
      name: 'Samsung Galaxy S24',
      description:
        'Samsung Galaxy S24 with Snapdragon 8 Gen 3, 256GB storage, AI-powered camera. Premium Android experience.',
      price: 899,
      image: 'https://miro.medium.com/v2/1*vlxbxI1ry_2FIiuqRNVOAQ.jpeg',
      category: 'Smartphones',
      inStock: true,
      rating: 4.6,
      reviews: 1834,
    },
    {
      id: '7',
      name: 'AirPods Pro 2',
      description:
        'Apple AirPods Pro (2nd generation) with H2 chip, Active Noise Cancellation, and MagSafe charging case.',
      price: 249,
      originalPrice: 279,
      image:
        'https://www.mybrandstore.pk/wp-content/uploads/2024/03/Apple-AirPods-Pro-2nd-Generation-ANC.jpg',
      category: 'Accessories',
      inStock: true,
      rating: 4.8,
      reviews: 3421,
    },
    {
      id: '8',
      name: 'Magic Mouse',
      description:
        'Apple Magic Mouse with Multi-Touch surface, wireless connectivity, and rechargeable battery. Perfect for Mac users.',
      price: 79,
      image: 'https://i.ytimg.com/vi/qn6fz_6_fcw/maxresdefault.jpg',
      category: 'Accessories',
      inStock: true,
      rating: 4.3,
      reviews: 567,
    },
  ];

  private selectedProductSubject = new BehaviorSubject<Product | null>(null);
  public selectedProduct$: Observable<Product | null> =
    this.selectedProductSubject.asObservable();

  /**
   * Get all products (returns Observable for consistency with real API)
   */
  getProducts(): Observable<Product[]> {
    return of([...this.products]);
  }

  /**
   * Get a product by ID
   */
  getProductById(id: string): Observable<Product | null> {
    const product = this.products.find((p) => p.id === id) || null;
    return of(product);
  }

  /**
   * Select a product and update the state
   */
  selectProduct(product: Product | null): void {
    this.selectedProductSubject.next(product);
  }

  /**
   * Get the currently selected product (synchronous access)
   */
  getSelectedProduct(): Product | null {
    return this.selectedProductSubject.value;
  }

  /**
   * Search products by name or description
   */
  searchProducts(query: string): Observable<Product[]> {
    const filtered = this.products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    const filtered = this.products.filter(
      (product) => product.category?.toLowerCase() === category.toLowerCase()
    );
    return of(filtered);
  }
}
