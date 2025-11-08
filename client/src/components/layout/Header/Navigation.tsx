// // components/layout/Navigation.tsx
// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   NavigationMenu,
//   NavigationMenuContent,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   NavigationMenuTrigger,
// } from "@/components/ui/navigation-menu";
// import { Skeleton } from '@/components/ui/skeleton';
// import { cn } from '@/lib/utils';
// import {
//   Crown,
//   Star,
//   ArrowRight,
//   Check,
//   ShoppingBag,
//   TrendingUp,
//   Zap,
//   Sparkles,
//   Flame
// } from 'lucide-react';
// import { NavMenuItem } from '@/types';
// import Image from 'next/image';
// import { useNavigation } from '@/lib/hooks/useNavigation';

// interface NavigationProps {
//   navMenu: NavMenuItem[];
//   isLoading: boolean;
// }

// const getCategoryIcon = (categoryName: string) => {
//   const icons: { [key: string]: string } = {
//     'Electronics': '📱',
//     'Fashion': '👕',
//     'Home & Living': '🏠',
//     'Beauty': '💄',
//     'Sports': '⚽',
//     'Smartphones': '📱',
//     'Laptops': '💻',
//     'Headphones': '🎧',
//     'Shoes': '👟',
//     'T-Shirts': '👚',
//     'Furniture': '🛋️',
//     'Skincare': '✨',
//     'Makeup': '🎨',
//     'Running': '🏃',
//     'Yoga': '🧘',
//   };
//   return icons[categoryName] ;
// };

// export const Navigation: React.FC<NavigationProps> = ({
//   navMenu,
//   isLoading,
// }) => {
//   const pathname = usePathname();
//   const { trendingProducts, featuredBrands, topCategories } = useNavigation();

//   if (isLoading) {
//     return (
//       <div className="flex space-x-4">
//         {Array.from({ length: 3 }).map((_, index) => (
//           <Skeleton key={index} className="h-8 w-20 rounded-lg" />
//         ))}
//       </div>
//     );
//   }

//   // Enhanced navigation with conditional brand and trending sections
//   const enhancedNavMenu = [
//     ...navMenu,
//     // Only add Brands if we have data
//     ...(featuredBrands.length > 0
//       ? [
//           {
//             id: 'brands',
//             label: 'Brands',
//             type: 'dropdown' as const,
//             url: '/brands',
//             children: featuredBrands,
//           },
//         ]
//       : []),
//     // Only add Trending if we have data
//     ...(trendingProducts.length > 0
//       ? [
//           {
//             id: 'trending',
//             label: 'Trending',
//             type: 'dropdown' as const,
//             url: '/trending',
//             children: trendingProducts,
//           },
//         ]
//       : []),
//   ];

//   return (
//     <NavigationMenu className="flex-1">
//       <NavigationMenuList className="space-x-1 whitespace-nowrap">
//         {enhancedNavMenu.map((item) => (
//           <NavigationMenuItem key={item.id}>
//             {item.type === 'link' ? (
//               <Link href={item.url || '#'} legacyBehavior passHref>
//                 <NavigationMenuLink
//                   className={cn(
//                     "px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg",
//                     "hover:bg-gray-100 hover:text-gray-900",
//                     pathname === item.url
//                       ? "text-blue-600 bg-blue-50"
//                       : "text-gray-700"
//                   )}
//                 >
//                   <span className="flex items-center gap-2">
//                     <span className="text-base">{getCategoryIcon(item.label)}</span>
//                     {item.label}
//                   </span>
//                 </NavigationMenuLink>
//               </Link>
//             ) : (
//               <>
//                 <NavigationMenuTrigger
//                   className={cn(
//                     "text-sm font-medium transition-colors duration-200 px-4 py-2.5",
//                     "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
//                     "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
//                   )}
//                 >
//                   <span className="flex items-center gap-2">
//                     <span className="text-base">{getCategoryIcon(item.label)}</span>
//                     {item.label}
//                     {item.label === 'Trending' && (
//                       <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
//                     )}
//                     {item.label === 'Brands' && (
//                       <Crown className="w-3 h-3 text-amber-500" />
//                     )}
//                     {item.label === 'Shop' && (
//                       <ShoppingBag className="w-3 h-3 text-blue-500" />
//                     )}
//                   </span>
//                 </NavigationMenuTrigger>
//                 <NavigationMenuContent>
//                   {item.label === 'Brands' ? (
//                     <BrandsDropdownContent brands={item.children || []} />
//                   ) : item.label === 'Trending' ? (
//                     <TrendingDropdownContent products={item.children || []} />
//                   ) : (
//                     <CategoriesDropdownContent
//                       item={item}
//                       topCategories={topCategories}
//                     />
//                   )}
//                 </NavigationMenuContent>
//               </>
//             )}
//           </NavigationMenuItem>
//         ))}
//       </NavigationMenuList>
//     </NavigationMenu>
//   );
// };

// // Brands Dropdown Component
// const BrandsDropdownContent = ({ brands }: { brands: any[] }) => {
//   if (brands.length === 0) {
//     return (
//       <div className="w-64 p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
//         <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//         <h3 className="font-semibold text-gray-900 mb-2">No Brands Available</h3>
//         <p className="text-gray-600 text-sm mb-4">
//           Brand information coming soon
//         </p>
//         <Link
//           href="/brands"
//           className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//         >
//           Explore Brands
//           <ArrowRight className="w-4 h-4" />
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="w-[800px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
//         <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
//           <Crown className="w-5 h-5 text-white" />
//         </div>
//         <div className="flex-1">
//           <h3 className="font-semibold text-xl text-gray-900 mb-1">
//             Featured Brands
//           </h3>
//           <p className="text-gray-600 text-sm">
//             Shop from trusted brand partners
//           </p>
//         </div>
//         <Link
//           href="/brands"
//           className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
//         >
//           View All
//           <ArrowRight className="w-4 h-4" />
//         </Link>
//       </div>

//       {/* Brands Grid */}
//       <div className="grid grid-cols-4 gap-3">
//         {brands.slice(0, 8).map((brand) => (
//           <Link
//             key={brand._id}
//             href={`/brands/${brand.slug}`}
//             className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-center"
//           >
//             {/* Brand Logo */}
//             <div className="relative mb-2">
//               <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
//                 {brand.logo?.url ? (
//                   <Image
//                     src={brand.logo.url}
//                     alt={brand.name}
//                     width={48}
//                     height={48}
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <Crown className="w-5 h-5 text-gray-400" />
//                 )}
//               </div>

//               {/* Verified Badge */}
//               {brand.isVerified && (
//                 <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
//                   <Check className="w-2 h-2 text-white" />
//                 </div>
//               )}
//             </div>

//             {/* Brand Info */}
//             <div className="space-y-1">
//               <h4 className="font-medium text-gray-900 text-sm truncate">
//                 {brand.name}
//               </h4>

//               {/* Rating */}
//               {brand.rating?.average > 0 && (
//                 <div className="flex items-center justify-center gap-1">
//                   <Star className="w-3 h-3 text-amber-400 fill-current" />
//                   <span className="text-xs text-gray-600">
//                     {brand.rating.average.toFixed(1)}
//                   </span>
//                 </div>
//               )}

//               {/* Product Count */}
//               {brand.productCount > 0 && (
//                 <div className="text-xs text-gray-500">
//                   {brand.productCount}+ products
//                 </div>
//               )}
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Trending Dropdown Component - Updated to match Shop/Brands style
// const TrendingDropdownContent = ({ products }: { products: any[] }) => {
//   if (products.length === 0) {
//     return (
//       <div className="w-64 p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
//         <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//         <h3 className="font-semibold text-gray-900 mb-2">No Trending Products</h3>
//         <p className="text-gray-600 text-sm mb-4">
//           Check back later for trending items
//         </p>
//         <Link
//           href="/trending"
//           className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
//         >
//           View All
//           <ArrowRight className="w-4 h-4" />
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="w-[800px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
//         <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
//           <Flame className="w-5 h-5 text-white" />
//         </div>
//         <div className="flex-1">
//           <h3 className="font-semibold text-xl text-gray-900 mb-1">
//             Trending Now
//           </h3>
//           <p className="text-gray-600 text-sm">
//             Discover what's popular right now
//           </p>
//         </div>
//         <Link
//           href="/trending"
//           className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
//         >
//           View All
//           <ArrowRight className="w-4 h-4" />
//         </Link>
//       </div>

//       {/* Top Trending Row */}
//       <div className="mb-6">
//         <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//           <Zap className="w-4 h-4 text-orange-500" />
//           Hot Right Now
//         </h4>
//         <div className="grid grid-cols-4 gap-3">
//           {products.slice(0, 4).map((product, index) => (
//             <Link
//               key={product._id}
//               href={`/shop/product/${product.slug}`}
//               className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-center group"
//             >
//               <div className="relative mb-2">
//                 <div className="w-12 h-12 mx-auto rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
//                   <span className="text-lg">🔥</span>
//                 </div>
//                 <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                   {index + 1}
//                 </div>
//               </div>
//               <span className="text-sm font-medium text-gray-900 block line-clamp-2">
//                 {product.title}
//               </span>
//               <div className="flex items-center justify-center gap-1 mt-1">
//                 <span className="text-xs font-semibold text-orange-600">
//                   ${product.price}
//                 </span>
//                 {product.comparePrice && product.comparePrice > product.price && (
//                   <span className="text-xs text-gray-500 line-through">
//                     ${product.comparePrice}
//                 </span>
//                 )}
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* All Trending Products Grid */}
//       <div className="grid grid-cols-3 gap-4">
//         {products.map((product) => (
//           <Link
//             key={product._id}
//             href={`/shop/product/${product.slug}`}
//             className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
//           >
//             <div className="flex items-start gap-3">
//               {/* Product Image */}
//               <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
//                 {product.images?.[0]?.url ? (
//                   <Image
//                     src={product.images[0].url}
//                     alt={product.title}
//                     width={48}
//                     height={48}
//                     className="w-full h-full object-cover group-hover:scale-110 transition-transform"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     <ShoppingBag className="w-5 h-5" />
//                   </div>
//                 )}
//               </div>

//               {/* Product Info */}
//               <div className="flex-1 min-w-0">
//                 <h4 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
//                   {product.title}
//                 </h4>

//                 {/* Brand */}
//                 {product.brand && (
//                   <p className="text-xs text-gray-500 capitalize mt-1">
//                     {product.brand}
//                   </p>
//                 )}

//                 {/* Price */}
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="text-sm font-semibold text-gray-900">
//                     ${product.price}
//                   </span>
//                   {product.comparePrice && product.comparePrice > product.price && (
//                     <span className="text-xs text-gray-500 line-through">
//                       ${product.comparePrice}
//                     </span>
//                   )}
//                 </div>

//                 {/* Rating */}
//                 {product.rating?.average > 0 && (
//                   <div className="flex items-center gap-1 mt-1">
//                     <Star className="w-3 h-3 text-amber-400 fill-current" />
//                     <span className="text-xs text-gray-600">
//                       {product.rating.average.toFixed(1)} ({product.rating.count})
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Trending Badge */}
//             <div className="mt-2 flex items-center justify-between">
//               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                 <TrendingUp className="w-3 h-3 mr-1" />
//                 Trending
//               </span>

//               {/* Sales Count */}
//               {product.salesCount > 0 && (
//                 <span className="text-xs text-gray-500">
//                   {product.salesCount.toLocaleString()} sold
//                 </span>
//               )}
//             </div>
//           </Link>
//         ))}
//       </div>

//       {/* Quick Stats */}
//       <div className="mt-6 pt-6 border-t border-gray-200">
//         <div className="grid grid-cols-3 gap-4 text-center">
//           <div className="text-center">
//             <div className="text-lg font-bold text-gray-900">{products.length}</div>
//             <div className="text-xs text-gray-500">Trending Items</div>
//           </div>
//           <div className="text-center">
//             <div className="text-lg font-bold text-gray-900">
//               {Math.max(...products.map(p => p.salesCount || 0)).toLocaleString()}
//             </div>
//             <div className="text-xs text-gray-500">Top Sales</div>
//           </div>
//           <div className="text-center">
//             <div className="text-lg font-bold text-gray-900">
//               {Math.max(...products.map(p => p.rating?.average || 0)).toFixed(1)}
//             </div>
//             <div className="text-xs text-gray-500">Best Rated</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Categories Dropdown Component
// const CategoriesDropdownContent = ({ item, topCategories }: { item: any; topCategories: any[] }) => (
//   <div className="w-[800px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
//     {/* Header */}
//     <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
//       <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
//         <span className="text-white text-lg">{getCategoryIcon(item.label)}</span>
//       </div>
//       <div className="flex-1">
//         <h3 className="font-semibold text-xl text-gray-900 mb-1">
//           {item.label}
//         </h3>
//         <p className="text-gray-600 text-sm">
//           {item.description || `Discover ${item.label.toLowerCase()} products`}
//         </p>
//       </div>
//       <Link
//         href={item.url || '#'}
//         className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//       >
//         View All
//         <ArrowRight className="w-4 h-4" />
//       </Link>
//     </div>

//     {/* Top Categories Row */}
//     {topCategories.length > 0 && (
//       <div className="mb-6">
//         <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
//           <Sparkles className="w-4 h-4 text-yellow-500" />
//           Popular Categories
//         </h4>
//         <div className="grid grid-cols-4 gap-3">
//           {topCategories.slice(0, 4).map((category) => (
//             <Link
//               key={category._id}
//               href={`/categories/${category.slug}`}
//               className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-center group"
//             >
//               <div className="w-12 h-12 mx-auto rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
//                 <span className="text-xl">{getCategoryIcon(category.name)}</span>
//               </div>
//               <span className="text-sm font-medium text-gray-900 block">
//                 {category.name}
//               </span>
//               {category.featured && (
//                 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
//                   <Star className="w-2 h-2 mr-1" />
//                   Featured
//                 </span>
//               )}
//             </Link>
//           ))}
//         </div>
//       </div>
//     )}

//     {/* All Categories Grid */}
//     <div className="grid grid-cols-3 gap-4">
//       {item.children?.map((child: any) => (
//         <Link
//           key={child.id}
//           href={child.url}
//           className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
//         >
//           <div className="flex items-start gap-3">
//             {/* Icon */}
//             <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
//               <span className="text-lg">{getCategoryIcon(child.label)}</span>
//             </div>

//             {/* Image Preview */}
//             {child.image && (
//               <div className="flex-1">
//                 <div className="w-full h-16 rounded-md overflow-hidden">
//                   <Image
//                     src={child.image}
//                     alt={child.label}
//                     width={64}
//                     height={64}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Text Content */}
//           <div className="mt-3 space-y-1">
//             <h4 className="font-medium text-gray-900">
//               {child.label}
//             </h4>
//             {child.description && (
//               <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
//                 {child.description}
//               </p>
//             )}
//           </div>

//           {/* Featured Badge */}
//           {child.featured && (
//             <div className="mt-2">
//               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                 <Star className="w-3 h-3 mr-1" />
//                 Featured
//               </span>
//             </div>
//           )}
//         </Link>
//       ))}
//     </div>
//   </div>
// );
// components/layout/Navigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Crown,
  Star,
  ArrowRight,
  Check,
  ShoppingBag,
  TrendingUp,
  Zap,
  Sparkles,
  Flame
} from 'lucide-react';
import { NavMenuItem } from '@/types';
import Image from 'next/image';
import { useNavigation } from '@/lib/hooks/useNavigation';

interface NavigationProps {
  navMenu: NavMenuItem[];
  isLoading: boolean;
}

const getCategoryIcon = (categoryName: string) => {
  const icons: { [key: string]: string } = {
    'Electronics': '📱',
    'Fashion': '👕',
    'Home & Living': '🏠',
    'Beauty': '💄',
    'Sports': '⚽',
    'Smartphones': '📱',
    'Laptops': '💻',
    'Headphones': '🎧',
    'Shoes': '👟',
    'T-Shirts': '👚',
    'Furniture': '🛋️',
    'Skincare': '✨',
    'Makeup': '🎨',
    'Running': '🏃',
    'Yoga': '🧘',
  };
  return icons[categoryName] || '📦';
};

export const Navigation: React.FC<NavigationProps> = ({
  navMenu,
  isLoading,
}) => {
  const pathname = usePathname();
  const { trendingProducts, featuredBrands, topCategories } = useNavigation();

  if (isLoading) {
    return (
      <div className="flex space-x-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-lg" />
        ))}
      </div>
    );
  }

  // Enhanced navigation with conditional sections
  const enhancedNavMenu = [
    ...navMenu,
    // Only add Trending if we have data
    ...(trendingProducts && trendingProducts.length > 0
      ? [
          {
            id: 'trending',
            label: 'Trending',
            type: 'dropdown' as const,
            url: '/trending',
            badge: 'HOT' as const,
          },
        ]
      : []),
    // Only add Brands if we have data
    ...(featuredBrands && featuredBrands.length > 0
      ? [
          {
            id: 'brands',
            label: 'Brands',
            type: 'dropdown' as const,
            url: '/brands',
          },
        ]
      : []),
  ];

  return (
    <NavigationMenu className="flex-1">
      <NavigationMenuList className="space-x-1 whitespace-nowrap">
        {enhancedNavMenu.map((item) => (
          <NavigationMenuItem key={item.id}>
            {item.type === 'link' ? (
              <Link href={item.url || '#'} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    "px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-lg",
                    "hover:bg-gray-100 hover:text-gray-900",
                    pathname === item.url
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{getCategoryIcon(item.label)}</span>
                    {item.label}
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 text-xs font-medium rounded-full",
                        item.badge === 'HOT' && "bg-orange-100 text-orange-800",
                        item.badge === 'SALE' && "bg-green-100 text-green-800"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </NavigationMenuLink>
              </Link>
            ) : (
              <>
                <NavigationMenuTrigger
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 px-4 py-2.5",
                    "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
                    "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{getCategoryIcon(item.label)}</span>
                    {item.label}
                    {item.label === 'Trending' && (
                      <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                    )}
                    {item.label === 'Brands' && (
                      <Crown className="w-3 h-3 text-amber-500" />
                    )}
                    {item.label === 'Shop' && (
                      <ShoppingBag className="w-3 h-3 text-blue-500" />
                    )}
                    {item.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 text-xs font-medium rounded-full",
                        item.badge === 'HOT' && "bg-orange-100 text-orange-800",
                        item.badge === 'SALE' && "bg-green-100 text-green-800"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.label === 'Brands' ? (
                    <BrandsDropdownContent brands={featuredBrands} />
                  ) : item.label === 'Trending' ? (
                    <TrendingDropdownContent products={trendingProducts} />
                  ) : (
                    <CategoriesDropdownContent
                      item={item}
                      topCategories={topCategories}
                    />
                  )}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

// Brands Dropdown Component
const BrandsDropdownContent = ({ brands }: { brands: any[] }) => {
  const displayBrands = Array.isArray(brands) ? brands : [];

  if (displayBrands.length === 0) {
    return null; // Don't render anything if no brands
  }

  return (
    <div className="w-[800px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-xl text-gray-900 mb-1">
            Featured Brands
          </h3>
          <p className="text-gray-600 text-sm">
            Shop from trusted brand partners
          </p>
        </div>
        <Link
          href="/brands"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-4 gap-3">
        {displayBrands.slice(0, 8).map((brand) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-center"
          >
            {/* Brand Logo */}
            <div className="relative mb-2">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                {brand.logo?.url ? (
                  <Image
                    src={brand.logo.url}
                    alt={brand.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Crown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Verified Badge */}
              {brand.isVerified && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </div>

            {/* Brand Info */}
            <div className="space-y-1">
              <h4 className="font-medium text-gray-900 text-sm truncate">
                {brand.name}
              </h4>

              {/* Rating */}
              {brand.rating?.average > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span className="text-xs text-gray-600">
                    {brand.rating.average.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Product Count */}
              {brand.productCount > 0 && (
                <div className="text-xs text-gray-500">
                  {brand.productCount}+ products
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Trending Dropdown Component
const TrendingDropdownContent = ({ products }: { products: any[] }) => {
  // Extract products from the nested structure
  const displayProducts = Array.isArray(products)
    ? products
    : (products as any)?.products || [];

  if (displayProducts.length === 0) {
    return (
      <div className="w-64 p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">No Trending Products</h3>
        <p className="text-gray-600 text-sm mb-4">
          Check back later for trending items
        </p>
        <Link
          href="/trending"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-[800px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-xl text-gray-900 mb-1">
            Trending Now
          </h3>
          <p className="text-gray-600 text-sm">
            Discover what's popular right now
          </p>
        </div>
        <Link
          href="/trending"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Top Trending Row */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-500" />
          Hot Right Now
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {displayProducts.slice(0, 4).map((product, index) => (
            <Link
              key={product._id || `trending-${index}`}
              href={`/shop/product/${product.slug}`}
              className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-center group"
            >
              <div className="relative mb-2">
                <div className="w-12 h-12 mx-auto rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                  <span className="text-lg">🔥</span>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 block line-clamp-2">
                {product.title}
              </span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-xs font-semibold text-orange-600">
                  ${product.price}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xs text-gray-500 line-through">
                    ${product.comparePrice}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Trending Products Grid */}
      <div className="grid grid-cols-3 gap-4">
        {displayProducts.map((product) => (
          <Link
            key={product._id}
            href={`/shop/product/${product.slug}`}
            className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
          >
            <div className="flex items-start gap-3">
              {/* Product Image */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                {product.images?.[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight">
                  {product.title}
                </h4>

                {/* Brand */}
                {product.brand && (
                  <p className="text-xs text-gray-500 capitalize mt-1">
                    {product.brand}
                  </p>
                )}

                {/* Price */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-gray-900">
                    ${product.price}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-xs text-gray-500 line-through">
                      ${product.comparePrice}
                    </span>
                  )}
                </div>

                {/* Rating */}
                {product.rating?.average > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-xs text-gray-600">
                      {product.rating.average.toFixed(1)} ({product.rating.count || 0})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trending Badge */}
            <div className="mt-2 flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </span>

              {/* Sales Count */}
              {product.salesCount > 0 && (
                <span className="text-xs text-gray-500">
                  {product.salesCount.toLocaleString()} sold
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{displayProducts.length}</div>
            <div className="text-xs text-gray-500">Trending Items</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {Math.max(...displayProducts.map(p => p.salesCount || 0)).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Top Sales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {Math.max(...displayProducts.map(p => p.rating?.average || 0)).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Best Rated</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Categories Dropdown Component
const CategoriesDropdownContent = ({ item, topCategories }: { item: any; topCategories: any[] }) => (
  <div className="w-[800px] p-6 bg-white rounded-xl shadow-lg border border-gray-200">
    {/* Header */}
    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
        <span className="text-white text-lg">{getCategoryIcon(item.label)}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-xl text-gray-900 mb-1">
          {item.label}
        </h3>
        <p className="text-gray-600 text-sm">
          {item.description || `Discover ${item.label.toLowerCase()} products`}
        </p>
      </div>
      <Link
        href={item.url || '#'}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
      >
        View All
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>

    {/* Top Categories Row */}
    {topCategories && topCategories.length > 0 && (
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          Popular Categories
        </h4>
        <div className="grid grid-cols-4 gap-3">
          {topCategories.slice(0, 4).map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 text-center group"
            >
              <div className="w-12 h-12 mx-auto rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <span className="text-xl">{getCategoryIcon(category.name)}</span>
              </div>
              <span className="text-sm font-medium text-gray-900 block">
                {category.name}
              </span>
              {category.featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                  <Star className="w-2 h-2 mr-1" />
                  Featured
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    )}

    {/* All Categories Grid */}
    <div className="grid grid-cols-3 gap-4">
      {item.children?.map((child: any) => (
        <Link
          key={child.id}
          href={child.url}
          className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <span className="text-lg">{getCategoryIcon(child.label)}</span>
            </div>

            {/* Image Preview */}
            {child.image && (
              <div className="flex-1">
                <div className="w-full h-16 rounded-md overflow-hidden">
                  <Image
                    src={child.image}
                    alt={child.label}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="mt-3 space-y-1">
            <h4 className="font-medium text-gray-900">
              {child.label}
            </h4>
            {child.description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {child.description}
              </p>
            )}
          </div>

          {/* Featured Badge */}
          {child.featured && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            </div>
          )}
        </Link>
      ))}
    </div>
  </div>
);
