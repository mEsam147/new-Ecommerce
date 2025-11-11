// lib/hooks/usePasswordReset.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useValidateResetTokenQuery
} from '@/lib/services/authApi';
import { useToast } from './useToast';

export const usePasswordReset = () => {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [forgotPassword, { isLoading: isSendingEmail }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [email, setEmail] = useState('');

  const handleForgotPassword = async (email: string) => {
    try {
      setEmail(email);
      const result = await forgotPassword({ email }).unwrap();

      if (result.success) {
        success(result.message || 'Password reset email sent successfully');
        return { success: true };
      } else {
        showError(result.message || 'Failed to send reset email');
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to send reset email. Please try again.';
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleResetPassword = async (token: string, password: string) => {
    try {
      const result = await resetPassword({ token, password }).unwrap();

      if (result.success) {
        success(result.message || 'Password reset successfully');
        return { success: true };
      } else {
        showError(result.message || 'Failed to reset password');
        return { success: false, error: result.message };
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to reset password. Please try again.';
      showError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    // State
    email,

    // Actions
    handleForgotPassword,
    handleResetPassword,

    // Loading states
    isSendingEmail,
    isResetting,

    // Combined loading state
    isLoading: isSendingEmail || isResetting,
  };
};

// Hook for validating reset token
export const useResetTokenValidation = (token: string) => {
  const {
    data,
    isLoading,
    error,
    isFetching
  } = useValidateResetTokenQuery(token, {
    skip: !token,
  });

  return {
    isValid: data?.valid ?? false,
    isLoading: isLoading || isFetching,
    error: error ? 'Invalid or expired reset token' : null,
  };
};
