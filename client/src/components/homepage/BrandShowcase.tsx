// components/homepage/BrandShowcase.tsx
'use client';

import React from 'react';

const brands = [
  { name: 'Nike', logo: '/brands/nike.svg' },
  { name: 'Adidas', logo: '/brands/adidas.svg' },
  { name: 'Apple', logo: '/brands/apple.svg' },
  { name: 'Samsung', logo: '/brands/samsung.svg' },
  { name: 'Sony', logo: '/brands/sony.svg' },
  { name: 'Zara', logo: '/brands/zara.svg' },
  { name: 'Puma', logo: '/brands/puma.svg' },
  { name: 'Gucci', logo: '/brands/gucci.svg' },
  { name: 'Louis Vuitton', logo: '/brands/lv.svg' },
  { name: 'Chanel', logo: '/brands/chanel.svg' },
];

const BrandShowcase = () => {
  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="py-16 bg-white border-y border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Trusted Partners
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by World&apos;s Best Brands
          </h2>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            We partner with leading brands to bring you the finest products
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

          {/* Marquee */}
          <div className="flex overflow-hidden">
            <div className="flex animate-marquee hover:[animation-play-state:paused] group">
              {duplicatedBrands.map((brand, index) => (
                <div
                  key={`${brand.name}-${index}`}
                  className="flex-shrink-0 mx-4 group-hover:pause"
                >
                  <div className="group/brand flex items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-500 transform hover:scale-110 border-2 border-transparent hover:border-blue-200">
                    <div className="relative w-32 h-16 grayscale group-hover/brand:grayscale-0 transition-all duration-500 opacity-70 group-hover/brand:opacity-100">
                      {/* Brand Logo Placeholder with Primary Color */}
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-1">
                          <div className="text-2xl font-bold text-gray-500 group-hover/brand:text-blue-600 transition-colors duration-300">
                            {brand.name}
                          </div>
                          <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto group-hover/brand:bg-blue-500 transition-colors duration-300"></div>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-blue-500/5 rounded-2xl opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Active Indicator */}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-blue-600 group-hover/brand:w-8 transition-all duration-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Static Grid for Mobile */}
        <div className="lg:hidden mt-8">
          <div className="grid grid-cols-3 gap-4">
            {brands.slice(0, 6).map((brand, index) => (
              <div
                key={brand.name}
                className="group flex items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative w-20 h-10 grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">50+</div>
            <div className="text-gray-600">Brand Partners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">100%</div>
            <div className="text-gray-600">Authentic Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">24/7</div>
            <div className="text-gray-600">Brand Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">5★</div>
            <div className="text-gray-600">Brand Rating</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 2));
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .hover\:\[animation-play-state\:paused\]:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default BrandShowcase;
