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

// // Fallback data in case API fails
// const fallbackNewArrivals: Product[] = [
//   {
//     id: "1",
//     title: "T-shirt with Tape Details",
//     images: [{ url: "/images/pic1.png", public_id: "" }],
//     price: 120,
//     discount: {
//       amount: 0,
//       percentage: 0,
//     },
//     rating: 4.5,
//     reviewCount: 24,
//     stock: 50,
//     category: { name: "T-Shirts", slug: "t-shirts" },
//     slug: "t-shirt-with-tape-details",
//     featured: false,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: "2",
//     title: "Skinny Fit Jeans",
//     images: [{ url: "/images/pic2.png", public_id: "" }],
//     price: 260,
//     discount: {
//       amount: 52,
//       percentage: 20,
//     },
//     rating: 3.5,
//     reviewCount: 18,
//     stock: 30,
//     category: { name: "Jeans", slug: "jeans" },
//     slug: "skinny-fit-jeans",
//     featured: false,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: "3",
//     title: "Chechered Shirt",
//     images: [{ url: "/images/pic3.png", public_id: "" }],
//     price: 180,
//     discount: {
//       amount: 0,
//       percentage: 0,
//     },
//     rating: 4.5,
//     reviewCount: 32,
//     stock: 25,
//     category: { name: "Shirts", slug: "shirts" },
//     slug: "chechered-shirt",
//     featured: false,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: "4",
//     title: "Sleeve Striped T-shirt",
//     images: [{ url: "/images/pic4.png", public_id: "" }],
//     price: 160,
//     discount: {
//       amount: 48,
//       percentage: 30,
//     },
//     rating: 4.5,
//     reviewCount: 29,
//     stock: 40,
//     category: { name: "T-Shirts", slug: "t-shirts" },
//     slug: "sleeve-striped-t-shirt",
//     featured: true,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   }
// ];

// const fallbackTopSelling: Product[] = [
//   {
//     id: "5",
//     title: "Vertical Striped Shirt",
//     images: [{ url: "/images/pic5.png", public_id: "" }],
//     price: 232,
//     discount: {
//       amount: 46.4,
//       percentage: 20,
//     },
//     rating: 5.0,
//     reviewCount: 45,
//     stock: 15,
//     category: { name: "Shirts", slug: "shirts" },
//     slug: "vertical-striped-shirt",
//     featured: true,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: "6",
//     title: "Courage Graphic T-shirt",
//     images: [{ url: "/images/pic6.png", public_id: "" }],
//     price: 145,
//     discount: {
//       amount: 0,
//       percentage: 0,
//     },
//     rating: 4.0,
//     reviewCount: 38,
//     stock: 60,
//     category: { name: "T-Shirts", slug: "t-shirts" },
//     slug: "courage-graphic-t-shirt",
//     featured: false,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: "7",
//     title: "Loose Fit Bermuda Shorts",
//     images: [{ url: "/images/pic7.png", public_id: "" }],
//     price: 80,
//     discount: {
//       amount: 0,
//       percentage: 0,
//     },
//     rating: 3.0,
//     reviewCount: 12,
//     stock: 35,
//     category: { name: "Shorts", slug: "shorts" },
//     slug: "loose-fit-bermuda-shorts",
//     featured: false,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: "8",
//     title: "Faded Skinny Jeans",
//     images: [{ url: "/images/pic8.png", public_id: "" }],
//     price: 210,
//     discount: {
//       amount: 0,
//       percentage: 0,
//     },
//     rating: 4.5,
//     reviewCount: 27,
//     stock: 20,
//     category: { name: "Jeans", slug: "jeans" },
//     slug: "faded-skinny-jeans",
//     featured: true,
//     status: "active",
//     isActive: true,
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   }
// ];

// const fallbackReviews: Review[] = [
//   {
//     id: "1",
//     user: {
//       name: "Alex K.",
//       avatar: { url: "/images/avatar1.jpg", public_id: "" }
//     },
//     product: {
//       title: "Premium T-Shirt",
//       images: [{ url: "/images/pic1.png", public_id: "" }]
//     },
//     rating: 5,
//     comment: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.",
//     status: "approved",
//     isActive: true,
//     createdAt: "2023-08-14T00:00:00.000Z",
//     updatedAt: "2023-08-14T00:00:00.000Z"
//   },
//   {
//     id: "2",
//     user: {
//       name: "Sarah M.",
//       avatar: { url: "/images/avatar2.jpg", public_id: "" }
//     },
//     product: {
//       title: "Designer Jeans",
//       images: [{ url: "/images/pic2.png", public_id: "" }]
//     },
//     rating: 5,
//     comment: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
//     status: "approved",
//     isActive: true,
//     createdAt: "2023-08-15T00:00:00.000Z",
//     updatedAt: "2023-08-15T00:00:00.000Z"
//   }
// ];


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


  console.log("newArrivals" , newArrivals)
  console.log("topSelling" , topSellingData)
  console.log("reviewDAta" , reviewsData)

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
