// lib/services/addressesApi.ts
import { Address } from '@/types';
import { baseApi } from './baseApi';



export const addressesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query<{ success: boolean; data: Address[] }, void>({
      query: () => '/addresses',
      providesTags: ['Address'],
    }),

    getAddress: builder.query<{ success: boolean; data: Address }, string>({
      query: (id) => `/addresses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Address', id }],
    }),

    getDefaultAddress: builder.query<{ success: boolean; data: Address }, void>({
      query: () => '/addresses/default',
      providesTags: ['Address'],
    }),

    createAddress: builder.mutation<{ success: boolean; data: Address; message: string }, Partial<Address>>({
      query: (addressData) => ({
        url: '/addresses',
        method: 'POST',
        body: addressData,
      }),
      invalidatesTags: ['Address'],
    }),

    updateAddress: builder.mutation<{ success: boolean; data: Address; message: string }, { id: string; data: Partial<Address> }>({
      query: ({ id, data }) => ({
        url: `/addresses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Address', id }],
    }),

    deleteAddress: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

    setDefaultAddress: builder.mutation<{ success: boolean; data: Address; message: string }, string>({
      query: (id) => ({
        url: `/addresses/${id}/set-default`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Address'],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressQuery,
  useGetDefaultAddressQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressesApi;
