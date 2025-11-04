// components/brands/BrandGrid.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp, Users, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetBrandsQuery } from '@/lib/services/brandApi';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BrandGridProps {
  initialBrands?: any[];
  initialPagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const BrandGrid: React.FC<BrandGridProps> = ({
  initialBrands = [],
  initialPagination
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get filters from URL search params
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'name';

  // Local filter state
  const [filters, setFilters] = useState({
    search,
    sort,
    page,
    limit: 12,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.sort !== 'name') params.set('sort', filters.sort);

    // Replace URL without causing navigation
    router.replace(`/brands?${params.toString()}`, { scroll: false });
  }, [filters, router]);

  // Use RTK Query for client-side updates with pagination
  const { data, isLoading, isFetching, error } = useGetBrandsQuery({
    page: filters.page,
    limit: filters.limit,
    sort: filters.sort,
    search: filters.search,
  }, {
    // Skip the initial fetch if we have server data and it's the first page
    skip: initialBrands.length > 0 && filters.page === 1 && !filters.search
  });

  // Use server data initially for first page, then client data when available
  const brands = (data?.data || (filters.page === 1 && !filters.search ? initialBrands : [])) as any[];
  const pagination = data?.pagination || (filters.page === 1 && !filters.search ? initialPagination : {
    page: filters.page,
    limit: filters.limit,
    total: 0,
    pages: 0
  });

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle search and sort changes
  const handleFilterChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  }, []);

  if (isLoading && brands.length === 0) {
    return (
      <div className="space-y-6">
        <BrandGridSkeleton />
        <PaginationSkeleton />
      </div>
    );
  }

  if (error && brands.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Failed to load brands
        </h3>
        <p className="text-muted-foreground mb-4">
          Please try refreshing the page
        </p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No Brands Found
        </h3>
        <p className="text-muted-foreground">
          {filters.search ? 'Try adjusting your search terms.' : 'Check back later for new brand additions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brands Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <BrandCard key={brand._id} brand={brand} />
        ))}
      </div>

      {/* Pagination - Using the same style as your shop page */}
      {pagination && pagination.pages > 1 && (
        <div className='border-t border-black/10'>
 <div className=" pt-6 max-w-full md:max-w-[400px] mx-auto ">
          <Pagination className="justify-between">
            <PaginationPrevious
              onClick={() => handlePageChange(pagination.page - 1)}
              className={`border border-black/10 ${pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            />

            <PaginationContent>
              {getPaginationItems(pagination.page, pagination.pages).map((item, index) => (
                <PaginationItem key={index}>
                  {item === 'ellipsis' ? (
                    <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(item as number)}
                      className={`text-black/50 font-medium text-sm ${pagination.page === item ? 'text-black font-semibold' : 'cursor-pointer'}`}
                      isActive={pagination.page === item}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
            </PaginationContent>

            <PaginationNext
              onClick={() => handlePageChange(pagination.page + 1)}
              className={`border border-black/10 ${pagination.page === pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            />
          </Pagination>

          {/* Items Count */}
          <div className="text-center mt-4 text-sm text-black/60">
            Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} brands
          </div>
        </div>
        </div>

      )}
    </div>
  );
};

// Helper function to generate pagination items like your shop page
const getPaginationItems = (currentPage: number, totalPages: number) => {
  const items: (number | 'ellipsis')[] = [];

  if (totalPages <= 7) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Always show first page
    items.push(1);

    if (currentPage > 3) {
      items.push('ellipsis');
    }

    // Show pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentPage < totalPages - 2) {
      items.push('ellipsis');
    }

    // Always show last page
    items.push(totalPages);
  }

  return items;
};

const BrandCard: React.FC<{ brand: any }> = ({ brand }) => {
  return (
    <Link href={`/brands/${brand.slug}`}>
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
        <CardContent className="p-0">
          {/* Brand Image */}
          <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center p-8">
            {brand.logo?.url ? (
              <Image
                src={brand.logo.url}
                alt={brand.name}
                width={120}
                height={120}
                className="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {brand.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Featured Badge */}
            {brand.isFeatured && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                <Zap className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Brand Info */}
          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {brand.name}
              </h3>

              {/* Rating */}
              {brand.rating && brand.rating.count > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{brand.rating.average?.toFixed(1) || '0.0'}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {brand.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {brand.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{brand.productCount || 0} products</span>
              </div>

              {brand.followerCount > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{brand.followerCount?.toLocaleString() || 0} followers</span>
                </div>
              )}
            </div>

            {/* Categories */}
            {brand.categories && brand.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {brand.categories.slice(0, 2).map((category: any) => (
                  <Badge key={category._id || category} variant="secondary" className="text-xs">
                    {category.name || category}
                  </Badge>
                ))}
                {brand.categories.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{brand.categories.length - 2} more
                  </Badge>
                )}
              </div>
            )}

            {/* View Products Button */}
            <Button
              variant="outline"
              className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              View Products
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const BrandGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="space-y-4">
              {/* Image Skeleton */}
              <Skeleton className="aspect-square w-full rounded-none" />

              {/* Content Skeleton */}
              <div className="space-y-3 p-6">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>

                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>

                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-14" />
                </div>

                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const PaginationSkeleton: React.FC = () => {
  return (
    <div className="border-t border-black/10 pt-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-24 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
};

export default BrandGrid;
