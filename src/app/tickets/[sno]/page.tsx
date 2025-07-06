import { TicketDetails } from '@/components/tickets/ticket-details';
import { ContactHost } from '@/components/tickets/contact-host';
import { getBookings } from '@/services/bookingService';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

export default async function TicketPage({ params }: { params: Promise<{ sno: string }> }) {
  const { sno } = await params;

  try {
    // Try to fetch bookings from API
    const bookings = await getBookings();
    
    // Find the booking by SNO
    const booking = bookings.find((b) => b.sno === sno);

    if (!booking) {
      console.log(`Booking with SNO "${sno}" not found`);
      notFound();
    }

    return (
      <div className="relative min-h-screen bg-muted p-4 font-body">
        {/* Main content - centered */}
        <div className="flex justify-center items-center min-h-screen">
          <TicketDetails booking={booking} />
        </div>
        
        {/* Contact Host - positioned in right corner */}
        <div className="fixed top-4 right-4 z-50">
          <ContactHost />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching bookings from API:', error);
    notFound();
  }
}
