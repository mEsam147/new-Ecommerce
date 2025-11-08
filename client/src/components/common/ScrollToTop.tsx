// components/common/ScrollToTop.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ScrollToTopProps {
  threshold?: number;
  smooth?: boolean;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showAfter?: number;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 300,
  smooth = true,
  className,
  position = 'bottom-right',
  showAfter = 1000,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [hasAppeared, setHasAppeared] = useState<boolean>(false);

  useEffect(() => {
    // Show component after initial delay
    const appearanceTimer = setTimeout(() => {
      setHasAppeared(true);
    }, showAfter);

    const toggleVisibility = (): void => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // Initial check
    toggleVisibility();

    return () => {
      clearTimeout(appearanceTimer);
      window.removeEventListener('scroll', toggleVisibility);
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
            duration: 0.3
          }}
          className={cn(
            "fixed z-50",
            positionClasses[position],
            className
          )}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={scrollToTop}
              className={cn(
                "h-12 w-12 rounded-full shadow-2xl border-0",
                "bg-primary  hover:from-blue-600 hover:to-purple-700",
                "text-white backdrop-blur-sm",
                "group relative overflow-hidden"
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
              <ChevronUp className="w-6 h-6 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />

              {/* Pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Floating version with subtle design
export const FloatingScrollToTop: React.FC<Omit<ScrollToTopProps, 'className'>> = (props) => (
  <ScrollToTop
    {...props}
    className="backdrop-blur-md bg-white/10 border border-white/20"
  />
);

// Minimal version
export const MinimalScrollToTop: React.FC<Omit<ScrollToTopProps, 'className'>> = (props) => (
  <ScrollToTop
    {...props}
    className="bg-gray-900/80 hover:bg-gray-900 text-white border border-gray-700"
  />
);

// Large version for better visibility
export const LargeScrollToTop: React.FC<Omit<ScrollToTopProps, 'className'>> = (props) => (
  <ScrollToTop
    {...props}
    className={cn(
      "h-14 w-14",
      "bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
      "text-white shadow-2xl"
    )}
  />
);

export default ScrollToTop;
