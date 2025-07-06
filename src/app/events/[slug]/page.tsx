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

  // If the API returns an error for unpublished event
  if ((event as any).error === 'Event not published') {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="inline-block px-8 py-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-2">This event is not published</h2>
          <p className="text-gray-600">The event you are trying to view is not currently published. Please check back later or contact the event organizer.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <EventDetails event={event} />
    </div>
  );
}
