// app/shop/product/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SingleProduct from "@/components/product-page/SingleProduct";

// Generate metadata dynamically based on the product
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;

  try {
    // Fetch product data for metadata
    // Note: You might need to adjust this based on your API structure
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    const data = await response.json();
    const product = data.data?.product;

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The product you are looking for does not exist.',
      };
    }

    return {
      title: `${product.title} | ${product.brand} - Your Store Name`,
      description: product.shortDescription || product.description?.substring(0, 160) || `Buy ${product.title} from ${product.brand}. ${product.category} products at great prices.`,
      keywords: [...product.tags || [], product.category, product.brand, product.title].join(', '),

      twitter: {
        card: 'summary_large_image',
        title: product.title,
        description: product.shortDescription || product.description?.substring(0, 160) || `Buy ${product.title} from ${product.brand}`,
        images: [product.images[0] || '/default-product-image.jpg'],
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/shop/product/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Product Page',
      description: 'View our product details and specifications.',
    };
  }
}

// If you want to generate static params for SSG
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/slugs`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const products = data.data?.products || [];

    return products.map((product: { slug: string }) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default function SingleProductPage({ params }: { params: { slug: string } }) {
  return <SingleProduct />;
}

// If you're using dynamic metadata and want to handle not found state
// export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
//   // ... same metadata generation logic as above
// }
