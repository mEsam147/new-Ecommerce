// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   useStripe,
//   useElements,
//   CardNumberElement,
//   CardExpiryElement,
//   CardCvcElement,
//   Elements,
// } from '@stripe/react-stripe-js';
// import { getStripe } from '@/lib/stripe/config';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Loader2, Lock, Shield, AlertCircle } from 'lucide-react';

// interface StripeCardFormProps {
//   clientSecret: string;
//   setupIntentId?: string;
//   onSuccess: (paymentMethodId: string, isDefault: boolean) => void;
//   onError: (error: string) => void;
//   onCancel: () => void;
// }

// // Enhanced Stripe element options with better focus handling
// const stripeElementOptions = {
//   style: {
//     base: {
//       fontSize: '16px',
//       color: '#424770',
//       fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
//       '::placeholder': {
//         color: '#aab7c4',
//       },
//       ':focus': {
//         color: '#424770',
//       },
//     },
//     invalid: {
//       color: '#9e2146',
//       iconColor: '#9e2146',
//     },
//   },
// };

// const StripeCardFormInner: React.FC<StripeCardFormProps> = ({
//   clientSecret,
//   setupIntentId,
//   onSuccess,
//   onError,
//   onCancel,
// }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isSecureContext, setIsSecureContext] = useState(true);
//   const [isComplete, setIsComplete] = useState({
//     cardNumber: false,
//     cardExpiry: false,
//     cardCvc: false,
//   });
//   const [elementsReady, setElementsReady] = useState(false);
//   const formRef = useRef<HTMLFormElement>(null);

//   // Check if we're in a secure context
//   useEffect(() => {
//     const secure = window.isSecureContext;
//     setIsSecureContext(secure);

//     if (!secure) {
//       console.warn('⚠️ Not in secure context. Stripe Elements may not work properly.');
//     }
//   }, []);

//   // Force elements to be ready after a short delay
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setElementsReady(true);
//       console.log('✅ Elements marked as ready');
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, []);

//   // Debug props and elements
//   useEffect(() => {
//     console.log('🔧 StripeCardForm State:', {
//       clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'undefined',
//       setupIntentId: setupIntentId || 'undefined',
//       hasStripe: !!stripe,
//       hasElements: !!elements,
//       elementsReady,
//       isSecureContext
//     });
//   }, [clientSecret, setupIntentId, stripe, elements, elementsReady, isSecureContext]);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();

//     if (!stripe || !elements) {
//       setError('Payment system not ready. Please try again.');
//       return;
//     }

//     setIsProcessing(true);
//     setError(null);

//     try {
//       const cardNumber = elements.getElement(CardNumberElement);
//       if (!cardNumber) {
//         throw new Error('Card element not found');
//       }

//       // Get the default payment method value
//       const defaultCheckbox = document.getElementById('defaultPayment') as HTMLInputElement;
//       const isDefault = defaultCheckbox ? defaultCheckbox.checked : false;

//       console.log('🔄 Setting up payment method...');

//       // First, check if the SetupIntent is already succeeded
//       try {
//         const existingSetupIntent = await stripe.retrieveSetupIntent(clientSecret);

//         if (existingSetupIntent.setupIntent?.status === 'succeeded') {
//           console.log('✅ SetupIntent already succeeded, using existing payment method');
//           const paymentMethodId = existingSetupIntent.setupIntent.payment_method;
//           if (paymentMethodId) {
//             onSuccess(paymentMethodId as string, isDefault);
//             return;
//           }
//         }
//       } catch (retrieveError) {
//         console.log('SetupIntent not retrievable, proceeding with confirmation');
//       }

//       // If not succeeded, confirm the setup
//       const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
//         payment_method: {
//           card: cardNumber,
//           billing_details: {
//             name: 'Customer Name',
//             email: 'customer@example.com',
//           },
//         },
//       });

//       if (confirmError) {
//         console.error('❌ Stripe confirmation error:', confirmError);

//         if (confirmError.code === 'setup_intent_unexpected_state') {
//           setError('This payment setup has already been completed. Please try adding a new card.');
//         } else {
//           setError(confirmError.message || 'An error occurred while processing your card');
//         }
//         onError(confirmError.message || 'An error occurred while processing your card');
//       } else if (setupIntent?.status === 'succeeded' && setupIntent.payment_method) {
//         console.log('✅ SetupIntent succeeded:', setupIntent.payment_method);
//         onSuccess(setupIntent.payment_method as string, isDefault);
//       } else {
//         throw new Error('Payment setup failed. Please try again.');
//       }
//     } catch (err: any) {
//       const errorMessage = err.message || 'An unexpected error occurred';
//       console.error('❌ Form submission error:', errorMessage);
//       setError(errorMessage);
//       onError(errorMessage);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleElementChange = (elementType: keyof typeof isComplete) => (event: any) => {
//     setError(null);
//     setIsComplete(prev => ({
//       ...prev,
//       [elementType]: event.complete,
//     }));

//     console.log(`📝 ${elementType} changed:`, {
//       complete: event.complete,
//       empty: event.empty,
//       error: event.error
//     });
//   };

//   const handleElementReady = (elementType: string) => (event: any) => {
//     console.log(`✅ ${elementType} element ready`);
//   };

//   const handleElementFocus = (elementType: string) => (event: any) => {
//     console.log(`🎯 ${elementType} element focused`);
//   };

//   const handleElementBlur = (elementType: string) => (event: any) => {
//     console.log(`👋 ${elementType} element blurred`);
//   };

//   const allFieldsComplete = isComplete.cardNumber && isComplete.cardExpiry && isComplete.cardCvc;

//   // Enhanced CSS for better Stripe Elements visibility and interaction
//   useEffect(() => {
//     const style = document.createElement('style');
//     style.textContent = `
//       .StripeElement {
//         width: 100%;
//         padding: 12px;
//         border: 1px solid #d1d5db;
//         border-radius: 6px;
//         background: white;
//         transition: all 0.2s ease;
//         min-height: 44px;
//         display: flex;
//         align-items: center;
//         box-sizing: border-box;
//         cursor: text;
//       }

//       .StripeElement--focus {
//         border-color: #3b82f6;
//         box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//         outline: none;
//       }

//       .StripeElement--invalid {
//         border-color: #ef4444;
//         background-color: #fef2f2;
//       }

//       .StripeElement--complete {
//         border-color: #10b981;
//       }

//       /* Force iframe to be interactive */
//       .StripeElement iframe {
//         width: 100% !important;
//         min-width: 100% !important;
//         height: 100% !important;
//         border: none !important;
//         background: transparent !important;
//         pointer-events: auto !important;
//       }

//       /* Container with forced pointer events */
//       .stripe-element-container {
//         position: relative;
//         width: 100%;
//         background: white;
//         cursor: text;
//       }

//       .stripe-element-container:focus-within {
//         border-color: #3b82f6;
//         box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//       }

//       /* Make sure the container is clickable */
//       .stripe-element-wrapper {
//         position: relative;
//         width: 100%;
//         cursor: text;
//         pointer-events: auto;
//       }

//       /* Loading overlay */
//       .elements-loading {
//         position: relative;
//       }

//       .elements-loading::after {
//         content: 'Loading payment form...';
//         position: absolute;
//         top: 0;
//         left: 0;
//         right: 0;
//         bottom: 0;
//         background: rgba(255, 255, 255, 0.9);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         font-size: 14px;
//         color: #6b7280;
//       }
//     `;
//     document.head.appendChild(style);

//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

//   // Safe substring function
//   const safeSubstring = (str: string | undefined, start: number, end: number) => {
//     if (!str) return 'undefined';
//     return str.substring(start, end) + '...';
//   };

//   return (
//     <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
//       {/* Security Warning for HTTP */}
//       {!isSecureContext && (
//         <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
//             <div className="flex-1">
//               <h4 className="text-sm font-medium text-amber-800">Insecure Connection</h4>
//               <p className="text-sm text-amber-700 mt-1">
//                 Payment form requires HTTPS for security. Some features may not work properly in development.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="space-y-4">
//         {/* Card Number */}
//         <div className="space-y-2">
//           <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
//             Card Number
//           </Label>
//           <div className="stripe-element-wrapper">
//             <div className="stripe-element-container">
//               <div className="border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20">
//                 <CardNumberElement
//                   id="cardNumber"
//                   options={stripeElementOptions}
//                   onChange={handleElementChange('cardNumber')}
//                   onReady={handleElementReady('cardNumber')}
//                   onFocus={handleElementFocus('cardNumber')}
//                   onBlur={handleElementBlur('cardNumber')}
//                   className="StripeElement"
//                 />
//               </div>
//               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Lock className="w-4 h-4 text-gray-400" />
//               </div>
//             </div>
//           </div>
//           <p className="text-xs text-gray-500">Click anywhere in the field to start typing</p>
//         </div>

//         {/* Expiry and CVC */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label htmlFor="cardExpiry" className="text-sm font-medium text-gray-700">
//               Expiry Date
//             </Label>
//             <div className="stripe-element-wrapper">
//               <div className="stripe-element-container">
//                 <div className="border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20">
//                   <CardExpiryElement
//                     id="cardExpiry"
//                     options={stripeElementOptions}
//                     onChange={handleElementChange('cardExpiry')}
//                     onReady={handleElementReady('cardExpiry')}
//                     onFocus={handleElementFocus('cardExpiry')}
//                     onBlur={handleElementBlur('cardExpiry')}
//                     className="StripeElement"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="cardCvc" className="text-sm font-medium text-gray-700">
//               CVC
//             </Label>
//             <div className="stripe-element-wrapper">
//               <div className="stripe-element-container">
//                 <div className="relative">
//                   <div className="border border-gray-300 rounded-lg bg-white transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20">
//                     <CardCvcElement
//                       id="cardCvc"
//                       options={stripeElementOptions}
//                       onChange={handleElementChange('cardCvc')}
//                       onReady={handleElementReady('cardCvc')}
//                       onFocus={handleElementFocus('cardCvc')}
//                       onBlur={handleElementBlur('cardCvc')}
//                       className="StripeElement"
//                     />
//                   </div>
//                   <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                     <Shield className="w-4 h-4 text-gray-400" />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Instructions */}
//       <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//         <h4 className="text-sm font-medium text-blue-800 mb-2">How to use:</h4>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>• Click anywhere inside the card number field</li>
//           <li>• Start typing your card number (test: 4242 4242 4242 4242)</li>
//           <li>• The field should highlight when clickable</li>
//         </ul>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
//           <div className="flex items-center gap-2">
//             <AlertCircle className="w-4 h-4 flex-shrink-0" />
//             <span>{error}</span>
//           </div>
//         </div>
//       )}

//       {/* Default Payment Method Toggle */}
//       <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//         <input
//           type="checkbox"
//           id="defaultPayment"
//           className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//         />
//         <label htmlFor="defaultPayment" className="text-sm text-gray-700 cursor-pointer">
//           Set as default payment method
//         </label>
//       </div>

//       {/* Debug Info */}
//       <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
//         <p className="text-xs text-blue-700 font-mono">
//           <strong>Security:</strong> {isSecureContext ? '✅ Secure (HTTPS)' : '❌ Insecure (HTTP)'}
//         </p>
//         <p className="text-xs text-blue-700 font-mono mt-1">
//           <strong>Elements Ready:</strong> {elementsReady ? '✅ Yes' : '❌ No'}
//         </p>
//         <p className="text-xs text-blue-700 font-mono mt-1">
//           <strong>Fields:</strong> Card: {isComplete.cardNumber ? '✓' : '✗'},
//           Expiry: {isComplete.cardExpiry ? '✓' : '✗'},
//           CVC: {isComplete.cardCvc ? '✓' : '✗'}
//         </p>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex gap-3 pt-4">
//         <Button
//           type="submit"
//           disabled={!stripe || !allFieldsComplete || isProcessing || !elementsReady}
//           className="flex items-center gap-2 flex-1"
//           size="lg"
//         >
//           {isProcessing ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Processing...
//             </>
//           ) : (
//             'Add Card'
//           )}
//         </Button>
//         <Button
//           type="button"
//           variant="outline"
//           onClick={onCancel}
//           disabled={isProcessing}
//           size="lg"
//         >
//           Cancel
//         </Button>
//       </div>

//       {/* Security Notice */}
//       <div className="text-center">
//         <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
//           <Shield className="w-3 h-3" />
//           Your card details are encrypted and securely processed by Stripe
//         </div>
//       </div>
//     </form>
//   );
// };

// export const StripeCardForm: React.FC<StripeCardFormProps> = (props) => {
//   const [stripe, setStripe] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     const initializeStripe = async () => {
//       try {
//         console.log('🔄 Initializing Stripe...');

//         const stripeInstance = await getStripe();
//         if (mounted) {
//           console.log('✅ Stripe loaded:', !!stripeInstance);
//           setStripe(stripeInstance);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error('❌ Failed to initialize Stripe:', error);
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     initializeStripe();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="p-8">
//           <div className="flex flex-col items-center justify-center space-y-4">
//             <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//             <p className="text-sm text-gray-600">Loading secure payment form...</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (!stripe) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="text-center text-red-600 space-y-2">
//             <AlertCircle className="w-8 h-8 mx-auto" />
//             <p className="font-medium">Unable to load payment form</p>
//             <p className="text-sm">Stripe failed to initialize. Please refresh the page.</p>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Elements
//       stripe={stripe}
//       options={{
//         fonts: [
//           {
//             cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
//           },
//         ],
//         appearance: {
//           theme: 'stripe',
//           variables: {
//             colorPrimary: '#3b82f6',
//             colorBackground: '#ffffff',
//             colorText: '#424770',
//             colorDanger: '#ef4444',
//             fontFamily: 'Inter, system-ui, sans-serif',
//             spacingUnit: '4px',
//             borderRadius: '6px',
//           },
//         },
//       }}
//     >
//       <StripeCardFormInner {...props} />
//     </Elements>
//   );
// };


// components/payment/StripeCardForm.tsx
'use client';

import React from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Label } from '@/components/ui/label';

interface StripeCardFormProps {
  onValidationChange?: (isValid: boolean) => void;
}

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onValidationChange
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  const handleElementChange = (event: any) => {
    if (onValidationChange) {
      onValidationChange(event.complete);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="card-number">Card Number</Label>
        <div className="border rounded-lg p-3">
          <CardNumberElement
            id="card-number"
            options={cardElementOptions}
            onChange={handleElementChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="card-expiry">Expiration Date</Label>
          <div className="border rounded-lg p-3">
            <CardExpiryElement
              id="card-expiry"
              options={cardElementOptions}
              onChange={handleElementChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-cvc">CVC</Label>
          <div className="border rounded-lg p-3">
            <CardCvcElement
              id="card-cvc"
              options={cardElementOptions}
              onChange={handleElementChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
