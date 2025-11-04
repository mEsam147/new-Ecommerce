// lib/services/brandApi.ts
import { Brand, Product } from '@/types';
import { baseApi } from './baseApi';

export interface BrandsResponse {
  success: boolean;
  data: Brand[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BrandResponse {
  success: boolean;
  data: Brand;
}

export interface BrandProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  brand: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface FollowBrandResponse {
  success: boolean;
  message: string;
  data: {
    brand: {
      _id: string;
      name: string;
      followerCount: number;
    };
  };
}

export const brandApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get brand by slug
    getBrandBySlug: builder.query<BrandResponse, string>({
      query: (slug) => `/brands/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Brand' as const, id: slug }],
    }),

    // Get brand products by slug
    getBrandProductsBySlug: builder.query<BrandProductsResponse, {
      slug: string;
      page?: number;
      limit?: number;
      category?: string;
      sort?: string;
      minPrice?: number;
      maxPrice?: number;
    }>({
      query: ({ slug, ...params }) => ({
        url: `/brands/slug/${slug}/products`,
        params,
      }),
      providesTags: (result, error, { slug }) => [
        { type: 'Brand' as const, id: slug },
        'Product'
      ],
    }),

    // Get all brands
    getBrands: builder.query<BrandsResponse, {
      page?: number;
      limit?: number;
      search?: string;
      sort?: string;
      featured?: boolean;
    }>({
      query: (params = {}) => ({
        url: '/brands',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Brand' as const, id: _id })),
              { type: 'Brand' as const, id: 'LIST' },
            ]
          : [{ type: 'Brand' as const, id: 'LIST' }],
    }),

    // Get single brand by ID
    getBrand: builder.query<BrandResponse, string>({
      query: (id) => `/brands/${id}`,
      providesTags: (result, error, id) => [{ type: 'Brand' as const, id }],
    }),

    // Get brand products by ID
    getBrandProducts: builder.query<BrandProductsResponse, {
      id: string;
      page?: number;
      limit?: number;
      category?: string;
      sort?: string;
      minPrice?: number;
      maxPrice?: number;
    }>({
      query: ({ id, ...params }) => ({
        url: `/brands/${id}/products`,
        params,
      }),
      providesTags: (result, error, { id }) => [
        { type: 'Brand' as const, id },
        'Product'
      ],
    }),

    // Get featured brands
    getFeaturedBrands: builder.query<BrandsResponse, { limit?: number }>({
      query: (params = {}) => ({
        url: '/brands/featured',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Brand' as const, id: _id })),
              { type: 'Brand' as const, id: 'FEATURED' },
            ]
          : [{ type: 'Brand' as const, id: 'FEATURED' }],
    }),

    // Follow brand
    followBrand: builder.mutation<FollowBrandResponse, string>({
      query: (id) => ({
        url: `/brands/${id}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Brand' as const, id },
        'User'
      ],
    }),

    // Unfollow brand
    unfollowBrand: builder.mutation<FollowBrandResponse, string>({
      query: (id) => ({
        url: `/brands/${id}/unfollow`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Brand' as const, id },
        'User'
      ],
    }),

    // Get followed brands
    getFollowedBrands: builder.query<BrandsResponse, void>({
      query: () => '/brands/user/followed',
      providesTags: ['User', { type: 'Brand' as const, id: 'FOLLOWED' }],
    }),

    // Create brand (admin)
    createBrand: builder.mutation<BrandResponse, Partial<Brand>>({
      query: (brandData) => ({
        url: '/brands',
        method: 'POST',
        body: brandData,
      }),
      invalidatesTags: [{ type: 'Brand' as const, id: 'LIST' }],
    }),

    // Update brand (admin)
    updateBrand: builder.mutation<BrandResponse, { id: string; data: Partial<Brand> }>({
      query: ({ id, data }) => ({
        url: `/brands/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand' as const, id }],
    }),

    // Delete brand (admin)
    deleteBrand: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Brand' as const, id }],
    }),

    // Upload brand logo (admin)
    uploadBrandLogo: builder.mutation<BrandResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/brands/${id}/logo`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand' as const, id }],
    }),

    // Upload brand banner (admin)
    uploadBrandBanner: builder.mutation<BrandResponse, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/brands/${id}/banner`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Brand' as const, id }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetBrandQuery,
  useGetBrandBySlugQuery,
  useGetBrandProductsBySlugQuery,
  useGetBrandProductsQuery,
  useGetFeaturedBrandsQuery,
  useFollowBrandMutation,
  useUnfollowBrandMutation,
  useGetFollowedBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useUploadBrandLogoMutation,
  useUploadBrandBannerMutation,
} = brandApi;
