// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Camera,
  ShoppingBag,
  Heart,
  Star,
  Shield,
  Bell,
  CreditCard,
  LogOut,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Settings
} from 'lucide-react';
import * as motion from 'framer-motion/client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  // Get tab from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'wishlist', 'reviews', 'security', 'notifications', 'billing'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your profile</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const handleSave = () => {
    // Here you would typically call an API to update the profile
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    // Add your API call here
  };

  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 156.00,
      items: 3,
      tracking: 'TRK123456789'
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'Processing',
      total: 89.99,
      items: 2,
      tracking: 'TRK987654321'
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      status: 'Shipped',
      total: 234.50,
      items: 4,
      tracking: 'TRK456789123'
    }
  ];

  // Mock wishlist data
  const wishlistItems = [
    {
      id: '1',
      name: 'Premium Cotton T-Shirt',
      price: 29.99,
      image: '/images/pic1.png',
      inStock: true
    },
    {
      id: '2',
      name: 'Designer Jeans',
      price: 89.99,
      image: '/images/pic2.png',
      inStock: true
    },
    {
      id: '3',
      name: 'Winter Jacket',
      price: 129.99,
      image: '/images/pic3.png',
      inStock: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            My Account
          </h1>
          <p className="text-gray-600 text-lg">Manage your profile, orders, and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1"
          >
            <Card className="sticky top-8">
              <CardContent className="p-6">
                {/* User Avatar */}
                <motion.div
                  className="text-center mb-6"
                  variants={itemVariants}
                >
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-3">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform border">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {user?.role || 'Customer'}
                  </Badge>
                </motion.div>

                {/* Navigation */}
                <motion.nav className="space-y-2" variants={itemVariants}>
                  {[
                    { id: 'profile', label: 'Profile', icon: User, href: '/profile?tab=profile' },
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag, href: '/profile?tab=orders' },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart, href: '/profile?tab=wishlist' },
                    { id: 'reviews', label: 'My Reviews', icon: Star, href: '/profile?tab=reviews' },
                    { id: 'security', label: 'Security', icon: Shield, href: '/profile?tab=security' },
                    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/profile?tab=notifications' },
                    { id: 'billing', label: 'Billing', icon: CreditCard, href: '/profile?tab=billing' },
                  ].map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200",
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  ))}
                </motion.nav>

                {/* Sign Out */}
                <motion.div variants={itemVariants} className="mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="w-full flex items-center gap-2 text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-3 space-y-6"
          >

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <User className="w-4 h-4" />
                          Full Name
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">{user?.name}</div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">{user?.email}</div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border text-gray-500">Not set</div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="w-4 h-4" />
                          Address
                        </label>
                        {isEditing ? (
                          <Input
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Enter your address"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border text-gray-500">Not set</div>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3 pt-4 border-t"
                      >
                        <Button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      My Orders
                    </CardTitle>
                    <CardDescription>
                      View and manage your recent orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{order.id}</h4>
                              <p className="text-sm text-gray-500">Placed on {order.date}</p>
                            </div>
                            <Badge className={cn("mt-2 sm:mt-0", getStatusColor(order.status))}>
                              {order.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total: </span>
                              <span className="font-semibold">${order.total}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Items: </span>
                              <span className="font-semibold">{order.items}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tracking: </span>
                              <span className="font-semibold">{order.tracking}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            {order.status === 'Delivered' && (
                              <Button size="sm" variant="outline">
                                Buy Again
                              </Button>
                            )}
                            {order.status === 'Processing' && (
                              <Button size="sm" variant="outline">
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {orders.length === 0 && (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <Button asChild>
                          <Link href="/shop">Start Shopping</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      My Wishlist
                    </CardTitle>
                    <CardDescription>
                      Your saved items for later
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {wishlistItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-sm">Image</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                              <p className="text-lg font-bold text-gray-900 mb-2">${item.price}</p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant={item.inStock ? "default" : "secondary"}>
                                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm">
                                  Add to Cart
                                </Button>
                                <Button size="sm" variant="outline">
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {wishlistItems.length === 0 && (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-6">Save items you love for later</p>
                        <Button asChild>
                          <Link href="/shop">Explore Products</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Other Tabs Placeholder */}
            {!['profile', 'orders', 'wishlist'].includes(activeTab) && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {activeTab === 'reviews' && <Star className="w-5 h-5" />}
                      {activeTab === 'security' && <Shield className="w-5 h-5" />}
                      {activeTab === 'notifications' && <Bell className="w-5 h-5" />}
                      {activeTab === 'billing' && <CreditCard className="w-5 h-5" />}
                      {activeTab.replace(/_/g, ' ')}
                    </CardTitle>
                    <CardDescription>
                      Manage your {activeTab.replace(/_/g, ' ')} settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Settings className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
                      </h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        This section is under development. You'll be able to manage your{' '}
                        {activeTab.replace(/_/g, ' ')} here soon.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader (keep the same as before)
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-4 w-32 mx-auto mb-2" />
                  <Skeleton className="h-3 w-24 mx-auto" />
                </div>
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full mb-2 rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
