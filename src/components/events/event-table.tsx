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
import { CheckCircle2, Circle, Copy, PlusCircle, Eye, Trash2, Filter, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EventForm } from './event-form';
import { useState, useEffect } from 'react';
import type { Event, EventStatus } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { getEvents, updateEvent, getEventsByHost, deleteEvent, getFilteredEvents } from '@/services/eventService';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
  const [filterType, setFilterType] = useState<'all' | 'today' | 'last_7_days' | 'last_30_days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(events.length / pageSize);
  const paginatedEvents = events.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        let fetchedEvents: Event[] = [];
        if (user?.role === 'host') {
          fetchedEvents = await getEventsByHost(user.id);
        } else {
          fetchedEvents = await getEvents();
        }
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
  }, [dialogOpen, toast, user]);

  const fetchFilteredEvents = async () => {
    try {
      setLoading(true);
      const params: any = { filter: filterType };
      if (user?.role === 'host') {
        params.host_id = user.id;
      }
      if (filterType === 'custom') {
        if (customStartDate) params.start_date = customStartDate;
        if (customEndDate) params.end_date = customEndDate;
      }
      const fetchedEvents = await getFilteredEvents(params);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to fetch filtered events:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch filtered events.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterType !== 'all' || customStartDate || customEndDate) {
      fetchFilteredEvents();
    }
  }, [filterType, customStartDate, customEndDate]);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/events/${slug}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        toast({
          title: 'Link Copied',
          description: 'Event link copied to clipboard.',
        });
      }).catch(err => {
        console.error('Failed to copy: ', err);
        fallbackCopyToClipboard(url);
      });
    } else {
      fallbackCopyToClipboard(url);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
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

  const handlePublish = async (event: Event) => {
    try {
      await updateEvent(event.id, { isPublished: true, status: 'Upcoming' });
      toast({ title: 'Event Published', description: 'The event is now public.' });
      if (filterType !== 'all' || customStartDate || customEndDate) {
        await fetchFilteredEvents();
      } else {
        let fetchedEvents: Event[] = [];
        if (user?.role === 'host') {
          fetchedEvents = await getEventsByHost(user.id);
        } else {
          fetchedEvents = await getEvents();
        }
        setEvents(fetchedEvents);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Publish Failed',
        description: 'Could not publish the event.',
      });
    }
  };

  const handleDelete = async (event: Event) => {
    try {
      await deleteEvent(event.id);
      toast({ title: 'Event Deleted', description: `Event "${event.title}" has been deleted successfully.` });
      if (filterType !== 'all' || customStartDate || customEndDate) {
        await fetchFilteredEvents();
      } else {
        let fetchedEvents: Event[] = [];
        if (user?.role === 'host') {
          fetchedEvents = await getEventsByHost(user.id);
        } else {
          fetchedEvents = await getEvents();
        }
        setEvents(fetchedEvents);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the event. Please try again.',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent font-extrabold">Event List</CardTitle>
            <CardDescription>
              A detailed record of all your events.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {user?.role === 'admin' && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg">
                    <PlusCircle className="mr-2 h-4 w-4 text-white" />
                    Create New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Create a New Event</DialogTitle>
                  </DialogHeader>
                  <EventForm setOpen={setDialogOpen} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        {/* Filter Controls */}
        {showFilters && (
          <div className="px-6 pb-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="filter-type" className="text-sm font-medium mb-2 block">Date Filter</Label>
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="h-10 text-base">
                    <SelectValue placeholder="Select filter type" />
                  </SelectTrigger>
                  <SelectContent className="min-w-[200px]">
                    <SelectItem value="all" className="text-base py-3">All Events</SelectItem>
                    <SelectItem value="today" className="text-base py-3">Today</SelectItem>
                    <SelectItem value="last_7_days" className="text-base py-3">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days" className="text-base py-3">Last 30 Days</SelectItem>
                    <SelectItem value="custom" className="text-base py-3">Custom Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filterType === 'custom' && (
                <>
                  <div className="min-w-[150px]">
                    <Label htmlFor="start-date" className="text-sm font-medium mb-2 block">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate || ''}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full h-10 text-base"
                    />
                  </div>
                  <div className="min-w-[150px]">
                    <Label htmlFor="end-date" className="text-sm font-medium mb-2 block">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate || ''}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full h-10 text-base"
                    />
                  </div>
                </>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterType('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="h-10 px-4"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {loading ? (
              <div className="space-y-2 p-6">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : events.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {user?.role === 'host'
                  ? 'No events found for your account.'
                  : 'No events found.'}
              </div>
            ) : (
              <>
                <Table className="min-w-[900px]">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-100 to-gray-200 border-b-2 border-gray-300 sticky top-0 z-10">
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 w-16 text-center">S.No</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3">Name</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 text-center">Date</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 text-center">Location</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 text-center">Category</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 text-center">Status</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 text-center">Published</TableHead>
                      <TableHead className="font-bold text-gray-700 uppercase tracking-wide py-3 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEvents.map((event, idx) => (
                      <TableRow
                        key={event.id}
                        className={
                          `transition-all duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/70 hover:shadow-md hover:scale-[1.01]`}
                      >
                        <TableCell className="font-medium py-3 px-4 text-center">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="font-medium py-3 px-4">{event.title}</TableCell>
                        <TableCell className="py-3 px-4 text-center">{format(event.date, 'PPP')}</TableCell>
                        <TableCell className="py-3 px-4 text-center">{event.location}</TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <Badge variant="outline">{event.category}</Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center">
                          <Badge variant={statusVariants[event.status]}>
                            {event.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-center align-middle">
                          {event.isPublished ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 inline-block" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500 inline-block" />
                          )}
                        </TableCell>
                        <TableCell className="text-right py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/events/${event.slug}`}>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(event.slug)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Link
                            </Button>
                            {user?.role === 'admin' && (
                              <>
                                <Button
                                  variant={event.isPublished ? 'destructive' : 'default'}
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      await updateEvent(event.id, { isPublished: !event.isPublished });
                                      toast({
                                        title: event.isPublished ? 'Event Unpublished' : 'Event Published',
                                        description: `The event has been ${event.isPublished ? 'unpublished' : 'published'}.`,
                                      });
                                      if (filterType !== 'all' || customStartDate || customEndDate) {
                                        await fetchFilteredEvents();
                                      } else {
                                        let fetchedEvents: Event[] = [];
                                        if (user?.role === 'host') {
                                          fetchedEvents = await getEventsByHost(user.id);
                                        } else {
                                          fetchedEvents = await getEvents();
                                        }
                                        setEvents(fetchedEvents);
                                      }
                                    } catch (error) {
                                      toast({
                                        variant: 'destructive',
                                        title: 'Failed',
                                        description: `Could not ${event.isPublished ? 'unpublish' : 'publish'} the event.`,
                                      });
                                    }
                                  }}
                                >
                                  {event.isPublished ? 'Unpublish' : 'Publish'}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="text-center">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="bg-gradient-to-r from-red-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent text-xl font-extrabold">Delete Event</AlertDialogTitle>
                                      <AlertDialogDescription className="mt-2">
                                        Are you sure you want to delete <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent font-semibold">{event.title}</span>? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(event)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-4 px-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
