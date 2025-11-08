// components/profile/ProfileSidebar.tsx
'use client';

import React from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProfile } from '@/lib/hooks/useProfile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ShoppingBag,
  Heart,
  Star,
  Shield,
  Bell,
  CreditCard,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

interface ProfileSidebarProps {
  activeTab: string;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ activeTab }) => {
  const { user: authUser, logout } = useAuth();
  const { user: profileUser } = useProfile();

  const displayUser = profileUser || authUser;

  const navigationItems = [
    { id: 'profile', label: 'Profile', icon: User, href: '/profile?tab=profile' },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, href: '/profile?tab=orders' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/profile?tab=wishlist' },
    { id: 'reviews', label: 'My Reviews', icon: Star, href: '/profile?tab=reviews' },
    { id: 'security', label: 'Security', icon: Shield, href: '/profile?tab=security' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/profile?tab=notifications' },
    { id: 'billing', label: 'Billing', icon: CreditCard, href: '/profile?tab=billing' },
  ];

  return (
    <Card className="sticky top-8">
      <CardContent className="p-6">
        {/* User Info */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3"
              style={
                displayUser?.avatar?.url && !displayUser.avatar.url.includes('default-avatar')
                  ? { backgroundImage: `url(${displayUser.avatar.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : undefined
              }
            >
              {(!displayUser?.avatar?.url || displayUser.avatar.url.includes('default-avatar')) &&
                displayUser?.name?.charAt(0).toUpperCase()
              }
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{displayUser?.name}</h3>
          <p className="text-sm text-gray-500 truncate">{displayUser?.email}</p>
          <Badge variant="secondary" className="mt-2">
            {displayUser?.role || 'Customer'}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                activeTab === item.id
                  ? "bg-blue-50 text-blue-600 font-medium border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={logout}
            className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
