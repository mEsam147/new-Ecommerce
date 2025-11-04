// lib/hooks/useAddresses.ts
import { useState, useCallback } from 'react';
import { useGetAddressesQuery, useGetDefaultAddressQuery, useCreateAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation, useSetDefaultAddressMutation } from '@/lib/services/addressesApi';
import { useToast } from './useToast';
import { Address } from '@/types';

export const useAddresses = () => {
  const { success, error } = useToast();

  // Queries
  const {
    data: addressesData,
    isLoading: isLoadingAddresses,
    refetch: refetchAddresses,
    error: addressesError
  } = useGetAddressesQuery();

  const {
    data: defaultAddressData,
    isLoading: isLoadingDefaultAddress,
    refetch: refetchDefaultAddress
  } = useGetDefaultAddressQuery();

  // Mutations
  const [createAddress, { isLoading: isCreatingAddress }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: isDeletingAddress }] = useDeleteAddressMutation();
  const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

  const addresses = addressesData?.data || [];
  const defaultAddress = defaultAddressData?.data;

  // Create address
  const handleCreateAddress = useCallback(async (addressData: Partial<Address>) => {
    try {
      const result = await createAddress(addressData).unwrap();
      success(result.message || 'Address created successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to create address';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [createAddress, success, error]);

  // Update address
  const handleUpdateAddress = useCallback(async (id: string, addressData: Partial<Address>) => {
    try {
      const result = await updateAddress({ id, data: addressData }).unwrap();
      success(result.message || 'Address updated successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to update address';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [updateAddress, success, error]);

  // Delete address
  const handleDeleteAddress = useCallback(async (id: string) => {
    try {
      const result = await deleteAddress(id).unwrap();
      success(result.message || 'Address deleted successfully');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to delete address';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [deleteAddress, success, error]);

  // Set default address
  const handleSetDefaultAddress = useCallback(async (id: string) => {
    try {
      const result = await setDefaultAddress(id).unwrap();
      success(result.message || 'Default address updated successfully');
      return { success: true, data: result.data };
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to set default address';
      error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [setDefaultAddress, success, error]);

  return {
    // Data
    addresses,
    defaultAddress,

    // Loading states
    isLoading: isLoadingAddresses || isLoadingDefaultAddress,
    isLoadingAddresses,
    isLoadingDefaultAddress,
    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSettingDefault,

    // Actions
    createAddress: handleCreateAddress,
    updateAddress: handleUpdateAddress,
    deleteAddress: handleDeleteAddress,
    setDefaultAddress: handleSetDefaultAddress,
    refetchAddresses,
    refetchDefaultAddress,

    // Errors
    addressesError,
  };
};
