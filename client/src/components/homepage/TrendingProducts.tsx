// components/homepage/TrendingProducts.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/common/ProductCard';
import { Product } from '@/types';

interface TrendingProductsProps {
  products: Product[];
}

const TrendingProducts: React.FC<TrendingProductsProps> = ({ products }) => {
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
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
              Hot Right Now
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Trending Products
            </h2>
            <p className="text-gray-600 mt-2">
              See what everyone&apos;s talking about this week
            </p>
          </div>

          <Link
            href="/shop?sort=trending"
            className="hidden sm:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
          >
            View All Trending
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
              className="group relative"
            >
              {/* Trend Badge */}
              <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                TRENDING
              </div>

              {/* Fire Icon */}
              <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"/>
                  </svg>
                </div>
              </div>

              <div className="transform transition-all duration-500 hover:scale-105">
                <ProductCard
                  product={product}
                  className="shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-orange-200"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/shop?sort=trending"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
          >
            View All Trending Products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
