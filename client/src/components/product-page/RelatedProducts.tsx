// components/product-page/RelatedProducts.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '../common/ProductCard';

interface RelatedProductsProps {
  products: Product[];
  title?: string;
  description?: string;
  maxProducts?: number;
  className?: string;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  products,
  title = "You Might Also Like",
  description = "Discover similar products that match your style and preferences",
  maxProducts = 8,
  className
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Limit products to maxProducts
  const displayedProducts = useMemo(() => {
    return products.slice(0, maxProducts);
  }, [products, maxProducts]);

  // Calculate slides for mobile carousel
  const productsPerSlide = 2;
  const totalSlides = Math.ceil(displayedProducts.length / productsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="text-center mb-8 lg:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {description}
          </p>
        )}
      </div>

      {/* Desktop Grid - Hidden on mobile */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {displayedProducts.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            className="animate-in fade-in-0 zoom-in-95"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          />
        ))}
      </div>

      {/* Mobile Carousel - Hidden on desktop */}
      <div className="lg:hidden relative">
        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div key={slideIndex} className="w-full flex-shrink-0">
                <div className="grid grid-cols-2 gap-4 px-2">
                  {displayedProducts
                    .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                    .map((product, index) => (
                      <div key={product._id} className="w-full">
                        <ProductCard
                          product={product}
                          className="h-full animate-in fade-in-0 zoom-in-95"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'both'
                          }}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentSlide
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button for many products */}
      {products.length > maxProducts && (
        <div className="text-center mt-8 lg:mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/shop'}
            className="hover:scale-105 transition-transform"
          >
            View All Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;
