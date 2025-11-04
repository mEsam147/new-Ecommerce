// components/checkout/ProgressSteps.tsx
'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStepsProps {
  currentStep: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Shipping' },
    { number: 2, label: 'Payment' },
    { number: 3, label: 'Confirmation' }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold transition-all duration-300",
              currentStep >= step.number
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-400",
              currentStep === step.number && "ring-4 ring-blue-100 scale-110"
            )}>
              {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-1 mx-4 transition-all duration-300",
                currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-sm font-medium">
        {steps.map((step) => (
          <span
            key={step.number}
            className={cn("transition-colors", currentStep >= step.number ? "text-blue-600" : "text-gray-400")}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};
