// // components/shop/Pagination.tsx
// 'use client';

// import React from 'react';
// import { cn } from '@/lib/utils';

// interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   onPageChange: (page: number) => void;
//   className?: string;
// }

// export const Pagination: React.FC<PaginationProps> = ({
//   currentPage,
//   totalPages,
//   onPageChange,
//   className,
// }) => {
//   const getVisiblePages = () => {
//     const delta = 2;
//     const range = [];
//     const rangeWithDots = [];

//     for (
//       let i = Math.max(2, currentPage - delta);
//       i <= Math.min(totalPages - 1, currentPage + delta);
//       i++
//     ) {
//       range.push(i);
//     }

//     if (currentPage - delta > 2) {
//       rangeWithDots.push(1, '...');
//     } else {
//       rangeWithDots.push(1);
//     }

//     rangeWithDots.push(...range);

//     if (currentPage + delta < totalPages - 1) {
//       rangeWithDots.push('...', totalPages);
//     } else {
//       rangeWithDots.push(totalPages);
//     }

//     return rangeWithDots;
//   };

//   if (totalPages <= 1) return null;

//   const visiblePages = getVisiblePages();

//   return (
//     <div className={cn('flex items-center justify-center space-x-2', className)}>
//       {/* Previous Button */}
//       <button
//         onClick={() => onPageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className={cn(
//           'px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-all duration-200',
//           'hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
//           'flex items-center gap-2'
//         )}
//       >
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//         </svg>
//         Previous
//       </button>

//       {/* Page Numbers */}
//       <div className="flex items-center space-x-1">
//         {visiblePages.map((page, index) => (
//           <React.Fragment key={index}>
//             {page === '...' ? (
//               <span className="px-3 py-2 text-gray-500">...</span>
//             ) : (
//               <button
//                 onClick={() => onPageChange(page as number)}
//                 className={cn(
//                   'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[40px]',
//                   currentPage === page
//                     ? 'bg-blue-500 text-white shadow-lg scale-105'
//                     : 'border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
//                 )}
//               >
//                 {page}
//               </button>
//             )}
//           </React.Fragment>
//         ))}
//       </div>

//       {/* Next Button */}
//       <button
//         onClick={() => onPageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className={cn(
//           'px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-all duration-200',
//           'hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed',
//           'flex items-center gap-2'
//         )}
//       >
//         Next
//         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//         </svg>
//       </button>
//     </div>
//   );
// };


// components/shop/Pagination.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    console.log("❌ Pagination not rendering - only one page");
    return null;
  }

  console.log("✅ Rendering pagination:", { currentPage, totalPages });

  const visiblePages = getVisiblePages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl border shadow-sm', className)}
    >
      {/* Mobile: Simple Info */}
      <div className="sm:hidden text-sm text-gray-600 font-medium">
        Page {currentPage} of {totalPages}
      </div>

      {/* Desktop: Detailed Info */}
      <div className="hidden sm:block text-sm text-gray-600">
        <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
        <span className="font-semibold text-gray-900">{totalPages}</span> pages
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* First Page Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'p-2 rounded-lg border text-sm font-medium transition-all duration-200',
            'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            'hidden sm:flex items-center gap-1'
          )}
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </motion.button>

        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2',
            'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1 mx-2">
          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-gray-400 font-medium">...</span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[44px] border',
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/25'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  )}
                >
                  {page}
                </motion.button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 flex items-center gap-2',
            'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Last Page Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'p-2 rounded-lg border text-sm font-medium transition-all duration-200',
            'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
            'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            'hidden sm:flex items-center gap-1'
          )}
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Page Size Info */}
      <div className="hidden sm:block text-sm text-gray-600">
        {totalPages > 1 && (
          <span className="font-medium">{totalPages} pages total</span>
        )}
      </div>
    </motion.div>
  );
};

export default Pagination;// export default Pagination;
