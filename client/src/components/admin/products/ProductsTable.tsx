// components/admin/products/ProductsTable.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { ProductTableRow } from './ProductTableRow';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  selectedProducts: string[];
  onSelectProduct: (productId: string, selected: boolean) => void;
  onSelectAll: (products: Product[], selected: boolean) => void;
  isAllSelected: boolean;
  onViewProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => Promise<boolean>;
  onToggleStatus: (productId: string, currentStatus: boolean) => Promise<void>;
  onToggleFeatured: (productId: string, currentFeatured: boolean) => Promise<void>;
  onDuplicateProduct: (productId: string) => Promise<void>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalProducts: number;
  onAddProduct?: () => void;
}

export function ProductsTable({
  products,
  isLoading,
  selectedProducts,
  onSelectProduct,
  onSelectAll,
  isAllSelected,
  onViewProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onToggleFeatured,
  onDuplicateProduct,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
  totalProducts,
  onAddProduct
}: ProductsTableProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (products.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50"
      >
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {searchTerm
            ? `No products match your search criteria "${searchTerm}". Try adjusting your filters.`
            : 'Get started by adding your first product to the catalog.'
          }
        </p>
        {onAddProduct && (
          <Button onClick={onAddProduct} size="lg">
            <Package className="w-4 h-4 mr-2" />
            Add Your First Product
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Table Container with Hidden Scroll */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900">
              Products {totalProducts > 0 && `(${totalProducts})`}
            </h3>
            {selectedProducts.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedProducts.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-createdAt">Newest First</SelectItem>
                <SelectItem value="createdAt">Oldest First</SelectItem>
                <SelectItem value="title">Name A-Z</SelectItem>
                <SelectItem value="-title">Name Z-A</SelectItem>
                <SelectItem value="price">Price: Low to High</SelectItem>
                <SelectItem value="-price">Price: High to Low</SelectItem>
                <SelectItem value="-salesCount">Best Selling</SelectItem>
                <SelectItem value="-inventory.quantity">Stock: High to Low</SelectItem>
                <SelectItem value="inventory.quantity">Stock: Low to High</SelectItem>
                <SelectItem value="-rating.average">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table with Hidden Scroll */}
        <div className="overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/30">
                  <th className="text-left py-4 px-4 w-12 sticky left-0 bg-gray-50/30 z-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 focus:ring-blue-500"
                      checked={isAllSelected}
                      onChange={(e) => onSelectAll(products, e.target.checked)}
                      disabled={isLoading || products.length === 0}
                    />
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[300px]">Product</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[120px]">Category</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[120px]">Brand</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[100px]">Price</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[120px]">Stock</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[120px]">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900 min-w-[100px]">Sales</th>
                  <th className="text-left py-4 px-4 w-20 font-semibold text-gray-900 sticky right-0 bg-gray-50/30 z-10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {products.map((product, index) => (
                    <ProductTableRow
                      key={product._id}
                      product={product}
                      index={index}
                      isSelected={selectedProducts.includes(product._id)}
                      onSelect={(selected) => onSelectProduct(product._id, selected)}
                      onView={onViewProduct}
                      onEdit={onEditProduct}
                      onDelete={onDeleteProduct}
                      onToggleStatus={() => onToggleStatus(product._id, product.isActive)}
                      onToggleFeatured={() => onToggleFeatured(product._id, product.isFeatured)}
                      onDuplicate={onDuplicateProduct}
                      isLoading={isLoading}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center py-12"
          >
            <div className="flex items-center gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Loading products...</span>
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-4 bg-gray-50/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalProducts)} of {totalProducts} products
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
