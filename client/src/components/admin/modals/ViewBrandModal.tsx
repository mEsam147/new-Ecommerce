'use client';

import { motion } from 'framer-motion';
import { X, Edit, Star, Users, Package, Calendar, TrendingUp, Verified, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/types';

interface ViewBrandModalProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (brand: Brand) => void;
}

export function ViewBrandModal({ brand, isOpen, onClose, onEdit }: ViewBrandModalProps) {
  if (!isOpen || !brand) return null;

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
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Brand Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(brand)}>
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
            {/* Brand Header */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  {brand.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-gray-900">{brand.name}</h1>
                    <div className="flex items-center gap-2">
                      {brand.isVerified && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                          <Verified size={14} />
                          Verified
                        </span>
                      )}
                      {brand.isFeatured && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        brand.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {brand.description && (
                    <p className="text-gray-600 text-lg leading-relaxed">{brand.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Brand Stats */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <Package className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{brand.productCount}</div>
                <div className="text-sm text-gray-600">Total Products</div>
                <div className="text-xs text-green-600 mt-1">+12 this month</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <Users className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{brand.followerCount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Followers</div>
                <div className="text-xs text-green-600 mt-1">+245 this week</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <Star className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">{brand.rating.average}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
                <div className="text-xs text-gray-600 mt-1">({brand.rating.count} reviews)</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 text-center">
                <TrendingUp className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900">
                  ${(brand.productCount * 450).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-xs text-green-600 mt-1">+18.5% growth</div>
              </div>
            </div>

            {/* Brand Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Brand Information</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Brand Slug</span>
                    <span className="font-medium">{brand.slug}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Verification Status</span>
                    <span className={`font-medium ${
                      brand.isVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {brand.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Featured Status</span>
                    <span className={`font-medium ${
                      brand.isFeatured ? 'text-purple-600' : 'text-gray-600'
                    }`}>
                      {brand.isFeatured ? 'Featured' : 'Regular'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Active Status</span>
                    <span className={`font-medium ${
                      brand.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {brand.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">94%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">2.3%</div>
                    <div className="text-sm text-gray-600">Return Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">4.8/5</div>
                    <div className="text-sm text-gray-600">Quality Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">On-time Delivery</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline & Contact */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Partnership Started</p>
                      <p className="text-sm text-gray-600">
                        {new Date(brand.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">
                        {new Date(brand.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact & Social</h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-blue-600 hover:underline cursor-pointer">
                      www.{brand.slug}.com
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">@{brand.slug}official</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Social Media Presence: Strong</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-3">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">New product launch</span>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Brand campaign started</span>
                    <span className="text-sm text-gray-500">1 week ago</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Partnership renewed</span>
                    <span className="text-sm text-gray-500">2 weeks ago</span>
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
