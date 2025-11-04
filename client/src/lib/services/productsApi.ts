// lib/services/productsApi.ts
import { Product, ProductFilters, ProductResponse, ProductsResponse } from '@/types';
import { baseApi } from './baseApi';



export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        return `/products?${params.toString()}`;
      },
      providesTags: ['Product'],
    }),

    getProduct: builder.query<{ success: boolean; data: Product }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getProductBySlug: builder.query<ProductResponse, string>({
      query: (slug) => `/products/slug/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'Product', id: slug },
        { type: 'Product', id: 'LIST' },
      ],
    }),
      getTrendingProducts: builder.query({
      query: (params = {}) => ({
        url: '/products/trending',
        params,
      }),
    }),
    getPopularProducts: builder.query({
      query: (params = {}) => ({
        url: '/products/popular',
        params,
      }),
    }),



    getFeaturedProducts: builder.query<{ success: boolean; data: Product[] }, { limit?: number }>({
      query: ({ limit = 8 } = {}) => `/products/featured?limit=${limit}`,
      providesTags: ['Product'],
    }),

    // getTrendingProducts: builder.query<{ success: boolean; data: Product[] }, { limit?: number }>({
    //   query: ({ limit = 10 } = {}) => `/products/trending?limit=${limit}`,
    //   providesTags: ['Product'],
    // }),

    getRecommendedProducts: builder.query<{ success: boolean; data: Product[] }, { limit?: number }>({
      query: ({ limit = 8 } = {}) => `/products/recommended?limit=${limit}`,
      providesTags: ['Product'],
    }),

    getRelatedProducts: builder.query<{ success: boolean; data: Product[] }, { productId: string; limit?: number }>({
      query: ({ productId, limit = 4 }) => `/products/${productId}/related?limit=${limit}`,
      providesTags: ['Product'],
    }),

    searchProducts: builder.query<
      {
        success: boolean;
        data: {
          products: Product[];
          total: number;
          suggestions: string[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }
      },
      { query: string; filters?: Partial<ProductFilters> }
    >({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams({ search: query });

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });

        return `/products/search/advanced?${params.toString()}`;
      },
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation<{ success: boolean; data: Product; message: string }, Partial<Product>>({
      query: (productData) => ({
        url: '/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation<{ success: boolean; data: Product; message: string }, { id: string; data: Partial<Product> }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),

    deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    updateInventory: builder.mutation<{ success: boolean; data: Product; message: string }, { id: string; inventory: any }>({
      query: ({ id, inventory }) => ({
        url: `/products/${id}/inventory`,
        method: 'PATCH',
        body: inventory,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductQuery,
  useGetProductBySlugQuery,
  useGetFeaturedProductsQuery,
  useGetTrendingProductsQuery,
  useGetRecommendedProductsQuery,
  useGetRelatedProductsQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateInventoryMutation,
} = productsApi;
