// components/common/ScrollToTopWithProgress.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ScrollToTopWithProgressProps {
  threshold?: number;
  smooth?: boolean;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showAfter?: number;
  showProgress?: boolean;
}

export const ScrollToTopWithProgress: React.FC<ScrollToTopWithProgressProps> = ({
  threshold = 300,
  smooth = true,
  className,
  position = 'bottom-right',
  showAfter = 1000,
  showProgress = true,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasAppeared, setHasAppeared] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const appearanceTimer = setTimeout(() => {
      setHasAppeared(true);
    }, showAfter);

    const handleScroll = (): void => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Calculate scroll progress
      const totalScroll = documentHeight - windowHeight;
      const progress = (scrollY / totalScroll) * 100;
      setScrollProgress(Math.min(progress, 100));

      // Toggle visibility
      setIsVisible(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      clearTimeout(appearanceTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, showAfter]);

  const scrollToTop = (): void => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
  };

  return (
    <AnimatePresence>
      {hasAppeared && isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className={cn(
            "fixed z-50",
            positionClasses[position],
            className
          )}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative"
          >
            {/* Progress Circle */}
            {showProgress && (
              <svg
                className="absolute -inset-2 w-16 h-16 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200/50"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="text-blue-500"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (scrollProgress / 100) * 251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (scrollProgress / 100) * 251.2 }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            )}

            <Button
              onClick={scrollToTop}
              className={cn(
                "h-12 w-12 rounded-full shadow-2xl border-0 relative",
                "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                "text-white backdrop-blur-sm",
                "group overflow-hidden"
              )}
              aria-label="Scroll to top"
              size="icon"
            >
              {/* Background shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* Main icon */}
              <ChevronUp className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
