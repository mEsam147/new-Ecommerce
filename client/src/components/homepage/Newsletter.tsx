// components/homepage/Newsletter.tsx
'use client';

import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail('');

    // Reset after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Stay in the Loop
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new arrivals,
            exclusive offers, and style tips.
          </p>
        </div>

        {/* Newsletter Form */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all"
                required
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto bg-green-500/20 border border-green-500/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-100 font-semibold">
                Thank you for subscribing! Welcome to the Shop.co family.
              </span>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-blue-800">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="text-blue-200">Exclusive Deals</span>
          </div>

          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-blue-200">Early Access</span>
          </div>

          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-blue-200">Weekly Updates</span>
          </div>
        </div>

        {/* Privacy Note */}
        <p className="text-sm text-blue-300 mt-8">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from Shop.co
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
