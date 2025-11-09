// components/admin/products/ProductActionsDropdown.tsx
'use client';

import { useState } from 'react';
import {
  Edit,
  Trash2,
  Eye,
  Power,
  Star,
  Copy,
  Archive,
  Package
} from 'lucide-react';
import { Product } from '@/types';
import { ActionsDropdown, DropdownAction } from '@/components/ui/actions-dropdown';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { toast } from 'react-hot-toast';

interface ProductActionsDropdownProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => Promise<boolean>;
  onToggleStatus: (productId: string, currentStatus: boolean) => Promise<void>;
  onToggleFeatured: (productId: string, currentFeatured: boolean) => Promise<void>;
  onDuplicate?: (productId: string) => Promise<void>;
  isLoading?: boolean;
}

export function ProductActionsDropdown({
  product,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onDuplicate,
  isLoading = false
}: ProductActionsDropdownProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

  const handleDelete = async () => {
    const success = await onDelete(product._id);
    if (success) {
      setDeleteModalOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    await onToggleStatus(product._id, product.isActive);
    setStatusModalOpen(false);
  };

  const handleToggleFeatured = async () => {
    await onToggleFeatured(product._id, product.isFeatured);
    setFeatureModalOpen(false);
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      await onDuplicate(product._id);
      setDuplicateModalOpen(false);
    }
  };

  const actions: DropdownAction[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onView(product)
    },
    {
      id: 'edit',
      label: 'Edit Product',
      icon: <Edit className="h-4 w-4" />,
      onClick: () => onEdit(product)
    },
    {
      id: 'duplicate',
      label: 'Duplicate Product',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => setDuplicateModalOpen(true),
      separatorBefore: true
    },
    {
      id: 'status',
      label: product.isActive ? 'Deactivate' : 'Activate',
      icon: <Power className="h-4 w-4" />,
      onClick: () => setStatusModalOpen(true),
      variant: product.isActive ? 'warning' : 'success'
    },
    {
      id: 'feature',
      label: product.isFeatured ? 'Remove Featured' : 'Mark Featured',
      icon: <Star className="h-4 w-4" />,
      onClick: () => setFeatureModalOpen(true),
      variant: 'success',
      separatorBefore: true
    },
    {
      id: 'delete',
      label: 'Delete Product',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setDeleteModalOpen(true),
      variant: 'destructive',
      separatorBefore: true
    }
  ];

  return (
    <>
      <ActionsDropdown
        actions={actions}
        isLoading={isLoading}
        size="sm"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.title}"? This action cannot be undone and all product data will be permanently removed.`}
        confirmText="Delete Product"
        variant="delete"
        isLoading={isLoading}
      />

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        title={product.isActive ? 'Deactivate Product' : 'Activate Product'}
        description={`Are you sure you want to ${product.isActive ? 'deactivate' : 'activate'} "${product.title}"? ${product.isActive ? 'Deactivated products will not be visible to customers.' : 'Activated products will be visible to customers.'}`}
        confirmText={product.isActive ? 'Deactivate' : 'Activate'}
        variant={product.isActive ? 'warning' : 'success'}
        isLoading={isLoading}
      />

      {/* Featured Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        onConfirm={handleToggleFeatured}
        title={product.isFeatured ? 'Remove Featured' : 'Mark as Featured'}
        description={`Are you sure you want to ${product.isFeatured ? 'remove' : 'mark'} "${product.title}" as ${product.isFeatured ? 'non-featured' : 'featured'}? ${product.isFeatured ? 'The product will no longer appear in featured sections.' : 'The product will be highlighted in featured sections.'}`}
        confirmText={product.isFeatured ? 'Remove Featured' : 'Mark Featured'}
        variant="info"
        isLoading={isLoading}
      />

      {/* Duplicate Confirmation Modal */}
      <ConfirmationModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onConfirm={handleDuplicate}
        title="Duplicate Product"
        description={`Create a copy of "${product.title}"? The new product will have "- Copy" appended to its name and SKU.`}
        confirmText="Duplicate"
        variant="info"
        isLoading={isLoading}
      />
    </>
  );
}
