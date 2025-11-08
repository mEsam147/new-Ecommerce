// app/page.tsx - SERVER COMPONENT (UPDATED)
import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import HeroSection from "@/components/homepage/Header";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { Product, Review } from "@/types";

// API calls on the server
async function getNewArrivals(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/new-arrivals?limit=8`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      throw new Error('Failed to fetch new arrivals');
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
}

async function getTopSelling(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/top-selling?limit=8`, {
      next: { revalidate: 1800 }, // Revalidate every 30 minutes
    });

    if (!res.ok) {
      throw new Error('Failed to fetch top selling');
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching top selling:', error);
    return [];
  }
}

async function getReviews(): Promise<Review[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews?limit=6`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch reviews');
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}



export default async function Home() {
  // Fetch data in parallel on the server
  const [newArrivals, topSelling, reviews] = await Promise.all([
    getNewArrivals(),
    getTopSelling(),
    getReviews()
  ]);

  // Use fallback data if API returns empty
  const newArrivalsData = newArrivals
  const topSellingData = topSelling
  const reviewsData = reviews.length



  return (
    <>
      <HeroSection />
      <Brands />
      <main className="my-[50px] sm:my-[72px]">
        <ProductListSec
          title="NEW ARRIVALS"
          data={newArrivalsData}
          viewAllLink="/shop#new-arrivals"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 my-10 sm:my-16" />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec
            title="top selling"
            data={topSellingData}
            viewAllLink="/shop#top-selling"
          />
        </div>
        <div className="mb-[50px] sm:mb-20">
          <DressStyle />
        </div>
        {/* <Reviews data={reviewsData} /> */}
      </main>
    </>
  );
}
