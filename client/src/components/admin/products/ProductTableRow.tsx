// components/admin/products/ProductTableRow.tsx
'use client';

import { motion } from 'framer-motion';
import { Star, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { ProductActionsDropdown } from './ProductActionsDropdown';
import { getStockStatus } from '@/utils/productUtils';
import Image from 'next/image';

interface ProductTableRowProps {
  product: Product;
  index: number;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<boolean>;
  onToggleStatus: (productId: string, currentStatus: boolean) => Promise<void>;
  onToggleFeatured: (productId: string, currentFeatured: boolean) => Promise<void>;
  isLoading: boolean;
}

export function ProductTableRow({
  product,
  index,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  isLoading
}: ProductTableRowProps) {
  const stockStatus = getStockStatus(product.inventory.quantity, product.inventory.lowStockAlert);

  const rowVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        delay: index * 0.05
      }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Only trigger view if click is not on checkbox or actions
    if (!(e.target as HTMLElement).closest('input[type="checkbox"]') &&
        !(e.target as HTMLElement).closest('[data-dropdown]')) {
      onView(product);
    }
  };

  return (
    <motion.tr
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      onClick={handleRowClick}
      className={`
        border-b border-gray-100 group cursor-pointer transition-all duration-200
        hover:bg-gray-50/80 ${isSelected ? 'bg-blue-50/50' : ''}
        ${!product.isActive ? 'opacity-60' : ''}
      `}
    >
      <td className="py-4 px-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 focus:ring-blue-500"
          disabled={isLoading}
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {product.images?.[0] ? (
                <Image
                width={100}
                height={100}
                  src={product.images[0].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {product.isFeatured && (
              <div className="absolute -top-1 -right-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900 truncate flex items-center gap-2">
                  {product.title}
                  {!product.isActive && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {product.variants?.[0]?.sku || 'No SKU'}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span>{product.rating?.average || 0}</span>
                    <span className="text-gray-400">({product.rating?.count || 0})</span>
                  </div>
                  {product.salesCount > 100 && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </td>

      <td className="py-4 px-4">
        <Badge variant="secondary" className="text-xs">
          {product.category}
        </Badge>
      </td>

      <td className="py-4 px-4">
        <span className="text-sm text-gray-600">{product.brand || '-'}</span>
      </td>

      <td className="py-4 px-4">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">${product.price}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice}
            </span>
          )}
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex flex-col gap-1">
          <Badge
            variant={stockStatus.status === 'Out of Stock' ? 'destructive' :
                    stockStatus.status === 'Low Stock' ? 'secondary' : 'default'}
            className="text-xs w-fit"
          >
            {product.inventory.quantity} units
          </Badge>
          {product.inventory.quantity <= product.inventory.lowStockAlert && product.inventory.quantity > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Low stock</span>
            </div>
          )}
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="flex flex-col gap-1">
          <Badge
            variant={product.isActive ? "default" : "secondary"}
            className="text-xs w-fit"
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {product.isFeatured && (
            <Badge variant="outline" className="text-xs w-fit bg-purple-50 text-purple-700 border-purple-200">
              Featured
            </Badge>
          )}
        </div>
      </td>

      <td className="py-4 px-4">
        <div className="text-sm font-medium text-gray-900">{product.salesCount}</div>
        <div className="text-xs text-gray-500">sales</div>
      </td>

      <td className="py-4 px-4">
        <div data-dropdown>
          <ProductActionsDropdown
            product={product}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            onToggleFeatured={onToggleFeatured}
            isLoading={isLoading}
          />
        </div>
      </td>
    </motion.tr>
  );
}
