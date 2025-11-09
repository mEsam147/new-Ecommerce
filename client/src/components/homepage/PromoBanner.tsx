// components/homepage/PromoBanner.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/common/ProductCard';
import { Product } from '@/types';
import Image from 'next/image';
import { Button } from '../ui/button';

interface PromoBannerProps {
  products?: Product[];
}

const PromoBanner: React.FC<PromoBannerProps> = ({ products = [] }) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const hotDealsProducts = Array.isArray(products) ? products.slice(0, 4) : [];

  const nextProduct = () => {
    if (hotDealsProducts.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentProductIndex((prevIndex) =>
        (prevIndex + 1) % hotDealsProducts.length
      );
      setIsAnimating(false);
    }, 300);
  };

  const prevProduct = () => {
    if (hotDealsProducts.length <= 1) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentProductIndex((prevIndex) =>
        prevIndex === 0 ? hotDealsProducts.length - 1 : prevIndex - 1
      );
      setIsAnimating(false);
    }, 300);
  };

  // Auto-rotate hot deals every 3 seconds with animation
  useEffect(() => {
    if (hotDealsProducts.length <= 1) return;

    const interval = setInterval(() => {
      nextProduct();
    }, 3000);

    return () => clearInterval(interval);
  }, [hotDealsProducts.length]);

  const currentProduct = hotDealsProducts[currentProductIndex];

  return (
    <section className="py-12 bg-white text-primary relative overflow-hidden">
      {/* Simple Background Elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-orange-100 rounded-full opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-100 rounded-full opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Flex Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">

          {/* Left Side - Hot Deals Card */}
          <div className="lg:w-2/5">
            <div className="bg-orange-500/60 rounded-xl p-5 shadow-lg h-full relative overflow-hidden">

              {/* Header */}
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                  FLASH SALE
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
                </div>
                <h2 className="text-2xl font-bold text-priamry mb-1">
                  Hot Deals
                </h2>
                <div className="text-xl font-bold text-yellow-300">
                  Up to 60% OFF
                </div>
              </div>

              {/* Navigation Arrows */}
              {hotDealsProducts.length > 1 && (
                <div className="flex justify-between items-center mb-3 px-2">
                  <button
                    onClick={prevProduct}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="text-xs text-white font-medium">
                    {currentProductIndex + 1} / {hotDealsProducts.length}
                  </div>

                  <button
                    onClick={nextProduct}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Main Product Card with Opacity Animation */}
              <div className={` h-1/2 rounded-lg p-3 mb-3 border border-white/20 transition-opacity duration-300 ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}>

                {/* Product Image */}
                <div className="h-full bg-white/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  {currentProduct?.images?.[0]?.url ? (
                    <Image
                    width={300}
                    height={300}


                      src={currentProduct.images[0].url}
                      alt={currentProduct.title}
                      className="w-full h-full rounded-lg object-cover "
                    />
                  ) : (
                    <div className="text-xl">🔥</div>
                  )}
                </div>

                {/* Product Info */}
                <div className="text-center space-y-5 mt-3">
                  <div className="text-lg mt-10 font-bold text-primary line-clamp-2 leading-tight">
                    {currentProduct?.title || 'Limited Time Offer'}
                  </div>

                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl  font-semibold text-orange-200">
                      ${currentProduct?.price || '49'}
                    </span>
                    {currentProduct?.comparePrice && (
                      <span className="text-xs text-orange-500 line-through">
                        ${currentProduct.comparePrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-white/10 rounded-lg   mt-28">
                <div className="text-center mb-2">
                  <div className="text-md text-primary font-semibold">
                    Deal Ends In
                  </div>
                </div>
                <div className="flex items-center justify-center gap-1">
                  {['02', '18', '45', '30'].map((time, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white/20 rounded px-1.5 py-1">
                        <div className="text-xs font-bold text-primary">
                          {time}
                        </div>
                      </div>
                      <div className="text-[10px] text-primary/80 mb-3 mt-0.5">
                        {['D', 'H', 'M', 'S'][index]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <Button asChild variant={"default"}  className='text-primary'>
                    <Link
                href="/shop?sale=true"
                className="block w-full bg-yellow-400 text-primary py-2  rounded-lg font-bold hover:bg-yellow-300 transition-colors text-center text-md"
              >
                Shop Now
              </Link>

              </Button>

            </div>
          </div>

          {/* Right Side - Product Cards Grid */}
          <div className="lg:w-3/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-full">
              {hotDealsProducts.map((product, index) => (
                <div
                  key={product._id}
                className={`transform transition-all duration-300 ${
                    index === currentProductIndex
                      ? 'scale-105 border border-primary rounded-xl '
                      : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="relative h-full">
                    {/* Active Deal Indicator */}
                    {index === currentProductIndex && (
                      <div className="absolute -top-1 -left-1 z-20">
                        <div className="bg-red-500 text-white px-1.5 py-0.5 text-xs font-bold rounded-full animate-pulse">
                          LIVE
                        </div>
                      </div>
                    )}

                    <ProductCard
                      product={product}
                      className="bg-white border border-gray-200 hover:border-orange-300 shadow-sm h-full min-h-[120px]"
                    />

                    {/* Discount Badge */}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <div className="absolute top-1 right-1 z-20">
                        <div className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                          {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Simple Customer Rating */}
            <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="text-xl font-bold text-orange-500">⭐ 4.9</div>
                <div className="text-left">
                  <div className="text-gray-900 font-semibold text-sm">Customer Rating</div>
                  <div className="text-gray-600 text-xs">2,000+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        {hotDealsProducts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {hotDealsProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentProductIndex(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  index === currentProductIndex
                    ? 'bg-orange-500 scale-125'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PromoBanner;
