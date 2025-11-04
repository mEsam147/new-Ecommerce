'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePaymentMethods } from '@/lib/hooks/usePaymentMethods';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit3,
  Check,
  Lock,
  Shield,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Wallet,
  Apple,
  Landmark
} from 'lucide-react';
import * as motion from 'framer-motion/client';
import Link from 'next/link';
import { StripeCardForm } from '@/components/payment/StripeCardForm';
import { PaymentMethodSelector } from '@/components/payment/PaymentMethodSelector';

type AddMethodStep = 'select' | 'card' | 'paypal' | 'apple_pay' | 'bank_transfer';

export default function PaymentMethodsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const {
    paymentMethods,
    isLoading,
    error,
    setDefaultPaymentMethod,
    deletePaymentMethod,
    addCardPaymentMethod,
    addPayPalPaymentMethod,
    addApplePayPaymentMethod,
    hasPaymentMethods,
    defaultPaymentMethod,
    isProcessing,
    createSetupIntent // Get this from the hook
  } = usePaymentMethods();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addMethodStep, setAddMethodStep] = useState<AddMethodStep>('select');
  const [setupIntentData, setSetupIntentData] = useState<{ clientSecret: string; setupIntentId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

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

 const handleAddMethodSelect = async (method: 'card' | 'paypal' | 'apple_pay' | 'bank_transfer') => {
  setAddMethodStep(method);

  if (method === 'card') {
    try {
      console.log('🔄 Creating new setup intent...');
      const data = await createSetupIntent();
      console.log('✅ Setup intent created:', data);
      setSetupIntentData(data); // This should have both clientSecret and setupIntentId
    } catch (error) {
      console.error('Failed to create setup intent:', error);
    }
  }
};


  const handleCardSuccess = async (paymentMethodId: string) => {
    try {
      await addCardPaymentMethod(paymentMethodId, false); // Pass the paymentMethodId
      setShowAddForm(false);
      setAddMethodStep('select');
      setSetupIntentData(null);
    } catch (error) {
      // Error handled in hook
      console.error('Failed to add card:', error);
    }
  };

  const handleCardError = (error: string) => {
    console.error('Stripe form error:', error);
  };

  const handlePayPalAdd = async () => {
    try {
      await addPayPalPaymentMethod(false);
      setShowAddForm(false);
      setAddMethodStep('select');
    } catch (error) {
      // Error handled in hook
      console.error('Failed to add PayPal:', error);
    }
  };

  const handleApplePayAdd = async () => {
    try {
      await addApplePayPaymentMethod(false);
      setShowAddForm(false);
      setAddMethodStep('select');
    } catch (error) {
      // Error handled in hook
      console.error('Failed to add Apple Pay:', error);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAddMethodStep('select');
    setSetupIntentData(null);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaymentMethod(id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return '💳';
    if (brandLower.includes('mastercard')) return '💳';
    if (brandLower.includes('amex')) return '💳';
    if (brandLower.includes('paypal')) return '🔵';
    if (brandLower.includes('apple')) return '';
    return '💳';
  };

  const getCardColor = (brand: string) => {
    const brandLower = brand.toLowerCase();
    if (brandLower.includes('visa')) return 'from-blue-500 to-blue-700';
    if (brandLower.includes('mastercard')) return 'from-red-500 to-orange-500';
    if (brandLower.includes('amex')) return 'from-green-500 to-blue-400';
    if (brandLower.includes('paypal')) return 'from-blue-400 to-blue-600';
    if (brandLower.includes('apple')) return 'from-gray-800 to-gray-900';
    return 'from-gray-500 to-gray-700';
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return CreditCard;
      case 'paypal':
        return Wallet;
      case 'apple_pay':
        return Apple;
      default:
        return CreditCard;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to manage your payment methods</p>
            <Button asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthLoading || isLoading) {
    return <PaymentMethodsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild className="hover:bg-gray-100">
              <Link href="/profile">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Payment Methods
              </h1>
              <p className="text-gray-600 text-lg mt-2">Manage your saved payment options</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 space-y-6"
          >

            {/* Security Notice */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Your payment info is secure</h3>
                      <p className="text-gray-600 text-sm">
                        We use bank-level encryption to protect your payment information.
                        Your data is never stored on our servers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div variants={itemVariants}>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-700 text-sm">
                        {typeof error === 'string' ? error : 'An error occurred while loading payment methods'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Payment Methods List */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Saved Payment Methods
                    </CardTitle>
                    <CardDescription>
                      Your saved cards and payment options
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2"
                    disabled={showAddForm || isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add New
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethods.map((method, index) => {
                    const MethodIcon = getMethodIcon(method.type);
                    return (
                      <motion.div
                        key={method.id}
                        variants={itemVariants}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={cn(
                          "border-2 transition-all duration-300 hover:shadow-md",
                          method.isDefault ? "border-blue-500 bg-blue-50/50" : "border-gray-200"
                        )}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Method Icon */}
                                <div className={cn(
                                  "w-12 h-12 rounded-xl bg-gradient-to-r flex items-center justify-center text-white text-lg",
                                  getCardColor(method.brand)
                                )}>
                                  <MethodIcon className="w-6 h-6" />
                                </div>

                                {/* Method Details */}
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {method.brand}
                                      {method.last4 && ` •••• ${method.last4}`}
                                    </h4>
                                    {method.isDefault && (
                                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {method.name}
                                    {method.expiry && ` • Expires ${method.expiry}`}
                                  </p>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {!method.isDefault && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSetDefault(method.id)}
                                    className="text-xs"
                                    disabled={isLoading}
                                  >
                                    Set Default
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingId(method.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(method.id)}
                                  className="text-gray-400 hover:text-red-600"
                                  disabled={isLoading || (method.isDefault && paymentMethods.length > 1)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                  {/* Empty State */}
                  {!hasPaymentMethods && (
                    <motion.div
                      variants={itemVariants}
                      className="text-center py-12"
                    >
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods</h3>
                      <p className="text-gray-600 mb-6">Add a payment method to get started</p>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Add Payment Method'
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Add Payment Method Flow */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                variants={itemVariants}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      {addMethodStep === 'select' && 'Add Payment Method'}
                      {addMethodStep === 'card' && 'Add Credit/Debit Card'}
                      {addMethodStep === 'paypal' && 'Add PayPal Account'}
                      {addMethodStep === 'apple_pay' && 'Add Apple Pay'}
                      {addMethodStep === 'bank_transfer' && 'Add Bank Transfer'}
                    </CardTitle>
                    <CardDescription>
                      {addMethodStep === 'select' && 'Choose your preferred payment method'}
                      {addMethodStep === 'card' && 'Enter your card details securely'}
                      {addMethodStep === 'paypal' && 'Connect your PayPal account'}
                      {addMethodStep === 'apple_pay' && 'Set up Apple Pay'}
                      {addMethodStep === 'bank_transfer' && 'Add bank account details'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Method Selection */}
                    {addMethodStep === 'select' && (
                      <>
                        <PaymentMethodSelector
                          onSelect={handleAddMethodSelect}
                        />
                        <div className="flex gap-3 pt-4">
                          <Button variant="outline" onClick={handleCancelAdd}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}

            {addMethodStep === 'card' && setupIntentData && (
  <StripeCardForm
    clientSecret={setupIntentData.clientSecret}
    setupIntentId={setupIntentData.setupIntentId} // Make sure this is passed
    onSuccess={handleCardSuccess}
    onError={(error) => {
      console.error('Stripe form error:', error);
    }}
    onCancel={handleCancelAdd}
  />
)}

                    {/* PayPal Integration */}
                    {addMethodStep === 'paypal' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            You will be redirected to PayPal to securely link your account.
                          </p>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={handlePayPalAdd}
                            className="flex items-center gap-2"
                            disabled={isProcessing}
                          >
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                            Connect PayPal
                          </Button>
                          <Button variant="outline" onClick={handleCancelAdd}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Apple Pay Integration */}
                    {addMethodStep === 'apple_pay' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">
                            Apple Pay will open to securely add your payment method.
                          </p>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={handleApplePayAdd}
                            className="flex items-center gap-2 bg-black hover:bg-gray-800"
                            disabled={isProcessing}
                          >
                            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Apple className="w-4 h-4" />
                            Add Apple Pay
                          </Button>
                          <Button variant="outline" onClick={handleCancelAdd}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            {/* Security Info */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5 text-green-600" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Bank-Level Encryption</h4>
                      <p className="text-sm text-gray-600">Your data is protected with 256-bit SSL encryption</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Fraud Monitoring</h4>
                      <p className="text-sm text-gray-600">24/7 monitoring for suspicious activity</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">PCI Compliant</h4>
                      <p className="text-sm text-gray-600">We meet all Payment Card Industry standards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Supported Methods */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Supported Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Credit & Debit Cards</span>
                    <div className="flex gap-1">
                      <span className="text-lg">💳</span>
                      <span className="text-lg">💳</span>
                      <span className="text-lg">💳</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">PayPal</span>
                    <span className="text-lg">🔵</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Apple Pay</span>
                    <span className="text-lg font-semibold"></span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Methods</span>
                    <span className="font-semibold">{paymentMethods.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Default Method</span>
                    <span className="font-semibold text-green-600">
                      {defaultPaymentMethod?.brand || 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cards</span>
                    <span className="font-semibold">
                      {paymentMethods.filter(m => m.type === 'card').length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader (keep the same as before)
function PaymentMethodsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 rounded-lg" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
