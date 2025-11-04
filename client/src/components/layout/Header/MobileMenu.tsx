// components/layout/MobileMenu.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  X,
  ChevronRight,
  ChevronDown,
  User,
  ShoppingBag,
  Heart,
  Settings,
  Search,
  Home,
  Package,
  Star,
  HelpCircle,
  Phone,
  Zap,
  Menu // ADDED: Import Menu icon for better visibility
} from 'lucide-react';
import type { NavMenuItem, User as UserType } from '@/types';
import Image from 'next/image';

interface MobileMenuProps {
  navMenu: NavMenuItem[];
  isLoading: boolean;
  isAuthenticated?: boolean;
  user?: UserType | null;
  featuredBrands?: any[];
  trendingProducts?: any[];
}

const getCategoryIcon = (categoryName: string) => {
  const icons: { [key: string]: string } = {
    'Electronics': '📱',
    'Fashion': '👕',
    'Home & Living': '🏠',
    'Beauty': '💄',
    'Sports': '⚽',
    'Smartphones': '📱',
    'Laptops': '💻',
    'Headphones': '🎧',
    'Shoes': '👟',
    'T-Shirts': '👚',
    'Furniture': '🛋️',
    'Skincare': '✨',
    'Makeup': '🎨',
    'Running': '🏃',
    'Yoga': '🧘',
    'Brands': '🏆',
    'Trending': '🔥',
    'Shop': '🛍️',
  };
  return icons[categoryName] || '🛍️';
};

export const MobileMenu: React.FC<MobileMenuProps> = ({
  navMenu,
  isLoading,
  isAuthenticated,
  user,
  featuredBrands = [],
  trendingProducts = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  // Handle mount and visibility states for animations
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Small delay to trigger the slide-in animation
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // Wait for slide-out animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsMounted(false);
        setExpandedItems(new Set());
      }, 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Close drawer when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // FIXED: Don't return null - always render the toggle button
  // Only conditionally render the menu overlay/panel

  // Enhanced navigation with conditional sections
  const enhancedNavMenu = [
    ...navMenu,
    ...(featuredBrands.length > 0 ? [{
      id: 'brands',
      label: 'Brands',
      type: 'dropdown' as const,
      url: '/brands',
      children: featuredBrands
    }] : []),
    ...(trendingProducts.length > 0 ? [{
      id: 'trending',
      label: 'Trending',
      type: 'dropdown' as const,
      url: '/trending',
      children: trendingProducts
    }] : [])
  ];

  return (
    <>
      {/* Menu Toggle Button - ALWAYS RENDERED */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative h-9 w-9 transition-all duration-300 hover:scale-105 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {/* IMPROVED: Use Menu icon for better visibility */}
          <Menu className="w-5 h-5" />
          {/* Alternative: Keep the custom hamburger but make it more visible */}
          {/* <div className="relative w-5 h-5">
            <span className="absolute block w-5 h-0.5 bg-current top-1.5 rounded-full" />
            <span className="absolute block w-5 h-0.5 bg-current top-2.5 rounded-full" />
            <span className="absolute block w-5 h-0.5 bg-current top-3.5 rounded-full" />
          </div> */}
        </Button>
      </div>

      {/* Menu Overlay and Panel - Conditionally Rendered */}
      {isMounted && (
        <>
          {/* Animated Backdrop */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-all duration-300 lg:hidden",
              isVisible
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            onClick={handleBackdropClick}
          />

          {/* Animated Menu Panel */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-[9999] lg:hidden",
              "transform transition-all duration-300 ease-out",
              "flex flex-col h-screen",
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header with slide-in animation */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 border-b border-gray-200 bg-white",
                  "transition-all duration-500 delay-100",
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-4 opacity-0"
                )}
              >
                <Link
                  href="/"
                  className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
                  onClick={handleClose}
                >
                  STYLESHOP
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-8 w-8 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* User Section */}
              <div
                className={cn(
                  "p-4 border-b border-gray-200 bg-white",
                  "transition-all duration-500 delay-150",
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-4 opacity-0"
                )}
              >
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/auth/login" onClick={handleClose}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm">
                        Sign In
                      </Button>
                    </Link>
                    <p className="text-center text-xs text-gray-600">
                      New customer?{' '}
                      <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium" onClick={handleClose}>
                        Create account
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto pb-20 bg-white">
                <div
                  className={cn(
                    "p-3 space-y-1",
                    "transition-all duration-500 delay-200",
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0"
                  )}
                >
                  {/* Quick Actions */}
                  <div className="mb-3">
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                      onClick={handleClose}
                    >
                      <Home className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <span>Home</span>
                    </Link>

                    <Link
                      href="/search"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                      onClick={handleClose}
                    >
                      <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <span>Search</span>
                    </Link>
                  </div>

                  {/* Main Navigation */}
                  {enhancedNavMenu.map((item, index) => (
                    <div
                      key={item.id}
                      className="group"
                      style={{
                        transitionDelay: isVisible ? `${200 + index * 50}ms` : '0ms'
                      }}
                    >
                      {item.type === 'link' ? (
                        <Link
                          href={item.url || '#'}
                          className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          onClick={handleClose}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base">{getCategoryIcon(item.label)}</span>
                            {item.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </Link>
                      ) : (
                        <div className="space-y-1">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-base">{getCategoryIcon(item.label)}</span>
                              {item.label}
                              {item.label === 'Trending' && (
                                <Zap className="w-3 h-3 text-orange-500 animate-pulse" />
                              )}
                            </span>
                            <ChevronDown className={cn(
                              "w-4 h-4 text-gray-400 transition-transform duration-200",
                              expandedItems.has(item.id) && "rotate-180"
                            )} />
                          </button>

                          {/* Sub-items with animation */}
                          <div className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            expandedItems.has(item.id) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          )}>
                            <div className="pl-4 space-y-1">
                              {item.children?.map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.url || '#'}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-all duration-200 transform hover:translate-x-1 group"
                                  onClick={handleClose}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    {child.image ? (
                                      <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
                                        <Image
                                          src={child.image}
                                          alt={child.label}
                                          width={24}
                                          height={24}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-sm w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                        {getCategoryIcon(child.label)}
                                      </span>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-gray-700 group-hover:text-blue-600 text-xs">
                                        {child.label}
                                      </div>
                                      {child.description && (
                                        <div className="text-xs text-gray-500 truncate">
                                          {child.description}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Support Section */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Support
                    </h3>
                    <Link
                      href="/help"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                      onClick={handleClose}
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <span>Help Center</span>
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                      onClick={handleClose}
                    >
                      <Phone className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                      <span>Contact Us</span>
                    </Link>
                  </div>
                </div>

                {/* Quick Actions for Authenticated Users */}
                {isAuthenticated && (
                  <div
                    className={cn(
                      "p-3 border-t border-gray-200 bg-gray-50",
                      "transition-all duration-500 delay-300",
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    )}
                  >
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 group"
                        onClick={handleClose}
                      >
                        <User className="w-3 h-3" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 group"
                        onClick={handleClose}
                      >
                        <Package className="w-3 h-3" />
                        My Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 group"
                        onClick={handleClose}
                      >
                        <Heart className="w-3 h-3" />
                        Wishlist
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
