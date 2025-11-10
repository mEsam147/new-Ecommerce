// components/checkout/ProgressSteps.tsx
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Truck, CreditCard, CheckCircle } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: 'Shipping', icon: Truck, description: 'Address & Delivery' },
  { id: 2, name: 'Payment', icon: CreditCard, description: 'Payment Method' },
  { id: 3, name: 'Confirmation', icon: CheckCircle, description: 'Order Review' },
];

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <div className="flex flex-col items-center flex-1">
                  <div className="flex items-center">
                    {/* Step Circle */}
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                  </div>

                  {/* Step Text */}
                  <div className="mt-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted || isCurrent
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </span>
                      {isCurrent && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs ${
                        isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 mt-6 rounded-full transition-colors duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
