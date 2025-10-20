import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { Product } from '@ai-product-dashboard/shared-types';
import { Recommender } from './components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { store } from '../store';

const sampleProduct: Product = {
  id: 1,
  name: 'MacBook Air M2',
  description: 'Lightweight laptop with M2 chip',
  price: 1199,
  imageUrl: 'https://via.placeholder.com/300x200'
};

function AppContent() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#14b7cd] mb-8">
          React Recommender Widget
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="space-y-4">
              <button
                onClick={() => setSelectedProduct(sampleProduct)}
                className="w-full px-4 py-2 bg-[#14b7cd] text-white rounded hover:bg-[#0ea5b8] transition-colors"
              >
                Select Sample Product
              </button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Clear Selection
              </button>
            </div>
            
            {selectedProduct && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-medium">Selected Product:</h3>
                <p className="text-sm text-gray-600">{selectedProduct.name}</p>
              </div>
            )}
          </div>

          {}
          <div className="bg-white rounded-lg shadow">
            <ErrorBoundary fallback={
              <div className="p-6 text-center bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-800 font-semibold mb-2">
                  Widget Error
                </div>
                <div className="text-red-600 text-sm mb-3">
                  The recommendation widget encountered an error.
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            }>
              <Recommender product={selectedProduct} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
