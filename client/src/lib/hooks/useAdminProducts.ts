// hooks/useProducts.ts
import { useState, useCallback, useMemo } from 'react';
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
  useLazyGetProductsQuery
} from '@/lib/services/productsApi';
import { useGetCategoriesQuery } from '@/lib/services/categoriesApi';
import { Product, ProductFilters } from '@/types';
import { toast } from 'react-hot-toast';

export const useProducts = (initialFilters: ProductFilters = {}) => {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 10,
    sort: '-createdAt',
    ...initialFilters
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Products API
  const {
    data: productsResponse,
    isLoading,
    error,
    refetch
  } = useGetProductsQuery(filters);

  // Categories API
  const { data: categoriesResponse } = useGetCategoriesQuery();

  const [deleteProduct] = useDeleteProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [triggerGetProducts] = useLazyGetProductsQuery();

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;
  const categories = categoriesResponse?.data || [];

  // Memoized computed values
  const stats = useMemo(() => ({
    totalProducts: pagination?.total || 0,
    activeProducts: products.filter(p => p.isActive).length,
    lowStock: products.filter(p =>
      p.inventory.quantity > 0 &&
      p.inventory.quantity <= p.inventory.lowStockAlert
    ).length,
    outOfStock: products.filter(p => p.inventory.quantity === 0).length,
    totalValue: products.reduce((sum, product) => sum + (product.price * product.inventory.quantity), 0),
    totalSales: products.reduce((sum, product) => sum + product.salesCount, 0),
  }), [products, pagination]);

  const categoryOptions = useMemo(() =>
    categories.map(cat => ({ label: cat.name, value: cat.name })),
    [categories]
  );

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    handleFilterChange({ search: term || undefined });
  }, [handleFilterChange]);

  const handleSortChange = useCallback((sort: string) => {
    handleFilterChange({ sort });
  }, [handleFilterChange]);

  // Product actions
  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      await deleteProduct(productId).unwrap();
      toast.success('Product deleted successfully');
      refetch();
      return true;
    } catch (error) {
      toast.error('Failed to delete product');
      return false;
    }
  }, [deleteProduct, refetch]);

  const handleUpdateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    try {
      const result = await updateProduct({ id: productId, data: updates }).unwrap();
      toast.success('Product updated successfully');
      refetch();
      return result;
    } catch (error) {
      toast.error('Failed to update product');
      throw error;
    }
  }, [updateProduct, refetch]);

  const handleCreateProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      const result = await createProduct(productData).unwrap();
      toast.success('Product created successfully');
      refetch();
      return result;
    } catch (error) {
      toast.error('Failed to create product');
      throw error;
    }
  }, [createProduct, refetch]);

  const handleToggleStatus = useCallback(async (productId: string, currentStatus: boolean) => {
    return handleUpdateProduct(productId, { isActive: !currentStatus });
  }, [handleUpdateProduct]);

  const handleToggleFeatured = useCallback(async (productId: string, currentFeatured: boolean) => {
    return handleUpdateProduct(productId, { isFeatured: !currentFeatured });
  }, [handleUpdateProduct]);

  const handleDuplicateProduct = useCallback(async (productId: string) => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) throw new Error('Product not found');

      const duplicateData = {
        ...product,
        title: `${product.title} - Copy`,
        slug: `${product.slug}-copy-${Date.now()}`,
        sku: product.variants?.[0]?.sku ? `${product.variants[0].sku}-COPY` : undefined,
        isActive: false,
        salesCount: 0,
        viewCount: 0,
        rating: {
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          average: 0,
          count: 0
        }
      };

      await handleCreateProduct(duplicateData);
      toast.success('Product duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate product');
      throw error;
    }
  }, [products, handleCreateProduct]);

  const handleBulkAction = useCallback(async (action: string, productIds: string[]) => {
    if (!action || productIds.length === 0) return;

    try {
      switch (action) {
        case 'activate':
          await Promise.all(
            productIds.map(id =>
              updateProduct({ id, data: { isActive: true } }).unwrap()
            )
          );
          toast.success(`${productIds.length} products activated successfully`);
          break;
        case 'deactivate':
          await Promise.all(
            productIds.map(id =>
              updateProduct({ id, data: { isActive: false } }).unwrap()
            )
          );
          toast.success(`${productIds.length} products deactivated successfully`);
          break;
        case 'delete':
          await Promise.all(
            productIds.map(id => deleteProduct(id).unwrap())
          );
          toast.success(`${productIds.length} products deleted successfully`);
          break;
        case 'feature':
          await Promise.all(
            productIds.map(id =>
              updateProduct({ id, data: { isFeatured: true } }).unwrap()
            )
          );
          toast.success(`${productIds.length} products marked as featured successfully`);
          break;
      }
      refetch();
      return true;
    } catch (error) {
      toast.error('Failed to perform bulk action');
      return false;
    }
  }, [updateProduct, deleteProduct, refetch]);

  return {
    // State
    products,
    pagination,
    filters,
    searchTerm,
    isLoading,
    error,
    categories: categoryOptions,

    // Actions
    setFilters,
    handleFilterChange,
    handlePageChange,
    handleSearch,
    handleSortChange,
    handleDeleteProduct,
    handleUpdateProduct,
    handleCreateProduct,
    handleToggleStatus,
    handleToggleFeatured,
    handleDuplicateProduct,
    handleBulkAction,
    refetch,

    // Computed values
    stats
  };
};
