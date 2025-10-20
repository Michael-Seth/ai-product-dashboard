import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Product } from '@ai-product-dashboard/shared-types';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  selectedProduct: Product | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.productService.selectedProduct$.subscribe(product => {
        this.selectedProduct = product;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}