'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Event } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState } from 'react';
import { addBooking } from '@/services/bookingService';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  foodPreference: z.string().optional(),
});

type RegistrationFormProps = {
  event: Event;
  setOpen: (open: boolean) => void;
};

export function RegistrationForm({ event, setOpen }: RegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      foodPreference: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const registrationData = {
        userName: values.name,
        email: values.email,
        phone: '',
        memberCount: 1,
        selectedPackage: {},
        foodPreference: values.foodPreference || '',
        additionalMembers: [],
        totalAmount: 0.00,
      };

      const newBooking = await addBooking(registrationData, event);
      toast({
        title: 'Registration Successful!',
        description: `Your ticket ID is ${newBooking.sno}. A confirmation has been sent to your email.`,
      });
      setOpen(false);
    } catch (error) {
       console.error('Registration failed:', error);
       toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'Could not complete your registration. Please try again.',
      });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {event.foodPreferenceConfig.enabled && event.foodPreferenceConfig.options.length > 0 && (
          <FormField
            control={form.control}
            name="foodPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Food Preference</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a food preference" /></SelectTrigger></FormControl>
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
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
