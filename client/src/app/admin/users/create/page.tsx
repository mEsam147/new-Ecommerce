// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { motion } from 'framer-motion';
// import { ArrowLeft, Save, Mail, Phone, MapPin } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { User } from '@/types';

// export default function CreateUserPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState<Partial<User>>({
//     name: '',
//     email: '',
//     role: 'user',
//     isActive: true,
//     phone: '',
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       country: '',
//       zipCode: ''
//     }
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     // Simulate API call
//     setTimeout(() => {
//       console.log('User created:', formData);
//       setIsLoading(false);
//       router.push('/admin/users');
//     }, 2000);
//   };

//   const handleChange = (field: string, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleAddressChange = (field: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       address: { ...prev.address!, [field]: value }
//     }));
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={() => router.back()}
//           className="hover:bg-gray-100"
//         >
//           <ArrowLeft size={20} />
//         </Button>
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
//           <p className="text-gray-600 mt-2">
//             Add a new user account to the system
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Basic Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Basic Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="name">Full Name *</Label>
//                   <Input
//                     id="name"
//                     value={formData.name}
//                     onChange={(e) => handleChange('name', e.target.value)}
//                     placeholder="Enter full name"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="email">Email Address *</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => handleChange('email', e.target.value)}
//                     placeholder="user@example.com"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="phone">Phone Number</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     value={formData.phone}
//                     onChange={(e) => handleChange('phone', e.target.value)}
//                     placeholder="+1 (555) 000-0000"
//                   />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Address Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Address Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="street">Street Address</Label>
//                   <Input
//                     id="street"
//                     value={formData.address?.street}
//                     onChange={(e) => handleAddressChange('street', e.target.value)}
//                     placeholder="123 Main Street"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="city">City</Label>
//                     <Input
//                       id="city"
//                       value={formData.address?.city}
//                       onChange={(e) => handleAddressChange('city', e.target.value)}
//                       placeholder="New York"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="state">State/Province</Label>
//                     <Input
//                       id="state"
//                       value={formData.address?.state}
//                       onChange={(e) => handleAddressChange('state', e.target.value)}
//                       placeholder="NY"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="country">Country</Label>
//                     <Input
//                       id="country"
//                       value={formData.address?.country}
//                       onChange={(e) => handleAddressChange('country', e.target.value)}
//                       placeholder="United States"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="zipCode">ZIP/Postal Code</Label>
//                     <Input
//                       id="zipCode"
//                       value={formData.address?.zipCode}
//                       onChange={(e) => handleAddressChange('zipCode', e.target.value)}
//                       placeholder="10001"
//                     />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Account Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Account Settings</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label htmlFor="role">User Role *</Label>
//                   <Select value={formData.role} onValueChange={(value: 'user' | 'admin' | 'moderator') => handleChange('role', value)}>
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="user">User</SelectItem>
//                       <SelectItem value="moderator">Moderator</SelectItem>
//                       <SelectItem value="admin">Administrator</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Define the user's access level and permissions.
//                   </p>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="active" className="text-sm font-medium">
//                     Active Account
//                   </Label>
//                   <Switch
//                     checked={formData.isActive}
//                     onCheckedChange={(checked) => handleChange('isActive', checked)}
//                   />
//                 </div>
//                 <p className="text-sm text-gray-500">
//                   Inactive users cannot log into the system.
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="emailVerified" className="text-sm font-medium">
//                     Email Verified
//                   </Label>
//                   <Switch defaultChecked />
//                 </div>
//                 <p className="text-sm text-gray-500">
//                   Mark if the user has verified their email address.
//                 </p>
//               </CardContent>
//             </Card>

//             {/* Notification Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notification Settings</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="emailNotifications" className="text-sm font-medium">
//                     Email Notifications
//                   </Label>
//                   <Switch defaultChecked />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="smsNotifications" className="text-sm font-medium">
//                     SMS Notifications
//                   </Label>
//                   <Switch />
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="marketingEmails" className="text-sm font-medium">
//                     Marketing Emails
//                   </Label>
//                   <Switch defaultChecked />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Actions */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Actions</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 <Button
//                   type="submit"
//                   className="w-full"
//                   disabled={isLoading || !formData.name || !formData.email || !formData.role}
//                 >
//                   {isLoading ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <Save size={16} className="mr-2" />
//                       Create User
//                     </>
//                   )}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full"
//                   onClick={() => router.back()}
//                 >
//                   Cancel
//                 </Button>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }


export default function CreateUser(){
  return(
    <>
    create User
    </>
  )
}
