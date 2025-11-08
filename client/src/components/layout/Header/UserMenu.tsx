// // components/layout/UserMenu.tsx
// 'use client';

// import { useState, useRef, useEffect } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { cn } from '@/lib/utils';
// import { User } from '@/types';
// import {
//   LogOut,
//   User as UserIcon,
//   Package,
//   Heart,
//   Settings,
//   ChevronDown,
//   CreditCard,
//   Bell,
//   Star
// } from 'lucide-react';

// interface UserMenuProps {
//   isAuthenticated: boolean;
//   user?: User | null;
//   isLoading: boolean;
// }

// export const UserMenu: React.FC<UserMenuProps> = ({
//   isAuthenticated,
//   user,
//   isLoading
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const { logout } = useAuth();

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Close on escape key
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === 'Escape') {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('keydown', handleEscape);
//     return () => document.removeEventListener('keydown', handleEscape);
//   }, []);

//   if (!isAuthenticated || !user) return null;

//   return (
//     <div className="relative" ref={dropdownRef}>
//       {/* User Avatar Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className={cn(
//           "flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300 group",
//           "hover:bg-gray-100 border border-transparent hover:border-gray-200",
//           "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
//           isOpen && "bg-gray-100 border-gray-200"
//         )}
//         aria-label="User menu"
//         aria-expanded={isOpen}
//       >
//         <div className="relative">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
//             {user.name?.charAt(0).toUpperCase()}
//           </div>
//           <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
//         </div>

//         <div className="hidden sm:flex items-center gap-1">
//           <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 max-w-20 truncate">
//             {user.name?.split(' ')[0]}
//           </span>
//           <ChevronDown className={cn(
//             "w-4 h-4 text-gray-400 transition-transform duration-200",
//             isOpen && "rotate-180"
//           )} />
//         </div>
//       </button>

//       {/* Dropdown Menu */}
//       {isOpen && (
//         <div
//           className={cn(
//             "absolute right-0 mt-2 w-80 origin-top-right",
//             "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50",
//             "animate-in fade-in slide-in-from-top-2 duration-200 z-50"
//           )}
//         >
//           {/* Gradient Border Effect */}
//           <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-px -m-px pointer-events-none" />

//           <div className="relative overflow-hidden rounded-2xl">
//             {/* User Header */}
//             <div className="p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/30 border-b border-gray-100">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
//                   {user.name?.charAt(0).toUpperCase()}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="font-bold text-gray-900 truncate text-lg">{user.name}</p>
//                   <p className="text-sm text-gray-500 truncate">{user.email}</p>
//                   <div className="flex items-center gap-2 mt-1">
//                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                       {user.role}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Stats */}
//             <div className="p-4 border-b border-gray-100">
//               <div className="grid grid-cols-3 gap-4 text-center">
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-900">12</div>
//                   <div className="text-xs text-gray-500">Orders</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-900">5</div>
//                   <div className="text-xs text-gray-500">Wishlist</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-lg font-bold text-gray-900">2</div>
//                   <div className="text-xs text-gray-500">Coupons</div>
//                 </div>
//               </div>
//             </div>

//             {/* Menu Items */}
//             <nav className="p-2 space-y-1">
//               <MenuItem
//                 href="/profile"
//                 icon={<UserIcon className="w-4 h-4" />}
//                 onClick={() => setIsOpen(false)}
//               >
//                 My Profile
//               </MenuItem>
//               <MenuItem
//                 href="/profile?tab=orders"
//                 icon={<Package className="w-4 h-4" />}
//                 onClick={() => setIsOpen(false)}
//               >
//                 Orders & Returns
//               </MenuItem>
//               <MenuItem
//                 href="/wishlist?tab=wishlist"
//                 icon={<Heart className="w-4 h-4" />}
//                 onClick={() => setIsOpen(false)}
//               >
//                 Wishlist
//               </MenuItem>


//               <MenuItem
//                 href="/profile?tab=notifications"
//                 icon={<Bell className="w-4 h-4" />}
//                 onClick={() => setIsOpen(false)}
//               >

//                 Notifications
//                 <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
//               </MenuItem>


//               <MenuItem
//   href="/profile?tab=reviews"
//   icon={<Star className="w-4 h-4" />}
//   onClick={() => setIsOpen(false)}
// >
//   My Reviews
// </MenuItem>
//               <MenuItem
//                 href="/payment-methods"
//                 icon={<CreditCard className="w-4 h-4" />}
//                 onClick={() => setIsOpen(false)}
//               >
//                 Payment Methods
//               </MenuItem>

//               {user.role === 'admin' && (
//                 <>
//                   <div className="h-px bg-gray-100 my-2" />
//                   <MenuItem
//                     href="/admin"
//                     icon={<Settings className="w-4 h-4" />}
//                     className="text-blue-600 bg-blue-50/50 hover:bg-blue-50"
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Admin Dashboard
//                   </MenuItem>
//                 </>
//               )}
//             </nav>

//             {/* Logout */}
//             <div className="border-t border-gray-100 p-2">
//               <button
//                 onClick={() => {
//                   logout();
//                   setIsOpen(false);
//                 }}
//                 className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
//               >
//                 <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
//                 Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Enhanced Menu Item Component
// const MenuItem = ({
//   href,
//   children,
//   icon,
//   className,
//   onClick,
// }: {
//   href: string;
//   children: React.ReactNode;
//   icon: React.ReactNode;
//   className?: string;
//   onClick?: () => void;
// }) => (
//   <Link
//     href={href}
//     className={cn(
//       "flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-gray-900",
//       "hover:bg-gray-50 rounded-xl transition-all duration-200 group",
//       "hover:translate-x-1",
//       className
//     )}
//     onClick={onClick}
//   >
//     <div className={cn(
//       "transition-transform duration-200",
//       "group-hover:scale-110 text-gray-500 group-hover:text-gray-700"
//     )}>
//       {icon}
//     </div>
//     <span className="flex-1">{children}</span>
//     <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//       </svg>
//     </div>
//   </Link>
// );

// components/layout/UserMenu.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import {
  LogOut,
  User as UserIcon,
  Package,
  Heart,
  Settings,
  ChevronDown,
  CreditCard,
  Bell,
  Star
} from 'lucide-react';

interface UserMenuProps {
  isAuthenticated: boolean;
  user?: User | null;
  isLoading: boolean;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isAuthenticated,
  user,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300 group",
          "hover:bg-gray-100 border border-transparent hover:border-gray-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
          isOpen && "bg-gray-100 border-gray-200"
        )}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>

        <div className="hidden sm:flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 max-w-20 truncate">
            {user.name?.split(' ')[0]}
          </span>
          <ChevronDown className={cn(
            "w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-72 sm:w-80 origin-top-right",
            "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50",
            "animate-in fade-in slide-in-from-top-2 duration-200 z-50"
          )}
        >
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-px -m-px pointer-events-none" />

          <div className="relative overflow-hidden rounded-2xl">
            {/* User Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50/50 to-blue-50/30 border-b border-gray-100">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-base sm:text-lg">{user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-gray-900">12</div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-gray-900">5</div>
                  <div className="text-xs text-gray-500">Wishlist</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-gray-900">2</div>
                  <div className="text-xs text-gray-500">Coupons</div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="p-2 space-y-1">
              <MenuItem
                href="/profile"
                icon={<UserIcon className="w-4 h-4" />}
                onClick={() => setIsOpen(false)}
              >
                My Profile
              </MenuItem>
              <MenuItem
                href="/profile?tab=orders"
                icon={<Package className="w-4 h-4" />}
                onClick={() => setIsOpen(false)}
              >
                Orders & Returns
              </MenuItem>
              <MenuItem
                href="/wishlist?tab=wishlist"
                icon={<Heart className="w-4 h-4" />}
                onClick={() => setIsOpen(false)}
              >
                Wishlist
              </MenuItem>
              <MenuItem
                href="/profile?tab=notifications"
                icon={<Bell className="w-4 h-4" />}
                onClick={() => setIsOpen(false)}
              >
                Notifications
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">3</span>
              </MenuItem>
              <MenuItem
                href="/profile?tab=reviews"
                icon={<Star className="w-4 h-4" />}
                onClick={() => setIsOpen(false)}
              >
                My Reviews
              </MenuItem>
              <MenuItem
                href="/payment-methods"
                icon={<CreditCard className="w-4 h-4" />}
                onClick={() => setIsOpen(false)}
              >
                Payment Methods
              </MenuItem>

              {user.role === 'admin' && (
                <>
                  <div className="h-px bg-gray-100 my-2" />
                  <MenuItem
                    href="/admin"
                    icon={<Settings className="w-4 h-4" />}
                    className="text-blue-600 bg-blue-50/50 hover:bg-blue-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </MenuItem>
                </>
              )}
            </nav>

            {/* Logout */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Menu Item Component
interface MenuItemProps {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  href,
  children,
  icon,
  className,
  onClick,
}) => (
  <Link
    href={href}
    className={cn(
      "flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 text-sm text-gray-700 hover:text-gray-900",
      "hover:bg-gray-50 rounded-xl transition-all duration-200 group",
      "hover:translate-x-1",
      className
    )}
    onClick={onClick}
  >
    <div className={cn(
      "transition-transform duration-200",
      "group-hover:scale-110 text-gray-500 group-hover:text-gray-700"
    )}>
      {icon}
    </div>
    <span className="flex-1">{children}</span>
    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
);
