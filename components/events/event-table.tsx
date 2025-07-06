'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Copy, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EventForm } from './event-form';
import { useState, useEffect } from 'react';
import type { Event, EventStatus } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getEvents } from '@/services/eventService';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';

const statusVariants: Record<
  EventStatus,
  'default' | 'secondary' | 'destructive' | 'outline' | 'success'
> = {
  Upcoming: 'secondary',
  Ongoing: 'default',
  Completed: 'success',
  Draft: 'outline',
};

export function EventTable() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch events from the database.',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [dialogOpen, toast]);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/events/${slug}`;
    
    // Check if clipboard API is available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: 'Link Copied',
          description: 'Event link copied to clipboard.',
        });
      }).catch(err => {
        console.error('Failed to copy: ', err);
        // Fallback to manual copy
        fallbackCopyToClipboard(url);
      });
    } else {
      // Fallback for browsers without clipboard API
      fallbackCopyToClipboard(url);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        toast({
          title: 'Link Copied',
          description: 'Event link copied to clipboard.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: 'Could not copy the link. Please copy manually.',
        });
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy the link. Please copy manually.',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Event List</CardTitle>
          <CardDescription>
            A detailed record of all your events.
          </CardDescription>
        </div>
        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Create a New Event</DialogTitle>
                </DialogHeader>
                <EventForm setOpen={setDialogOpen} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{format(event.date, 'PPP')}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[event.status]}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {event.isPublished ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      {event.isPublished ? 'Yes' : 'No'}
                    </TableCell>
                     <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(event.slug)}
                        disabled={!event.isPublished}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
