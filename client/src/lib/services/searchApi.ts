// lib/services/searchApi.ts
import { Product, Category, Brand } from '@/types';
import { baseApi } from './baseApi';

export interface SearchResult {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suggestions: SearchSuggestion[];
  query?: string;
}

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'tag';
  text: string;
  category?: string;
  slug?: string;
  url?: string;
}

export interface SearchFilters {
  category?: string | string[];
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: 'relevance' | 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'popular' | 'rating' | 'featured';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult;
}

export interface ProductsSearchResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    categories: Array<{ _id: string; name: string; slug: string; count: number }>;
    brands: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
  };
  query: string;
}

export interface PopularSearch {
  term: string;
  count: number;
  type: 'product' | 'brand' | 'category';
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Global search across all types
    searchAll: builder.query<SearchResult, { query: string; limit?: number }>({
      query: ({ query, limit = 8 }) => ({
        url: '/search',
        params: { q: query, limit }
      }),
      providesTags: (result, error, { query }) => [
        { type: 'Search', id: query },
        { type: 'Product', id: 'LIST' },
        { type: 'Category', id: 'LIST' },
        { type: 'Brand', id: 'LIST' }
      ],
      transformResponse: (response: SearchResponse) => response.data,
    }),

    // Advanced product search with filtering
    searchProducts: builder.query<ProductsSearchResponse, {
      query: string;
      filters?: Partial<SearchFilters>
    }>({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams({ q: query });

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        return `/search/products?${params.toString()}`;
      },
      providesTags: (result, error, { query, filters }) => [
        { type: 'Search', id: `products-${query}` },
        { type: 'Product', id: 'LIST' }
      ],
    }),

    // Get search suggestions
    getSearchSuggestions: builder.query<SearchSuggestion[], { query: string; limit?: number }>({
      query: ({ query, limit = 5 }) => ({
        url: '/search/suggestions',
        params: { q: query, limit }
      }),
      providesTags: (result, error, { query }) => [
        { type: 'Search', id: `suggestions-${query}` }
      ],
      transformResponse: (response: { success: boolean; data: SearchSuggestion[] }) => response.data,
    }),

    // Get popular search terms
    getPopularSearches: builder.query<PopularSearch[], { limit?: number }>({
      query: ({ limit = 10 } = {}) => ({
        url: '/search/popular',
        params: { limit }
      }),
      providesTags: ['Search'],
      transformResponse: (response: { success: boolean; data: PopularSearch[] }) => response.data,
    }),

    // Search by specific type
    searchByType: builder.query<any[], {
      type: 'products' | 'categories' | 'brands';
      query: string;
      limit?: number
    }>({
      query: ({ type, query, limit = 12 }) => ({
        url: `/search/${type}`,
        params: { q: query, limit }
      }),
      providesTags: (result, error, { type, query }) => [
        { type: 'Search', id: `${type}-${query}` }
      ],
      transformResponse: (response: { success: boolean; data: any[] }) => response.data,
    }),

    // Lazy search queries for on-demand fetching
    lazySearchAll: builder.query<SearchResult, { query: string; limit?: number }>({
      query: ({ query, limit = 8 }) => ({
        url: '/search',
        params: { q: query, limit }
      }),
      transformResponse: (response: SearchResponse) => response.data,
    }),

    lazySearchProducts: builder.query<ProductsSearchResponse, {
      query: string;
      filters?: Partial<SearchFilters>
    }>({
      query: ({ query, filters = {} }) => {
        const params = new URLSearchParams({ q: query });

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else {
              params.append(key, value.toString());
            }
          }
        });

        return `/search/products?${params.toString()}`;
      },
    }),
  }),
});

export const {
  useSearchAllQuery,
  useLazySearchAllQuery,
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  useGetPopularSearchesQuery,
  useSearchByTypeQuery,
  useLazySearchByTypeQuery,
} = searchApi;
