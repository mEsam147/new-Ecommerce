// components/checkout/ShippingStep.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  MapPin,
  Truck,
  ArrowLeft,
  Edit3,
  Loader2
} from 'lucide-react';
import { AddressForm } from './AddressForm';
import { AddressList } from './AddressList';
import { Address } from '@/types';
import { useToast } from '@/lib/hooks/useToast';

interface ShippingStepProps {
  user: any;
  isAuthenticated: boolean;
  addresses: Address[];
  defaultAddress: Address | undefined;
  selectedAddress: Address | undefined;
  guestShippingInfo: any;
  shippingMethod: string;
  addressesLoading: boolean;
  isCreatingAddress: boolean;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
  isSettingDefault: boolean;
  onSelectAddress: (address: Address) => void;
  onCreateAddress: (addressData: any) => Promise<any>;
  onUpdateAddress: (addressData: any) => Promise<any>;
  onDeleteAddress: (addressId: string) => Promise<any>;
  onSetDefaultAddress: (addressId: string) => Promise<any>;
  onEditAddress: (address: Address) => void;
  onAddNewAddress: () => void;
  onCloseAddressDialog: () => void;
  onInputChange: (field: string, value: string) => void;
  onShippingMethodChange: (method: string) => void;
  onContinueToPayment: () => void;
  isAddressDialogOpen: boolean;
  setIsAddressDialogOpen: (open: boolean) => void;
  editingAddress: Address | undefined;
  setEditingAddress: (address: Address | undefined) => void;
  addressTab: 'select' | 'new';
  setAddressTab: (tab: 'select' | 'new') => void;
}

const shippingMethods = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 0,
    time: '5-7 business days',
    freeThreshold: 50
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 9.99,
    time: '2-3 business days'
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    price: 19.99,
    time: 'Next business day'
  }
];

export const ShippingStep: React.FC<ShippingStepProps> = ({
  user,
  isAuthenticated,
  addresses,
  defaultAddress,
  selectedAddress,
  guestShippingInfo,
  shippingMethod,
  addressesLoading,
  isCreatingAddress,
  isUpdatingAddress,
  isDeletingAddress,
  isSettingDefault,
  onSelectAddress,
  onCreateAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onEditAddress,
  onAddNewAddress,
  onCloseAddressDialog,
  onInputChange,
  onShippingMethodChange,
  onContinueToPayment,
  isAddressDialogOpen,
  setIsAddressDialogOpen,
  editingAddress,
  setEditingAddress,
  addressTab,
  setAddressTab
}) => {
  const { error: toastError } = useToast();

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate address selection for authenticated users
    if (isAuthenticated && !selectedAddress) {
      toastError('Please select a shipping address');
      return;
    }

    // Validate guest shipping info
    if (!isAuthenticated) {
      const requiredFields = ['email', 'firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !guestShippingInfo[field as keyof typeof guestShippingInfo]);

      if (missingFields.length > 0) {
        toastError('Please fill in all required shipping information');
        return;
      }
    }

    onContinueToPayment();
  };

  const handleCloseAddressDialog = () => {
    setIsAddressDialogOpen(false);
    setEditingAddress(undefined);
    setTimeout(() => setAddressTab('select'), 300);
  };

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleShippingSubmit} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={isAuthenticated ? user?.email || '' : guestShippingInfo.email}
                  onChange={(e) => onInputChange('email', e.target.value)}
                  required
                  className="w-full"
                  disabled={isAuthenticated}
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Shipping Address
                </h3>
                {isAuthenticated && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddressDialogOpen(true)}
                    className="gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Manage Addresses
                  </Button>
                )}
              </div>

              {isAuthenticated ? (
                // Authenticated user - address selection
                <div className="space-y-4">
                  {addressesLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Loading addresses...</p>
                    </div>
                  ) : selectedAddress ? (
                    <Card className="border-2 border-blue-500 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">
                                {selectedAddress.type}
                              </Badge>
                              {selectedAddress.isDefault && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="font-semibold">{selectedAddress.name}</p>
                            <p className="text-sm text-gray-600">
                              {selectedAddress.street}
                              {selectedAddress.apartment && `, ${selectedAddress.apartment}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                            </p>
                            <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAddressDialogOpen(true)}
                          >
                            Change
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No address selected</p>
                      <Button onClick={() => setIsAddressDialogOpen(true)}>
                        Select Address
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Guest user - address form
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="First name"
                    value={guestShippingInfo.firstName}
                    onChange={(e) => onInputChange('firstName', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Last name"
                    value={guestShippingInfo.lastName}
                    onChange={(e) => onInputChange('lastName', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Address"
                    value={guestShippingInfo.address}
                    onChange={(e) => onInputChange('address', e.target.value)}
                    required
                    className="md:col-span-2"
                  />
                  <Input
                    placeholder="Apartment, suite, etc. (optional)"
                    value={guestShippingInfo.apartment}
                    onChange={(e) => onInputChange('apartment', e.target.value)}
                    className="md:col-span-2"
                  />
                  <Input
                    placeholder="City"
                    value={guestShippingInfo.city}
                    onChange={(e) => onInputChange('city', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="State"
                    value={guestShippingInfo.state}
                    onChange={(e) => onInputChange('state', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="ZIP code"
                    value={guestShippingInfo.zipCode}
                    onChange={(e) => onInputChange('zipCode', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Phone"
                    value={guestShippingInfo.phone}
                    onChange={(e) => onInputChange('phone', e.target.value)}
                    required
                    className="md:col-span-2"
                  />
                </div>
              )}
            </div>

            {/* Shipping Method */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500" />
                Shipping Method
              </h3>
              <RadioGroup value={shippingMethod} onValueChange={onShippingMethodChange} className="space-y-3">
                {shippingMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 hover:border-blue-500 transition-colors">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.time}</p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {method.price === 0 ? 'FREE' : `$${method.price}`}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              type="submit"
              disabled={isAuthenticated && !selectedAddress}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              Continue to Payment
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Address Management Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Manage Addresses
            </DialogTitle>
          </DialogHeader>

          <Tabs value={addressTab} onValueChange={(value) => setAddressTab(value as 'select' | 'new')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Select Address</TabsTrigger>
              <TabsTrigger value="new">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              <AddressList
                addresses={addresses}
                selectedAddress={selectedAddress}
                onSelectAddress={(address) => {
                  onSelectAddress(address);
                  setIsAddressDialogOpen(false);
                }}
                onEditAddress={onEditAddress}
                onDeleteAddress={onDeleteAddress}
                onSetDefaultAddress={onSetDefaultAddress}
                onAddNewAddress={onAddNewAddress}
                isLoading={addressesLoading}
                isDeleting={isDeletingAddress}
                isSettingDefault={isSettingDefault}
              />
            </TabsContent>

            <TabsContent value="new">
              <AddressForm
                address={editingAddress}
                onSubmit={editingAddress ? onUpdateAddress : onCreateAddress}
                onCancel={handleCloseAddressDialog}
                isLoading={isCreatingAddress || isUpdatingAddress}
                mode={editingAddress ? 'edit' : 'create'}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};
