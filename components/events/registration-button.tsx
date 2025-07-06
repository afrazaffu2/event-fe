'use client';
import { useState } from 'react';
import type { Event } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { RegistrationForm } from './registration-form';

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

    return (
        <Card>
            <CardContent className="p-4">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                <Button className="w-full" size="lg">Register Now</Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Register for {event.title}</DialogTitle>
                </DialogHeader>
                <RegistrationForm event={event} setOpen={setDialogOpen} />
                </DialogContent>
            </Dialog>
            </CardContent>
        </Card>
    );
}
