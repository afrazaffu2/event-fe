// Remove mock data import - using API data instead
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventStatus } from '@/types';
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
import { generateSlug } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
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

export function UpcomingOngoingEvents() {
  const recentEvents = events
    .filter((event) => event.status === 'Upcoming' || event.status === 'Ongoing')
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming & Ongoing Events</CardTitle>
        <CardDescription>
          A quick look at what's happening now and next.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{format(event.date, 'PPP')}</TableCell>
                <TableCell>
                  <Badge variant={statusVariants[event.status]}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/events/${generateSlug(event.title)}`}
                    target="_blank"
                    className="flex justify-end"
                  >
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
