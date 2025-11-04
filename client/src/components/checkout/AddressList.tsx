// components/checkout/AddressList.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Building,
  Navigation,
  Edit3,
  Trash2,
  Star,
  MapPin,
  Plus
} from 'lucide-react';
import { Address } from '@/types';
import { cn } from '@/lib/utils';

interface AddressListProps {
  addresses: Address[];
  selectedAddress?: Address;
  onSelectAddress: (address: Address) => void;
  onEditAddress: (address: Address) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefaultAddress: (addressId: string) => void;
  onAddNewAddress: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  isSettingDefault?: boolean;
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  selectedAddress,
  onSelectAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onAddNewAddress,
  isLoading = false,
  isDeleting = false,
  isSettingDefault = false
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4" />;
      case 'work': return <Building className="w-4 h-4" />;
      default: return <Navigation className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'home': return 'bg-blue-100 text-blue-800';
      case 'work': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      await onDeleteAddress(addressId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    setSettingDefaultId(addressId);
    try {
      await onSetDefaultAddress(addressId);
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No addresses saved
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first address to get started with checkout
          </p>
          <Button onClick={onAddNewAddress} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Address
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add New Address Button */}
      <Button
        onClick={onAddNewAddress}
        variant="outline"
        className="w-full gap-2 border-dashed"
      >
        <Plus className="w-4 h-4" />
        Add New Address
      </Button>

      {/* Address List */}
      <div className="space-y-3">
        {addresses.map((address) => (
          <Card
            key={address._id}
            className={cn(
              "cursor-pointer transition-all duration-200 border-2",
              selectedAddress?._id === address._id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            )}
            onClick={() => onSelectAddress(address)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(address.type)}
                    <span className="font-semibold text-gray-900">
                      {address.name}
                    </span>
                    <Badge variant="secondary" className={getTypeColor(address.type)}>
                      {address.type}
                    </Badge>
                    {address.isDefault && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 fill-yellow-500 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{address.street}</p>
                    {address.apartment && <p>{address.apartment}</p>}
                    <p>
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p>{address.country}</p>
                    <p className="text-gray-500">{address.phone}</p>
                    {address.instructions && (
                      <p className="text-gray-500 italic">
                        Note: {address.instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {/* Set Default Button */}
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address._id);
                      }}
                      disabled={isSettingDefault && settingDefaultId === address._id}
                      className="h-8 w-8 p-0"
                      title="Set as default"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAddress(address);
                    }}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                    title="Edit address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address._id);
                    }}
                    disabled={(isDeleting && deletingId === address._id) || address.isDefault}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
