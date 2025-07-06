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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, PlusCircle, Trash2, CheckCircle, Circle, X, 
  Wifi, Car, Coffee, Utensils, WashingMachine, Tv, Music, 
  WifiOff, ParkingCircle, Baby, Dog, Flame, User, Stethoscope, 
  Shield, Camera, Mic, Volume2, Monitor, Fan, Snowflake, Sun, 
  Moon, Clock, MapPin, Phone, Mail, Globe, Lock, Unlock, Heart, 
  Star, Gift, Trophy, Medal, Crown, Zap, Battery, Plug, Lightbulb, 
  Home, Building, Store, ChefHat, Hotel, School, Building2, 
  Banknote, Mailbox, Library, Theater, Mountain, Trees, Flower, 
  Leaf, Cloud, CloudRain, Wind, Droplets
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
// Define event statuses and types locally since mock-data was removed
const eventStatuses = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' }
];

const eventTypes = [
  { value: 'Conference', label: 'Conference' },
  { value: 'Webinar', label: 'Webinar' },
  { value: 'Meetup', label: 'Meetup' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Other', label: 'Other' }
];
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { addEvent, addEventWithImages } from '@/services/eventService';
import { getHosts } from '@/services/hostService';
import { getAmenities, createAmenity } from '@/services/amenityService';
import type { Host, Amenity } from '@/types';
import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from '@/lib/api';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import RichTextField from './RichTextField';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const formSchema = z.object({
  title: z.string().min(3, { message: 'Event title must be at least 3 characters.' }),
  description: z.string().optional(),
  date: z.date({ required_error: 'Start date is required.' }),
  end_date: z.date({ required_error: 'End date is required.' }),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().min(2, { message: 'Location is required.' }),
  type: z.string().min(1, 'Please select an event type.'),
  status: z.string().min(1, 'Please select a status.'),
  assignedHostId: z.string().min(1, 'Please assign a host.'),
  category: z.string().min(1, 'Please select a category.'),
  tags: z.string().min(1, { message: 'Please enter at least one tag.' }), // Comma-separated
  amenities: z.array(z.string()).optional(),
  images: z.object({
    cover: z.any().optional(),
    thumbnail: z.any().optional(),
    square: z.any().optional(),
  }),
  packages: z.array(z.object({
    title: z.string().min(1, 'Package title is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be positive'),
    limit: z.coerce.number().int().positive().optional(),
    endDate: z.date().optional(),
  })).optional(),
  additionalMembersConfig: z.object({
    mode: z.enum(['none', 'pax', 'type']),
  }),
  foodPreferenceConfig: z.object({
    enabled: z.boolean(),
    options: z.string().optional(), // Comma-separated
  }),
  faq: z.array(z.object({
    question: z.string().min(1, 'Question cannot be empty'),
    answer: z.string().min(1, 'Answer cannot be empty'),
  })).optional(),
  termsAndConditions: z.string().optional(),
}).refine((data) => {
  // End date must be after or equal to start date
  if (data.date && data.end_date) {
    return data.end_date >= data.date;
  }
  return true;
}, {
  message: "End date must be on or after start date",
  path: ["end_date"],
}).refine((data) => {
  // If both times are provided, end time must be after start time
  if (data.start_time && data.end_time) {
    const startTime = new Date(`2000-01-01T${data.start_time}`);
    const endTime = new Date(`2000-01-01T${data.end_time}`);
    return endTime > startTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["end_time"], // This will show the error on the end_time field
}).refine((data) => {
  // If one time is provided, both should be provided
  if ((data.start_time && !data.end_time) || (!data.start_time && data.end_time)) {
    return false;
  }
  return true;
}, {
  message: "Both start time and end time must be provided together",
  path: ["end_time"],
});

type EventFormProps = {
  setOpen: (open: boolean) => void;
};

export function EventForm({ setOpen }: EventFormProps) {
  const { toast } = useToast();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [categories, setCategories] = useState<{ id: number; title: string }[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddAmenity, setShowAddAmenity] = useState(false);
  const [newAmenityTitle, setNewAmenityTitle] = useState('');
  const [imageFiles, setImageFiles] = useState<{ cover?: File; thumbnail?: File; square?: File }>({});
  const [imagePreviews, setImagePreviews] = useState<{ cover?: string; thumbnail?: string; square?: string }>({});

  useEffect(() => {
    async function fetchHosts() {
      try {
        console.log('🔍 Event Form - Fetching hosts...');
        const fetchedHosts = await getHosts();
        console.log('🔍 Event Form - Fetched hosts:', fetchedHosts);
        setHosts(fetchedHosts);
      } catch (error) {
        console.error('❌ Event Form - Failed to fetch hosts:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch hosts. Please try again.',
        });
      }
    }

    async function fetchCategories() {
      try {
        console.log('🔍 Event Form - Fetching categories...');
        const response = await fetch(API_ENDPOINTS.CATEGORIES, createApiRequestOptions('GET'));
        const fetchedCategories = await handleApiResponse<{ id: number; title: string }[]>(response);
        console.log('🔍 Event Form - Fetched categories:', fetchedCategories);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('❌ Event Form - Failed to fetch categories:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch categories. Please try again.',
        });
      }
    }

    async function fetchAmenities() {
      try {
        console.log('🔍 Event Form - Fetching amenities...');
        const fetchedAmenities = await getAmenities();
        console.log('🔍 Event Form - Fetched amenities:', fetchedAmenities);
        setAmenities(fetchedAmenities);
      } catch (error) {
        console.error('❌ Event Form - Failed to fetch amenities:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch amenities. Please try again.',
        });
      }
    }

    fetchHosts();
    fetchCategories();
    fetchAmenities();
  }, []);

  // Function to handle image file selection with validation and preview
  const handleImageChange = (type: 'cover' | 'thumbnail' | 'square', file: File | undefined) => {
    if (!file) {
      setImageFiles(prev => ({ ...prev, [type]: undefined }));
      setImagePreviews(prev => ({ ...prev, [type]: undefined }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, etc.)',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Image file must be less than 5MB',
      });
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    setImageFiles(prev => ({ ...prev, [type]: file }));
    setImagePreviews(prev => ({ ...prev, [type]: previewUrl }));
  };

  // Function to get icon based on amenity title
  const getAmenityIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    // Transportation & Parking
    if (lowerTitle.includes('parking') || lowerTitle.includes('car') || lowerTitle.includes('vehicle')) return ParkingCircle;
    if (lowerTitle.includes('shuttle') || lowerTitle.includes('transport')) return Car;
    
    // Internet & Technology
    if (lowerTitle.includes('wifi') || lowerTitle.includes('internet') || lowerTitle.includes('wireless')) return Wifi;
    if (lowerTitle.includes('no wifi') || lowerTitle.includes('offline')) return WifiOff;
    if (lowerTitle.includes('projector') || lowerTitle.includes('screen') || lowerTitle.includes('monitor')) return Monitor;
    if (lowerTitle.includes('tv') || lowerTitle.includes('television')) return Tv;
    if (lowerTitle.includes('microphone') || lowerTitle.includes('mic')) return Mic;
    if (lowerTitle.includes('speaker') || lowerTitle.includes('audio')) return Volume2;
    if (lowerTitle.includes('camera') || lowerTitle.includes('photo')) return Camera;
    
    // Food & Beverages
    if (lowerTitle.includes('coffee') || lowerTitle.includes('tea') || lowerTitle.includes('hot drink')) return Coffee;
    if (lowerTitle.includes('food') || lowerTitle.includes('meal') || lowerTitle.includes('dining')) return Utensils;
    if (lowerTitle.includes('restaurant') || lowerTitle.includes('cafe')) return ChefHat;
    if (lowerTitle.includes('bar') || lowerTitle.includes('alcohol') || lowerTitle.includes('drink')) return Coffee;
    
    // Comfort & Environment
    if (lowerTitle.includes('ac') || lowerTitle.includes('air conditioning') || lowerTitle.includes('cooling')) return Snowflake;
    if (lowerTitle.includes('heating') || lowerTitle.includes('warm')) return Sun;
    if (lowerTitle.includes('fan') || lowerTitle.includes('ventilation')) return Fan;
    
    // Facilities & Services
    if (lowerTitle.includes('bathroom') || lowerTitle.includes('toilet') || lowerTitle.includes('restroom')) return User;
    if (lowerTitle.includes('medical') || lowerTitle.includes('first aid') || lowerTitle.includes('health')) return Stethoscope;
    if (lowerTitle.includes('security') || lowerTitle.includes('safety')) return Shield;
    if (lowerTitle.includes('laundry') || lowerTitle.includes('washing')) return WashingMachine;
    
    // Entertainment & Activities
    if (lowerTitle.includes('music') || lowerTitle.includes('sound')) return Music;
    if (lowerTitle.includes('gaming') || lowerTitle.includes('game')) return Zap;
    if (lowerTitle.includes('sports') || lowerTitle.includes('fitness')) return Trophy;
    
    // Accessibility
    if (lowerTitle.includes('wheelchair') || lowerTitle.includes('accessible')) return User;
    if (lowerTitle.includes('baby') || lowerTitle.includes('child')) return Baby;
    if (lowerTitle.includes('pet') || lowerTitle.includes('dog') || lowerTitle.includes('animal')) return Dog;
    
    // Smoking
    if (lowerTitle.includes('smoking') || lowerTitle.includes('smoke')) return Flame;
    if (lowerTitle.includes('no smoking') || lowerTitle.includes('non-smoking')) return X;
    
    // Power & Energy
    if (lowerTitle.includes('power') || lowerTitle.includes('electricity') || lowerTitle.includes('outlet')) return Plug;
    if (lowerTitle.includes('battery') || lowerTitle.includes('charging')) return Battery;
    
    // Awards & Recognition
    if (lowerTitle.includes('award') || lowerTitle.includes('trophy') || lowerTitle.includes('prize')) return Trophy;
    if (lowerTitle.includes('medal') || lowerTitle.includes('achievement')) return Medal;
    if (lowerTitle.includes('crown') || lowerTitle.includes('royal')) return Crown;
    if (lowerTitle.includes('star') || lowerTitle.includes('rating')) return Star;
    if (lowerTitle.includes('gift') || lowerTitle.includes('present')) return Gift;
    
    // Default icon
    return Wifi;
  };

  // Function to get color scheme based on amenity title
  const getAmenityColors = (title: string) => {
    const lowerTitle = title.toLowerCase();
    
    // Technology & Internet - Light Blue
    if (lowerTitle.includes('wifi') || lowerTitle.includes('internet') || lowerTitle.includes('wireless') || 
        lowerTitle.includes('projector') || lowerTitle.includes('screen') || lowerTitle.includes('monitor') ||
        lowerTitle.includes('tv') || lowerTitle.includes('television') || lowerTitle.includes('camera')) {
      return {
        selected: 'bg-gradient-to-r from-blue-300 to-blue-400 text-blue-900',
        unselected: 'border-blue-100 bg-blue-25 text-blue-600 hover:border-blue-200 hover:bg-blue-50'
      };
    }
    
    // Food & Beverages - Light Orange
    if (lowerTitle.includes('coffee') || lowerTitle.includes('tea') || lowerTitle.includes('food') || 
        lowerTitle.includes('meal') || lowerTitle.includes('dining') || lowerTitle.includes('restaurant') ||
        lowerTitle.includes('cafe') || lowerTitle.includes('bar') || lowerTitle.includes('alcohol') ||
        lowerTitle.includes('drink') || lowerTitle.includes('hot drink')) {
      return {
        selected: 'bg-gradient-to-r from-orange-300 to-amber-400 text-orange-900',
        unselected: 'border-orange-100 bg-orange-25 text-orange-600 hover:border-orange-200 hover:bg-orange-50'
      };
    }
    
    // Transportation & Parking - Light Green
    if (lowerTitle.includes('parking') || lowerTitle.includes('car') || lowerTitle.includes('vehicle') ||
        lowerTitle.includes('shuttle') || lowerTitle.includes('transport')) {
      return {
        selected: 'bg-gradient-to-r from-green-300 to-emerald-400 text-green-900',
        unselected: 'border-green-100 bg-green-25 text-green-600 hover:border-green-200 hover:bg-green-50'
      };
    }
    
    // Comfort & Environment - Light Purple
    if (lowerTitle.includes('ac') || lowerTitle.includes('air conditioning') || lowerTitle.includes('cooling') ||
        lowerTitle.includes('heating') || lowerTitle.includes('warm') || lowerTitle.includes('fan') ||
        lowerTitle.includes('ventilation')) {
      return {
        selected: 'bg-gradient-to-r from-purple-300 to-indigo-400 text-purple-900',
        unselected: 'border-purple-100 bg-purple-25 text-purple-600 hover:border-purple-200 hover:bg-purple-50'
      };
    }
    
    // Facilities & Services - Light Teal
    if (lowerTitle.includes('bathroom') || lowerTitle.includes('toilet') || lowerTitle.includes('restroom') ||
        lowerTitle.includes('medical') || lowerTitle.includes('first aid') || lowerTitle.includes('health') ||
        lowerTitle.includes('security') || lowerTitle.includes('safety') || lowerTitle.includes('laundry') ||
        lowerTitle.includes('washing')) {
      return {
        selected: 'bg-gradient-to-r from-teal-300 to-cyan-400 text-teal-900',
        unselected: 'border-teal-100 bg-teal-25 text-teal-600 hover:border-teal-200 hover:bg-teal-50'
      };
    }
    
    // Entertainment & Activities - Light Pink
    if (lowerTitle.includes('music') || lowerTitle.includes('sound') || lowerTitle.includes('gaming') ||
        lowerTitle.includes('game') || lowerTitle.includes('sports') || lowerTitle.includes('fitness')) {
      return {
        selected: 'bg-gradient-to-r from-pink-300 to-rose-400 text-pink-900',
        unselected: 'border-pink-100 bg-pink-25 text-pink-600 hover:border-pink-200 hover:bg-pink-50'
      };
    }
    
    // Accessibility - Light Yellow
    if (lowerTitle.includes('wheelchair') || lowerTitle.includes('accessible') || lowerTitle.includes('baby') ||
        lowerTitle.includes('child') || lowerTitle.includes('pet') || lowerTitle.includes('dog') ||
        lowerTitle.includes('animal')) {
      return {
        selected: 'bg-gradient-to-r from-yellow-300 to-amber-400 text-yellow-900',
        unselected: 'border-yellow-100 bg-yellow-25 text-yellow-600 hover:border-yellow-200 hover:bg-yellow-50'
      };
    }
    
    // Power & Energy - Light Red
    if (lowerTitle.includes('power') || lowerTitle.includes('electricity') || lowerTitle.includes('outlet') ||
        lowerTitle.includes('battery') || lowerTitle.includes('charging')) {
      return {
        selected: 'bg-gradient-to-r from-red-300 to-pink-400 text-red-900',
        unselected: 'border-red-100 bg-red-25 text-red-600 hover:border-red-200 hover:bg-red-50'
      };
    }
    
    // Awards & Recognition - Light Gold
    if (lowerTitle.includes('award') || lowerTitle.includes('trophy') || lowerTitle.includes('prize') ||
        lowerTitle.includes('medal') || lowerTitle.includes('achievement') || lowerTitle.includes('crown') ||
        lowerTitle.includes('royal') || lowerTitle.includes('star') || lowerTitle.includes('rating') ||
        lowerTitle.includes('gift') || lowerTitle.includes('present')) {
      return {
        selected: 'bg-gradient-to-r from-amber-300 to-yellow-400 text-amber-900',
        unselected: 'border-amber-100 bg-amber-25 text-amber-600 hover:border-amber-200 hover:bg-amber-50'
      };
    }
    
    // Default - Light Gray
    return {
      selected: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900',
      unselected: 'border-gray-100 bg-gray-25 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
    };
  };

  // Function to handle adding new amenity
  const handleAddAmenity = async () => {
    if (!newAmenityTitle.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an amenity title.',
      });
      return;
    }

    try {
      const newAmenity = await createAmenity({ title: newAmenityTitle.trim() });
      setAmenities(prev => [...prev, newAmenity]);
      setNewAmenityTitle('');
      setShowAddAmenity(false);
      
      toast({
        title: 'Amenity Added',
        description: `"${newAmenityTitle.trim()}" has been added successfully.`,
      });
    } catch (error) {
      console.error('Failed to add amenity:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add amenity. Please try again.',
      });
    }
  };

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      end_date: new Date(),
      start_time: '',
      end_time: '',
      location: '',
      status: 'Draft',
      tags: '',
      amenities: [],
      packages: [],
      additionalMembersConfig: { mode: 'none' },
      foodPreferenceConfig: { enabled: false, options: '' },
      faq: [],
      termsAndConditions: '',
      type: '',
      category: '',
      assignedHostId: '',
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: 'faq',
  });

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control: form.control,
    name: 'packages',
  });

  // Watch time fields for real-time validation
  const startTime = form.watch('start_time');
  const endTime = form.watch('end_time');

  // Real-time time validation
  useEffect(() => {
    if (startTime && endTime) {
      const startTimeObj = new Date(`2000-01-01T${startTime}`);
      const endTimeObj = new Date(`2000-01-01T${endTime}`);
      
      if (endTimeObj <= startTimeObj) {
        form.setError('end_time', {
          type: 'manual',
          message: 'End time must be after start time'
        });
      } else {
        form.clearErrors('end_time');
      }
    }
  }, [startTime, endTime, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      console.log('🔍 Event Form - Starting submission with values:', values);
      console.log('🔍 Event Form - Available hosts:', hosts);
      
      const preparedData = {
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(t => t),
        amenities: values.amenities || [],
        packages: values.packages?.map(p => ({...p, id: Math.random().toString() })) || [],
        faq: values.faq?.map(f => ({...f, id: Math.random().toString() })) || [],
        assigned_host: values.assignedHostId,
        food_preference_config: {
            ...values.foodPreferenceConfig,
            options: values.foodPreferenceConfig.options?.split(',').map(o => o.trim()).filter(o => o) || []
        },
        additional_members_config: values.additionalMembersConfig,
        termsAndConditions: values.termsAndConditions,
      } as any;
      
      console.log('🔍 Event Form - Prepared data:', preparedData);
      
      // Remove fields that need to be transformed
      delete preparedData.assignedHostId;
      delete preparedData.foodPreferenceConfig;
      delete preparedData.additionalMembersConfig;
      // Remove images from preparedData, will be sent as files
      delete preparedData.images;

      console.log('🔍 Event Form - Final data to send:', preparedData);
      console.log('🔍 Event Form - Image files:', imageFiles);

      const result = await addEventWithImages(preparedData as any, imageFiles);
      console.log('🔍 Event Form - API response:', result);

      toast({
        title: 'Event Created',
        description: `Event "${values.title}" has been created successfully.`,
      });
      
      // Clean up image previews and files
      Object.values(imagePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      setImageFiles({});
      setImagePreviews({});
      
      setOpen(false);
    } catch (error) {
        console.error("❌ Event Form - Failed to create event:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not create event. Please try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Event Tite</FormLabel>
                <FormControl><Input placeholder="e.g., Annual Tech Conference" {...field} className="w-full" autoComplete="off" /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Describe the event..." {...field} className="w-full" autoComplete="off" /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field, fieldState }) => (
                <FormItem className="flex flex-col mb-2">
                  <FormLabel className="flex items-center gap-1">
                    Event Start Date
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button 
                          variant={'outline'} 
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                            fieldState.error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a start date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs text-gray-500">
                    Select the event start date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="end_date" render={({ field, fieldState }) => (
                <FormItem className="flex flex-col mb-2">
                  <FormLabel className="flex items-center gap-1">
                    Event End Date
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal', 
                            !field.value && 'text-muted-foreground',
                            fieldState.error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick an end date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={date => {
                          const startDate = form.getValues('date');
                          return startDate && date < startDate;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-xs text-gray-500">
                    Select the event end date (can be same as start date)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="start_time" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input 
                      type="time" 
                      placeholder="09:00" 
                      {...field} 
                      className="w-full" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Event start time (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="end_time" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="time" 
                        placeholder="17:00" 
                        {...field} 
                        className={`w-full ${startTime && endTime && new Date(`2000-01-01T${endTime}`) > new Date(`2000-01-01T${startTime}`) ? 'border-green-500 focus:border-green-500' : ''}`}
                      />
                      {startTime && endTime && new Date(`2000-01-01T${endTime}`) > new Date(`2000-01-01T${startTime}`) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Event end time (must be after start time)
                    {startTime && endTime && new Date(`2000-01-01T${endTime}`) > new Date(`2000-01-01T${startTime}`) && (
                      <span className="block mt-1 text-green-600 font-medium">
                        Duration: {Math.floor((new Date(`2000-01-01T${endTime}`).getTime() - new Date(`2000-01-01T${startTime}`).getTime()) / (1000 * 60 * 60))} hours
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="location" render={({ field }) => {
                const [isCustomLocation, setIsCustomLocation] = useState(false);
                const [showSuggestions, setShowSuggestions] = useState(false);
                const [searchTerm, setSearchTerm] = useState(field.value || '');
                
                // Sync searchTerm with field value when field value changes
                useEffect(() => {
                  setSearchTerm(field.value || '');
                }, [field.value]);
                
                // Static Singapore-based locations
                const staticLocations = [
                  'Marina Bay Sands, Singapore',
                  'Singapore Expo, Singapore',
                  'Suntec Singapore Convention & Exhibition Centre',
                  'Raffles City Convention Centre, Singapore',
                  'Orchard Hotel, Singapore',
                  'Grand Hyatt Singapore',
                  'Shangri-La Hotel Singapore',
                  'Resorts World Sentosa, Singapore',
                  'Gardens by the Bay, Singapore',
                  'Singapore Flyer, Singapore',
                  'ArtScience Museum, Singapore',
                  'National Gallery Singapore',
                  'Esplanade - Theatres on the Bay, Singapore',
                  'Singapore Botanic Gardens',
                  'Sentosa Island, Singapore',
                  'Clarke Quay, Singapore',
                  'Boat Quay, Singapore',
                  'Chinatown, Singapore',
                  'Little India, Singapore',
                  'Kampong Glam, Singapore'
                ];

                const filteredLocations = staticLocations.filter(location =>
                  location.toLowerCase().includes(searchTerm.toLowerCase())
                );

                const handleLocationSelect = (selectedLocation: string, event?: React.MouseEvent) => {
                  console.log('Location selected:', selectedLocation);
                  
                  // Prevent any default behavior
                  if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                  
                  field.onChange(selectedLocation);
                  setSearchTerm(selectedLocation);
                  setShowSuggestions(false);
                  setIsCustomLocation(false);
                  
                  console.log('Field value after selection:', field.value);
                };

                const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  field.onChange(value);
                  
                  // Show suggestions when typing to allow selection from filtered results
                  if (value.length > 0) {
                    setShowSuggestions(true);
                    setIsCustomLocation(true);
                  } else {
                    // If input is empty, show all static locations
                    setShowSuggestions(true);
                    setIsCustomLocation(false);
                  }
                };

                const handleInputFocus = () => {
                  // Always show static locations when input is focused
                  setShowSuggestions(true);
                };

                const handleInputBlur = () => {
                  // Delay hiding suggestions to allow for clicks
                  setTimeout(() => {
                    // Only hide if no element in the suggestions dropdown has focus
                    const activeElement = document.activeElement;
                    const suggestionsContainer = document.querySelector('.location-suggestions');
                    if (!suggestionsContainer?.contains(activeElement)) {
                      setShowSuggestions(false);
                    }
                  }, 300);
                };

                return (
                  <FormItem className="mb-2">
                    <FormLabel>Location</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="Search Singapore locations or enter custom location..."
                          value={searchTerm}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                          className="w-full pr-10"
                          autoComplete="off"
                        />
                      </FormControl>
                      
                      {/* Clear button */}
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            field.onChange('');
                            setShowSuggestions(false);
                            setIsCustomLocation(false);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {/* Location suggestions dropdown */}
                      {showSuggestions && (
                        <div className="location-suggestions absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-600 font-medium">
                              {searchTerm.length > 0 ? 'Filtered Singapore Locations' : 'Popular Singapore Locations'}
                            </p>
                          </div>
                          {filteredLocations.length > 0 ? (
                            filteredLocations.map((location, index) => (
                              <button
                                key={location}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => handleLocationSelect(location, e)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>{location}</span>
                                </div>
                              </button>
                            ))
                          ) : searchTerm.length > 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No matching Singapore locations found. You can enter a custom location.
                            </div>
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              Start typing to filter locations or enter a custom location.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Custom location indicator */}
                      {isCustomLocation && searchTerm && !staticLocations.some(loc => loc.toLowerCase() === searchTerm.toLowerCase()) && (
                        <div className="mt-1 text-xs text-blue-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Custom location
                        </div>
                      )}
                    </div>
                    {/* <FormDescription>
                      Select from popular Singapore locations or enter a custom location (e.g., "Mumbai, India").
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                );
              }}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>{eventTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>{eventStatuses.map(status => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField
              control={form.control}
              name="assignedHostId"
              render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Host</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a host" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hosts.map((host) => (
                        <SelectItem key={host.id} value={host.id}>
                          {host.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.title}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="tags" render={({ field }) => {
              const commonTags = [
                'Technology', 'Business', 'Networking', 'Education', 'Entertainment',
                'Health', 'Sports', 'Food', 'Music', 'Art'
              ];
              
              const selectedTags = field.value ? field.value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
              
              const handleTagToggle = (tag: string) => {
                const isSelected = selectedTags.includes(tag);
                let newTags: string[];
                
                if (isSelected) {
                  newTags = selectedTags.filter(t => t !== tag);
                } else {
                  newTags = [...selectedTags, tag];
                }
                
                field.onChange(newTags.join(', '));
              };
              
              return (
                <FormItem className="mb-2">
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {commonTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-200",
                            isSelected
                              ? "bg-gradient-to-r from-indigo-300 to-purple-400 text-indigo-900 border-transparent shadow-sm"
                              : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  {/* <FormDescription>Select relevant tags for your event (max 5 recommended).</FormDescription> */}
                  <FormMessage />
                </FormItem>
              );
            }}/>
            <FormField control={form.control} name="amenities" render={({ field }) => (
              <FormItem className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Amenities</FormLabel>
                  <button
                    type="button"
                    onClick={() => setShowAddAmenity(true)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add New
                  </button>
                </div>
                
                {/* Selected Amenities Display - Compact */}
                {field.value && field.value.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Selected Amenities:</div>
                    <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                                            {field.value.map((amenityTitle, index) => {
                        const amenity = amenities.find(a => a.title === amenityTitle);
                        const IconComponent = amenity ? getAmenityIcon(amenity.title) : Wifi;
                        const colors = amenity ? getAmenityColors(amenity.title) : getAmenityColors('default');
                        return (
                          <div
                            key={amenityTitle}
                            className={`flex items-center justify-between ${colors.selected} border border-transparent rounded-full px-3 py-1.5 text-xs shadow-sm`}
                          >
                            <div className="flex items-center gap-1">
                              <IconComponent className="h-3 w-3 text-current" />
                              <span className="text-current font-medium truncate">{amenityTitle}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(field.value?.filter((value) => value !== amenityTitle));
                              }}
                              className="text-current/70 hover:text-current transition-colors ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Amenities Grid - Label Style */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {amenities.map((amenity) => {
                    const IconComponent = getAmenityIcon(amenity.title);
                    const colors = getAmenityColors(amenity.title);
                    const isSelected = field.value?.includes(amenity.title);
                    
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            field.onChange(field.value?.filter((value) => value !== amenity.title));
                          } else {
                            field.onChange([...(field.value || []), amenity.title]);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-center px-3 py-1.5 rounded-full border transition-all duration-200 hover:shadow-sm",
                          isSelected
                            ? `border-transparent ${colors.selected} shadow-sm`
                            : `bg-white ${colors.unselected}`
                        )}
                      >
                        <IconComponent className={cn(
                          "h-3 w-3 mr-1.5",
                          isSelected ? "text-current" : "text-current"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-current" : "text-current"
                        )}>
                          {amenity.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                {/* <FormDescription className="mt-2 text-center">
                  Click labels to select amenities
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}/>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="images.cover" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Cover Image</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    handleImageChange('cover', file);
                  }} />
                </FormControl>
                <FormDescription>Recommended dimensions: 1200x400px.</FormDescription>
                {imagePreviews.cover && (
                  <div className="mt-2">
                    <img 
                      src={imagePreviews.cover} 
                      alt="Cover preview" 
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="images.thumbnail" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Thumbnail Image</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    handleImageChange('thumbnail', file);
                  }} />
                </FormControl>
                <FormDescription>Recommended dimensions: 400x300px.</FormDescription>
                {imagePreviews.thumbnail && (
                  <div className="mt-2">
                    <img 
                      src={imagePreviews.thumbnail} 
                      alt="Thumbnail preview" 
                      className="w-32 h-24 object-cover rounded-md border"
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="images.square" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Square Image</FormLabel>
                <FormControl>
                  <Input type="file" accept="image/*" onChange={e => {
                    const file = e.target.files?.[0];
                    handleImageChange('square', file);
                  }} />
                </FormControl>
                <FormDescription>Recommended dimensions: 400x400px.</FormDescription>
                {imagePreviews.square && (
                  <div className="mt-2">
                    <img 
                      src={imagePreviews.square} 
                      alt="Square preview" 
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}/>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-4">
              {packageFields.map((field, index) => (
                <Card key={field.id} className="border-2 border-gray-100 hover:border-gray-200 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <CardTitle className="text-lg">Package {index + 1}</CardTitle>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removePackage(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name={`packages.${index}.title`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Package Title</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="e.g. Early Bird, VIP, Standard" 
                              className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name={`packages.${index}.price`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Price (SGD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                              <Input 
                                type="number" 
                                {...field} 
                                placeholder="99.00" 
                                className="w-full pl-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                autoComplete="off"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                    
                    <FormField control={form.control} name={`packages.${index}.description`} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe what's included in this package..." 
                            className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name={`packages.${index}.limit`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Ticket Limit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              value={field.value ?? ''} 
                              placeholder="Unlimited" 
                              className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-gray-500">Leave empty for unlimited tickets</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name={`packages.${index}.endDate`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700">Sale End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button 
                                  variant="outline" 
                                  className={cn(
                                    'w-full pl-3 text-left font-normal border-gray-200 hover:border-blue-500',
                                    !field.value && 'text-gray-500'
                                  )}
                                >
                                  {field.value ? format(field.value, 'PPP') : <span>No end date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormDescription className="text-xs text-gray-500">Optional - when ticket sales end</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                <CardContent className="p-6">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => appendPackage({ title: '', description: '', price: 0, limit: undefined, endDate: undefined })}
                    className="w-full h-16 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                      <PlusCircle className="h-5 w-5" />
                      <span className="font-medium">Add New Package</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="additionalMembersConfig.mode" render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Additional Members</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a mode" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">Disabled</SelectItem>
                    <SelectItem value="pax">Pax Count</SelectItem>
                    <SelectItem value="type">Structured Input (Not implemented)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Configure how attendees can add guests.</FormDescription>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="foodPreferenceConfig.enabled" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mb-2">
                <div className="space-y-0.5">
                  <FormLabel>Enable Food Preferences</FormLabel>
                  <FormDescription>Ask attendees for their food preference.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )}/>
            {form.watch('foodPreferenceConfig.enabled') && (
              <FormField control={form.control} name="foodPreferenceConfig.options" render={({ field }) => (
                <FormItem className="mb-2">
                  <FormLabel>Food Options</FormLabel>
                  <FormControl><Input placeholder="e.g. Veg, Non-Veg, Vegan" {...field} className="w-full" autoComplete="off" /></FormControl>
                  <FormDescription>Comma-separated list of options.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {faqFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 border p-3 rounded-md">
                    <div className="flex-1 space-y-2">
                      <FormField control={form.control} name={`faq.${index}.question`} render={({ field }) => (
                        <FormItem className="mb-2"><FormLabel>Question</FormLabel><FormControl><Input {...field} className="w-full" autoComplete="off" /></FormControl><FormMessage/></FormItem>
                      )}/>
                                              <FormField control={form.control} name={`faq.${index}.answer`} render={({ field }) => (
                          <FormItem className="mb-2"><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} className="w-full" autoComplete="off" /></FormControl><FormMessage/></FormItem>
                        )}/>
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removeFaq(index)}><Trash2 /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendFaq({ question: '', answer: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4"/> Add FAQ
                </Button>
              </CardContent>
            </Card>
            <FormField control={form.control} name="termsAndConditions" render={({ field, fieldState }) => (
              <FormItem className="mb-2">
                <RichTextField
                  value={field.value || ''}
                  onChange={field.onChange}
                  label="Terms & Conditions"
                  placeholder="Enter event terms and conditions..."
                  error={fieldState.error?.message}
                />
              </FormItem>
            )}/>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </form>

      {/* Add Amenity Modal */}
      <Dialog open={showAddAmenity} onOpenChange={setShowAddAmenity}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Amenity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="amenity-title" className="block text-sm font-medium text-gray-700 mb-2">
                Amenity Title
              </label>
              <Input
                id="amenity-title"
                type="text"
                placeholder="e.g., Free WiFi, Parking, Coffee"
                value={newAmenityTitle}
                onChange={(e) => setNewAmenityTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddAmenity(false);
                  setNewAmenityTitle('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddAmenity}
                disabled={!newAmenityTitle.trim()}
              >
                Add Amenity
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}