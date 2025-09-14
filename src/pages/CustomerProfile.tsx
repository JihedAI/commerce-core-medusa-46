import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/lib/sdk';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import RecentOrders from '@/components/RecentOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Address {
  id: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  country_code: string;
  province?: string;
  postal_code: string;
  phone?: string;
  is_default?: boolean;
}

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { customer, setCustomer, checkAuth } = useAuth();
  const { toast } = useToast();
  
  // Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
  });
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressOffset, setAddressOffset] = useState(0);
  const [addressLimit] = useState(20);
  
  // Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    country_code: 'us',
    province: '',
    postal_code: '',
    phone: '',
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!customer) {
      navigate('/login');
    } else {
      // Initialize profile data
      setProfileData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company_name: customer.company_name || '',
      });
      
      // Load addresses
      loadAddresses();
    }
  }, [customer, navigate]);

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const { addresses, count } = await sdk.store.customer.listAddress({
        limit: addressLimit,
        offset: addressOffset,
      });
      setAddresses(addresses || []);
      setAddressCount(count || 0);
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load addresses',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const { customer: updatedCustomer } = await sdk.store.customer.update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        company_name: profileData.company_name,
      });
      
      if (updatedCustomer) {
        setCustomer({
          id: updatedCustomer.id,
          email: updatedCustomer.email,
          first_name: updatedCustomer.first_name,
          last_name: updatedCustomer.last_name,
          phone: updatedCustomer.phone,
          company_name: updatedCustomer.company_name,
          created_at: typeof updatedCustomer.created_at === 'string' ? updatedCustomer.created_at : updatedCustomer.created_at.toISOString(),
          updated_at: typeof updatedCustomer.updated_at === 'string' ? updatedCustomer.updated_at : updatedCustomer.updated_at.toISOString(),
        });
      }
      setIsEditingProfile(false);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleAddAddress = async () => {
    try {
      await sdk.store.customer.createAddress(addressForm);
      
      toast({
        title: 'Success',
        description: 'Address added successfully',
      });
      
      // Reset form and reload addresses
      setIsAddingAddress(false);
      setAddressForm({
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        country_code: 'us',
        province: '',
        postal_code: '',
        phone: '',
      });
      loadAddresses();
    } catch (error) {
      console.error('Failed to add address:', error);
      toast({
        title: 'Error',
        description: 'Failed to add address',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAddress = async (addressId: string) => {
    try {
      await sdk.store.customer.updateAddress(addressId, addressForm);
      
      toast({
        title: 'Success',
        description: 'Address updated successfully',
      });
      
      // Reset form and reload addresses
      setEditingAddressId(null);
      setAddressForm({
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        country_code: 'us',
        province: '',
        postal_code: '',
        phone: '',
      });
      loadAddresses();
    } catch (error) {
      console.error('Failed to update address:', error);
      toast({
        title: 'Error',
        description: 'Failed to update address',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await sdk.store.customer.deleteAddress(addressId);
      
      toast({
        title: 'Success',
        description: 'Address deleted successfully',
      });
      
      loadAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete address',
        variant: 'destructive',
      });
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      company: address.company || '',
      address_1: address.address_1,
      address_2: address.address_2 || '',
      city: address.city,
      country_code: address.country_code,
      province: address.province || '',
      postal_code: address.postal_code,
      phone: address.phone || '',
    });
  };

  if (!customer) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your account details
                    </CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button onClick={() => setIsEditingProfile(true)} variant="outline">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleProfileUpdate} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            first_name: customer.first_name || '',
                            last_name: customer.last_name || '',
                            email: customer.email || '',
                            phone: customer.phone || '',
                            company_name: customer.company_name || '',
                          });
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      disabled={!isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      disabled={!isEditingProfile}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditingProfile}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company_name}
                      onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
                      disabled={!isEditingProfile}
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>
                      Manage your shipping addresses
                    </CardDescription>
                  </div>
                  <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                        <DialogDescription>
                          Enter your shipping address details
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="add-first-name">First Name</Label>
                          <Input
                            id="add-first-name"
                            value={addressForm.first_name}
                            onChange={(e) => setAddressForm({...addressForm, first_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-last-name">Last Name</Label>
                          <Input
                            id="add-last-name"
                            value={addressForm.last_name}
                            onChange={(e) => setAddressForm({...addressForm, last_name: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="add-company">Company (Optional)</Label>
                          <Input
                            id="add-company"
                            value={addressForm.company}
                            onChange={(e) => setAddressForm({...addressForm, company: e.target.value})}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="add-address-1">Address Line 1</Label>
                          <Input
                            id="add-address-1"
                            value={addressForm.address_1}
                            onChange={(e) => setAddressForm({...addressForm, address_1: e.target.value})}
                            placeholder="123 Main St"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="add-address-2">Address Line 2 (Optional)</Label>
                          <Input
                            id="add-address-2"
                            value={addressForm.address_2}
                            onChange={(e) => setAddressForm({...addressForm, address_2: e.target.value})}
                            placeholder="Apt 4B"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-city">City</Label>
                          <Input
                            id="add-city"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-province">State/Province</Label>
                          <Input
                            id="add-province"
                            value={addressForm.province}
                            onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-postal">Postal Code</Label>
                          <Input
                            id="add-postal"
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="add-country">Country Code</Label>
                          <Input
                            id="add-country"
                            value={addressForm.country_code}
                            onChange={(e) => setAddressForm({...addressForm, country_code: e.target.value})}
                            placeholder="us"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="add-phone">Phone</Label>
                          <Input
                            id="add-phone"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                            placeholder="+1234567890"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddingAddress(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddAddress}>
                          Add Address
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAddresses ? (
                  <div className="text-center py-8">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No saved addresses yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add your first address to speed up checkout
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <Card key={address.id} className="relative">
                        <CardContent className="pt-6">
                          {editingAddressId === address.id ? (
                            <div className="space-y-3">
                              <Input
                                value={addressForm.first_name}
                                onChange={(e) => setAddressForm({...addressForm, first_name: e.target.value})}
                                placeholder="First Name"
                              />
                              <Input
                                value={addressForm.last_name}
                                onChange={(e) => setAddressForm({...addressForm, last_name: e.target.value})}
                                placeholder="Last Name"
                              />
                              <Input
                                value={addressForm.address_1}
                                onChange={(e) => setAddressForm({...addressForm, address_1: e.target.value})}
                                placeholder="Address Line 1"
                              />
                              <Input
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                placeholder="City"
                              />
                              <Input
                                value={addressForm.postal_code}
                                onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                                placeholder="Postal Code"
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleUpdateAddress(address.id)}
                                >
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setEditingAddressId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {address.first_name} {address.last_name}
                                </p>
                                {address.company && (
                                  <p className="text-sm text-muted-foreground">{address.company}</p>
                                )}
                                <p className="text-sm">{address.address_1}</p>
                                {address.address_2 && (
                                  <p className="text-sm">{address.address_2}</p>
                                )}
                                <p className="text-sm">
                                  {address.city}, {address.province} {address.postal_code}
                                </p>
                                <p className="text-sm">{address.country_code.toUpperCase()}</p>
                                {address.phone && (
                                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                                )}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditAddress(address)}
                                >
                                  <Edit2 className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteAddress(address.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* Pagination */}
                {addressCount > addressLimit && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddressOffset(Math.max(0, addressOffset - addressLimit));
                        loadAddresses();
                      }}
                      disabled={addressOffset === 0}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {Math.floor(addressOffset / addressLimit) + 1} of{' '}
                      {Math.ceil(addressCount / addressLimit)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddressOffset(addressOffset + addressLimit);
                        loadAddresses();
                      }}
                      disabled={addressOffset + addressLimit >= addressCount}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <RecentOrders />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}