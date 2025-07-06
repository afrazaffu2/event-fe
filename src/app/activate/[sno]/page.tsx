'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Clock, User, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scanQrBySno, getBookingBySno } from '@/services/bookingService';
import type { Booking } from '@/types';

export default function ActivatePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const [debug, setDebug] = useState<string>('');

  const sno = params?.sno as string;

  useEffect(() => {
    const activateTicket = async () => {
      if (!sno) {
        setDebug('No SNO provided');
        toast({
          variant: 'destructive',
          title: 'Invalid Ticket',
          description: 'No ticket number provided.',
        });
        return;
      }

      try {
        setLoading(true);
        setDebug(`Starting activation for SNO: ${sno}`);
        
        // First, try to get the booking details
        setDebug('Fetching booking details...');
        const foundBooking = await getBookingBySno(sno);
        
        if (!foundBooking) {
          setDebug('Booking not found');
          toast({
            variant: 'destructive',
            title: 'Ticket Not Found',
            description: `No ticket found with number ${sno}`,
          });
          return;
        }

        setBooking(foundBooking);
        setDebug('Booking found, scanning QR...');

        // Always call the API to toggle the ticket status
        setActivating(true);
        const updatedBooking = await scanQrBySno(sno);
        setBooking(updatedBooking);
        setActivated(true);
        setDebug('QR scan completed successfully');
        
        toast({
          title: updatedBooking.is_activated ? 'Ticket Activated!' : 'Ticket Deactivated!',
          description: updatedBooking.is_activated 
            ? 'Your ticket has been activated successfully.'
            : 'Your ticket has been deactivated.',
        });

      } catch (error) {
        console.error('Error activating ticket:', error);
        setDebug(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast({
          variant: 'destructive',
          title: 'Activation Failed',
          description: 'Failed to activate your ticket. Please try again.',
        });
      } finally {
        setLoading(false);
        setActivating(false);
      }
    };

    if (sno) {
      activateTicket();
    }
  }, [sno, toast]);

  if (!sno) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Invalid Ticket</h2>
          <p className="text-gray-600 mb-6">
            No ticket number provided.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Activating your ticket...</p>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-6">
            No ticket found with number {sno}
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-2 left-2 w-6 h-6 border-2 border-white rounded-full"></div>
            <div className="absolute top-4 right-4 w-3 h-3 border border-white rounded-full"></div>
            <div className="absolute bottom-2 left-4 w-4 h-4 border-2 border-white transform rotate-45"></div>
          </div>
          
          <div className="relative z-10">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-white" />
            <h1 className="text-2xl font-bold mb-1">
              {activated ? (booking.is_activated ? 'Ticket is Active!' : 'Ticket Deactivated!') : 'Processing Ticket...'}
            </h1>
            <p className="text-white/90 text-sm">
              {activated 
                ? (booking.is_activated 
                    ? 'Your ticket is currently active. You can attend the event!' 
                    : 'Your ticket has been deactivated. Please scan again to activate.')
                : 'Please wait while we process your ticket...'
              }
            </p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Event Details */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {booking.eventName}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                <Star className="w-3 h-3 mr-1" />
                {booking.is_activated ? 'Activated' : 'Not Activated'}
              </span>
            </div>

            {/* Ticket Information - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{booking.userName}</p>
                  <p className="text-xs text-gray-600">{booking.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{booking.eventDate} at {booking.eventTime}</p>
                </div>
              </div>
            </div>

            {/* Ticket Number */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Ticket Number</p>
              <p className="font-mono text-base font-bold text-gray-900">
                {booking.sno}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm py-2 rounded-lg"
                onClick={() => router.push('/')}
              >
                Go to Homepage
              </button>
              
              <button 
                className="w-full border border-gray-300 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-50"
                onClick={() => window.print()}
              >
                Print Ticket
              </button>
            </div>

            {/* Debug Information */}
            {debug && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium text-sm">Debug Info:</p>
                <p className="text-blue-700 text-xs mt-1">{debug}</p>
              </div>
            )}

            {/* Success Message */}
            {activated && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-green-800 font-medium text-sm">
                    {booking.is_activated 
                      ? 'Ticket is currently active!'
                      : 'Ticket has been deactivated!'
                    }
                  </p>
                </div>
                <p className="text-green-700 text-xs mt-1">
                  {booking.is_activated 
                    ? 'You can attend the event. Scan again to deactivate if needed.'
                    : 'Scan again to activate your ticket for the event.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 