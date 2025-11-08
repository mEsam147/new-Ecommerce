import React, { Suspense } from 'react';
import { CategoryContent } from './CategoryContent';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    brand?: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;

  // In a real app, you'd fetch category data here
  const formattedSlug = slug.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return {
    title: `${formattedSlug} - Shop Modern ${formattedSlug} Products | StyleShop`,
    description: `Discover our premium collection of ${formattedSlug.toLowerCase()} products. Find the best deals, latest trends, and top-quality items for your ${formattedSlug.toLowerCase()} needs.`,
    keywords: `${formattedSlug}, ${formattedSlug.toLowerCase()} products, home ${formattedSlug.toLowerCase()}, buy ${formattedSlug.toLowerCase()} online`,
    openGraph: {
      title: `${formattedSlug} - StyleShop`,
      description: `Explore our ${formattedSlug.toLowerCase()} collection featuring the latest trends and best deals.`,
      type: 'website',
    },
  };
}

export default function CategoryPage({ params, searchParams }: PageProps) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        <div className="flex gap-8">
          {/* Filters Skeleton */}
          <div className="w-80 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Products Skeleton */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
