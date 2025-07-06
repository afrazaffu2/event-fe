'use client';
import { useState } from 'react';
import type { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationForm } from './registration-form';
import { getBookingsByEvent } from '@/services/bookingService';

export function RegistrationButton({ event }: { event: Event }) {
    const [dialogOpen, setDialogOpen] = useState(false);

    // Don't show register button for completed events
    if (event.status === 'Completed') {
        return (
            <Card>
                <CardContent className="p-4">
                    <Button className="w-full" size="lg" disabled>Event Completed</Button>
                </CardContent>
            </Card>
        )
    }

    // Disable if all packages' endDate are in the past
    const now = new Date();
    const allPackagesClosed = event.packages && event.packages.length > 0 && event.packages.every(pkg => {
      if (pkg.endDate) {
        return new Date(pkg.endDate) < now;
      }
      return false;
    });

    // Check if all packages are full (limit reached)
    // const allFull = event.packages && event.packages.length > 0 && event.packages.every(pkg => {
    //     if (typeof pkg.limit === 'number' && typeof pkg.registered === 'number') {
    //         return pkg.registered >= pkg.limit;
    //     }
    //     return false;
    // });

    return (
        <Card>
            <CardContent className="p-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                <Button className="w-full" size="lg" disabled={allPackagesClosed}>
                  {allPackagesClosed ? 'Registration Closed' : 'Register Now'}
                </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Register for {event.title}</DialogTitle>
                    <DialogDescription>
                        Complete your registration details and select a payment method to secure your spot.
                    </DialogDescription>
                </DialogHeader>
                <RegistrationForm event={event} setOpen={setDialogOpen} />
                </DialogContent>
            </Dialog>
            </CardContent>
        </Card>
    );
}
