// components/ui/actions-dropdown.tsx
'use client';

import { useState, ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  disabled?: boolean;
  separatorBefore?: boolean;
}

interface ActionsDropdownProps {
  actions: DropdownAction[];
  align?: 'start' | 'center' | 'end';
  triggerClassName?: string;
  contentClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function ActionsDropdown({
  actions,
  align = 'end',
  triggerClassName,
  contentClassName,
  size = 'md',
  isLoading = false
}: ActionsDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleActionClick = (action: DropdownAction) => {
    if (!action.disabled && !isLoading) {
      action.onClick();
      setOpen(false);
    }
  };

  const getVariantClass = (variant: string = 'default') => {
    const variants = {
      default: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      destructive: 'text-red-600 hover:bg-red-50 hover:text-red-700',
      success: 'text-green-600 hover:bg-green-50 hover:text-green-700',
      warning: 'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  const getSizeClass = () => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-9 w-9',
      lg: 'h-10 w-10'
    };
    return sizes[size];
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-100',
              getSizeClass(),
              triggerClassName
            )}
            disabled={isLoading}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className={cn('w-56 shadow-lg border border-gray-200', contentClassName)}
        >
          {actions.map((action, index) => (
            <div key={action.id}>
              {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => handleActionClick(action)}
                disabled={action.disabled || isLoading}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150',
                  getVariantClass(action.variant),
                  (action.disabled || isLoading) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className={cn(
                  'flex-shrink-0',
                  action.variant === 'destructive' && 'text-red-600',
                  action.variant === 'success' && 'text-green-600',
                  action.variant === 'warning' && 'text-yellow-600'
                )}>
                  {action.icon}
                </div>
                <span className="font-medium">{action.label}</span>
              </DropdownMenuItem>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
