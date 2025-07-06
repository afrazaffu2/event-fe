import { getEventBySlug } from '@/services/eventService';
import { EventDetails } from '@/components/events/event-details';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <EventDetails event={event} />
    </div>
  );
}
