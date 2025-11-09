// // app/page.tsx - SERVER COMPONENT (UPDATED)
// import ProductListSec from "@/components/common/ProductListSec";
// import Brands from "@/components/homepage/Brands";
// import DressStyle from "@/components/homepage/DressStyle";
// import HeroSection from "@/components/homepage/Header";
// import Reviews from "@/components/homepage/Reviews";
// import { Product, Review } from "@/types";

// // API calls on the server
// async function getNewArrivals(): Promise<Product[]> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/new-arrivals?limit=8`, {
//       next: { revalidate: 3600 },
//     });

//     if (!res.ok) {
//       throw new Error('Failed to fetch new arrivals');
//     }

//     const data = await res.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching new arrivals:', error);
//     return [];
//   }
// }

// async function getTopSelling(): Promise<Product[]> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/top-selling?limit=8`, {
//       next: { revalidate: 1800 },
//     });

//     if (!res.ok) {
//       throw new Error('Failed to fetch top selling');
//     }

//     const data = await res.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching top selling:', error);
//     return [];
//   }
// }

// async function getFeaturedProducts(): Promise<Product[]> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/featured?limit=8`, {
//       next: { revalidate: 3600 },
//     });

//     if (!res.ok) {
//       throw new Error('Failed to fetch featured products');
//     }

//     const data = await res.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching featured products:', error);
//     return [];
//   }
// }

// async function getTrendingProducts(): Promise<Product[]> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/trending?limit=8`, {
//       next: { revalidate: 1800 },
//     });

//     if (!res.ok) {
//       throw new Error('Failed to fetch trending products');
//     }

//     const data = await res.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching trending products:', error);
//     return [];
//   }
// }

// async function getTopCategories(): Promise<any[]> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/top?limit=6`, {
//       next: { revalidate: 3600 },
//     });

//     if (!res.ok) {
//       throw new Error('Failed to fetch top categories');
//     }

//     const data = await res.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching top categories:', error);
//     return [];
//   }
// }

// async function getReviews(): Promise<Review[]> {
//   try {
//     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?limit=6`, {
//       next: { revalidate: 3600 },
//     });

//     if (!res.ok) {
//       throw new Error('Failed to fetch reviews');
//     }

//     const data = await res.json();
//     return data.data || [];
//   } catch (error) {
//     console.error('Error fetching reviews:', error);
//     return [];
//   }
// }

// export default async function Home() {
//   // Fetch data in parallel on the server
//   const [newArrivals, topSelling, featuredProducts, trendingProducts, topCategories, reviews] = await Promise.all([
//     getNewArrivals(),
//     getTopSelling(),
//     getFeaturedProducts(),
//     getTrendingProducts(),
//     getTopCategories(),
//     getReviews()
//   ]);

//   return (
//     <>
//       <HeroSection />
//       <Brands />

//       <main className="my-[50px] sm:my-[72px]">
//         {/* New Arrivals Section */}
//         <ProductListSec
//           title="NEW ARRIVALS"
//           data={newArrivals}
//           viewAllLink="/shop?sort=newest"
//         />

//         <SectionDivider />

//         {/* Featured Products Section */}
//         <ProductListSec
//           title="FEATURED PRODUCTS"
//           data={featuredProducts}
//           viewAllLink="/shop?featured=true"
//           className="mb-[50px] sm:mb-20"
//         />

//         <SectionDivider />

//         {/* Top Selling Section */}
//         <ProductListSec
//           title="TOP SELLING"
//           data={topSelling}
//           viewAllLink="/shop?sort=popular"
//           className="mb-[50px] sm:mb-20"
//         />

//         <SectionDivider />

//         {/* Trending Now Section */}
//         <ProductListSec
//           title="TRENDING NOW"
//           data={trendingProducts}
//           viewAllLink="/shop?sort=trending"
//           className="mb-[50px] sm:mb-20"
//         />

//         {/* Categories Section */}
//         {topCategories.length > 0 && (
//           <>
//             <SectionDivider />
//             <CategoriesSection categories={topCategories} />
//           </>
//         )}

//         {/* Dress Style Section */}
//         <SectionDivider />
//         <div className="mb-[50px] sm:mb-20">
//           <DressStyle />
//         </div>

//         {/* Reviews Section */}
//         {reviews.length > 0 && (
//           <>
//             <SectionDivider />
//             <Reviews data={reviews} />
//           </>
//         )}

//         {/* Newsletter Section */}
//         <SectionDivider />
//         <NewsletterSection />
//       </main>
//     </>
//   );
// }

// // Section Divider Component
// function SectionDivider() {
//   return (
//     <div className="max-w-frame mx-auto px-4 xl:px-0">
//       <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
//     </div>
//   );
// }

// // Categories Section Component
// function CategoriesSection({ categories }: { categories: any[] }) {
//   return (
//     <section className="mb-[50px] sm:mb-20">
//       <div className="max-w-frame mx-auto px-4 xl:px-0">
//         <div className="text-center mb-8">
//           <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
//             SHOP BY CATEGORY
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Explore our wide range of categories and find exactly what you're looking for
//           </p>
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
//           {categories.map((category) => (
//             <a
//               key={category._id}
//               href={`/shop?category=${category.slug}`}
//               className="group block text-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
//                 {category.image?.url ? (
//                   // Using img instead of Image for server component simplicity
//                   <img
//                     src={category.image.url}
//                     alt={category.name}
//                     className="w-10 h-10 object-cover rounded-full"
//                   />
//                 ) : (
//                   <span className="text-lg font-bold text-gray-600">
//                     {category.name.charAt(0).toUpperCase()}
//                   </span>
//                 )}
//               </div>
//               <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
//                 {category.name}
//               </h3>
//               {category.productsCount && (
//                 <p className="text-sm text-gray-500 mt-1">
//                   {category.productsCount} products
//                 </p>
//               )}
//             </a>
//           ))}
//         </div>

//         <div className="text-center mt-8">
//           <a
//             href="/categories"
//             className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
//           >
//             View All Categories
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//             </svg>
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }

// // Newsletter Section Component
// function NewsletterSection() {
//   return (
//     <section className="mb-[50px] sm:mb-20">
//       <div className="max-w-4xl mx-auto px-4 xl:px-0">
//         <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
//           <h2 className="text-2xl sm:text-3xl font-bold mb-4">
//             Stay in the Loop
//           </h2>
//           <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
//             Subscribe to our newsletter and be the first to know about new arrivals,
//             exclusive offers, and style tips.
//           </p>

//           <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
//             <input
//               type="email"
//               placeholder="Enter your email address"
//               className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//             <button
//               type="submit"
//               className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
//             >
//               Subscribe
//             </button>
//           </form>

//           <p className="text-sm text-blue-200 mt-4">
//             By subscribing, you agree to our Privacy Policy and consent to receive updates.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// }


// app/page.tsx - COMPLETE HOME PAGE
import React from 'react';
// import HeroSection from '@/components/homepage/HeroSection';
import BrandShowcase from '@/components/homepage/BrandShowcase';
import CategoryGrid from '@/components/homepage/CategoryGrid';
import FeaturedProducts from '@/components/homepage/FeaturedProducts';
import NewArrivals from '@/components/homepage/NewArrivals';
import TrendingProducts from '@/components/homepage/TrendingProducts';
import TopSelling from '@/components/homepage/TopSelling';
import PromoBanner from '@/components/homepage/PromoBanner';
import Testimonials from '@/components/homepage/Testimonials';
import Newsletter from '@/components/homepage/Newsletter';
import HeroSection from '@/components/homepage/Header';

// Server-side data fetching
async function getHomePageData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch all data in parallel
    const [
      newArrivalsRes,
      featuredRes,
      trendingRes,
      topSellingRes,
      categoriesRes,
      testimonialsRes
    ] = await Promise.all([
      fetch(`${baseUrl}/products/new-arrivals?limit=8`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/products/featured`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/products/trending?limit=8`, {
        next: { revalidate: 1800 }
      }),
      fetch(`${baseUrl}/products/top-selling?limit=8`, {
        next: { revalidate: 1800 }
      }),
      fetch(`${baseUrl}/categories/top?limit=6`, {
        next: { revalidate: 3600 }
      }),
      fetch(`${baseUrl}/reviews?limit=6`, {
        next: { revalidate: 3600 }
      })
    ]);

    // Parse responses
    const [
      newArrivalsData,
      featuredData,
      trendingData,
      topSellingData,
      categoriesData,
      testimonialsData
    ] = await Promise.all([
      newArrivalsRes.json(),
      featuredRes.json(),
      trendingRes.json(),
      topSellingRes.json(),
      categoriesRes.json(),
      testimonialsRes.json()
    ]);

    return {
      newArrivals: newArrivalsData.data || [],
      featured: featuredData.data || [],
      trending: trendingData.data || [],
      topSelling: topSellingData.data || [],
      categories: categoriesData.data || [],
      testimonials: testimonialsData.data || []
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      newArrivals: [],
      featured: [],
      trending: [],
      topSelling: [],
      categories: [],
      testimonials: []
    };
  }
}

export default async function Home() {
  const {
    newArrivals,
    featured,
    trending,
    topSelling,
    categories,
    testimonials
  } = await getHomePageData();

  console.log("categoriesData" , categories)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Brand Showcase */}
      <BrandShowcase />

      {/* Categories Grid */}
      <CategoryGrid categories={categories} />

      {/* New Arrivals */}
      <NewArrivals products={newArrivals} />

      {/* Promo Banner */}
      <PromoBanner products={topSelling} />

      {/* Featured Products */}
      <FeaturedProducts products={featured} />

      {/* Trending Products */}
      <TrendingProducts products={trending} />

      {/* Top Selling */}
      <TopSelling products={topSelling} />

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

    </div>
  );
}
