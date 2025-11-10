// app/checkout/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/hooks/useToast';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { useCartCheckout } from '@/lib/hooks/useCartCheckout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCreateOrderMutation } from '@/lib/services/ordersApi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Import components directly
import { ProgressSteps } from '@/components/checkout/ProgressSteps';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { OrdersSummary } from '@/components/checkout/OrderSummary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Shadcn UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { AlertCircle, ShoppingBag, Home, ArrowLeft } from 'lucide-react';

// Types
import { Address, ShippingMethod, PaymentMethod, GuestShippingInfo } from '@/types';

// Initialize Stripe safely
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export default function CheckoutPage() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Cart and order hooks
  const {
    items: cart,
    isEmpty,
    subtotal,
    total,
    discount,
    shipping,
    tax,
    totalItems,
    clearCart,
  } = useCartCheckout();

  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

  // Address management
  const {
    addresses,
    defaultAddress,
    isLoading: addressesLoading,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetchAddresses,
    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSettingDefault,
  } = useAddresses();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping state
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [guestShippingInfo, setGuestShippingInfo] = useState<GuestShippingInfo>({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Order state
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // Address management state
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressTab, setAddressTab] = useState<'select' | 'new'>('select');

  // Set default address when addresses load
  useEffect(() => {
    if (defaultAddress && isAuthenticated) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, isAuthenticated]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isEmpty && !orderConfirmed) {
      toastError('Your cart is empty. Add some items before checkout.');
      setTimeout(() => {
        router.push('/cart');
      }, 2000);
    }
  }, [isEmpty, orderConfirmed, router, toastError]);

  // Address management handlers
  const handleCreateAddress = async (addressData: any) => {
    try {
      const result = await createAddress(addressData);
      if (result.success) {
        setIsAddressDialogOpen(false);
        setAddressTab('select');
        if (addresses.length === 0 || addressData.isDefault) {
          setSelectedAddress(result.data);
        }
        refetchAddresses();
        toastSuccess('Address created successfully');
      }
      return result;
    } catch (error) {
      toastError('Failed to create address');
      return { success: false, error: 'Failed to create address' };
    }
  };

  const handleUpdateAddress = async (addressData: any) => {
    if (!editingAddress) {
      toastError('No address to update');
      return { success: false, error: 'No address to update' };
    }

    try {
      const result = await updateAddress(editingAddress._id, addressData);
      if (result.success) {
        setIsAddressDialogOpen(false);
        setEditingAddress(null);
        setAddressTab('select');
        if (selectedAddress?._id === editingAddress._id) {
          setSelectedAddress(result.data);
        }
        refetchAddresses();
        toastSuccess('Address updated successfully');
      }
      return result;
    } catch (error) {
      toastError('Failed to update address');
      return { success: false, error: 'Failed to update address' };
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressTab('new');
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setAddressTab('new');
  };

  const handleCloseAddressDialog = () => {
    setIsAddressDialogOpen(false);
    setEditingAddress(null);
    setAddressTab('select');
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const result = await deleteAddress(addressId);
      if (result.success) {
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(null);
        }
        refetchAddresses();
        toastSuccess('Address deleted successfully');
      }
      return result;
    } catch (error) {
      toastError('Failed to delete address');
      return { success: false, error: 'Failed to delete address' };
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        refetchAddresses();
        toastSuccess('Default address updated');
      }
      return result;
    } catch (error) {
      toastError('Failed to set default address');
      return { success: false, error: 'Failed to set default address' };
    }
  };

  // Shipping step handlers
  const handleShippingComplete = () => {
    // Validate shipping information
    if (isAuthenticated && !selectedAddress) {
      toastError('Please select a shipping address');
      return;
    }

    if (!isAuthenticated) {
      const requiredFields: (keyof GuestShippingInfo)[] = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !guestShippingInfo[field]);

      if (missingFields.length > 0) {
        toastError('Please fill in all required shipping information');
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestShippingInfo.email)) {
        toastError('Please enter a valid email address');
        return;
      }
    }

    setCurrentStep(2);
  };

  // Handle guest shipping info changes with proper typing
  const handleGuestInfoChange = (field: keyof GuestShippingInfo, value: string) => {
    setGuestShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  // Payment and order creation - FIXED VERSION
// In your checkout page - UPDATED handleOrderCreation with network debugging
const handleOrderCreation = async (paymentData?: any) => {
  console.log('🎯 handleOrderCreation called with paymentData:', paymentData);
  console.log('📝 agreeToTerms:', agreeToTerms);
  console.log('💳 paymentMethod:', paymentMethod);

  if (!agreeToTerms) {
    console.log('❌ Terms not agreed - blocking order creation');
    toastError('Please agree to the terms and conditions');
    return;
  }

  setIsProcessing(true);
  console.log('🔄 Order creation started - setting isProcessing to true');

  try {
    // Prepare order data with proper user information
    const shippingAddressData = isAuthenticated && selectedAddress ? {
      name: selectedAddress.name,
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipCode: selectedAddress.zipCode,
      country: selectedAddress.country || 'US',
      phone: selectedAddress.phone,
    } : {
      name: `${guestShippingInfo.firstName} ${guestShippingInfo.lastName}`,
      street: guestShippingInfo.address,
      city: guestShippingInfo.city,
      state: guestShippingInfo.state,
      zipCode: guestShippingInfo.zipCode,
      country: guestShippingInfo.country,
      phone: guestShippingInfo.phone,
    };

    // Build the exact order data that matches your backend expectations
    const orderData = {
      // Required fields based on common order schemas
      shippingAddress: shippingAddressData,
      paymentMethod: paymentMethod,
      paymentIntentId: paymentData?.paymentIntentId,

      // Cart items in the format your backend expects
      items: cart.map(item => ({
        product: item.productId || item.product?._id, // Some APIs expect 'product' instead of 'productId'
        productId: item.productId || item.product?._id, // Include both for compatibility
        quantity: item.quantity,
        price: item.price,
        name: item.product?.title || item.product?.name, // Include product name
        ...(item.size && { size: item.size }),
        ...(item.color && { color: item.color }),
      })),

      // Pricing information
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total,

      // Payment result
      paymentResult: paymentData?.paymentResult || {
        id: paymentData?.paymentIntentId,
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: isAuthenticated ? user?.email : guestShippingInfo.email,
      },

      // Optional fields
      couponCode: '',
      notes: '',
      billingAddress: undefined,
    };

    console.log('📦 Final order data being sent:', JSON.stringify(orderData, null, 2));

    // Create order with detailed error handling
    console.log('🔄 Calling createOrder API...');

    // Log the actual network request
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      console.log('🌐 Network Request:', args[0], args[1]);
      return originalFetch.apply(this, args);
    };

    const result = await createOrder(orderData).unwrap();
    console.log('✅ Order creation API response:', result);

    if (result.success) {
      console.log('✅ Order created successfully, updating state...');
      setOrderData(result.data);
      setOrderConfirmed(true);
      setCurrentStep(3);
      console.log('✅ Moving to step 3 - Confirmation');

      // Clear cart
      await clearCart();
      console.log('✅ Cart cleared');

      toastSuccess('Your order has been placed successfully!');
    } else {
      console.log('❌ Order creation failed in API:', result.message);
      throw new Error(result.message || 'Failed to create order');
    }
  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    console.error('❌ Full error object:', error);
    console.error('❌ Error status:', error?.status);
    console.error('❌ Error data:', error?.data);
    console.error('❌ Error message:', error?.message);

    // Check network tab for more details
    console.log('🔍 Check browser Network tab for the failed API call details');

    toastError(error?.data?.message || error?.data?.error || error.message || 'Failed to create order. Please try again.');
  } finally {
    setIsProcessing(false);
    console.log('🔄 Order creation process completed - isProcessing set to false');
  }
};

  // Handle payment success - FIXED VERSION
  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('💰 handlePaymentSuccess called with:', paymentResult);
    console.log('👤 Current user:', user);
    console.log('🏠 Selected address:', selectedAddress);
    console.log('📦 Cart items:', cart);
    console.log('🔄 Calling handleOrderCreation...');
    handleOrderCreation(paymentResult);
  };

  // Handle payment error
  const handlePaymentError = (error: any) => {
    console.error('❌ Payment error:', error);
    setIsProcessing(false);
    toastError(error.message || 'Payment failed. Please try again.');
  };

  // Handle back to previous step
  const handleBackToShipping = () => {
    setCurrentStep(1);
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    router.push('/products');
  };

  if (isEmpty && !orderConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some amazing products to your cart before checking out.</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/products')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise || undefined}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase securely</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <ProgressSteps currentStep={currentStep} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Steps */}
            <div className="lg:col-span-2 space-y-6">
              {/* Back Button for Payment Step */}
              {currentStep === 2 && (
                <Button
                  variant="ghost"
                  onClick={handleBackToShipping}
                  className="mb-4 gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Shipping
                </Button>
              )}

              {/* Shipping Step */}
              {currentStep === 1 && (
                <Card className="shadow-lg border-0">
                  <CardContent className="p-0">
                    <ShippingStep
                      user={user}
                      isAuthenticated={isAuthenticated}
                      addresses={addresses}
                      defaultAddress={defaultAddress || undefined}
                      selectedAddress={selectedAddress || undefined}
                      guestShippingInfo={guestShippingInfo}
                      shippingMethod={shippingMethod}
                      addressesLoading={addressesLoading}
                      isCreatingAddress={isCreatingAddress}
                      isUpdatingAddress={isUpdatingAddress}
                      isDeletingAddress={isDeletingAddress}
                      isSettingDefault={isSettingDefault}
                      onSelectAddress={setSelectedAddress}
                      onCreateAddress={handleCreateAddress}
                      onUpdateAddress={handleUpdateAddress}
                      onDeleteAddress={handleDeleteAddress}
                      onSetDefaultAddress={handleSetDefaultAddress}
                      onEditAddress={handleEditAddress}
                      onAddNewAddress={handleAddNewAddress}
                      onCloseAddressDialog={handleCloseAddressDialog}
                      onInputChange={handleGuestInfoChange}
                      onShippingMethodChange={setShippingMethod}
                      onContinueToPayment={handleShippingComplete}
                      isAddressDialogOpen={isAddressDialogOpen}
                      setIsAddressDialogOpen={setIsAddressDialogOpen}
                      editingAddress={editingAddress || undefined}
                      setEditingAddress={setEditingAddress}
                      addressTab={addressTab}
                      setAddressTab={setAddressTab}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Payment Step */}
              {currentStep === 2 && (
                <Card className="shadow-lg border-0">
                  <CardContent className="p-0">
                    <PaymentStep
                      paymentMethod={paymentMethod}
                      selectedAddress={selectedAddress}
                      guestShippingInfo={guestShippingInfo}
                      isAuthenticated={isAuthenticated}
                      shippingMethod={shippingMethod}
                      shippingCost={shipping}
                      agreeToTerms={agreeToTerms}
                      totalAmount={total}
                      cart={cart}
                      onPaymentMethodChange={setPaymentMethod}
                      onAgreeToTermsChange={setAgreeToTerms}
                      onBack={handleBackToShipping}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      onCreateOrder={handleOrderCreation}
                      isProcessing={isProcessing || isCreatingOrder}
                      user={user}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Confirmation Step */}
              {currentStep === 3 && orderConfirmed && (
                <ConfirmationStep
                  order={orderData}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  selectedAddress={selectedAddress}
                  guestShippingInfo={guestShippingInfo}
                />
              )}

              {/* Security Badge */}
              {currentStep !== 3 && (
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {currentStep !== 3 && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <OrdersSummary
                    items={cart}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    discount={discount}
                    total={total}
                    totalItems={totalItems}
                  />

                  {/* Help Section */}
                  <Card className="mt-4 border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
                      <p className="text-blue-700 text-sm mb-3">
                        Our support team is here to help with your order.
                      </p>
                      <div className="space-y-2 text-sm text-blue-600">
                        <p>📞 1-800-123-4567</p>
                        <p>✉️ support@shopco.com</p>
                        <p>🕒 24/7 Customer Support</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Loading Overlay */}
          {(isProcessing || isCreatingOrder) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isCreatingOrder ? 'Creating Your Order...' : 'Processing Payment...'}
                </h3>
                <p className="text-gray-600">
                  Please don't close this window. This may take a few moments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Elements>
  );
}
