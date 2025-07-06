'use client';
import { useEffect, useState } from 'react';
import { getUpcomingOngoingEvents } from '@/services/eventService';
import type { Event, EventStatus } from '@/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Clock } from 'lucide-react';
import { format } from 'date-fns';
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

// Helper to compare only the date part (local)
const isSameLocalDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export function UpcomingOngoingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await getUpcomingOngoingEvents();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const filtered = data
          .filter(event => {
            const eventDate = new Date(event.date);
            return isSameLocalDay(eventDate, today) || eventDate > today;
          })
          .map(event => {
            const eventDate = new Date(event.date);
            let status: EventStatus = event.status;
            if (isSameLocalDay(eventDate, today)) {
              status = 'Ongoing';
            } else if (eventDate > today) {
              status = 'Upcoming';
            }
            return { ...event, status };
          })
          .slice(0, 10);
        setEvents(filtered);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      className="relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 min-h-[220px] group"
    >
      {/* Animated background icon */}
      <CalendarDays className="absolute right-4 bottom-4 w-28 h-28 text-blue-200 opacity-20 z-0" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-lg font-extrabold uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider">Upcoming & Ongoing Events</span>
        </div>
        <div className="text-sm text-muted-foreground mb-4">A quick look at what's happening now and next.</div>
        {loading ? (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No upcoming or ongoing events found.</div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-blue-100 bg-white/60 backdrop-blur-md shadow-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-100 via-purple-100 to-white">
                  <TableHead className="font-bold uppercase text-xs tracking-wider text-blue-700">Event</TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider text-blue-700">Location</TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider text-blue-700">Date</TableHead>
                  <TableHead className="font-bold uppercase text-xs tracking-wider text-blue-700">Status</TableHead>
                  <TableHead className="text-right font-bold uppercase text-xs tracking-wider text-blue-700">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <motion.tr
                    key={event.id}
                    whileHover={{ scale: 1.015, backgroundColor: '#f1f5f9' }}
                    className="transition-all duration-200 border-b border-blue-100 last:border-0 group"
                  >
                    <TableCell className="font-bold text-blue-900">
                      {event.title}
                    </TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{format(new Date(event.date), 'PPP')}</TableCell>
                    <TableCell>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1 text-xs font-semibold shadow-md">
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/events/${event.slug}`}
                        target="_blank"
                        className="flex justify-end"
                      >
                        <ArrowUpRight className="h-4 w-4 text-blue-500 group-hover:scale-125 transition-transform duration-200" />
                      </Link>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
