// components/homepage/CategoryGrid.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    public_id: string;
    url: string;
  };
  parent?: {
    _id: string;
    name: string;
    slug: string;
  };
  isActive: boolean;
  featured: boolean;
  productsCount?: number;
}

interface CategoryGridProps {
  categories: Category[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categories }) => {
  const defaultCategories = [
    {
      _id: '1',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Stylish fashion accessories including jewelry, bags, watches and more',
      image: {
        public_id: 'accessories-cat',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop'
      },
      parent: {
        _id: '2',
        name: 'Fashion',
        slug: 'fashion'
      },
      isActive: true,
      featured: true,
      productsCount: 256
    },
    {
      _id: '2',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets, smartphones, laptops and cutting-edge technology',
      image: {
        public_id: 'electronics-cat',
        url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=400&fit=crop'
      },
      isActive: true,
      featured: true,
      productsCount: 512
    },
    {
      _id: '3',
      name: 'Home Decor',
      slug: 'home-decor',
      description: 'Beautiful home furnishings, furniture and interior decoration items',
      image: {
        public_id: 'home-cat',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop'
      },
      isActive: true,
      featured: false,
      productsCount: 189
    },
    {
      _id: '4',
      name: 'Sports & Fitness',
      slug: 'sports-fitness',
      description: 'Equipment and gear for all your sports and fitness activities',
      image: {
        public_id: 'sports-cat',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'
      },
      isActive: true,
      featured: true,
      productsCount: 324
    },
    {
      _id: '5',
      name: 'Beauty & Care',
      slug: 'beauty-care',
      description: 'Premium skincare, makeup and personal care products',
      image: {
        public_id: 'beauty-cat',
        url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop'
      },
      isActive: true,
      featured: false,
      productsCount: 278
    },
    {
      _id: '6',
      name: 'Toys & Games',
      slug: 'toys-games',
      description: 'Fun toys, games and entertainment for all ages',
      image: {
        public_id: 'toys-cat',
        url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop'
      },
      isActive: true,
      featured: false,
      productsCount: 167
    }
  ];

  const displayCategories = categories.length > 0 ? categories.slice(0, 6) :[]


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-gray-200 shadow-sm mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">Popular Categories</span>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our extensive collection across various categories, each offering unique products tailored to your needs
          </p>
        </motion.div>

        {/* Categories Grid - 2x3 Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {displayCategories.map((category, index) => (
            <motion.div
              key={category._id}
              variants={cardVariants}
              whileHover={{
                y: -12,
                scale: 1.02,
                transition: { duration: 0.4 }
              }}
              className="group"
            >
              <Link
                href={`/shop?category=${category.slug}`}
                className="block h-full"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col">

                  {/* Image Container - Bigger */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                    width={500}
                    height={500}
                      src={category.image?.url as string}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Featured Badge */}
                    {category.featured && (
                      <div className="absolute top-6 left-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ⭐ Featured
                      </div>
                    )}

                    {/* Parent Category */}
                    {category.parent && (
                      <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-lg">
                        {category.parent.name}
                      </div>
                    )}

                    {/* Hover Action Indicator */}
                    <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-700">
                        Explore Collection →
                      </div>
                    </div>
                  </div>

                  {/* Content - Enhanced */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                        {category.name}
                      </h3>

                      <p className="text-gray-600 text-lg leading-relaxed mb-6 line-clamp-3">
                        {category.description}
                      </p>
                    </div>

                    {/* Footer with Stats */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <span className="font-semibold">{category.productsCount}+ products</span>
                        </div>
                      </div>

                      {/* Enhanced Arrow Button */}
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-45 transition-all duration-300 shadow-lg">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 rounded-3xl transition-all duration-500 pointer-events-none"></div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link
            href="/categories"
            className="group inline-flex items-center gap-4 bg-gray-900 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <span>Explore All Categories</span>
            <svg
              className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
