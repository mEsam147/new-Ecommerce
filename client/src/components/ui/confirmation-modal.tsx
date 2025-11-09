// components/ui/confirmation-modal.tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Power, Star } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'delete' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false
}: ConfirmationModalProps) {
  const variantConfig = {
    delete: {
      icon: Trash2,
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
      iconClass: 'text-red-600'
    },
    warning: {
      icon: AlertTriangle,
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      iconClass: 'text-yellow-600'
    },
    info: {
      icon: Power,
      confirmClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconClass: 'text-blue-600'
    },
    success: {
      icon: Star,
      confirmClass: 'bg-green-600 hover:bg-green-700 text-white',
      iconClass: 'text-green-600'
    }
  };

  const { icon: Icon, confirmClass, iconClass } = variantConfig[variant];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${iconClass} bg-opacity-10`}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-gray-600 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmClass}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
