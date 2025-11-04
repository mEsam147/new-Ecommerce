// app/brands/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { BrandGrid } from '@/components/brands/brandGrid';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: 'Brands | Shop.co',
  description: 'Discover all the amazing brands available at Shop.co. Find your favorite brands and explore new ones.',
  keywords: 'brands, fashion, electronics, home, lifestyle, Shop.co',
};

// Server-side data fetching function
async function getBrands() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ;
    const response = await fetch(`${baseUrl}/brands?limit=50&sort=name`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add revalidation if needed
      next: {
        revalidate: 3600, // Revalidate every hour
        tags: ['brands']
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brands: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    // Return empty data structure to prevent page crash
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0
      }
    };
  }
}

export default async function BrandsPage() {
  // Fetch brands on the server
  const brandsData = await getBrands();
  const brands = brandsData.success ? brandsData.data : [];

  console.log("brnads" , brandsData)

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Our Brands"
        subtitle="Discover amazing brands and find products you'll love"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Brands', href: '/brands' }
        ]}
      />

      <BrandsContent initialBrands={brands} />
    </div>
  );
}

// Client component that receives initial data from server
interface BrandsContentProps {
  initialBrands: any[];
}

function BrandsContent({ initialBrands }: BrandsContentProps) {
  return (
    <>
      {/* Brands Grid Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              All Brands
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collection of trusted brands. From fashion to electronics,
              we've got the best names in the industry.
            </p>
          </div>

          <BrandGrid initialBrands={initialBrands} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Can't Find Your Favorite Brand?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            We're constantly adding new brands to our collection. Let us know which brands you'd like to see!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Suggest a Brand
            </button>
            <button className="px-6 py-3 border border-input bg-background rounded-lg font-semibold hover:bg-accent transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
