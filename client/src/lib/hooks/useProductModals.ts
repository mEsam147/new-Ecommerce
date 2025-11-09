// hooks/useProductModals.ts
import { useState, useCallback } from 'react';
import { Product } from '@/types';

export const useProductModals = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const openEditModal = useCallback((product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
  }, []);

  const openViewModal = useCallback((product: Product) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingProduct(null);
  }, []);

  return {
    editingProduct,
    viewingProduct,
    isEditModalOpen,
    isViewModalOpen,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal
  };
};
