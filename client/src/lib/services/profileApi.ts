// lib/services/profileApi.ts
import { baseApi } from './baseApi';
import { User } from '@/types';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface AvatarResponse {
  success: boolean;
  data: {
    user: User;
    avatar: {
      public_id: string;
      url: string;
    };
  };
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => '/auth/me',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation<{ success: boolean; data: { user: User } }, UpdateProfileData>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    updateAvatar: builder.mutation<AvatarResponse, FormData>({
      query: (formData) => ({
        url: '/auth/avatar',
        method: 'PUT',
        body: formData,
        headers: {
          // Let browser set content-type for FormData
        },
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    deleteAvatar: builder.mutation<{ success: boolean; data: { user: User } }, void>({
      query: () => ({
        url: '/auth/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
  useDeleteAvatarMutation,
} = profileApi;
