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
import { CalendarDays, MapPin, Users, DollarSign, Clock, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Textarea } from '../ui/textarea';
import { API_BASE_URL } from '@/lib/api';

// Singapore phone number validation regex - supports +65, 65, or direct 8/9 digit numbers
const singaporePhoneRegex = /^(\+65|65)?[689]\d{7}$/;

// Helper function to format Singapore phone numbers
const formatSingaporePhone = (value: string): string => {
  // Remove all non-digits and spaces
  let cleaned = value.replace(/[\s\-\(\)]/g, '');
  
  // If it starts with +65, remove the + and keep 65
  if (cleaned.startsWith('+65')) {
    cleaned = cleaned.substring(1);
  }
  
  // If it doesn't start with 65, add it (only if it's a valid Singapore number)
  if (cleaned.length > 0 && !cleaned.startsWith('65')) {
    // Check if it's a valid Singapore number (starts with 6, 8, or 9)
    if (/^[689]/.test(cleaned)) {
      cleaned = '65' + cleaned;
    }
  }
  
  // Limit to maximum length (65 + 8 digits = 10 digits total)
  if (cleaned.length > 10) {
    cleaned = cleaned.substring(0, 10);
  }
  
  // Format with spaces: 65 9123 4567
  if (cleaned.length > 2) {
    cleaned = cleaned.substring(0, 2) + ' ' + cleaned.substring(2);
  }
  if (cleaned.length > 7) {
    cleaned = cleaned.substring(0, 7) + ' ' + cleaned.substring(7);
  }
  
  return cleaned;
};

// Helper function to validate Singapore phone number
const isValidSingaporePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  
  // Remove all formatting
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it's a valid Singapore number
  // Should be either: +65XXXXXXXX, 65XXXXXXXX, or XXXXXXXXX (where X is digit)
  if (cleaned.startsWith('+65')) {
    return /^\+65[689]\d{7}$/.test(cleaned);
  } else if (cleaned.startsWith('65')) {
    return /^65[689]\d{7}$/.test(cleaned);
  } else {
    return /^[689]\d{7}$/.test(cleaned);
  }
};

const formSchema = z.object({
  user_name: z.string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must be less than 50 characters.' })
    .regex(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces.' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address.' })
    .min(5, { message: 'Email must be at least 5 characters.' })
    .max(100, { message: 'Email must be less than 100 characters.' }),
  phone: z.string()
    .refine((val) => !val || isValidSingaporePhone(val), {
      message: 'Please enter a valid Singapore mobile number starting with 6, 8, or 9 (e.g., 9123 4567)'
    })
    .optional(),
  member_count: z.coerce.number()
    .min(1, 'At least 1 member required')
    .max(10, 'Maximum 10 members allowed'),
  selected_package: z.object({
    id: z.string(),
    title: z.string(),
    price: z.number(),
  }).optional(),
  food_preference: z.string().optional(),
  additional_members: z.array(z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(50, { message: 'Name must be less than 50 characters.' })
      .regex(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces.' }),
    email: z.string()
      .email('Valid email required')
      .min(5, { message: 'Email must be at least 5 characters.' })
      .max(100, { message: 'Email must be less than 100 characters.' }),
    phone: z.string()
      .refine((val) => !val || isValidSingaporePhone(val), {
        message: 'Please enter a valid Singapore mobile number starting with 6, 8, or 9'
      })
      .optional(),
  })).optional(),
});

type RegistrationFormProps = {
  event: Event;
  setOpen: (open: boolean) => void;
};

// HitPay integration
async function createHitPayPayment(amount: number, name: string, email: string, phone: string, eventTitle: string) {
  const redirectUrl = window.location.origin + '/payment-success';
  const body = {
    amount: amount.toFixed(2),
    currency: 'SGD',
    email,
    name,
    reference_number: 'EVT-' + Math.floor(Math.random() * 1000000),
    purpose: eventTitle,
    redirect_url: redirectUrl,
  };

  const response = await fetch('/api/hitpay-create-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to create HitPay payment');
  return data.url;
}

export function RegistrationForm({ event, setOpen }: RegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: '',
      email: '',
      phone: '',
      member_count: 1,
      selected_package: undefined,
      food_preference: '',
      additional_members: [],
    },
    mode: 'onChange', // Enable real-time validation
  });

  const { fields: additionalMemberFields, append: appendMember, remove: removeMember } = useFieldArray({
    control: form.control,
    name: 'additional_members',
  });

  const memberCount = form.watch('member_count');

  // Custom remove function that updates member count
  const handleRemoveMember = (index: number) => {
    removeMember(index);
    // Update member count to reflect the actual number of attendees
    const newMemberCount = memberCount - 1;
    form.setValue('member_count', newMemberCount);
  };

  // Update additional members when member count changes
  useEffect(() => {
    const currentMembers = form.getValues('additional_members') || [];
    const diff = memberCount - 1 - currentMembers.length;
    
    if (diff > 0) {
      // Add members
      for (let i = 0; i < diff; i++) {
        appendMember({ name: '', email: '', phone: '' });
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
      const calculatedAmount = selectedPackage.price * memberCount;
      console.log(`Calculating amount: ${selectedPackage.price} * ${memberCount} = ${calculatedAmount}`);
      setTotalAmount(calculatedAmount);
    } else {
      console.log('No package selected, setting amount to 0');
      setTotalAmount(0);
    }
  }, [selectedPackage, memberCount]);

  // Modified onSubmit to handle registration
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const registrationData = {
        user_name: values.user_name,
        email: values.email,
        phone: values.phone || '',
        member_count: values.member_count,
        selected_package: selectedPackage || {},
        food_preference: values.food_preference || '',
        additional_members: values.additional_members || [],
        total_amount: totalAmount,
        payment_id: '',
        payment_method: 'hitpay',
      };

      console.log('Submitting registration with data:', registrationData);
      console.log('Total amount being sent:', totalAmount);
      console.log('Selected package:', selectedPackage);
      console.log('Member count:', values.member_count);
      console.log('Final calculation:', selectedPackage ? `${selectedPackage.price} * ${values.member_count} = ${totalAmount}` : 'No package selected');

      const response = await fetch(`${API_BASE_URL}/api/events/${parseInt(event.id)}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Registration API error:', errorData);
        throw new Error(`Registration failed: ${response.status} ${response.statusText}`);
      }

      const booking = await response.json();
      console.log('Registration successful:', booking);

      toast({
        title: 'Registration Successful! 🎉',
        description: `Your ticket ID is ${booking.sno}. A confirmation has been sent to your email.`,
      });
      
      // Close the modal after a short delay
      setTimeout(() => {
      setOpen(false);
      }, 2000);
      
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

  return (
    <div className="max-h-[75vh] overflow-y-auto pr-2">
      {/* Compact Hero Section */}
      <div className="relative mb-4 sm:mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-lg sm:rounded-xl"></div>
        <div className="relative p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div>
              <h2 className="text-lg sm:text-xl font-bold">{event.title}</h2>
              <p className="text-purple-100 text-xs sm:text-sm">Event Registration</p>
            </div>
              </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 sm:mt-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <CalendarDays className="h-3 w-3 text-purple-200" />
                <span className="text-xs text-purple-200">Date</span>
              </div>
              <p className="font-semibold text-xs">{format(event.date, 'MMM dd')}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-purple-200" />
                <span className="text-xs text-purple-200">Time</span>
              </div>
              <p className="font-semibold text-xs">
                {event.start_time && event.end_time ? (
                  `${new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })} - ${new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}`
                ) : (
                  format(event.date, 'h:mm a')
                )}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-purple-200" />
                <span className="text-xs text-purple-200">Location</span>
              </div>
              <p className="font-semibold text-xs truncate">{event.location}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 mb-1">
                <DollarSign className="h-3 w-3 text-purple-200" />
                <span className="text-xs text-purple-200">From</span>
              </div>
              <p className="font-semibold text-xs">${event.packages?.[0]?.price || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Personal Information Section */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    Personal Information
                  </h3>
                </div>
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Full Name *</FormLabel>
                    <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            className="h-9 sm:h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                            onChange={(e) => {
                              // Only allow letters and spaces
                              const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                              field.onChange(value);
                            }}
                          />
                    </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          Only letters and spaces allowed
                        </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                  
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Email Address *</FormLabel>
                    <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            {...field} 
                            className="h-9 sm:h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                          />
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
                        <FormLabel className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span>🇸🇬</span>
                          Phone Number (Singapore)
                        </FormLabel>
                    <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-xs sm:text-sm">+65</span>
                            </div>
                            <Input 
                              placeholder="9123 4567" 
                              {...field} 
                              maxLength={13} // 65 9123 4567 = 13 characters
                              className="h-9 sm:h-10 pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg text-sm"
                              onChange={(e) => {
                                const formatted = formatSingaporePhone(e.target.value);
                                field.onChange(formatted);
                              }}
                            />
                          </div>
                    </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          Enter your Singapore mobile number (e.g., 9123 4567). Must start with 6, 8, or 9.
                        </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                      </div>
                        </div>

              {/* Member Count */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-3 w-3 text-purple-600" />
                    </div>
                    Group Size
                  </h3>
                </div>
                <div className="p-3 sm:p-4">
              <FormField
                control={form.control}
                name="member_count"
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Number of Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            className="h-9 sm:h-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg max-w-xs text-sm"
                      />
                    </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                      Including yourself. Maximum 10 members per registration.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
                </div>
              </div>

              {/* Food Preference */}
              {event.foodPreferenceConfig.enabled && event.foodPreferenceConfig.options.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pink-100 rounded-lg flex items-center justify-center">
                        <span className="text-pink-600 text-xs sm:text-sm">🍽️</span>
                      </div>
                      Dietary Preferences
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    <FormField
                      control={form.control}
                      name="food_preference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs sm:text-sm font-medium text-gray-700">Food Preference</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 sm:h-10 border-gray-200 focus:border-pink-500 focus:ring-pink-500 rounded-lg text-sm">
                                <SelectValue placeholder="Choose your dietary preference" />
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
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-6">
              {/* Package Selection */}
              {event.packages && event.packages.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-3 w-3 text-emerald-600" />
                      </div>
                      Choose Your Package
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    <div className="space-y-3">
                      {event.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`relative p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                            selectedPackage?.id === pkg.id
                              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 shadow-md'
                              : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm'
                          }`}
                          onClick={() => {
                            console.log('Selecting package:', pkg);
                            setSelectedPackage(pkg);
                          }}
                        >
                          {selectedPackage?.id === pkg.id && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xs sm:text-sm font-bold text-gray-900">{pkg.title}</h3>
                            <div className="text-right">
                              <div className="text-base sm:text-lg font-bold text-emerald-600">${pkg.price}</div>
                              <div className="text-xs text-gray-500">per person</div>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 leading-relaxed">{pkg.description}</p>
                          
                          <div className="space-y-1">
                            {pkg.limit && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Users className="h-3 w-3 mr-1 text-emerald-500" />
                                <span>Limited to {pkg.limit} registrations</span>
                              </div>
                            )}
                            {pkg.endDate && (
                              <div className="flex items-center text-xs text-red-600">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Offer ends {format(pkg.endDate, 'MMM dd')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

          {/* Additional Members */}
          {memberCount > 1 && (
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users className="h-3 w-3 text-orange-600" />
                      </div>
                      Additional Attendees
                    </h3>
                  </div>
                  <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {additionalMemberFields.map((field, index) => (
                      <div key={field.id} className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 p-3 sm:p-4 border border-orange-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-orange-600">{index + 2}</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Attendee {index + 2}</h4>
                          </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveMember(index)}
                            className="border-orange-200 text-orange-600 hover:bg-orange-50 h-7 sm:h-8 px-2"
                      >
                            <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name={`additional_members.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                                <FormLabel className="text-xs font-medium text-gray-700">Full Name</FormLabel>
                            <FormControl>
                                  <Input 
                                    placeholder="Enter full name" 
                                    {...field} 
                                    className="h-9 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                                    onChange={(e) => {
                                      // Only allow letters and spaces
                                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                      field.onChange(value);
                                    }}
                                  />
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
                                <FormLabel className="text-xs font-medium text-gray-700">Email Address</FormLabel>
                            <FormControl>
                                  <Input 
                                    placeholder="email@example.com" 
                                    {...field} 
                                    className="h-9 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                                  />
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
                                <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                  <span className="text-xs">🇸🇬</span>
                                  Phone
                                </FormLabel>
                            <FormControl>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-xs">+65</span>
                                    </div>
                                    <Input 
                                      placeholder="9123 4567" 
                                      {...field} 
                                      maxLength={13} // 65 9123 4567 = 13 characters
                                      className="h-9 pl-10 border-orange-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg text-sm"
                                      onChange={(e) => {
                                        const formatted = formatSingaporePhone(e.target.value);
                                        field.onChange(formatted);
                                      }}
                                    />
                                  </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                  </div>
                </div>
          )}
            </div>
          </div>

          {/* Form Validation Summary */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-base">📋</span>
              </div>
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-2 text-sm">Form Validation Status</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${form.formState.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs">Form is {form.formState.isValid ? 'valid' : 'incomplete'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${selectedPackage ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                    <span className="text-xs">Package {selectedPackage ? 'selected' : 'not selected'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${form.formState.errors.user_name ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs">Name {form.formState.errors.user_name ? 'has errors' : 'is valid'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${form.formState.errors.email ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-xs">Email {form.formState.errors.email ? 'has errors' : 'is valid'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${form.formState.errors.phone ? 'bg-red-500' : form.watch('phone') ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs">Phone {form.formState.errors.phone ? 'has errors' : form.watch('phone') ? 'is valid' : 'is optional'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount & Payment */}
          {selectedPackage && (
            <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-lg sm:rounded-xl shadow-sm sm:shadow-lg border border-emerald-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-3 sm:px-4 py-2 sm:py-3">
                <h3 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  Payment Summary
                </h3>
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                    <span className="text-xs sm:text-sm text-gray-600">Package</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{selectedPackage.title}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                    <span className="text-xs sm:text-sm text-gray-600">Attendees</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">{memberCount} {memberCount === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-100">
                    <span className="text-xs sm:text-sm text-gray-600">Price per person</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">${selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-emerald-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Button */}
              <Button
                type="button"
                  disabled={isSubmitting || !selectedPackage || !form.formState.isValid}
                onClick={form.handleSubmit(async (values) => {
                  setIsSubmitting(true);
                  try {
                    // Save registration data to localStorage for use after payment
                    localStorage.setItem('pendingRegistration', JSON.stringify({
                      user_name: values.user_name,
                      email: values.email,
                      phone: values.phone || '',
                      member_count: values.member_count,
                      selected_package: selectedPackage || {},
                      food_preference: values.food_preference || '',
                      additional_members: values.additional_members || [],
                      total_amount: totalAmount,
                      event_id: event.id,
                      slug: event.slug,
                    }));
                    const url = await createHitPayPayment(
                      totalAmount,
                      values.user_name,
                      values.email,
                      values.phone || '',
                      event.title
                    );
                    window.location.href = url;
                  } catch (error) {
                      console.error('HitPay payment error:', error);
                    toast({
                      variant: 'destructive',
                      title: 'Payment Error',
                        description: 'Could not initiate payment. Please try again.',
                    });
                    setIsSubmitting(false);
                  }
                })}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Processing Payment...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg">💳</span>
                      <span className="text-sm sm:text-base">
                        {!selectedPackage ? 'Select a Package' : 
                         !form.formState.isValid ? 'Complete Form' : 
                         'Proceed to Secure Payment'}
                      </span>
                      <span className="text-xs sm:text-sm opacity-90">→</span>
                    </div>
                  )}
              </Button>
              </div>
            </div>
          )}

          {/* Payment Status Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-base">🔒</span>
              </div>
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1 text-sm">Secure Payment Information</p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    <span>Bank-level security with HitPay</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    <span>Accepts all major credit/debit cards</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    <span>Digital wallet payments supported</span>
                  </li>
                  <li className="flex items-center gap-1">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    <span>Instant confirmation email after payment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 