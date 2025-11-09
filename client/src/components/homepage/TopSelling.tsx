// components/homepage/TopSelling.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/common/ProductCard';
import { Product } from '@/types';

interface TopSellingProps {
  products: Product[];
}

const TopSelling: React.FC<TopSellingProps> = ({ products }) => {
  const displayProducts = Array.isArray(products) ? products.slice(0, 4) : [];

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Customer Favorites
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Top Selling Products
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Join thousands of satisfied customers who love these bestsellers
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayProducts.map((product, index) => (
            <div
              key={product._id}
              className="group relative"
            >
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                #{index + 1}
              </div>

              {/* Best Seller Ribbon */}
              <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold z-10">
                BEST SELLER
              </div>

              <div className="transform transition-all duration-500 group-hover:scale-105">
                <ProductCard
                  product={product}
                  className="shadow-lg group-hover:shadow-2xl transition-all bg-white"
                />
              </div>

              {/* Sales Count */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-gray-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                ⭐ 500+ sold
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/shop?sort=popular"
            className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span>See All Best Sellers</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TopSelling;
