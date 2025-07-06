'use client';
import type { Event } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { getRelatedEvents } from '@/services/eventService';
import { Skeleton } from '../ui/skeleton';

type RelatedEventsProps = {
  currentEvent: Event;
};

export function RelatedEvents({ currentEvent }: RelatedEventsProps) {
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedEvents() {
      try {
        setLoading(true);
        const events = await getRelatedEvents(currentEvent);
        setRelatedEvents(events);
      } catch (error) {
        console.error("Failed to fetch related events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRelatedEvents();
  }, [currentEvent]);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Related Events</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (relatedEvents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Related Events</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} passHref>
              <Card className="h-full overflow-hidden transition-transform hover:-translate-y-1">
                <Image
                  src={event.images.thumbnail}
                  alt={event.title}
                  width={400}
                  height={300}
                  className="object-cover w-full h-auto"
                  data-ai-hint="event thumbnail"
                />
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-semibold text-md leading-tight truncate">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p>
                  <Badge variant="outline">{event.category}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
