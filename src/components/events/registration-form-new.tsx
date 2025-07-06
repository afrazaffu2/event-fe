'use client';

import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Event, Package } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CalendarDays, MapPin, Users, DollarSign, Clock, Plus, Trash2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '../ui/textarea';
import { API_ENDPOINTS, createApiRequestOptions } from '@/lib/api';
import { Checkbox } from '../ui/checkbox';

// Enhanced form schema with payment information
const formSchema = z.object({
  // Event Information
  event_id: z.string(),
  event_title: z.string(),
  event_date: z.string(),
  event_location: z.string(),
  host_id: z.string().optional(),
  host_name: z.string().optional(),
  
  // Primary Contact Information
  user_name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number.' }),
  
  // Registration Details
  member_count: z.coerce.number().min(1, 'At least 1 member required').max(10, 'Maximum 10 members'),
  selected_package: z.object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
    description: z.string(),
  }).optional(),
  
  // Payment Information
  payment_method: z.enum(['card', 'paynow', 'bank_transfer', 'grabpay', 'favepay']),
  payment_reference: z.string().optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'cancelled']).default('pending'),
  payment_amount: z.number().min(0),
  payment_currency: z.string().default('SGD'),
  
  // Additional Information
  food_preference: z.string().optional(),
  special_requirements: z.string().optional(),
  emergency_contact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    phone: z.string().min(8, 'Emergency contact phone is required'),
    relationship: z.string().min(2, 'Relationship is required'),
  }),
  
  // Additional Members
  additional_members: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().optional(),
    food_preference: z.string().optional(),
    special_requirements: z.string().optional(),
  })).optional(),
  
  // Terms and Conditions
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  privacy_policy_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the privacy policy',
  }),
  
  // Metadata
  registration_date: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  source: z.string().default('web'),
});

type RegistrationFormProps = {
  event: Event;
  setOpen: (open: boolean) => void;
};

export function RegistrationForm({ event, setOpen }: RegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'confirmation'>('details');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      event_id: event.id,
      event_title: event.title,
      event_date: format(event.date, 'yyyy-MM-dd'),
      event_location: event.location,
      host_id: event.assignedHostIds?.[0] || '',
      host_name: '', // Will be populated from backend
      user_name: '',
      email: '',
      phone: '',
      member_count: 1,
      selected_package: undefined,
      payment_method: 'paynow',
      payment_status: 'pending',
      payment_amount: 0,
      payment_currency: 'SGD',
      food_preference: '',
      special_requirements: '',
      emergency_contact: {
        name: '',
        phone: '',
        relationship: '',
      },
      additional_members: [],
      terms_accepted: false,
      privacy_policy_accepted: false,
      registration_date: new Date().toISOString(),
      source: 'web',
    },
  });

  const { fields: additionalMemberFields, append: appendMember, remove: removeMember } = useFieldArray({
    control: form.control,
    name: 'additional_members',
  });

  const memberCount = form.watch('member_count');

  // Update additional members when member count changes
  useEffect(() => {
    const currentMembers = form.getValues('additional_members') || [];
    const diff = memberCount - 1 - currentMembers.length;
    
    if (diff > 0) {
      // Add members
      for (let i = 0; i < diff; i++) {
        appendMember({ 
          name: '', 
          email: '', 
          phone: '', 
          food_preference: '',
          special_requirements: ''
        });
      }
    } else if (diff < 0) {
      // Remove members
      for (let i = 0; i < Math.abs(diff); i++) {
        if (currentMembers.length > 0) {
          removeMember(currentMembers.length - 1);
        }
      }
    }
  }, [memberCount, appendMember, removeMember, form]);

  // Calculate total amount
  useEffect(() => {
    if (selectedPackage) {
      const amount = selectedPackage.price * memberCount;
      setTotalAmount(amount);
      form.setValue('payment_amount', amount);
      form.setValue('selected_package', {
        id: selectedPackage.id,
        title: selectedPackage.title,
        price: selectedPackage.price,
        description: selectedPackage.description,
      });
    } else {
      setTotalAmount(0);
      form.setValue('payment_amount', 0);
    }
  }, [selectedPackage, memberCount, form]);

  // Handle payment method change
  const handlePaymentMethodChange = (method: string) => {
    form.setValue('payment_method', method as any);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Create comprehensive registration data
      const registrationData = {
        // Event Information
        event_id: values.event_id,
        event_title: values.event_title,
        event_date: values.event_date,
        event_location: values.event_location,
        host_id: values.host_id,
        host_name: values.host_name,
        
        // Primary Contact
        user_name: values.user_name,
        email: values.email,
        phone: values.phone,
        
        // Registration Details
        member_count: values.member_count,
        selected_package: values.selected_package,
        
        // Payment Information
        payment_method: values.payment_method,
        payment_reference: values.payment_reference,
        payment_status: values.payment_status,
        payment_amount: values.payment_amount,
        payment_currency: values.payment_currency,
        
        // Additional Information
        food_preference: values.food_preference,
        special_requirements: values.special_requirements,
        emergency_contact: values.emergency_contact,
        
        // Additional Members
        additional_members: values.additional_members || [],
        
        // Metadata
        registration_date: values.registration_date,
        source: values.source,
      };

      console.log('Submitting registration data:', registrationData);
      console.log('Event assigned host:', event.assignedHostIds);
      console.log('Host ID being sent:', values.host_id);

      const response = await fetch(
        API_ENDPOINTS.EVENT_REGISTER(parseInt(event.id).toString()), 
        createApiRequestOptions('POST', registrationData)
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }

      const booking = await response.json();

      toast({
        title: 'Registration Successful!',
        description: `Your ticket ID is ${booking.sno}. A confirmation has been sent to your email.`,
      });
      
      setPaymentStep('confirmation');
      setTimeout(() => {
        setOpen(false);
      }, 3000);
      
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Could not complete your registration. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNextStep = () => {
    if (paymentStep === 'details') {
      // Validate required fields for details step
      const detailsValid = form.trigger(['user_name', 'email', 'phone', 'member_count', 'emergency_contact']);
      detailsValid.then(isValid => {
        if (isValid) {
          setPaymentStep('payment');
        }
      });
    }
  };

  const handleBackStep = () => {
    if (paymentStep === 'payment') {
      setPaymentStep('details');
    }
  };

  if (paymentStep === 'confirmation') {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Complete!</h3>
            <p className="text-gray-600 mb-4">
              Your registration has been successfully submitted. You will receive a confirmation email shortly.
            </p>
            <Button onClick={() => setOpen(false)} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 ${paymentStep === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="text-sm font-medium">Details</span>
        </div>
        <div className="w-8 h-1 bg-gray-200 rounded"></div>
        <div className={`flex items-center space-x-2 ${paymentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="text-sm font-medium">Payment</span>
        </div>
      </div>

      {/* Event Details Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-semibold text-gray-900">{format(event.date, 'PPP')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Type</p>
                <p className="font-semibold text-gray-900">{event.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Starting Price</p>
                <p className="font-semibold text-gray-900">
                  ${event.packages?.[0]?.price || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {paymentStep === 'details' && (
            <>
              {/* Primary Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Primary Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="user_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., +65 9123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emergency_contact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergency_contact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="Emergency contact phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergency_contact.relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spouse, Parent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Package Selection */}
              {event.packages && event.packages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Select Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedPackage?.id === pkg.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{pkg.title}</h3>
                            <Badge className="bg-blue-100 text-blue-800">
                              ${pkg.price}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                          {pkg.limit && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-4 w-4 mr-1" />
                              <span>Limit: {pkg.limit}</span>
                            </div>
                          )}
                          {pkg.endDate && (
                            <div className="flex items-center text-sm text-red-600 mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>Ends: {format(pkg.endDate, 'MMM dd')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Member Count */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Number of Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="member_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Members</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormDescription>
                          Including yourself. Maximum 10 members per registration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Additional Members */}
              {memberCount > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Additional Members</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {additionalMemberFields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium">Member {index + 2}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMember(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FormField
                            control={form.control}
                            name={`additional_members.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`additional_members.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="Email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`additional_members.${index}.phone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="Phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Food Preference */}
              {event.foodPreferenceConfig.enabled && event.foodPreferenceConfig.options.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Food Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="food_preference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Preference</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a food preference" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {event.foodPreferenceConfig.options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Special Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Special Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="special_requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Any special requirements or requests?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Accessibility needs, dietary restrictions, etc." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Let us know if you have any special requirements or requests.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Next Button */}
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  disabled={!selectedPackage}
                  className="px-8"
                >
                  Next: Payment Details
                </Button>
              </div>
            </>
          )}

          {paymentStep === 'payment' && (
            <>
              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'paynow', label: 'PayNow', icon: '💳', description: 'Fast and secure' },
                      { value: 'card', label: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, Amex' },
                      { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦', description: 'Direct bank transfer' },
                      { value: 'grabpay', label: 'GrabPay', icon: '🚗', description: 'GrabPay wallet' },
                      { value: 'favepay', label: 'FavePay', icon: '🎫', description: 'FavePay wallet' },
                    ].map((method) => (
                      <div
                        key={method.value}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          form.watch('payment_method') === method.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handlePaymentMethodChange(method.value)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{method.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{method.label}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              {selectedPackage && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-green-800">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium">{selectedPackage.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Members:</span>
                      <span className="font-medium">{memberCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Price per person:</span>
                      <span className="font-medium">${selectedPackage.price}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-700">${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="terms_accepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="privacy_policy_accepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I accept the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleBackStep}
                >
                  Back to Details
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? 'Processing...' : 'Complete Registration'}
                </Button>
              </div>
            </>
          )}
        </form>
      </Form>
    </div>
  );
} 