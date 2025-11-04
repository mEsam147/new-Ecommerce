// app/brands/[slug]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrandHeader } from '@/components/brands/BrandHeader';
import { BrandProducts } from '@/components/brands/BrandProducts';

interface BrandPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    category?: string;
    sort?: string;
    page?: string;
  };
}

// Server-side data fetching for brand by slug
async function getBrandBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/brands/slug/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 3600, // Revalidate every hour
        tags: ['brands']
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch brand: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching brand:', error);
    return null;
  }
}

// Server-side data fetching for brand products by slug
async function getBrandProductsBySlug(slug: string, searchParams: any) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const queryParams = new URLSearchParams();

    if (searchParams.category) queryParams.append('category', searchParams.category);
    if (searchParams.sort) queryParams.append('sort', searchParams.sort);
    if (searchParams.page) queryParams.append('page', searchParams.page);

    queryParams.append('limit', '12');

    const response = await fetch(`${baseUrl}/brands/slug/${slug}/products?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300, // Revalidate every 5 minutes
        tags: ['products']
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch brand products: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching brand products:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      }
    };
  }
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brandData = await getBrandBySlug(params.slug);

  if (!brandData?.success || !brandData.data) {
    return {
      title: 'Brand Not Found | Shop.co',
    };
  }

  const brand = brandData.data;

  return {
    title: `${brand.name} | Shop.co`,
    description: brand.description || `Discover amazing products from ${brand.name} at Shop.co`,
    keywords: `${brand.name}, ${brand.categories?.join(', ')}, Shop.co`,
    openGraph: {
      title: `${brand.name} | Shop.co`,
      description: brand.description || `Discover amazing products from ${brand.name}`,
      images: brand.logo?.url ? [brand.logo.url] : [],
      type: 'website',
      url: `/brands/${brand.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand.name} | Shop.co`,
      description: brand.description || `Discover amazing products from ${brand.name}`,
      images: brand.logo?.url ? [brand.logo.url] : [],
    },
  };
}

export async function generateStaticParams() {
  // Generate static params for popular brands
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${baseUrl}/brands?limit=20&sort=productCount`, {
      next: { revalidate: 86400 } // Revalidate daily
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.data.map((brand: any) => ({
      slug: brand.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  // Fetch brand and products in parallel on the server
  const [brandData, productsData] = await Promise.all([
    getBrandBySlug(params.slug),
    getBrandProductsBySlug(params.slug, searchParams)
  ]);

  if (!brandData?.success || !brandData.data) {
    notFound();
  }

  const brand = brandData.data;
  const products = productsData.success ? productsData.data : [];
  const totalProducts = productsData.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader initialBrand={brand} slug={params.slug} />
      <BrandProducts
        initialProducts={products}
        initialTotal={totalProducts}
        slug={params.slug}
        searchParams={searchParams}
      />
    </div>
  );
}
