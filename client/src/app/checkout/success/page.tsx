// In your success page component - FIXED VERSION
"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetSessionStatusQuery } from '@/lib/services/paymentApi';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [inventoryStatus, setInventoryStatus] = useState('pending');

  // Debug the session ID
  useEffect(() => {
    if (sessionId) {
      console.log('🎯 Session ID from URL:', sessionId);
      console.log('🎯 Session ID length:', sessionId.length);
      console.log('🎯 Session ID type:', typeof sessionId);
    }
  }, [sessionId]);

  const { data: sessionData, isLoading, error } = useGetSessionStatusQuery(
    { sessionId: sessionId! },
    {
      skip: !sessionId,
      refetchOnMountOrArgChange: true
    }
  );

  // Decrement inventory when session data is loaded - FIXED
  useEffect(() => {
    const decrementInventory = async () => {
      // Only proceed if we have a valid session ID and payment was successful
      if (!sessionId || sessionId.length < 10) {
        console.error('❌ Invalid session ID:', sessionId);
        setInventoryStatus('invalid_session');
        return;
      }

      if (sessionData?.success && sessionData.data?.paymentStatus === 'paid') {
        try {
          console.log('🔄 Attempting to decrement inventory for session:', sessionId);

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/decrement-inventory`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              sessionId: sessionId.trim() // Trim any whitespace
            })
          });

          const result = await response.json();

          if (result.success) {
            setInventoryStatus('success');
            setOrderDetails(result.data.order);
            console.log('✅ Inventory decremented successfully');
          } else {
            setInventoryStatus('failed');
            console.error('❌ Inventory decrement failed:', result.error);
          }
        } catch (error) {
          setInventoryStatus('error');
          console.error('❌ Inventory decrement error:', error);
        }
      }
    };

    if (sessionData && sessionId) {
      decrementInventory();
    }
  }, [sessionData, sessionId]);

  // Handle different states
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Session Missing</h2>
          <p>No session ID found in URL. Please return to checkout.</p>
          <a href="/cart" className="text-blue-600 hover:underline">Return to Cart</a>
        </div>
      </div>
    );
  }

  if (sessionId.length < 10) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Session ID</h2>
          <p>Session ID is too short or invalid: "{sessionId}"</p>
          <a href="/cart" className="text-blue-600 hover:underline">Return to Cart</a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2>Verifying your payment...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Verifying Payment</h2>
          <p>{error.data?.error || 'Failed to verify payment session'}</p>
        </div>
      </div>
    );
  }

  // Rest of your success page...
}
