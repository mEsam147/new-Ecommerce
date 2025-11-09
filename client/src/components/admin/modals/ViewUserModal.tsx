'use client';

import { motion } from 'framer-motion';
import { X, Edit, Mail, Calendar, Phone, MapPin, Shield, Package, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types';

interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: User) => void;
}

export function ViewUserModal({ user, isOpen, onClose, onEdit }: ViewUserModalProps) {
  if (!isOpen || !user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-5 h-5" />;
      case 'moderator': return <Shield className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">User Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Edit size={16} className="mr-2" />
              Edit
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Header */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Stats */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">$1,245</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">4.8</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>

            {/* User Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-gray-600">New York, NY, USA</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Last Login</span>
                    <span className="font-medium">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Account Status</span>
                    <span className={`font-medium ${
                      user.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Placed new order</span>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Updated profile</span>
                    <span className="text-sm text-gray-500">1 day ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Product review</span>
                    <span className="text-sm text-gray-500">3 days ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Newsletter subscription</span>
                    <span className="text-sm text-gray-500">1 week ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email Notifications</span>
                    <span className="text-sm font-medium text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">SMS Alerts</span>
                    <span className="text-sm font-medium text-gray-600">Disabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Newsletter</span>
                    <span className="text-sm font-medium text-green-600">Subscribed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
