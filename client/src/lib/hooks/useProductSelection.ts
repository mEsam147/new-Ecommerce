// hooks/useProductSelection.ts
import { useState, useCallback } from 'react';
import { Product } from '@/types';

export const useProductSelection = () => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSelectProduct = useCallback((productId: string, selected: boolean) => {
    setSelectedProducts(prev =>
      selected
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    );
  }, []);

  const handleSelectAll = useCallback((products: Product[], selected: boolean) => {
    setSelectedProducts(selected ? products.map(p => p._id) : []);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  const isProductSelected = useCallback((productId: string) => {
    return selectedProducts.includes(productId);
  }, [selectedProducts]);

  // const isAllSelected = useCallback((products: Product[]) => {
  //   return products.length > 0 && selectedProducts.length === products.length;
  // }, [selectedProducts, products?.length]);


    const isAllSelected = useCallback((products: Product[]) => {
    return products.length > 0 && selectedProducts.length === products.length;
  }, [selectedProducts]);

  return {
    selectedProducts,
    handleSelectProduct,
    handleSelectAll,
    clearSelection,
    isProductSelected,
    isAllSelected
  };
};
