// // app/checkout/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';

// import { useToast } from '@/lib/hooks/useToast';
// import { useAddresses } from '@/lib/hooks/useAddresses';
// import { useOrders } from '@/lib/hooks/useOrders';
// import { ShippingStep } from '@/components/checkout/ShippingStep';
// import { PaymentStep } from '@/components/checkout/PaymentStep';
// import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
// import { OrderSummary } from '@/components/checkout/OrderSummary';
// import { ProgressSteps } from '@/components/checkout/ProgressSteps';
// import { Address } from '@/types';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import { useCart } from '@/lib/hooks/useCart';
// import { useAuth } from '@/lib/hooks/useAuth';

// // Initialize Stripe
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// export default function CheckoutPage() {
//   const { items:cart, clearCart } = useCart();
//   const { user, isAuthenticated } = useAuth();
//   const { success: toastSuccess, error: toastError } = useToast();

//   // Use addresses hook
//   const {
//     addresses,
//     defaultAddress,
//     isLoading: addressesLoading,
//     isCreatingAddress,
//     isUpdatingAddress,
//     isDeletingAddress,
//     isSettingDefault,
//     createAddress,
//     updateAddress,
//     deleteAddress,
//     setDefaultAddress,
//     refetchAddresses
//   } = useAddresses();

//   // Use orders hook
//   const { createOrder, isCreatingOrder } = useOrders();

//   // Step management
//   const [currentStep, setCurrentStep] = useState(1);

//   // Shipping state
//   const [selectedAddress, setSelectedAddress] = useState<Address>();
//   const [guestShippingInfo, setGuestShippingInfo] = useState({
//     name: '',
//     street: '',
//     city: '',
//     state: '',
//     zipCode: '',
//     country: 'US',
//     phone: ''
//   });
//   const [shippingMethod, setShippingMethod] = useState('standard');

//   // Payment state
//   const [paymentMethod, setPaymentMethod] = useState('card');
//   const [paymentInfo, setPaymentInfo] = useState({
//     cardNumber: '',
//     expiryDate: '',
//     cvv: '',
//     nameOnCard: '',
//     saveCard: false
//   });
//   const [agreeToTerms, setAgreeToTerms] = useState(false);

//   // Address management state
//   const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
//   const [editingAddress, setEditingAddress] = useState<Address>();
//   const [addressTab, setAddressTab] = useState<'select' | 'new'>('select');

//   // Order state
//   const [orderConfirmed, setOrderConfirmed] = useState(false);
//   const [orderId, setOrderId] = useState<string>('');

//   // Calculate order totals
//   const calculateTotals = () => {
//     const subtotal = cart.reduce((total, item) => {
//       const price = item.price || item.product?.price || 0;
//       const quantity = item.quantity || item.qty || 1;
//       return total + (price * quantity);
//     }, 0);

//     const totalItems = cart.reduce((total, item) => total + (item.quantity || item.qty || 1), 0);

//     // Calculate shipping price (matching backend logic)
//     const shippingPrice = subtotal > 100 ? 0 : 10; // Free shipping over $100

//     // Calculate tax (8% - matching backend)
//     const taxPrice = subtotal * 0.08;

//     // Calculate discount (for demo)
//     const discountAmount = 0; // You can add coupon logic later

//     const totalPrice = subtotal + shippingPrice + taxPrice - discountAmount;

//     return {
//       itemsPrice: Number(subtotal.toFixed(2)),
//       shippingPrice: Number(shippingPrice.toFixed(2)),
//       taxPrice: Number(taxPrice.toFixed(2)),
//       discountAmount: Number(discountAmount.toFixed(2)),
//       totalPrice: Number(totalPrice.toFixed(2)),
//       totalItems
//     };
//   };

//   const {
//     itemsPrice,
//     shippingPrice,
//     taxPrice,
//     discountAmount,
//     totalPrice,
//     totalItems
//   } = calculateTotals();

//   // Set default address when addresses load
//   useEffect(() => {
//     if (defaultAddress && isAuthenticated) {
//       setSelectedAddress(defaultAddress);
//     }
//   }, [defaultAddress, isAuthenticated]);

//   // Address management handlers
//   const handleCreateAddress = async (addressData: any) => {
//     const result = await createAddress(addressData);
//     if (result.success) {
//       setIsAddressDialogOpen(false);
//       setAddressTab('select');

//       if (addresses.length === 0 || addressData.isDefault) {
//         setSelectedAddress(result.data);
//       }

//       refetchAddresses();
//     }
//     return result;
//   };

//   const handleUpdateAddress = async (addressData: any) => {
//     if (!editingAddress) return;

//     const result = await updateAddress(editingAddress._id, addressData);
//     if (result.success) {
//       setIsAddressDialogOpen(false);
//       setEditingAddress(undefined);
//       setAddressTab('select');

//       if (selectedAddress?._id === editingAddress._id) {
//         setSelectedAddress(result.data);
//       }

//       refetchAddresses();
//     }
//     return result;
//   };

//   const handleDeleteAddress = async (addressId: string) => {
//     const result = await deleteAddress(addressId);
//     if (result.success) {
//       if (selectedAddress?._id === addressId) {
//         setSelectedAddress(undefined);
//       }
//       refetchAddresses();
//     }
//     return result;
//   };

//   const handleSetDefaultAddress = async (addressId: string) => {
//     const result = await setDefaultAddress(addressId);
//     if (result.success) {
//       setSelectedAddress(result.data);
//       refetchAddresses();
//     }
//     return result;
//   };

//   const handleEditAddress = (address: Address) => {
//     setEditingAddress(address);
//     setAddressTab('new');
//   };

//   const handleAddNewAddress = () => {
//     setEditingAddress(undefined);
//     setAddressTab('new');
//   };

//   const handleCloseAddressDialog = () => {
//     setIsAddressDialogOpen(false);
//     setEditingAddress(undefined);
//     setTimeout(() => setAddressTab('select'), 300);
//   };

//   // Shipping step handlers
//   const handleInputChange = (field: string, value: string) => {
//     setGuestShippingInfo(prev => ({ ...prev, [field]: value }));
//   };

//   const handleShippingMethodChange = (method: string) => {
//     setShippingMethod(method);
//   };

//   const handleContinueToPayment = () => {
//     setCurrentStep(2);
//   };

//   // Payment step handlers
//   const handlePaymentMethodChange = (method: string) => {
//     setPaymentMethod(method);
//   };

//   const handlePaymentInfoChange = (field: string, value: string) => {
//     setPaymentInfo(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSaveCardChange = (checked: boolean) => {
//     setPaymentInfo(prev => ({ ...prev, saveCard: checked }));
//   };

//   const handleAgreeToTermsChange = (checked: boolean) => {
//     setAgreeToTerms(checked);
//   };

//   const handleBackToShipping = () => {
//     setCurrentStep(1);
//   };

//   // Format cart items for backend
//   const formatCartItems = () => {
//     return cart.map(item => ({
//       product: item.productId || item.product?._id || item.product,
//       variant: {
//         size: item.size,
//         color: item.color
//       },
//       name: item.product?.title || 'Product',
//       image: item.product?.images?.[0]?.url || '/images/placeholder-product.jpg',
//       price: item.price || item.product?.price || 0,
//       quantity: item.quantity || item.qty || 1,
//       totalPrice: (item.price || item.product?.price || 0) * (item.quantity || item.qty || 1)
//     }));
//   };

//   // Format shipping address for backend
//   const formatShippingAddress = () => {
//     if (isAuthenticated && selectedAddress) {
//       return {
//         name: selectedAddress.name,
//         street: selectedAddress.street,
//         city: selectedAddress.city,
//         state: selectedAddress.state,
//         zipCode: selectedAddress.zipCode,
//         country: 'US',
//         phone: selectedAddress.phone
//       };
//     } else {
//       return {
//         name: `${guestShippingInfo.firstName} ${guestShippingInfo.lastName}`,
//         street: guestShippingInfo.address,
//         city: guestShippingInfo.city,
//         state: guestShippingInfo.state,
//         zipCode: guestShippingInfo.zipCode,
//         country: 'US',
//         phone: guestShippingInfo.phone
//       };
//     }
//   };

//   const handleSubmitPayment = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       // Validate payment information
//       if (paymentMethod === 'card') {
//         const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
//         const missingFields = requiredFields.filter(field => !paymentInfo[field as keyof typeof paymentInfo]);

//         if (missingFields.length > 0) {
//           toastError('Please fill in all payment information');
//           return;
//         }
//       }

//       // Prepare order data for backend
//       const orderData = {
//         shippingAddress: formatShippingAddress(),
//         billingAddress: formatShippingAddress(), // Same as shipping for now
//         paymentMethod: paymentMethod === 'card' ? 'stripe' : paymentMethod,
//         notes: `Shipping method: ${shippingMethod}`
//       };

//       // Create order using backend API
//       const result = await createOrder(orderData);

//       if (result.success) {
//    setOrderId(result.data.orderNumber);
//       setOrderConfirmed(true);
//       setCurrentStep(3);
//       clearCart();
//       toastSuccess('Order placed successfully!');
//       } else {
//         throw new Error(result.error || 'Failed to create order');
//       }

//     } catch (error) {
//       console.error('Payment error:', error);
//       toastError('Payment failed. Please try again.');
//     }
//   };

//   // Get selected shipping method details
//   const selectedShipping = {
//     standard: { name: 'Standard Shipping', time: '5-7 business days', price: shippingPrice },
//     express: { name: 'Express Shipping', time: '2-3 business days', price: 15 },
//     overnight: { name: 'Overnight Shipping', time: 'Next business day', price: 25 }
//   }[shippingMethod];

//   // Redirect if cart is empty and not on confirmation step
//   useEffect(() => {
//     if (cart.length === 0 && currentStep !== 3 && !orderConfirmed) {
//       window.location.href = '/cart';
//     }
//   }, [cart, currentStep, orderConfirmed]);

//   if (cart.length === 0 && !orderConfirmed) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
//           <p className="text-gray-600 mb-8">Add some items to your cart before checkout</p>
//           <a href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
//             Continue Shopping
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Elements stripe={stripePromise}>
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           {/* Progress Steps */}
//           <ProgressSteps currentStep={currentStep} />

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Main Checkout Content */}
//             <div className="lg:col-span-2">
//               {currentStep === 1 && (
//                 <ShippingStep
//                   user={user}
//                   isAuthenticated={isAuthenticated}
//                   addresses={addresses}
//                   defaultAddress={defaultAddress}
//                   selectedAddress={selectedAddress}
//                   guestShippingInfo={guestShippingInfo}
//                   shippingMethod={shippingMethod}
//                   addressesLoading={addressesLoading}
//                   isCreatingAddress={isCreatingAddress}
//                   isUpdatingAddress={isUpdatingAddress}
//                   isDeletingAddress={isDeletingAddress}
//                   isSettingDefault={isSettingDefault}
//                   onSelectAddress={setSelectedAddress}
//                   onCreateAddress={handleCreateAddress}
//                   onUpdateAddress={handleUpdateAddress}
//                   onDeleteAddress={handleDeleteAddress}
//                   onSetDefaultAddress={handleSetDefaultAddress}
//                   onEditAddress={handleEditAddress}
//                   onAddNewAddress={handleAddNewAddress}
//                   onCloseAddressDialog={handleCloseAddressDialog}
//                   onInputChange={handleInputChange}
//                   onShippingMethodChange={handleShippingMethodChange}
//                   onContinueToPayment={handleContinueToPayment}
//                   isAddressDialogOpen={isAddressDialogOpen}
//                   setIsAddressDialogOpen={setIsAddressDialogOpen}
//                   editingAddress={editingAddress}
//                   setEditingAddress={setEditingAddress}
//                   addressTab={addressTab}
//                   setAddressTab={setAddressTab}
//                 />
//               )}

//               {currentStep === 2 && (
//                 <PaymentStep
//                   paymentMethod={paymentMethod}
//                   paymentInfo={paymentInfo}
//                   selectedAddress={selectedAddress}
//                   guestShippingInfo={guestShippingInfo}
//                   isAuthenticated={isAuthenticated}
//                   selectedShipping={selectedShipping}
//                   agreeToTerms={agreeToTerms}
//                   loading={isCreatingOrder}
//                   onPaymentMethodChange={handlePaymentMethodChange}
//                   onPaymentInfoChange={handlePaymentInfoChange}
//                   onSaveCardChange={handleSaveCardChange}
//                   onAgreeToTermsChange={handleAgreeToTermsChange}
//                   onBackToShipping={handleBackToShipping}
//                   onSubmitPayment={handleSubmitPayment}
//                 />
//               )}

//               {currentStep === 3 && orderConfirmed && (
//                 <ConfirmationStep
//                   user={user}
//                   isAuthenticated={isAuthenticated}
//                   selectedAddress={selectedAddress}
//                   guestShippingInfo={guestShippingInfo}
//                   orderNumber={orderId} // Pass the actual order number from backend
//                 />
//               )}
//             </div>

//             {/* Order Summary */}
//             {currentStep !== 3 && (
//               <div className="lg:col-span-1">
//                 <OrderSummary
//                   items={cart}
//                   totalItems={totalItems}
//                   subtotal={itemsPrice}
//                   total={totalPrice}
//                   discount={discountAmount}
//                   shippingCost={shippingPrice}
//                   tax={taxPrice}
//                   finalTotal={totalPrice}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Elements>
//   );
// }

// app/checkout/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/lib/hooks/useToast';
import { useAddresses } from '@/lib/hooks/useAddresses';
import { ShippingStep } from '@/components/checkout/ShippingStep';
import { PaymentStep } from '@/components/checkout/PaymentStep';
import { ConfirmationStep } from '@/components/checkout/ConfirmationStep';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { ProgressSteps } from '@/components/checkout/ProgressSteps';
import { Address } from '@/types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCartCheckout } from '@/lib/hooks/useCartCheckout';
import { useAuth } from '@/lib/hooks/useAuth';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  // استخدام الهوك الجديد المبسط
  const {
    items: cart,
    isEmpty,
    subtotal,
    total,
    discount,
    shipping,
    tax,
    totalItems,
    clearCart
  } = useCartCheckout();

  const { user, isAuthenticated } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Use addresses hook
  const {
    addresses,
    defaultAddress,
    isLoading: addressesLoading,
    isCreatingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isSettingDefault,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetchAddresses
  } = useAddresses();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Shipping state
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [guestShippingInfo, setGuestShippingInfo] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: ''
  });
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Address management state
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address>();
  const [addressTab, setAddressTab] = useState<'select' | 'new'>('select');

  // Order state
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  // Set default address when addresses load
  useEffect(() => {
    if (defaultAddress && isAuthenticated) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, isAuthenticated]);

  // Set user email for guest checkout
  useEffect(() => {
    if (user?.email && !isAuthenticated) {
      setGuestShippingInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [user?.email, isAuthenticated]);

  // Address management handlers
  const handleCreateAddress = async (addressData: any) => {
    const result = await createAddress(addressData);
    if (result.success) {
      setIsAddressDialogOpen(false);
      setAddressTab('select');

      if (addresses.length === 0 || addressData.isDefault) {
        setSelectedAddress(result.data);
      }

      refetchAddresses();
    }
    return result;
  };

  const handleUpdateAddress = async (addressData: any) => {
    if (!editingAddress) return;

    const result = await updateAddress(editingAddress._id, addressData);
    if (result.success) {
      setIsAddressDialogOpen(false);
      setEditingAddress(undefined);
      setAddressTab('select');

      if (selectedAddress?._id === editingAddress._id) {
        setSelectedAddress(result.data);
      }

      refetchAddresses();
    }
    return result;
  };

  const handleDeleteAddress = async (addressId: string) => {
    const result = await deleteAddress(addressId);
    if (result.success) {
      if (selectedAddress?._id === addressId) {
        setSelectedAddress(undefined);
      }
      refetchAddresses();
    }
    return result;
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      setSelectedAddress(result.data);
      refetchAddresses();
    }
    return result;
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressTab('new');
    setIsAddressDialogOpen(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(undefined);
    setAddressTab('new');
    setIsAddressDialogOpen(true);
  };

  const handleCloseAddressDialog = () => {
    setIsAddressDialogOpen(false);
    setEditingAddress(undefined);
    setTimeout(() => setAddressTab('select'), 300);
  };

  // Shipping step handlers
  const handleInputChange = (field: string, value: string) => {
    setGuestShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleShippingMethodChange = (method: string) => {
    setShippingMethod(method);
  };

  const handleContinueToPayment = () => {
    // Validate shipping information before proceeding
    if (isAuthenticated && !selectedAddress) {
      toastError('Please select a shipping address');
      return;
    }

    if (!isAuthenticated) {
      const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !guestShippingInfo[field as keyof typeof guestShippingInfo]);

      if (missingFields.length > 0) {
        toastError('Please fill in all required shipping information');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestShippingInfo.email)) {
        toastError('Please enter a valid email address');
        return;
      }
    }

    setCurrentStep(2);
  };

  // Payment step handlers
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  const handleAgreeToTermsChange = (checked: boolean) => {
    setAgreeToTerms(checked);
  };

  const handleBackToShipping = () => {
    setCurrentStep(1);
  };

  // Handle successful payment and order creation
  const handleOrderSuccess = (orderNumber: string) => {
    setOrderId(orderNumber);
    setOrderConfirmed(true);
    setCurrentStep(3);
    clearCart();
    toastSuccess('Order placed successfully!');
  };

  // Redirect if cart is empty and not on confirmation step
  useEffect(() => {
    if (isEmpty && currentStep !== 3 && !orderConfirmed) {
      window.location.href = '/cart';
    }
  }, [isEmpty, currentStep, orderConfirmed]);

  if (isEmpty && !orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checkout</p>
          <a href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <ProgressSteps currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <ShippingStep
                  user={user}
                  isAuthenticated={isAuthenticated}
                  addresses={addresses}
                  defaultAddress={defaultAddress}
                  selectedAddress={selectedAddress}
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
                  onInputChange={handleInputChange}
                  onShippingMethodChange={handleShippingMethodChange}
                  onContinueToPayment={handleContinueToPayment}
                  isAddressDialogOpen={isAddressDialogOpen}
                  setIsAddressDialogOpen={setIsAddressDialogOpen}
                  editingAddress={editingAddress}
                  setEditingAddress={setEditingAddress}
                  addressTab={addressTab}
                  setAddressTab={setAddressTab}
                />
              )}

              {currentStep === 2 && (
                <PaymentStep
                  paymentMethod={paymentMethod}
                  selectedAddress={selectedAddress}
                  guestShippingInfo={guestShippingInfo}
                  isAuthenticated={isAuthenticated}
                  selectedShipping={{
                    name: shippingMethod === 'standard' ? 'Standard Shipping' :
                          shippingMethod === 'express' ? 'Express Shipping' : 'Overnight Shipping',
                    time: shippingMethod === 'standard' ? '5-7 business days' :
                          shippingMethod === 'express' ? '2-3 business days' : 'Next business day',
                    price: shippingMethod === 'standard' ? shipping :
                           shippingMethod === 'express' ? 15 : 25
                  }}
                  agreeToTerms={agreeToTerms}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onAgreeToTermsChange={handleAgreeToTermsChange}
                  onBackToShipping={handleBackToShipping}
                  totalAmount={total} // ✅ الآن total معرّف بشكل صحيح
                  cart={cart}
                  onOrderSuccess={handleOrderSuccess}
                />
              )}

              {currentStep === 3 && orderConfirmed && (
                <ConfirmationStep
                  user={user}
                  isAuthenticated={isAuthenticated}
                  selectedAddress={selectedAddress}
                  guestShippingInfo={guestShippingInfo}
                  orderNumber={orderId}
                />
              )}
            </div>

            {/* Order Summary */}
            {currentStep !== 3 && (
              <div className="lg:col-span-1">
                <OrderSummary
                  items={cart}
                  totalItems={totalItems}
                  subtotal={subtotal}
                  total={total}
                  discount={discount}
                  shippingCost={shipping}
                  tax={tax}
                  finalTotal={total}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Elements>
  );
}
