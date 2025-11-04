// lib/services/categoriesApi.ts
import { baseApi } from './baseApi';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    public_id: string;
    url: string;
  };
  parent?: string;
  isActive: boolean;
  featured: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  productsCount?: number;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<{ success: boolean; data: Category[] }, void>({
      query: () => '/categories',
      providesTags: ['Category'],
      keepUnusedDataFor: 300
    }),
        getTopCategories: builder.query({
      query: (params = {}) => ({
        url: '/categories/top',
        params,
      }),
    }),

        getCategoriesByBrand: builder.query<{ success: boolean; data: Category[] }, string>({
      query: (brandSlug) => `/categories/brand/${brandSlug}`,
      providesTags: ['Category'],
    }),

    getCategoryTree: builder.query<{ success: boolean; data: Category[] }, void>({
      query: () => '/categories/tree',
      providesTags: ['Category'],
    }),

    getCategory: builder.query<{ success: boolean; data: Category }, string>({
      query: (id) => `/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    getCategoryBySlug: builder.query<{ success: boolean; data: Category }, string>({
      query: (slug) => `/categories/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),

    createCategory: builder.mutation<{ success: boolean; data: Category; message: string }, Partial<Category>>({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategory: builder.mutation<{ success: boolean; data: Category; message: string }, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),

    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),

    uploadCategoryImage: builder.mutation<{ success: boolean; data: Category; message: string }, { id: string; image: File }>({
      query: ({ id, image }) => {
        const formData = new FormData();
        formData.append('image', image);

        return {
          url: `/categories/${id}/image`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Category', id }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoriesByBrandQuery,
  useGetCategoryQuery,
  useGetTopCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} = categoriesApi;
