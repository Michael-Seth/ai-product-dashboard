import { Route } from '@angular/router';
import { ProductsComponent } from './pages/products/products.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoryComponent } from './pages/category/category.component';
import { DealsComponent } from './pages/deals/deals.component';
import { ProductDetailPageComponent } from './pages/product-detail/product-detail-page.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { SuccessComponent } from './pages/success/success.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    component: ProductsComponent,
  },
  {
    path: 'categories',
    component: CategoriesComponent,
  },
  {
    path: 'category/:name',
    component: CategoryComponent,
  },
  {
    path: 'deals',
    component: DealsComponent,
  },
  {
    path: 'product/:id',
    component: ProductDetailPageComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'success',
    component: SuccessComponent,
  },
  {
    path: '**',
    redirectTo: '/products',
  },
];
