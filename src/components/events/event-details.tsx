'use client';

import type { Event } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CalendarDays, MapPin, ParkingSquare, Utensils, Wifi, Wind, Clock, Users, Tag, Star, Heart, Share2, Eye, HelpCircle,
  Coffee, Car, Music, Camera, Baby, Dog, CheckCircle2, Tv, Monitor, Fan, Snowflake, Sun, Moon,
  Phone, Mail, Globe, Lock, Unlock, Zap, Battery, Plug, Lightbulb, Home, Building, Store, ChefHat, Hotel, School,
  Banknote, Mailbox, Library, Theater, Mountain, Trees, Flower, Leaf, Cloud, CloudRain, Droplets
} from 'lucide-react';
import { RegistrationButton } from './registration-button';
import { format, differenceInDays, formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { useState, useEffect } from 'react';
import { getBookingsByPackage } from '@/services/bookingService';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MDEditor from '@uiw/react-md-editor';
import { motion } from 'framer-motion';

// Function to get amenity icon and colors
const getAmenityIcon = (title: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'Wi-Fi': <Wifi className="h-4 w-4" />,
    'Free WiFi': <Wifi className="h-4 w-4" />,
    'Parking': <ParkingSquare className="h-4 w-4" />,
    'Free Parking': <ParkingSquare className="h-4 w-4" />,
    'Food': <Utensils className="h-4 w-4" />,
    'Drinks': <Coffee className="h-4 w-4" />,
    'Coffee': <Coffee className="h-4 w-4" />,
    'AC': <Wind className="h-4 w-4" />,
    'Air Conditioning': <Wind className="h-4 w-4" />,
    'Music': <Music className="h-4 w-4" />,
    'Camera': <Camera className="h-4 w-4" />,
    'TV': <Tv className="h-4 w-4" />,
    'Monitor': <Monitor className="h-4 w-4" />,
    'Fan': <Fan className="h-4 w-4" />,
    'Phone': <Phone className="h-4 w-4" />,
    'Mail': <Mail className="h-4 w-4" />,
    'Globe': <Globe className="h-4 w-4" />,
    'Lock': <Lock className="h-4 w-4" />,
    'Unlock': <Unlock className="h-4 w-4" />,
    'Zap': <Zap className="h-4 w-4" />,
    'Battery': <Battery className="h-4 w-4" />,
    'Plug': <Plug className="h-4 w-4" />,
    'Lightbulb': <Lightbulb className="h-4 w-4" />,
    'Home': <Home className="h-4 w-4" />,
    'Building': <Building className="h-4 w-4" />,
    'Store': <Store className="h-4 w-4" />,
    'Chef Hat': <ChefHat className="h-4 w-4" />,
    'Hotel': <Hotel className="h-4 w-4" />,
    'School': <School className="h-4 w-4" />,
    'Banknote': <Banknote className="h-4 w-4" />,
    'Mailbox': <Mailbox className="h-4 w-4" />,
    'Library': <Library className="h-4 w-4" />,
    'Theater': <Theater className="h-4 w-4" />,
    'Mountain': <Mountain className="h-4 w-4" />,
    'Trees': <Trees className="h-4 w-4" />,
    'Flower': <Flower className="h-4 w-4" />,
    'Leaf': <Leaf className="h-4 w-4" />,
    'Cloud': <Cloud className="h-4 w-4" />,
    'Cloud Rain': <CloudRain className="h-4 w-4" />,
    'Droplets': <Droplets className="h-4 w-4" />,
    'Baby': <Baby className="h-4 w-4" />,
    'Dog': <Dog className="h-4 w-4" />,
    'Car': <Car className="h-4 w-4" />,
    'Sun': <Sun className="h-4 w-4" />,
    'Moon': <Moon className="h-4 w-4" />,
    'Snowflake': <Snowflake className="h-4 w-4" />,
  };
  
  return iconMap[title] || <CheckCircle2 className="h-4 w-4" />;
};

const getAmenityColors = (title: string) => {
  const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
    // Technology
    'Wi-Fi': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Free WiFi': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'TV': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    'Monitor': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    'Phone': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    'Globe': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    'Zap': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    'Battery': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    'Plug': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    'Lightbulb': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    
    // Food & Drinks
    'Food': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    'Drinks': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    'Coffee': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    'Utensils': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    'Chef Hat': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    
    // Transport
    'Parking': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    'Free Parking': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    'Car': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    
    // Environment
    'AC': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    'Air Conditioning': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    'Fan': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    'Sun': { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
    'Moon': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    'Snowflake': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Cloud': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
    'Cloud Rain': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Droplets': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    
    // Entertainment
    'Music': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    'Camera': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    'Theater': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    
    // Nature
    'Mountain': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    'Trees': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    'Flower': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    'Leaf': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    
    // Family & Pets
    'Baby': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    'Dog': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    
    // Buildings
    'Home': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
    'Building': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
    'Store': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Hotel': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    'School': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Library': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    'Mailbox': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    
    // Security & Access
    'Lock': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    'Unlock': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    'Mail': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Banknote': { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  };
  
  return colorMap[title] || { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
};

// Image validation helper
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  if (url.startsWith('data:')) return true;
  if (url.startsWith('blob:')) return true;
  if (url.startsWith('http://') || url.startsWith('https://')) return true;
  return false;
};

// Image component with error handling
const SafeImage = ({ 
  src, 
  alt, 
  fallback, 
  className, 
  fill = false, 
  width, 
  height, 
  sizes,
  priority = false 
}: {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) => {
  const [imgSrc, setImgSrc] = useState(isValidImageUrl(src) ? src : fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    onError: handleError,
    priority,
    sizes,
    ...(fill ? { fill } : { width, height })
  };

  return <Image {...imageProps} />;
};

export function EventDetails({ event }: { event: Event }) {
  const [isLiked, setIsLiked] = useState(false);
  const [packageBookingCounts, setPackageBookingCounts] = useState<{ [packageId: string]: number }>({});
  const [loadingCounts, setLoadingCounts] = useState(false);
  const { toast } = useToast();
  const [shareDisabled, setShareDisabled] = useState(false);
  const [liveCountdown, setLiveCountdown] = useState(event.date ? formatDistanceToNow(new Date(event.date), { addSuffix: true }) : null);
  const [countdownHMS, setCountdownHMS] = useState('');

  const now = new Date();
  const eventEndDate = event.end_date ? new Date(event.end_date) : null;
  const isEventOver = eventEndDate ? now > eventEndDate : false;
  const isFuture = event.date && new Date(event.date) > now;
  const daysToEvent = event.date ? differenceInDays(new Date(event.date), now) : null;

  useEffect(() => {
    async function fetchCounts() {
      setLoadingCounts(true);
      const counts: { [packageId: string]: number } = {};
      await Promise.all(
        event.packages.map(async (pkg) => {
          const bookings = await getBookingsByPackage(event.id, pkg.id);
          counts[pkg.id] = bookings.length;
        })
      );
      setPackageBookingCounts(counts);
      setLoadingCounts(false);
    }
    if (event.packages?.length) {
      fetchCounts();
    }
  }, [event.id, event.packages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('ticketSuccess')) {
      toast({
        title: 'Ticket Registered!',
        description: 'Your ticket has been successfully registered!'
      });
      localStorage.removeItem('ticketSuccess');
    }
  }, [toast]);

  useEffect(() => {
    if (!event.date) return;
    const updateCountdown = () => {
      const now = new Date();
      const eventDate = new Date(event.date);
      const diffSec = Math.max(0, differenceInSeconds(eventDate, now));
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      setLiveCountdown(formatDistanceToNow(eventDate, { addSuffix: true }));
      setCountdownHMS(
        `${hours.toString().padStart(2, '0')}:` +
        `${minutes.toString().padStart(2, '0')}:` +
        `${seconds.toString().padStart(2, '0')}`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [event.date]);

  // Add registered count to each package (limit feature disabled)
  // const eventWithRegistered = {
  //   ...event,
  //   packages: event.packages?.map(pkg => ({
  //     ...pkg,
  //     registered: packageBookingCounts[pkg.id] || 0,
  //   })) || [],
  // };

  const handleShare = async () => {
    if (shareDisabled) return;
    setShareDisabled(true);
    setTimeout(() => setShareDisabled(false), 1000);
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: event.title.toUpperCase(),
      text: `Check out this event: ${event.title.toUpperCase()}`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not available');
      }
    } catch (err) {
      // Fallback: copy to clipboard
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const input = document.createElement('input');
          input.value = shareUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        }
        toast({ title: 'Link Copied!', description: 'Event link copied to clipboard.' });
      } catch (copyErr) {
        toast({ variant: 'destructive', title: 'Share Failed', description: 'Could not share or copy the event link.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pt-0 mt-0 relative">
      {isEventOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-4">This event is over</h2>
            <p className="text-lg text-gray-700">The event has ended. Please check our other events!</p>
          </div>
        </div>
      )}
      <div className={isEventOver ? 'pointer-events-none filter blur-sm select-none' : ''}>
        {/* Main Content Container */}
        <div className="max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          {/* Hero Section with Enhanced Banner */}
          <div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 h-[180px] sm:h-[200px] md:h-[220px] lg:h-[250px] overflow-hidden rounded-b-xl sm:rounded-b-2xl md:rounded-b-3xl shadow-xl sm:shadow-2xl mb-3 sm:mb-4 group">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 z-5"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-xl"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-purple-300 rounded-full blur-lg"></div>
              <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300 rounded-full blur-xl"></div>
            </div>
            
            <SafeImage
              src={event.images.cover || 'https://placehold.co/1200x400.png'}
              alt={`Cover image for ${event.title.toUpperCase()}`}
              fallback="https://placehold.co/1200x400.png"
              fill
              priority
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 1200px"
              data-ai-hint="event cover photo"
            />
            
            {/* Event name overlay on hover for cover image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30 pointer-events-none">
              <span className="text-2xl md:text-4xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400 bg-clip-text text-transparent px-8 py-4 rounded-2xl shadow-2xl group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent">
                {event.title.toUpperCase()}
              </span>
            </div>
            
            {/* Floating Action Buttons */}
            <div className="absolute top-2 right-2 sm:top-3 md:top-6 sm:right-3 md:right-6 z-20 flex gap-1.5 sm:gap-2 md:gap-3">
              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={`p-1.5 sm:p-2 md:p-3 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                  isLiked 
                    ? 'bg-red-500/90 text-white shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={shareDisabled}
                className="p-1.5 sm:p-2 md:p-3 rounded-full backdrop-blur-md bg-white/20 text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 disabled:opacity-60 disabled:pointer-events-none"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </div>

          {/* Event Info Section - Enhanced Design */}
          <div className="relative pb-4 sm:pb-6 -mt-3 sm:-mt-4">
            {/* Floating Info Card */}
            <div className="bg-white/95 backdrop-blur-md rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg sm:shadow-xl border border-white/20 p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8 mt-4 sm:mt-6 md:mt-8">
              {/* Event Title and Category */}
              <div className="mb-3 sm:mb-4 md:mb-6">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-3 md:mb-4">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-2 py-0.5 sm:px-3 sm:py-1 md:px-4 md:py-2 text-xs sm:text-sm font-semibold">
                    {event.category}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1 text-xs sm:text-sm">
                    {event.status}
                  </Badge>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2 sm:mb-3 leading-tight">
                  {event.title.toUpperCase()}
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl">
                  {event.description}
                </p>
              </div>

              {/* Enhanced Quick Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
                {/* Date & Time Card */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600 mb-1.5 sm:mb-2 md:mb-3" />
                  <div className="font-semibold text-xs sm:text-sm md:text-lg text-gray-900 mb-1 text-center">{format(event.date, 'PPPP')}</div>
                  <div className="text-red-500 text-xs sm:text-sm md:text-base mb-1 font-semibold text-center">
                    {event.start_time && event.end_time ? (
                      <span>
                        {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        })} - {new Date(`2000-01-01T${event.end_time}`).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: true 
                        })}
                      </span>
                    ) : (
                      format(event.date, 'p')
                    )}
                  </div>
                  {isFuture && (
                    <div className="text-xs text-blue-700 bg-blue-100 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 mt-1 flex flex-col items-center">
                      <span>Starts {liveCountdown}</span>
                      {daysToEvent !== null && daysToEvent < 1 && (
                        <span className="flex items-center gap-1 sm:gap-2 mt-1.5 sm:mt-2">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-500" />
                          <span className="font-mono text-xs sm:text-sm md:text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 text-white px-1.5 sm:px-2 md:px-4 py-0.5 sm:py-1 rounded-full shadow-lg tracking-widest">
                            {countdownHMS}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* Location Card (with map, already enhanced) */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-green-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-200 rounded-full -translate-y-6 sm:-translate-y-8 md:-translate-y-10 translate-x-6 sm:translate-x-8 md:translate-x-10 opacity-20"></div>
                  <div className="relative z-10">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 shadow-lg">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Location</p>
                    <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-lg">{event.location}</p>
                    {event.location && (
                      <div className="mt-1.5 sm:mt-2 md:mt-3 rounded-lg overflow-hidden border border-green-200 shadow-sm">
                        <iframe
                          title="Event Location Map"
                          width="100%"
                          height="100"
                          className="sm:h-[140px] md:h-[180px]"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* Event Type Card */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-purple-200 shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Tag className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-purple-600 mb-1.5 sm:mb-2 md:mb-3" />
                  <span className="font-semibold text-xs sm:text-sm md:text-lg capitalize text-gray-900 mb-1 text-center">{event.type}</span>
                  <span className="text-xs text-purple-700 bg-purple-100 rounded px-1.5 py-0.5 sm:px-2 sm:py-1 mt-1">{event.category}</span>
                </div>
              </div>

              {/* Tags Section */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-xs sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="pb-6 sm:pb-8 md:pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-start">
              {/* Left Column: All main sections stacked as before */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
                {/* About Section - Enhanced */}
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true, amount: 0.2 }}>
                  <div className="relative">
                    {/* Vertical accent bar */}
                    <div className="absolute left-0 top-6 bottom-6 w-2 bg-gradient-to-b from-blue-500 via-purple-500 to-blue-400 rounded-full shadow-lg z-10"></div>
                    {/* Card with layered background */}
                    <Card className="relative pl-6 sm:pl-8 border-0 shadow-2xl bg-white/95 rounded-xl sm:rounded-2xl overflow-visible">
                      {/* Floating icon */}
                      <div className="absolute -top-4 sm:-top-6 left-4 sm:left-6 z-20">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                          <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      {/* Pattern/gradient background */}
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-white opacity-80 pointer-events-none z-0"></div>
                      <CardHeader className="pt-6 sm:pt-8 pb-2 pl-16 sm:pl-20 pr-4 sm:pr-8 z-10 relative">
                        <CardTitle className="text-lg sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider uppercase drop-shadow-lg">
                          ABOUT THIS EVENT
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pl-16 sm:pl-24 pr-4 sm:pr-8 pb-6 sm:pb-8 pt-2 z-10 relative">
                        <p className="text-gray-800 leading-relaxed text-sm sm:text-lg md:text-xl font-medium tracking-wide mb-2" style={{ letterSpacing: '0.01em' }}>
                          {event.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
                {/* Packages Section - Enhanced */}
                {event.packages?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true, amount: 0.2 }}>
                    <div className="relative">
                      {/* Vertical accent bar */}
                      <div className="absolute left-0 top-3 sm:top-6 bottom-3 sm:bottom-6 w-1 sm:w-2 bg-gradient-to-b from-green-500 via-emerald-500 to-green-400 rounded-full shadow-lg z-10"></div>
                      {/* Card with layered background */}
                      <Card className="relative pl-4 sm:pl-6 md:pl-8 border-0 shadow-lg sm:shadow-2xl bg-white/95 rounded-lg sm:rounded-xl md:rounded-2xl overflow-visible">
                        {/* Floating icon */}
                        <div className="absolute -top-2 sm:-top-4 md:-top-6 left-2 sm:left-4 md:left-6 z-20">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl border-2 sm:border-4 border-white">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                          </div>
                        </div>
                        {/* Pattern/gradient background */}
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-white opacity-80 pointer-events-none z-0"></div>
                        <CardHeader className="pt-4 sm:pt-6 md:pt-8 pb-2 pl-12 sm:pl-16 md:pl-20 pr-3 sm:pr-4 md:pr-8 z-10 relative">
                          <CardTitle className="text-base sm:text-lg md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-green-700 via-emerald-700 to-green-400 bg-clip-text text-transparent tracking-wider uppercase drop-shadow-lg">
                            TICKETS & PACKAGES
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-12 sm:pl-16 md:pl-24 pr-3 sm:pr-4 md:pr-8 pb-4 sm:pb-6 md:pb-8 pt-2 z-10 relative space-y-3 sm:space-y-4">
                          {event.packages.map((pkg, index) => (
                            <div key={pkg.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-lg sm:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2">
                              <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-6 sm:-translate-y-8 translate-x-6 sm:translate-x-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                              <div className="relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex-1 mb-2 sm:mb-3 md:mb-0">
                                    <h3 className="text-sm sm:text-base md:text-xl font-bold text-gray-900 mb-1">{pkg.title}</h3>
                                    <p className="text-gray-600 mb-1 md:mb-2 text-xs sm:text-sm md:text-base">{pkg.description}</p>
                                  </div>
                                  <div className="text-center sm:text-right flex flex-col items-end gap-1 sm:gap-2">
                                    <div className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 md:mb-2">
                                      ${pkg.price.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
                {/* FAQ Section - Enhanced */}
                {event.faq?.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true, amount: 0.2 }}>
                    <div className="relative">
                      {/* Vertical accent bar */}
                      <div className="absolute left-0 top-3 sm:top-6 bottom-3 sm:bottom-6 w-1 sm:w-2 bg-gradient-to-b from-blue-500 via-indigo-500 to-blue-400 rounded-full shadow-lg z-10"></div>
                      {/* Card with layered background */}
                      <Card className="relative pl-4 sm:pl-6 md:pl-8 border-0 shadow-lg sm:shadow-2xl bg-white/95 rounded-lg sm:rounded-xl md:rounded-2xl overflow-visible">
                        {/* Floating icon */}
                        <div className="absolute -top-2 sm:-top-4 md:-top-6 left-2 sm:left-4 md:left-6 z-20">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl border-2 sm:border-4 border-white">
                            <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                          </div>
                        </div>
                        {/* Pattern/gradient background */}
                        <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-white opacity-80 pointer-events-none z-0"></div>
                        <CardHeader className="pt-4 sm:pt-6 md:pt-8 pb-2 pl-12 sm:pl-16 md:pl-20 pr-3 sm:pr-4 md:pr-8 z-10 relative">
                          <CardTitle className="text-base sm:text-lg md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-400 bg-clip-text text-transparent tracking-wider uppercase drop-shadow-lg">
                            FREQUENTLY ASKED QUESTIONS
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-12 sm:pl-16 md:pl-24 pr-3 sm:pr-4 md:pr-8 pb-4 sm:pb-6 md:pb-8 pt-2 z-10 relative">
                          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
                            {event.faq.map((faqItem, index) => (
                              <AccordionItem key={faqItem.id} value={faqItem.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg sm:rounded-xl hover:shadow-lg sm:hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-6 sm:-translate-y-8 translate-x-6 sm:translate-x-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <AccordionTrigger className="text-left text-sm sm:text-base md:text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200 hover:no-underline p-3 sm:p-4 md:p-5 relative z-10">
                                  {faqItem.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed p-3 sm:p-4 md:p-5 pt-0 relative z-10">
                                  {faqItem.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
                {/* Event Gallery - Enhanced */}
                <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} viewport={{ once: true, amount: 0.2 }}>
                  <div className="relative">
                    {/* Vertical accent bar */}
                    <div className="absolute left-0 top-3 sm:top-6 bottom-3 sm:bottom-6 w-1 sm:w-2 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-400 rounded-full shadow-lg z-10"></div>
                    {/* Card with layered background */}
                    <Card className="relative pl-4 sm:pl-6 md:pl-8 border-0 shadow-lg sm:shadow-2xl bg-white/95 rounded-lg sm:rounded-xl md:rounded-2xl overflow-visible">
                      {/* Floating icon */}
                      <div className="absolute -top-2 sm:-top-4 md:-top-6 left-2 sm:left-4 md:left-6 z-20">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg sm:shadow-xl border-2 sm:border-4 border-white">
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                        </div>
                      </div>
                      {/* Pattern/gradient background */}
                      <div className="absolute inset-0 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-white opacity-80 pointer-events-none z-0"></div>
                      <CardHeader className="pt-4 sm:pt-6 md:pt-8 pb-2 pl-12 sm:pl-16 md:pl-20 pr-3 sm:pr-4 md:pr-8 z-10 relative">
                        <CardTitle className="text-base sm:text-lg md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-purple-700 via-pink-700 to-purple-400 bg-clip-text text-transparent tracking-wider uppercase drop-shadow-lg">
                          EVENT GALLERY
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pl-12 sm:pl-16 md:pl-24 pr-3 sm:pr-4 md:pr-8 pb-4 sm:pb-6 md:pb-8 pt-2 z-10 relative">
                        <div className="relative overflow-hidden rounded-lg sm:rounded-xl group">
                          <SafeImage
                            src={event.images.thumbnail || 'https://placehold.co/800x600.png'}
                            alt={`Thumbnail for ${event.title}`}
                            fallback="https://placehold.co/800x600.png"
                            width={800}
                            height={600}
                            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-contain hover:scale-105 transition-transform duration-500 group-hover:shadow-lg sm:group-hover:shadow-2xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
                {/* Terms & Conditions - Compact */}
                {event.termsAndConditions && (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} viewport={{ once: true, amount: 0.2 }}>
                    <Card className="border border-gray-200 shadow-sm bg-white rounded-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Tag className="h-5 w-5 text-gray-600" />
                          Terms & Conditions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                          <MDEditor.Markdown
                            source={event.termsAndConditions}
                            style={{ background: 'none', padding: 0, fontSize: '0.875rem' }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
              {/* Right Sidebar */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6 md:space-y-8 lg:sticky lg:top-24">
                {/* Registration Button - Enhanced */}
                <Card className="border-0 shadow-lg sm:shadow-xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
                  <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8 text-center">
                    <div className="mb-3 sm:mb-4 md:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2">Ready to Join?</h3>
                      <p className="text-blue-100 text-xs sm:text-sm md:text-base">Secure your spot at this amazing event!</p>
                    </div>
                    <RegistrationButton event={event} />
                  </CardContent>
                </Card>

                {/* Amenities Section - Enhanced */}
                {event.amenities && event.amenities.length > 0 && (
                  <Card className="border-0 shadow-lg sm:shadow-xl bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-3 sm:pb-4 md:pb-6">
                      <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <Wifi className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                        </div>
                        Amenities
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {event.amenities.map((amenity, index) => {
                          const colors = getAmenityColors(amenity);
                          return (
                            <div 
                              key={index} 
                              className={`flex flex-col items-center gap-1.5 p-2.5 md:p-3 rounded-lg border transition-all duration-200 hover:scale-105 ${colors.bg} ${colors.border} hover:shadow-md`}
                            >
                              <div className={`${colors.text}`}>
                                {getAmenityIcon(amenity)}
                              </div>
                              <span className={`text-xs font-medium text-center leading-tight ${colors.text}`}>
                                {amenity}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
