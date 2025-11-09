// components/admin/products/BulkActions.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: string, productIds: string[]) => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export function BulkActions({
  selectedCount,
  onBulkAction,
  onClearSelection,
  isLoading = false
}: BulkActionsProps) {
  const [bulkAction, setBulkAction] = useState('');

  const handleApplyBulkAction = () => {
    if (!bulkAction) return;
    // In a real implementation, we would pass the actual product IDs
    // For now, we'll simulate with empty array since the actual IDs aren't available here
    onBulkAction(bulkAction, []);
    setBulkAction('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} product(s) selected
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-1 border border-blue-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bulk Actions</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="feature">Mark Featured</option>
            <option value="delete">Delete</option>
          </select>
          <button
            onClick={handleApplyBulkAction}
            disabled={!bulkAction || isLoading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Applying...' : 'Apply'}
          </button>
        </div>
        <button
          onClick={onClearSelection}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Clear Selection
        </button>
      </div>
    </motion.div>
  );
}
