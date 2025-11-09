// app/admin/products/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EditProductModal } from '@/components/admin/modals/EditProductModal';
import { ViewProductModal } from '@/components/admin/modals/ViewProductModal';
import {
  Plus,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Custom hooks
import { useProducts } from '@/lib/hooks/useAdminProducts';
import { useProductSelection } from '@/lib/hooks/useProductSelection';
import { useProductModals } from '@/lib/hooks/useProductModals';

// Components
import { ProductsStats } from '@/components/admin/products/ProductsStats';
import { ProductsFilters } from '@/components/admin/products/ProductsFilters';
import { ProductsTable } from '@/components/admin/products/ProductsTable';
import { BulkActions } from '@/components/admin/products/BulkActions';
import { Product } from '@/types';

export default function ProductsPage() {
  const router = useRouter();

  // Custom hooks
  const {
    products,
    pagination,
    filters,
    searchTerm,
    isLoading,
    stats,
    categories,
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
    refetch
  } = useProducts();

  const {
    selectedProducts,
    handleSelectProduct,
    handleSelectAll,
    clearSelection,
    isAllSelected
  } = useProductSelection();

  const {
    editingProduct,
    viewingProduct,
    isEditModalOpen,
    isViewModalOpen,
    openEditModal,
    closeEditModal,
    openViewModal,
    closeViewModal
  } = useProductModals();

  const handleCreateProductClick = () => {
    router.push('/admin/products/create');
  };

  const handleSaveProduct = async (updatedProduct: Product) => {
    if (updatedProduct._id.startsWith('new-')) {
      await handleCreateProduct(updatedProduct);
    } else {
      await handleUpdateProduct(updatedProduct._id, updatedProduct);
    }
    closeEditModal();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading && !products.length) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleCreateProductClick}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <ProductsStats stats={stats} />

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          {/* Search and Filters */}
          <ProductsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            products={products}
            categories={categories}
            isLoading={isLoading}
          />

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <BulkActions
              selectedCount={selectedProducts.length}
              onBulkAction={handleBulkAction}
              onClearSelection={clearSelection}
              isLoading={isLoading}
            />
          )}

          {/* Products Table */}
          <div className="mt-6">
            <ProductsTable
              products={products}
              isLoading={isLoading}
              selectedProducts={selectedProducts}
              onSelectProduct={handleSelectProduct}
              onSelectAll={handleSelectAll}
              isAllSelected={isAllSelected(products)}
              onViewProduct={openViewModal}
              onEditProduct={openEditModal}
              onDeleteProduct={handleDeleteProduct}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
              onDuplicateProduct={handleDuplicateProduct}
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              sortBy={filters.sort || '-createdAt'}
              onSortChange={handleSortChange}
              currentPage={pagination?.page || 1}
              totalPages={pagination?.pages || 1}
              onPageChange={handlePageChange}
              totalProducts={pagination?.total || 0}
              onAddProduct={handleCreateProductClick}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ViewProductModal
        product={viewingProduct}
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        onEdit={openEditModal}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveProduct}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
