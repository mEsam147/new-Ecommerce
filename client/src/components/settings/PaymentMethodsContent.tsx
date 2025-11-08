// components/settings/PaymentMethodsContent.tsx
'use client';

import React, { useState } from 'react';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Plus,
  Trash2,
  Star,
  Calendar,
  Shield,
  AlertTriangle,

  Banknote,
} from 'lucide-react';
import * as motion from 'framer-motion/client';
import { FaPaypal } from 'react-icons/fa6';

export const PaymentMethodsContent: React.FC = () => {
  const {
    paymentMethods,
    isLoading,
    setDefaultPaymentMethod,
    removePaymentMethod,
    isSettingDefault,
    isRemovingPaymentMethod,
    addMethodModalOpen,
    setAddMethodModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    methodToDelete,
    handleDeleteClick,
    handleConfirmDelete,
  } = usePaymentMethods();

  const [stripeLoading, setStripeLoading] = useState(false);

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

  // Format card brand name
  const formatBrandName = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  // Get card icon based on brand
  const getCardIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      diners: '💳',
      jcb: '💳',
      unionpay: '💳',
    };
    return icons[brand] || '💳';
  };

  // Handle add payment method with Stripe
  const handleAddPaymentMethod = async () => {
    setStripeLoading(true);
    // In a real implementation, you would:
    // 1. Create setup intent
    // 2. Initialize Stripe Elements
    // 3. Handle card setup
    setTimeout(() => {
      setStripeLoading(false);
      setAddMethodModalOpen(false);
      // Here you would typically show a success message
    }, 2000);
  };

  // Handle set default payment method
  const handleSetDefault = async (methodId: string) => {
    await setDefaultPaymentMethod(methodId);
  };

  if (isLoading) {
    return <PaymentMethodsSkeleton />;
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CreditCard className="w-6 h-6" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods for faster and secure checkout
                </CardDescription>
              </div>
              <Button
                onClick={() => setAddMethodModalOpen(true)}
                className="mt-4 sm:mt-0"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900">Your payment information is secure</h4>
                <p className="text-blue-700 text-sm mt-1">
                  We use industry-standard encryption to protect your payment details.
                  Your full card numbers are never stored on our servers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Payment Methods</CardTitle>
            <CardDescription>
              {paymentMethods.length > 0
                ? `You have ${paymentMethods.length} saved payment method${paymentMethods.length !== 1 ? 's' : ''}`
                : 'No payment methods saved yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Payment Method Icon */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {method.type === 'card' ? (
                          <CreditCard className="w-6 h-6 text-gray-600" />
                        ) : method.type === 'paypal' ? (
                          <FaPaypal className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Banknote className="w-6 h-6 text-green-600" />
                        )}
                      </div>

                      {/* Payment Method Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {method.type === 'card'
                              ? `${formatBrandName(method.card?.brand || 'Card')} •••• ${method.card?.last4}`
                              : method.type === 'paypal'
                              ? `PayPal • ${method.paypal?.email || 'Account'}`
                              : 'Bank Account'
                            }
                          </h3>
                          {method.isDefault && (
                            <Badge variant="default" className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              Default
                            </Badge>
                          )}
                        </div>

                        {method.type === 'card' && method.card && (
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-4">
                              <span>Expires {method.card.exp_month.toString().padStart(2, '0')}/{method.card.exp_year}</span>
                              <span className="capitalize">{method.card.funding} card</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Added on {new Date(method.created * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        )}

                        {method.type === 'paypal' && (
                          <div className="text-sm text-gray-600">
                            Connected PayPal account
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                          disabled={isSettingDefault}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(
                          method.id,
                          method.type === 'card' ? method.card?.last4 : undefined
                        )}
                        disabled={isRemovingPaymentMethod || method.isDefault}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No payment methods</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Add a payment method to make your checkout experience faster and more convenient.
                </p>
                <Button onClick={() => setAddMethodModalOpen(true)} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Payment Method
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Payment Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Payment Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">PCI Compliant</h4>
                <p className="text-gray-600">We meet the highest security standards for payment processing</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Encrypted Data</h4>
                <p className="text-gray-600">Your payment details are encrypted and securely stored</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Fraud Protection</h4>
                <p className="text-gray-600">Advanced fraud detection systems protect your transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Payment Method Modal */}
      <Dialog open={addMethodModalOpen} onOpenChange={setAddMethodModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Payment Method
            </DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to your account for faster checkout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Method Options */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={handleAddPaymentMethod}
                disabled={stripeLoading}
              >
                <CreditCard className="w-6 h-6" />
                Credit/Debit Card
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                disabled
              >
                <FaPaypal className="w-6 h-6 text-blue-600" />
                PayPal
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              </Button>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  Your payment details are secured with bank-level encryption and never stored on our servers.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setAddMethodModalOpen(false)}
              disabled={stripeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPaymentMethod}
              disabled={stripeLoading}
            >
              {stripeLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Add Card'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Remove Payment Method
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {methodToDelete?.last4 ? `card ending in ${methodToDelete.last4}` : 'this payment method'}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isRemovingPaymentMethod}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isRemovingPaymentMethod}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isRemovingPaymentMethod ? 'Removing...' : 'Remove Payment Method'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Payment Methods Skeleton Component
const PaymentMethodsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
      </Card>

      {/* Security Notice Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
