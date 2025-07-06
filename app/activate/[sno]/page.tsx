'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, User, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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

  const sno = params?.sno as string;

  useEffect(() => {
    const activateTicket = async () => {
      if (!sno) {
        toast({
          variant: 'destructive',
          title: 'Invalid Ticket',
          description: 'No ticket number provided.',
        });
        return;
      }

      try {
        setLoading(true);
        
        // First, try to get the booking details
        const foundBooking = await getBookingBySno(sno);
        
        if (!foundBooking) {
          toast({
            variant: 'destructive',
            title: 'Ticket Not Found',
            description: `No ticket found with number ${sno}`,
          });
          return;
        }

        setBooking(foundBooking);

        // Always call the API to toggle the ticket status
        setActivating(true);
        const updatedBooking = await scanQrBySno(sno);
        setBooking(updatedBooking);
        setActivated(true);
        
        toast({
          title: updatedBooking.is_activated ? 'Ticket Activated!' : 'Ticket Deactivated!',
          description: updatedBooking.is_activated 
            ? 'Your ticket has been activated successfully.'
            : 'Your ticket has been deactivated.',
        });

      } catch (error) {
        console.error('Error activating ticket:', error);
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
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Invalid Ticket</h2>
            <p className="text-muted-foreground mb-6">
              No ticket number provided.
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Activating your ticket...</p>
            <p className="text-muted-foreground">Please wait a moment</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ticket Not Found</h2>
            <p className="text-muted-foreground mb-6">
              No ticket found with number {sno}
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-2 left-2 w-6 h-6 border-2 border-white rounded-full"></div>
            <div className="absolute top-4 right-4 w-3 h-3 border border-white rounded-full"></div>
            <div className="absolute bottom-2 left-4 w-4 h-4 border-2 border-white transform rotate-45"></div>
          </div>
          
          <div className="relative z-10">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-white" />
            <CardTitle className="text-2xl font-bold mb-1">
              {activated ? (booking.is_activated ? 'Ticket is Active!' : 'Ticket Deactivated!') : 'Processing Ticket...'}
            </CardTitle>
            <p className="text-white/90 text-sm">
              {activated 
                ? (booking.is_activated 
                    ? 'Your ticket is currently active. You can attend the event!' 
                    : 'Your ticket has been deactivated. Please scan again to activate.')
                : 'Please wait while we process your ticket...'
              }
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Event Details */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground mb-1">
                {booking.eventName}
              </h3>
              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                <Star className="w-3 h-3 mr-1" />
                {booking.is_activated ? 'Activated' : 'Not Activated'}
              </Badge>
            </div>

            {/* Ticket Information - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{booking.userName}</p>
                  <p className="text-xs text-muted-foreground">{booking.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{booking.eventDate} at {booking.eventTime}</p>
                </div>
              </div>
            </div>

            {/* Ticket Number */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Ticket Number</p>
              <p className="font-mono text-base font-bold text-foreground">
                {booking.sno}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {/* <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm py-2"
                onClick={() => router.push('/')}
              >
                Go to Homepage
              </Button> */}
              
              <Button 
                variant="outline" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm py-2"
                onClick={() => window.print()}
              >
                Print Ticket
              </Button>
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
} 