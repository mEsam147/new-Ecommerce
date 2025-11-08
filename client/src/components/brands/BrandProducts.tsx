// // components/brands/BrandProducts.tsx
// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { ProductGrid } from '@/components/shop-page/ProductGrid';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Filter, Grid3X3, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
// import { useGetBrandProductsBySlugQuery } from '@/lib/services/brandApi';
// import { useGetCategoriesByBrandQuery } from '@/lib/services/categoriesApi';
// import { PriceRangeSlider, PriceRange } from '@/components/ui/PriceRangeSlider';

// interface BrandProductsProps {
//   initialProducts?: any[];
//   initialTotal?: number;
//   slug: string;
//   searchParams: {
//     category?: string;
//     sort?: string;
//     page?: string;
//     minPrice?: string;
//     maxPrice?: string;
//   };
// }

// export const BrandProducts: React.FC<BrandProductsProps> = ({
//   initialProducts = [],
//   initialTotal = 0,
//   slug,
//   searchParams
// }) => {
//   const router = useRouter();
//   const params = useSearchParams();
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>(
//     searchParams.category ? searchParams.category.split(',') : []
//   );
//   const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 5000 });
//   const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>({ min: 0, max: 5000 });
//   const [sortOption, setSortOption] = useState(searchParams.sort || 'featured');

//   // Fetch products with filters
//   const { data, isLoading, error } = useGetBrandProductsBySlugQuery({
//     slug: slug,
//     page: parseInt(searchParams.page || '1'),
//     limit: 12,
//     category: searchParams.category,
//     sort: searchParams.sort,
//     minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
//     maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
//   });

//   // Fetch categories for this brand
//   const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesByBrandQuery(slug);

//   // Use server data initially, then client data when available
//   const products = data?.data || initialProducts;
//   const totalProducts = data?.pagination?.total || initialTotal;
//   const brand = data?.brand;
//   const categories = categoriesData?.data || [];

//   // Calculate price range from products
//   useEffect(() => {
//     if (products && products.length > 0) {
//       const prices = products.map(product => product.price);
//       const minPrice = Math.floor(Math.min(...prices));
//       const maxPrice = Math.ceil(Math.max(...prices));
//       const calculatedRange = {
//         min: Math.max(0, minPrice - 50),
//         max: maxPrice + 50
//       };
//       setPriceRange(calculatedRange);

//       // Set selected price range from URL or default to full range
//       const urlMinPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : calculatedRange.min;
//       const urlMaxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : calculatedRange.max;
//       setSelectedPriceRange({
//         min: Math.max(calculatedRange.min, urlMinPrice),
//         max: Math.min(calculatedRange.max, urlMaxPrice)
//       });
//     }
//   }, [products, searchParams.minPrice, searchParams.maxPrice]);

//   // Generate URL with filters
//   const updateFilters = useCallback((updates: {
//     category?: string[];
//     minPrice?: number;
//     maxPrice?: number;
//     sort?: string;
//     page?: number;
//     clearPrice?: boolean; // New option to clear price filters
//   }) => {
//     const newParams = new URLSearchParams(params.toString());

//     // Update categories
//     if (updates.category !== undefined) {
//       if (updates.category.length > 0) {
//         newParams.set('category', updates.category.join(','));
//       } else {
//         newParams.delete('category');
//       }
//     }

//     // Handle price range updates
//     if (updates.clearPrice) {
//       // Clear both price filters
//       newParams.delete('minPrice');
//       newParams.delete('maxPrice');
//     } else {
//       // Update min price
//       if (updates.minPrice !== undefined) {
//         if (updates.minPrice > priceRange.min) {
//           newParams.set('minPrice', updates.minPrice.toString());
//         } else {
//           newParams.delete('minPrice');
//         }
//       }

//       // Update max price
//       if (updates.maxPrice !== undefined) {
//         if (updates.maxPrice < priceRange.max) {
//           newParams.set('maxPrice', updates.maxPrice.toString());
//         } else {
//           newParams.delete('maxPrice');
//         }
//       }
//     }

//     // Update sort
//     if (updates.sort && updates.sort !== 'featured') {
//       newParams.set('sort', updates.sort);
//     } else {
//       newParams.delete('sort');
//     }

//     // Update page
//     if (updates.page && updates.page > 1) {
//       newParams.set('page', updates.page.toString());
//     } else {
//       newParams.delete('page');
//     }

//     router.push(`?${newParams.toString()}`, { scroll: false });
//   }, [params, router, priceRange]);

//   // Clear specific price filter (min or max)
//   const clearPriceFilter = (type: 'min' | 'max' | 'both') => {
//     if (type === 'both') {
//       // Clear both price filters
//       setSelectedPriceRange(priceRange);
//       updateFilters({ clearPrice: true, page: 1 });
//     } else if (type === 'min') {
//       // Clear only min price
//       const newRange = { ...selectedPriceRange, min: priceRange.min };
//       setSelectedPriceRange(newRange);
//       updateFilters({ minPrice: priceRange.min, page: 1 });
//     } else if (type === 'max') {
//       // Clear only max price
//       const newRange = { ...selectedPriceRange, max: priceRange.max };
//       setSelectedPriceRange(newRange);
//       updateFilters({ maxPrice: priceRange.max, page: 1 });
//     }
//   };

//   // Handle category selection
//   const toggleCategory = (categoryName: string) => {
//     const newCategories = selectedCategories.includes(categoryName)
//       ? selectedCategories.filter(cat => cat !== categoryName)
//       : [...selectedCategories, categoryName];

//     setSelectedCategories(newCategories);
//     updateFilters({ category: newCategories, page: 1 });
//   };

//   // Handle price range change from slider
//   const handlePriceRangeChange = (range: PriceRange) => {
//     setSelectedPriceRange(range);
//   };

//   // Apply price filter
//   const applyPriceFilter = () => {
//     updateFilters({
//       minPrice: selectedPriceRange.min,
//       maxPrice: selectedPriceRange.max,
//       page: 1
//     });
//   };

//   // Handle sort change
//   const handleSortChange = (value: string) => {
//     setSortOption(value);
//     updateFilters({ sort: value, page: 1 });
//   };

//   // Clear all filters
//   const clearAllFilters = () => {
//     setSelectedCategories([]);
//     setSelectedPriceRange(priceRange);
//     setSortOption('featured');
//     updateFilters({
//       category: [],
//       clearPrice: true,
//       sort: 'featured',
//       page: 1
//     });
//   };

//   const hasActiveFilters = selectedCategories.length > 0 ||
//     selectedPriceRange.min > priceRange.min ||
//     selectedPriceRange.max < priceRange.max;

//   const hasPriceFilter = selectedPriceRange.min > priceRange.min || selectedPriceRange.max < priceRange.max;
//   const hasMinPriceFilter = selectedPriceRange.min > priceRange.min;
//   const hasMaxPriceFilter = selectedPriceRange.max < priceRange.max;

//   if (error && initialProducts.length === 0) {
//     return (
//       <section className="py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <div className="w-24 h-24 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
//             <Filter className="w-12 h-12 text-destructive" />
//           </div>
//           <h3 className="text-xl font-semibold text-foreground mb-2">
//             Failed to load products
//           </h3>
//           <p className="text-muted-foreground mb-6">
//             Please try refreshing the page
//           </p>
//           <Button onClick={() => window.location.reload()}>
//             Try Again
//           </Button>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header with Filters */}
//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
//           <div>
//             {isLoading && initialProducts.length === 0 ? (
//               <>
//                 <Skeleton className="h-8 w-64 mb-2" />
//                 <Skeleton className="h-4 w-32" />
//               </>
//             ) : (
//               <>
//                 <h2 className="text-2xl font-bold text-foreground">
//                   {brand?.name || 'Brand'} Products
//                 </h2>
//                 <p className="text-muted-foreground mt-1">
//                   {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
//                   {hasActiveFilters && ' (filtered)'}
//                 </p>
//               </>
//             )}
//           </div>

//           {/* Controls */}
//           <div className="flex items-center gap-4">
//             {/* Active Filters Badges */}
//             {hasActiveFilters && (
//               <div className="flex items-center gap-2 flex-wrap">
//                 {/* Category Badges */}
//                 {selectedCategories.map(category => (
//                   <Badge key={category} variant="secondary" className="gap-1">
//                     {category}
//                     <X
//                       className="w-3 h-3 cursor-pointer"
//                       onClick={() => toggleCategory(category)}
//                     />
//                   </Badge>
//                 ))}

//                 {/* Price Filter Badges */}
//                 {hasMinPriceFilter && (
//                   <Badge variant="secondary" className="gap-1">
//                     Min: ${selectedPriceRange.min}
//                     <X
//                       className="w-3 h-3 cursor-pointer"
//                       onClick={() => clearPriceFilter('min')}
//                     />
//                   </Badge>
//                 )}

//                 {hasMaxPriceFilter && (
//                   <Badge variant="secondary" className="gap-1">
//                     Max: ${selectedPriceRange.max}
//                     <X
//                       className="w-3 h-3 cursor-pointer"
//                       onClick={() => clearPriceFilter('max')}
//                     />
//                   </Badge>
//                 )}

//                 {/* Clear All Button */}
//                 <Button variant="ghost" size="sm" onClick={clearAllFilters}>
//                   Clear All
//                 </Button>
//               </div>
//             )}

//             {/* Mobile Filter Toggle */}
//             <Button
//               variant="outline"
//               size="sm"
//               className="lg:hidden gap-2"
//               onClick={() => setShowFilters(!showFilters)}
//             >
//               <SlidersHorizontal className="w-4 h-4" />
//               Filters
//             </Button>

//             {/* View Toggle */}
//             <div className="flex items-center gap-1 border rounded-lg p-1">
//               <Button
//                 variant={viewMode === 'grid' ? "default" : "ghost"}
//                 size="sm"
//                 className="h-8 w-8 p-0"
//                 onClick={() => setViewMode('grid')}
//               >
//                 <Grid3X3 className="w-4 h-4" />
//               </Button>
//               <Button
//                 variant={viewMode === 'list' ? "default" : "ghost"}
//                 size="sm"
//                 className="h-8 w-8 p-0"
//                 onClick={() => setViewMode('list')}
//               >
//                 <List className="w-4 h-4" />
//               </Button>
//             </div>

//             {/* Sort Dropdown */}
//             <div className="relative">
//               <select
//                 value={sortOption}
//                 onChange={(e) => handleSortChange(e.target.value)}
//                 className="appearance-none bg-background border border-input rounded-md px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value="featured">Featured</option>
//                 <option value="newest">Newest</option>
//                 <option value="price-low">Price: Low to High</option>
//                 <option value="price-high">Price: High to Low</option>
//                 <option value="name">Name: A to Z</option>
//               </select>
//               <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
//             </div>
//           </div>
//         </div>

//         {/* Filters Sidebar (Mobile & Desktop) */}
//         {showFilters && (
//           <div className="lg:hidden mb-6 p-4 border rounded-lg bg-background">
//             <FiltersSidebar
//               categories={categories}
//               selectedCategories={selectedCategories}
//               onCategoryToggle={toggleCategory}
//               priceRange={priceRange}
//               selectedPriceRange={selectedPriceRange}
//               onPriceRangeChange={handlePriceRangeChange}
//               onApplyPriceFilter={applyPriceFilter}
//               onClearPriceFilter={() => clearPriceFilter('both')}
//               categoriesLoading={categoriesLoading}
//               hasPriceFilter={hasPriceFilter}
//             />
//           </div>
//         )}

//         <div className="flex gap-8">
//           {/* Desktop Filters Sidebar */}
//           <div className="hidden lg:block w-80 flex-shrink-0">
//             <FiltersSidebar
//               categories={categories}
//               selectedCategories={selectedCategories}
//               onCategoryToggle={toggleCategory}
//               priceRange={priceRange}
//               selectedPriceRange={selectedPriceRange}
//               onPriceRangeChange={handlePriceRangeChange}
//               onApplyPriceFilter={applyPriceFilter}
//               onClearPriceFilter={() => clearPriceFilter('both')}
//               categoriesLoading={categoriesLoading}
//               hasPriceFilter={hasPriceFilter}
//             />
//           </div>

//           {/* Products Grid */}
//           <div className="flex-1">
//             <ProductGrid
//               products={products}
//               isLoading={isLoading && initialProducts.length === 0}
//               totalProducts={totalProducts}
//               showViewToggle={false}
//               viewMode={viewMode}
//               searchQuery={brand?.name}
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// // Filters Sidebar Component
// interface FiltersSidebarProps {
//   categories: any[];
//   selectedCategories: string[];
//   onCategoryToggle: (categoryName: string) => void;
//   priceRange: PriceRange;
//   selectedPriceRange: PriceRange;
//   onPriceRangeChange: (range: PriceRange) => void;
//   onApplyPriceFilter: () => void;
//   onClearPriceFilter: () => void;
//   categoriesLoading: boolean;
//   hasPriceFilter: boolean;
// }

// const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
//   categories,
//   selectedCategories,
//   onCategoryToggle,
//   priceRange,
//   selectedPriceRange,
//   onPriceRangeChange,
//   onApplyPriceFilter,
//   onClearPriceFilter,
//   categoriesLoading,
//   hasPriceFilter
// }) => {
//   return (
//     <div className="space-y-6">
//       <h3 className="font-semibold text-lg">Filters</h3>

//       {/* Categories */}
//       <div>
//         <h4 className="font-medium mb-3">Categories</h4>
//         <div className="space-y-2 max-h-60 overflow-y-auto">
//           {categoriesLoading ? (
//             Array.from({ length: 4 }).map((_, i) => (
//               <Skeleton key={i} className="h-10 w-full" />
//             ))
//           ) : categories.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No categories found</p>
//           ) : (
//             categories.map(category => (
//               <button
//                 key={category._id}
//                 onClick={() => onCategoryToggle(category.name)}
//                 className={`flex items-center justify-between w-full p-2 rounded-lg text-sm transition-colors ${
//                   selectedCategories.includes(category.name)
//                     ? 'bg-primary text-primary-foreground'
//                     : 'hover:bg-accent'
//                 }`}
//               >
//                 <span>{category.name}</span>
//                 <Badge
//                   variant={selectedCategories.includes(category.name) ? "default" : "secondary"}
//                   className="text-xs"
//                 >
//                   {category.productsCount || 0}
//                 </Badge>
//               </button>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Price Range */}
//       <div>
//         <div className="flex items-center justify-between mb-3">
//           <h4 className="font-medium">Price Range</h4>
//           {hasPriceFilter && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={onClearPriceFilter}
//               className="h-6 text-xs text-muted-foreground hover:text-foreground"
//             >
//               <X className="w-3 h-3 mr-1" />
//               Clear
//             </Button>
//           )}
//         </div>

//         <PriceRangeSlider
//           priceRange={priceRange}
//           selectedRange={selectedPriceRange}
//           onRangeChange={onPriceRangeChange}
//           onApply={onApplyPriceFilter}
//           onClear={onClearPriceFilter}
//           showApplyButton={true}
//           showClearButton={false}
//           currency="$"
//           allowOverlap={true}
//           className="mt-2"
//         />
//       </div>

//       {/* Clear All Filters */}
//       {(selectedCategories.length >= 0 || hasPriceFilter) && (
//         <Button
//           variant="outline"
//           size="sm"
//           className="w-full"
//           onClick={() => {
//             selectedCategories.forEach(cat => onCategoryToggle(cat));
//             onClearPriceFilter();
//           }}
//         >
//           Clear All Filters
//         </Button>
//       )}
//     </div>
//   );
// };

// components/brands/BrandProducts.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/shop-page/ProductGrid';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Filter, Grid3X3, List, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useGetBrandProductsBySlugQuery } from '@/lib/services/brandApi';
import { useGetCategoriesByBrandQuery } from '@/lib/services/categoriesApi';
import PriceFilter from '@/components/shop-page/PriceFilter';

interface BrandProductsProps {
  initialProducts?: any[];
  initialTotal?: number;
  slug: string;
  searchParams: {
    category?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export const BrandProducts: React.FC<BrandProductsProps> = ({
  initialProducts = [],
  initialTotal = 0,
  slug,
  searchParams
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.category ? searchParams.category.split(',') : []
  );
  const [sortOption, setSortOption] = useState(searchParams.sort || 'featured');
  const [isPriceFiltering, setIsPriceFiltering] = useState(false);

  // Calculate initial price range from URL
  const initialMinPrice = searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined;
  const initialMaxPrice = searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined;

  // Fetch products with filters
  const { data, isLoading, error, isFetching } = useGetBrandProductsBySlugQuery({
    slug: slug,
    page: parseInt(searchParams.page || '1'),
    limit: 12,
    category: searchParams.category,
    sort: searchParams.sort,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
  });

  // Fetch categories for this brand
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesByBrandQuery(slug);

  // Use server data initially, then client data when available
  const products = data?.data || initialProducts;
  const totalProducts = data?.pagination?.total || initialTotal;
  const brand = data?.brand;
  const categories = categoriesData?.data || [];

  // Generate URL with filters
  const updateFilters = useCallback((updates: {
    category?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
  }) => {
    const newParams = new URLSearchParams(params.toString());

    // Update categories
    if (updates.category !== undefined) {
      if (updates.category.length > 0) {
        newParams.set('category', updates.category.join(','));
      } else {
        newParams.delete('category');
      }
    }

    // Update price
    if (updates.minPrice !== undefined) {
      if (updates.minPrice > 0) {
        newParams.set('minPrice', updates.minPrice.toString());
      } else {
        newParams.delete('minPrice');
      }
    }

    if (updates.maxPrice !== undefined) {
      if (updates.maxPrice < 1000) {
        newParams.set('maxPrice', updates.maxPrice.toString());
      } else {
        newParams.delete('maxPrice');
      }
    }

    // Update sort
    if (updates.sort && updates.sort !== 'featured') {
      newParams.set('sort', updates.sort);
    } else {
      newParams.delete('sort');
    }

    // Update page
    if (updates.page && updates.page > 1) {
      newParams.set('page', updates.page.toString());
    } else {
      newParams.delete('page');
    }

    router.push(`?${newParams.toString()}`, { scroll: false });
  }, [params, router]);

  // Handle price filter change
  const handlePriceChange = useCallback((minPrice?: number, maxPrice?: number) => {
    setIsPriceFiltering(true);
    updateFilters({
      minPrice: minPrice || 0,
      maxPrice: maxPrice || 1000,
      page: 1
    });

    // Reset loading state after a short delay
    setTimeout(() => setIsPriceFiltering(false), 500);
  }, [updateFilters]);

  // Handle category selection
  const toggleCategory = (categoryName: string) => {
    const newCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(cat => cat !== categoryName)
      : [...selectedCategories, categoryName];

    setSelectedCategories(newCategories);
    updateFilters({ category: newCategories, page: 1 });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value);
    updateFilters({ sort: value, page: 1 });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSortOption('featured');
    updateFilters({
      category: [],
      minPrice: 0,
      maxPrice: 1000,
      sort: 'featured',
      page: 1
    });
  };

  // Clear price filter
  const clearPriceFilter = () => {
    updateFilters({
      minPrice: 0,
      maxPrice: 1000,
      page: 1
    });
  };

  const hasActiveFilters = selectedCategories.length > 0 ||
    initialMinPrice !== undefined ||
    initialMaxPrice !== undefined;

  const hasPriceFilter = initialMinPrice !== undefined || initialMaxPrice !== undefined;

  if (error && initialProducts.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Filter className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load products
          </h3>
          <p className="text-gray-600 mb-6">
            Please try refreshing the page
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            {isLoading && initialProducts.length === 0 ? (
              <>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">
                  {brand?.name || 'Brand'} Products
                </h2>
                <p className="text-gray-600 mt-1">
                  {totalProducts} {totalProducts === 1 ? 'product' : 'products'} found
                  {hasActiveFilters && ' (filtered)'}
                </p>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Category Badges */}
                {selectedCategories.map(category => (
                  <Badge key={category} variant="secondary" className="gap-1 bg-blue-100 text-blue-800">
                    {category}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-blue-600"
                      onClick={() => toggleCategory(category)}
                    />
                  </Badge>
                ))}

                {/* Price Filter Badge */}
                {hasPriceFilter && (
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                    Price Filter
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-green-600"
                      onClick={clearPriceFilter}
                    />
                  </Badge>
                )}

                {/* Clear All Button */}
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-gray-600 hover:text-gray-900">
                  Clear All
                </Button>
              </div>
            )}

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {selectedCategories.length + (hasPriceFilter ? 1 : 0)}
                </span>
              )}
            </Button>

            {/* View Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
              <Button
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters Sidebar (Mobile & Desktop) */}
        {showFilters && (
          <div className="lg:hidden mb-6 p-4 border rounded-lg bg-white shadow-sm">
            <FiltersSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={toggleCategory}
              minPrice={initialMinPrice}
              maxPrice={initialMaxPrice}
              onPriceChange={handlePriceChange}
              categoriesLoading={categoriesLoading}
              isPriceFiltering={isPriceFiltering}
            />
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg border p-4 shadow-sm sticky top-4">
              <FiltersSidebar
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryToggle={toggleCategory}
                minPrice={initialMinPrice}
                maxPrice={initialMaxPrice}
                onPriceChange={handlePriceChange}
                categoriesLoading={categoriesLoading}
                isPriceFiltering={isPriceFiltering}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              isLoading={isLoading && initialProducts.length === 0}
              isFiltering={isFetching}
              totalProducts={totalProducts}
              showViewToggle={false}
              viewMode={viewMode}
              searchQuery={brand?.name}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// Filters Sidebar Component
interface FiltersSidebarProps {
  categories: any[];
  selectedCategories: string[];
  onCategoryToggle: (categoryName: string) => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange: (minPrice?: number, maxPrice?: number) => void;
  categoriesLoading: boolean;
  isPriceFiltering: boolean;
}

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  minPrice,
  maxPrice,
  onPriceChange,
  categoriesLoading,
  isPriceFiltering
}) => {
  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 text-lg">Filters</h3>

      {/* Categories */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categoriesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories found</p>
          ) : (
            categories.map(category => (
              <button
                key={category._id}
                onClick={() => onCategoryToggle(category.name)}
                className={`flex items-center justify-between w-full p-3 rounded-lg text-sm transition-colors ${
                  selectedCategories.includes(category.name)
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span>{category.name}</span>
                <Badge
                  variant={selectedCategories.includes(category.name) ? "default" : "secondary"}
                  className="text-xs"
                >
                  {category.productsCount || 0}
                </Badge>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={onPriceChange}
          isFiltering={isPriceFiltering}
        />
      </div>

      {/* Clear All Filters */}
      {(selectedCategories.length > 0 || minPrice !== undefined || maxPrice !== undefined) && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            selectedCategories.forEach(cat => onCategoryToggle(cat));
            onPriceChange(undefined, undefined);
          }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
};
