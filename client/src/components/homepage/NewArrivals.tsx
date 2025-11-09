// components/homepage/NewArrivals.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/common/ProductCard';
import { Product } from '@/types';

interface NewArrivalsProps {
  products: Product[];
}

const NewArrivals: React.FC<NewArrivalsProps> = ({ products }) => {
  const displayProducts = Array.isArray(products) ? products.slice(0, 4) : [];

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Fresh Arrivals
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              New Arrivals
            </h2>
            <p className="text-gray-600 mt-2">
              Discover the latest products just added to our collection
            </p>
          </div>

          <Link
            href="/shop?sort=newest"
            className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <div
              key={product._id}
              className="transform transition-all duration-500 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard
                product={product}
                className="shadow-lg hover:shadow-2xl transition-shadow"
              />

              {/* New Badge */}
              <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                NEW
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/shop?sort=newest"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            View All New Arrivals
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
