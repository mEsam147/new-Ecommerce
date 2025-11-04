// components/layout/NavigationItem.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { NavMenuItem } from '@/types';

interface NavigationItemProps {
  item: NavMenuItem;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsAnimating(true);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setIsOpen(false);
    }, 200);
  };

  const handleItemClick = (url?: string) => {
    if (url && !url.startsWith('#')) {
      router.push(url);
    }
    setIsOpen(false);
    setIsAnimating(false);
  };

  const isDivider = (item: NavMenuItem) => item.label === '---';
  const isHeader = (item: NavMenuItem) => item.url?.startsWith('#header');
  const isViewAll = (item: NavMenuItem) => item.id === 'view-all';

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (item.type === 'link') {
    return (
      <Link
        href={item.url || '#'}
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 relative group"
      >
        {item.label}
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
      </Link>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        className={cn(
          "flex items-center space-x-1 text-sm font-medium transition-all duration-300 relative group",
          isOpen ? "text-gray-900" : "text-gray-600 hover:text-gray-900"
        )}
      >
        <span className="relative">
          {item.label}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
        </span>
        <svg
          className={cn(
            "w-4 h-4 transition-all duration-300",
            isOpen ? "rotate-180 text-gray-900" : "rotate-0 text-gray-500"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && item.children && item.children.length > 0 && (
        <div
          className={cn(
            "absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden",
            "transition-all duration-300 ease-out",
            isAnimating
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2"
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
          }}
        >
          {/* Animated border */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-px -m-px">
            <div className="w-full h-full bg-white/95 backdrop-blur-md rounded-2xl" />
          </div>

          {/* Menu Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="p-6 pb-4">
              <h3 className="font-bold text-gray-900 text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {item.label}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              )}
            </div>

            {/* Menu Items */}
            <div className="px-3 pb-3">
              {item.children.map((child, index) => (
                <React.Fragment key={child.id}>
                  {isDivider(child) ? (
                    <div className="my-2 border-t border-gray-100/50" />
                  ) : isHeader(child) ? (
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {child.label}
                      </h4>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleItemClick(child.url)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl transition-all duration-300 group/item flex items-center space-x-3",
                        isViewAll(child)
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200/50"
                          : "hover:bg-gray-50/80 hover:scale-105 hover:shadow-lg"
                      )}
                      disabled={child.url?.startsWith('#')}
                    >
                      {/* Category Image or Icon */}
                      {child.category?.image?.url ? (
                        <div className="flex-shrink-0 relative">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 group-hover/item:from-blue-200 group-hover/item:to-purple-200 transition-all duration-300">
                            <Image
                              src={child.category.image.url}
                              alt={child.label}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                            />
                          </div>
                          {child.featured && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white" />
                          )}
                        </div>
                      ) : (
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-300",
                          isViewAll(child)
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 group-hover/item:from-blue-100 group-hover/item:to-purple-100"
                        )}>
                          {child.icon || '📁'}
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "font-medium transition-all duration-300",
                            isViewAll(child)
                              ? "text-blue-700 group-hover/item:text-blue-800"
                              : "text-gray-700 group-hover/item:text-gray-900"
                          )}>
                            {child.label}
                          </span>
                          {!isViewAll(child) && (
                            <svg
                              className="w-4 h-4 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300 transform group-hover/item:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                        {child.description && (
                          <p className={cn(
                            "text-xs transition-all duration-300 mt-0.5",
                            isViewAll(child)
                              ? "text-blue-600/70"
                              : "text-gray-500 group-hover/item:text-gray-600"
                          )}>
                            {child.description}
                          </p>
                        )}
                      </div>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-xl -z-10" />
        </div>
      )}
    </div>
  );
};
