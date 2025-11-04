// // components/checkout/PaymentStep.tsx - COMPLETE STRIPE VERSION
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
// import { Label } from '@/components/ui/label';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import Link from 'next/link';
// import {
//   Lock,
//   CreditCard,
//   Wallet,
//   Apple,
//   ArrowLeft,
//   Loader2,
//   Plus,
//   AlertCircle
// } from 'lucide-react';
// import { useGetPaymentMethodsQuery } from '@/lib/services/stripeApi';
// import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
// import { FaGoogle } from 'react-icons/fa6';

// interface PaymentStepProps {
//   paymentMethod: string;
//   paymentInfo: any;
//   selectedAddress: any;
//   guestShippingInfo: any;
//   isAuthenticated: boolean;
//   selectedShipping: any;
//   agreeToTerms: boolean;
//   loading: boolean;
//   onPaymentMethodChange: (method: string) => void;
//   onPaymentInfoChange: (field: string, value: string) => void;
//   onSaveCardChange: (checked: boolean) => void;
//   onAgreeToTermsChange: (checked: boolean) => void;
//   onBackToShipping: () => void;
//   onSubmitPayment: (e: React.FormEvent, paymentData?: any) => void;
//   totalAmount: number;
// }

// const paymentMethods = [
//   {
//     id: 'card',
//     name: 'Credit/Debit Card',
//     icon: CreditCard,
//     description: 'Pay with Visa, Mastercard, or American Express'
//   },
//   {
//     id: 'paypal',
//     name: 'PayPal',
//     icon: Wallet,
//     description: 'Pay with your PayPal account'
//   },
//   {
//     id: 'applepay',
//     name: 'Apple Pay',
//     icon: Apple,
//     description: 'Pay with Apple Pay'
//   },
//   {
//     id: 'googlepay',
//     name: 'Google Pay',
//     icon: FaGoogle,
//     description: 'Pay with Google Pay'
//   }
// ];

// // Test card information for development
// const testCards = [
//   { type: 'Visa', number: '4242 4242 4242 4242', exp: '12/34', cvc: '123' },
//   { type: 'Mastercard', number: '5555 5555 5555 4444', exp: '12/34', cvc: '123' },
//   { type: 'Amex', number: '3782 822463 10005', exp: '12/34', cvc: '1234' },
// ];

// export const PaymentStep: React.FC<PaymentStepProps> = ({
//   paymentMethod,
//   paymentInfo,
//   selectedAddress,
//   guestShippingInfo,
//   isAuthenticated,
//   selectedShipping,
//   agreeToTerms,
//   loading,
//   onPaymentMethodChange,
//   onPaymentInfoChange,
//   onSaveCardChange,
//   onAgreeToTermsChange,
//   onBackToShipping,
//   onSubmitPayment,
//   totalAmount
// }) => {
//   const stripe = useStripe();
//   const elements = useElements();

//   const { data: paymentMethodsData, isLoading: isLoadingPaymentMethods } = useGetPaymentMethodsQuery(undefined, {
//     skip: !isAuthenticated,
//   });

//   const [selectedSavedCard, setSelectedSavedCard] = useState<string>('');
//   const [cardError, setCardError] = useState<string>('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showTestCards, setShowTestCards] = useState(false);

//   const savedPaymentMethods = paymentMethodsData?.data || [];

//   const cardElementOptions = {
//     style: {
//       base: {
//         fontSize: '16px',
//         color: '#424770',
//         '::placeholder': {
//           color: '#aab7c4',
//         },
//         padding: '10px 12px',
//       },
//     },
//     hidePostalCode: true,
//   };

//   const getCardIcon = (brand: string) => {
//     const icons: { [key: string]: string } = {
//       visa: '💳',
//       mastercard: '💳',
//       amex: '💳',
//       discover: '💳',
//     };
//     return icons[brand] || '💳';
//   };

//   const handleSavedCardSelect = (cardId: string) => {
//     setSelectedSavedCard(cardId);
//     onPaymentInfoChange('savedPaymentMethodId', cardId);
//     setCardError('');
//   };

//   const handleCardChange = (event: any) => {
//     setCardError(event.error?.message || '');
//   };

//   const fillTestCard = (testCard: any) => {
//     onPaymentInfoChange('cardNumber', testCard.number);
//     onPaymentInfoChange('expiryDate', testCard.exp);
//     onPaymentInfoChange('cvv', testCard.cvc);
//     onPaymentInfoChange('nameOnCard', 'Test User');
//     setShowTestCards(false);
//   };

//   const handleStripeSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!stripe || !elements) {
//       setCardError('Stripe not loaded');
//       return;
//     }

//     if (selectedSavedCard) {
//       // Use saved payment method
//       onSubmitPayment(e);
//       return;
//     }

//     // For new card payments with Stripe Elements
//     const cardElement = elements.getElement(CardElement);
//     if (!cardElement) {
//       setCardError('Card element not found');
//       return;
//     }

//     setIsProcessing(true);
//     setCardError('');

//     try {
//       // Create payment method
//       const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
//         type: 'card',
//         card: cardElement,
//         billing_details: {
//           name: paymentInfo.nameOnCard || 'Test User',
//           email: isAuthenticated ? guestShippingInfo.email : guestShippingInfo.email,
//           address: {
//             line1: selectedAddress?.street || guestShippingInfo.address,
//             city: selectedAddress?.city || guestShippingInfo.city,
//             state: selectedAddress?.state || guestShippingInfo.state,
//             postal_code: selectedAddress?.zipCode || guestShippingInfo.zipCode,
//             country: 'US',
//           },
//         },
//       });

//       if (createError) {
//         setCardError(createError.message || 'Card details are invalid');
//         setIsProcessing(false);
//         return;
//       }

//       if (!paymentMethod) {
//         setCardError('Failed to create payment method');
//         setIsProcessing(false);
//         return;
//       }

//       // Pass payment method ID to parent
//       onPaymentInfoChange('paymentMethodId', paymentMethod.id);

//       // Submit the order with Stripe payment method
//       onSubmitPayment(e, { paymentMethodId: paymentMethod.id });

//     } catch (error: any) {
//       setCardError(error.message || 'Payment processing failed');
//       setIsProcessing(false);
//     }
//   };

//   const handleManualCardSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Basic validation for manual card input
//     if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.nameOnCard) {
//       setCardError('Please fill in all card details');
//       return;
//     }

//     // Simple card number validation
//     const cleanCardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
//     if (cleanCardNumber.length < 13) {
//       setCardError('Please enter a valid card number');
//       return;
//     }

//     setCardError('');
//     onSubmitPayment(e);
//   };

//   const handleSubmit = paymentMethod === 'card' && !selectedSavedCard
//     ? handleStripeSubmit
//     : onSubmitPayment;

//   return (
//     <Card className="shadow-lg border-0">
//       <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
//         <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
//           <CreditCard className="w-5 h-5 text-blue-600" />
//           Payment Method
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="p-6">
//         {/* Test Mode Banner */}
//         <Alert className="mb-6 bg-yellow-50 border-yellow-200">
//           <AlertCircle className="h-4 w-4 text-yellow-600" />
//           <AlertDescription className="text-yellow-800">
//             <strong>Test Mode:</strong> Use test card 4242 4242 4242 4242 with any future expiry and CVC
//             <Button
//               variant="link"
//               className="p-0 h-auto text-yellow-700 ml-2"
//               onClick={() => setShowTestCards(!showTestCards)}
//             >
//               {showTestCards ? 'Hide' : 'Show'} all test cards
//             </Button>
//           </AlertDescription>
//         </Alert>

//         {showTestCards && (
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//             <h4 className="font-semibold text-gray-900 mb-3">Test Card Numbers</h4>
//             <div className="space-y-2">
//               {testCards.map((card, index) => (
//                 <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
//                   <div>
//                     <span className="font-medium">{card.type}:</span>
//                     <span className="ml-2 text-sm">{card.number}</span>
//                   </div>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => fillTestCard(card)}
//                   >
//                     Use
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Payment Method Selection */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Select Payment Method
//             </h3>
//             <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
//               {paymentMethods.map((method) => {
//                 const IconComponent = method.icon;
//                 return (
//                   <div key={method.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 transition-colors">
//                     <RadioGroupItem value={method.id} id={method.id} />
//                     <Label htmlFor={method.id} className="flex-1 cursor-pointer">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <IconComponent className="w-6 h-6 text-gray-600" />
//                           <div>
//                             <p className="font-medium text-gray-900">{method.name}</p>
//                             <p className="text-sm text-gray-600">{method.description}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </Label>
//                   </div>
//                 );
//               })}
//             </RadioGroup>
//           </div>

//           {/* Saved Payment Methods for Authenticated Users */}
//           {paymentMethod === 'card' && isAuthenticated && savedPaymentMethods.length > 0 && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h3>
//               <RadioGroup value={selectedSavedCard} onValueChange={handleSavedCardSelect}>
//                 <div className="space-y-3">
//                   {savedPaymentMethods.map((method) => (
//                     <div key={method.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 transition-colors">
//                       <RadioGroupItem value={method.id} id={`saved-${method.id}`} />
//                       <Label htmlFor={`saved-${method.id}`} className="flex-1 cursor-pointer">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <span className="text-2xl">{getCardIcon(method.brand || 'card')}</span>
//                             <div>
//                               <p className="font-medium text-gray-900 capitalize">
//                                 {method.brand || method.type} {method.last4 ? `•••• ${method.last4}` : ''}
//                               </p>
//                               <p className="text-sm text-gray-600">
//                                 Expires {method.expiry}
//                               </p>
//                             </div>
//                           </div>
//                           {method.isDefault && (
//                             <Badge variant="secondary">Default</Badge>
//                           )}
//                         </div>
//                       </Label>
//                     </div>
//                   ))}
//                 </div>
//               </RadioGroup>

//               <div className="flex items-center justify-center">
//                 <div className="border-t border-gray-300 flex-grow"></div>
//                 <span className="mx-4 text-sm text-gray-500">OR</span>
//                 <div className="border-t border-gray-300 flex-grow"></div>
//               </div>
//             </div>
//           )}

//           {/* Stripe Card Element for New Cards */}
//           {paymentMethod === 'card' && !selectedSavedCard && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>

//               <div className="space-y-2">
//                 <Label>Card Information</Label>
//                 <div className="border rounded-lg p-3">
//                   <CardElement
//                     options={cardElementOptions}
//                     onChange={handleCardChange}
//                   />
//                 </div>
//                 {cardError && (
//                   <p className="text-sm text-red-600">{cardError}</p>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="nameOnCard">Name on Card</Label>
//                 <Input
//                   id="nameOnCard"
//                   placeholder="John Doe"
//                   value={paymentInfo.nameOnCard}
//                   onChange={(e) => onPaymentInfoChange('nameOnCard', e.target.value)}
//                   required
//                 />
//               </div>

//               {isAuthenticated && (
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="save-card"
//                     checked={paymentInfo.saveCard}
//                     onCheckedChange={onSaveCardChange}
//                   />
//                   <Label htmlFor="save-card" className="text-sm text-gray-600">
//                     Save card for future purchases
//                   </Label>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Manual Card Input (Fallback) */}
//           {paymentMethod === 'card' && !selectedSavedCard && process.env.NODE_ENV === 'development' && (
//             <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
//               <h4 className="font-semibold text-gray-900">Manual Card Input (Development Only)</h4>
//               <div className="grid grid-cols-1 gap-4">
//                 <Input
//                   placeholder="Card number"
//                   value={paymentInfo.cardNumber}
//                   onChange={(e) => onPaymentInfoChange('cardNumber', e.target.value)}
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <Input
//                     placeholder="MM/YY"
//                     value={paymentInfo.expiryDate}
//                     onChange={(e) => onPaymentInfoChange('expiryDate', e.target.value)}
//                   />
//                   <Input
//                     placeholder="CVV"
//                     value={paymentInfo.cvv}
//                     onChange={(e) => onPaymentInfoChange('cvv', e.target.value)}
//                   />
//                 </div>
//                 <Input
//                   placeholder="Name on card"
//                   value={paymentInfo.nameOnCard}
//                   onChange={(e) => onPaymentInfoChange('nameOnCard', e.target.value)}
//                 />
//               </div>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleManualCardSubmit}
//                 className="w-full"
//               >
//                 Use Manual Card Input
//               </Button>
//             </div>
//           )}

//           {/* Other payment method notices */}
//           {paymentMethod !== 'card' && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-center gap-2 text-blue-800 mb-2">
//                 {paymentMethod === 'paypal' && <Wallet className="w-5 h-5" />}
//                 {paymentMethod === 'applepay' && <Apple className="w-5 h-5" />}
//                 {paymentMethod === 'googlepay' && <FaGoogle className="w-5 h-5" />}
//                 <span className="font-semibold">
//                   {paymentMethod === 'paypal' ? 'PayPal Checkout' :
//                    paymentMethod === 'applepay' ? 'Apple Pay' : 'Google Pay'}
//                 </span>
//               </div>
//               <p className="text-sm text-blue-700">
//                 {paymentMethod === 'paypal'
//                   ? 'You will be redirected to PayPal to complete your payment securely.'
//                   : 'You will be prompted to complete your payment using your device\'s secure payment system.'}
//               </p>
//             </div>
//           )}

//           {/* Order Summary Preview */}
//           <div className="border-t pt-6">
//             <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Total Amount:</span>
//                 <span className="font-bold text-lg text-gray-900">
//                   ${totalAmount?.toFixed(2)}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Terms and Conditions */}
//           <div className="border-t pt-6">
//             <div className="flex items-start space-x-2">
//               <Checkbox
//                 id="terms"
//                 checked={agreeToTerms}
//                 onCheckedChange={onAgreeToTermsChange}
//                 required
//               />
//               <Label htmlFor="terms" className="text-sm text-gray-600">
//                 I agree to the{' '}
//                 <Link href="/terms" className="text-blue-600 hover:underline">
//                   Terms and Conditions
//                 </Link>{' '}
//                 and{' '}
//                 <Link href="/privacy" className="text-blue-600 hover:underline">
//                   Privacy Policy
//                 </Link>
//               </Label>
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onBackToShipping}
//               className="flex-1 border-gray-300 hover:border-gray-400"
//             >
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Shipping
//             </Button>
//             <Button
//               type="submit"
//               disabled={!agreeToTerms || loading || isProcessing || (paymentMethod === 'card' && !selectedSavedCard && cardError)}
//               className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
//             >
//               {(loading || isProcessing) ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 <>
//                   <Lock className="w-5 h-5" />
//                   Pay ${totalAmount?.toFixed(2)}
//                 </>
//               )}
//             </Button>
//           </div>
//         </form>
//       </CardContent>
//     </Card>
//   );
// };

// components/checkout/PaymentStep.tsx - النسخة العربية
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Lock,
  CreditCard,
  Wallet,
  Apple,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe
} from 'lucide-react';
import { useCreateCheckoutSessionMutation } from '@/lib/services/paymentApi';
import { useToast } from '@/lib/hooks/useToast';
import { FaGoogle } from 'react-icons/fa6';
import { useCart } from '@/lib/hooks/useCart';

interface PaymentStepProps {
  paymentMethod: string;
  selectedAddress: any;
  guestShippingInfo: any;
  isAuthenticated: boolean;
  selectedShipping: any;
  agreeToTerms: boolean;
  onPaymentMethodChange: (method: string) => void;
  onAgreeToTermsChange: (checked: boolean) => void;
  onBackToShipping: () => void;
  totalAmount: number;
  cart: any[];
}

const paymentMethods = [
  {
    id: 'stripe',
    name: 'البطاقة الائتمانية',
    icon: CreditCard,
    description: 'الدفع باستخدام فيزا، ماستركارد، أو أمريكان إكسبريس'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: Wallet,
    description: 'الدفع باستخدام حساب PayPal'
  },
  {
    id: 'applepay',
    name: 'Apple Pay',
    icon: Apple,
    description: 'الدفع باستخدام Apple Pay'
  },
  {
    id: 'googlepay',
    name: 'Google Pay',
    icon: FaGoogle,
    description: 'الدفع باستخدام Google Pay'
  }
];

export const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentMethod,
  selectedAddress,
  guestShippingInfo,
  isAuthenticated,
  selectedShipping,
  agreeToTerms,
  onPaymentMethodChange,
  onAgreeToTermsChange,
  onBackToShipping,
  totalAmount,

}) => {
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation();
  const { success, error: toastError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const {items:cart} = useCart()

  const handlePayment = async () => {
    if (!agreeToTerms) {
      toastError('يرجى الموافقة على الشروط والأحكام');
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'stripe') {
        // إنشاء جلسة دفع Stripe
        const result = await createCheckoutSession({
          successUrl: `${window.location.origin}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout`,
          shippingAddress: {
            country: selectedAddress?.country || guestShippingInfo.country || 'EG'
          }
        }).unwrap();

        if (result.success && result.data.url) {
          // التوجيه إلى صفحة الدفع Stripe
          window.location.href = result.data.url;
        }
      } else if (paymentMethod === 'paypal') {
        // هنا تضيف منطق PayPal
        window.location.href = `/api/payments/paypal/create-order?amount=${totalAmount}`;
      } else if (paymentMethod === 'applepay') {
        // معالجة Apple Pay
        handleApplePay();
      } else if (paymentMethod === 'googlepay') {
        // معالجة Google Pay
        handleGooglePay();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toastError(error?.data?.message || 'فشل في بدء عملية الدفع');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplePay = async () => {
    // تنفيذ Apple Pay
    toastError('Apple Pay غير متاح حالياً');
  };

  const handleGooglePay = async () => {
    // تنفيذ Google Pay
    toastError('Google Pay غير متاح حالياً');
  };

  const getCountryName = (countryCode: string) => {
    const countries: { [key: string]: string } = {
      'EG': 'مصر',
      'SA': 'السعودية',
      'AE': 'الإمارات',
      'BH': 'البحرين',
      'QA': 'قطر',
      'KW': 'الكويت',
      'OM': 'عمان',
      'JO': 'الأردن',
      'LB': 'لبنان',
      'MA': 'المغرب',
      'TN': 'تونس'
    };
    return countries[countryCode] || countryCode;
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          طريقة الدفع
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* معلومات الدولة */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Globe className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>الدولة:</strong> {getCountryName(selectedAddress?.country || guestShippingInfo.country || 'EG')}
          </AlertDescription>
        </Alert>

        {/* طرق الدفع */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            اختر طريقة الدفع
          </h3>
          <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 transition-colors">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* معلومات الطلب */}
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-900 mb-3">ملخص الطلب</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">المجموع:</span>
              <span className="font-bold text-lg text-gray-900">
                ${totalAmount?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">عدد العناصر:</span>
              <span className="font-medium text-gray-900">
                {cart.reduce((total, item) => total + (item.quantity || 1), 0)}
              </span>
            </div>
          </div>
        </div>

        {/* الشروط والأحكام */}
        <div className="border-t pt-6">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={onAgreeToTermsChange}
              required
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              أوافق على {' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                الشروط والأحكام
              </Link>{' '}
              و {' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                سياسة الخصوصية
              </Link>
            </Label>
          </div>
        </div>

        {/* أزرار التنقل */}
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBackToShipping}
            className="flex-1 border-gray-300 hover:border-gray-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للتوصيل
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!agreeToTerms || isProcessing || isCreatingSession}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          >
            {(isProcessing || isCreatingSession) ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري التوجيه للدفع...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                الدفع ${totalAmount?.toFixed(2)}
              </>
            )}
          </Button>
        </div>

        {/* معلومات الدفع الآمن */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <Lock className="w-4 h-4" />
            <span className="font-medium">دفع آمن</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            جميع عمليات الدفع مشفرة وآمنة. نحن لا نخزن أي بيانات بطاقتك الائتمانية.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
