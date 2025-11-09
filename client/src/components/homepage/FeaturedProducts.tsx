  // components/homepage/FeaturedProducts.tsx
  'use client';

  import React from 'react';
  import Link from 'next/link';
  import ProductCard from '@/components/common/ProductCard';
  import { Product } from '@/types';

  interface FeaturedProductsProps {
    products: Product[];
  }

  const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
    const displayProducts = Array.isArray(products) ? products : [];

    if (displayProducts.length === 0) {
      return null;
    }

    // Check if we have enough products for the special layout
    const hasEnoughProducts = displayProducts.length >= 9;

    // Split products for different layouts
    let leftProducts: Product[] = [];
    let centerProduct: Product | null = null;
    let rightProducts: Product[] = [];

    if (hasEnoughProducts) {
      // Special layout: 4 left (2x2), 1 big center, 4 right (2x2)
      leftProducts = displayProducts.slice(0, 4);
      centerProduct = displayProducts[4];
      rightProducts = displayProducts.slice(5, 9);
    } else {
      // Regular grid layout
      leftProducts = displayProducts;
    }

    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full opacity-30 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Editor&apos;s Choice
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Featured Products
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Carefully curated selection of our most exceptional products that redefine quality and style
            </p>
          </div>

          {/* Products Layout */}
          {hasEnoughProducts ? (
            // Special Layout: 4 left (2x2), 1 big center, 4 right (2x2)
            <div className="flex flex-col xl:flex-row gap-8 xl:gap-6 mb-16">
              {/* Left Column - 4 Products in 2x2 grid */}
              <div className="xl:w-1/4">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {leftProducts.map((product, index) => (
                    <div key={product._id} className="transform transition-all duration-500 hover:scale-105">
                      <ProductCard
                        product={product}
                        className="h-full shadow-lg hover:shadow-xl border-2 border-transparent hover:border-purple-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Column - Big Featured Product */}
              <div className="xl:w-2/4 flex items-center justify-center px-4 xl:px-0">
                {centerProduct && (
                  <div className="relative group">
                    {/* Premium Center Badge */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        FEATURED PRODUCT
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                      </div>
                    </div>

                    {/* Enhanced Center Card */}
                    <div className="transform transition-all duration-700 group-hover:scale-105 group-hover:shadow-3xl">
                      <ProductCard
                        product={centerProduct}
                        className="min-h-[500px] border-2 border-purple-200 shadow-2xl bg-white/80 backdrop-blur-sm"
                        priority={true}
                      />
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                  </div>
                )}
              </div>

              {/* Right Column - 4 Products in 2x2 grid */}
              <div className="xl:w-1/4">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {rightProducts.map((product, index) => (
                    <div key={product._id} className="transform transition-all duration-500 hover:scale-105">
                      <ProductCard
                        product={product}
                        className="h-full shadow-lg hover:shadow-xl border-2 border-transparent hover:border-blue-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Regular Grid Layout
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {leftProducts.map((product, index) => (
                <div key={product._id} className="transform transition-all duration-500 hover:scale-105">
                  <ProductCard
                    product={product}
                    className="h-full shadow-lg hover:shadow-xl"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">9+</div>
              <div className="text-gray-600 font-semibold">Featured Products</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">⭐ 4.9</div>
              <div className="text-gray-600 font-semibold">Average Rating</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-2">🚚 Free</div>
              <div className="text-gray-600 font-semibold">Shipping</div>
            </div>
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-orange-100">
              <div className="text-3xl font-bold text-orange-600 mb-2">✓ 100%</div>
              <div className="text-gray-600 font-semibold">Quality Guarantee</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/shop?featured=true"
              className="group inline-flex items-center gap-4 bg-white text-gray-900 px-10 py-5 rounded-2xl font-semibold border-2 border-gray-200 hover:border-purple-600 hover:text-purple-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

              <span className="relative z-10">Explore All Featured Products</span>
              <svg
                className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
                <div className="absolute inset-[2px] bg-white rounded-2xl"></div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    );
  };

  export default FeaturedProducts;
