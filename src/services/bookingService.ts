import type { Booking, Event } from '@/types';
import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from '@/lib/api';

export async function addBooking(
    registrationData: { userName: string; email: string; phone?: string; memberCount?: number; selectedPackage?: any; foodPreference?: string; additionalMembers?: any[]; totalAmount?: number },
    event: Event
): Promise<Booking> {
    try {
        const response = await fetch(API_ENDPOINTS.EVENT_REGISTER(parseInt(event.id).toString()), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_name: registrationData.userName,
                email: registrationData.email,
                phone: registrationData.phone || '',
                member_count: registrationData.memberCount || 1,
                selected_package: registrationData.selectedPackage || {},
                food_preference: registrationData.foodPreference || '',
                additional_members: registrationData.additionalMembers || [],
                total_amount: registrationData.totalAmount || 0.00,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const bookingData = await response.json();
        
        // Transform the API response to match our Booking type
        const booking: Booking = {
            id: bookingData.id.toString(),
            sno: bookingData.sno || `EVENT-${bookingData.id}`,
            eventId: bookingData.event,
            eventName: event.title,
            eventDate: new Date(event.date).toLocaleDateString(),
            eventTime: new Date(event.date).toLocaleTimeString(),
            userName: bookingData.user_name,
            email: bookingData.email,
            qrCodeUrl: bookingData.qr_code_url || '',
            is_activated: bookingData.is_activated || false,
        };

        return booking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

export async function getBookings(): Promise<Booking[]> {
  try {
    const response = await fetch(API_ENDPOINTS.BOOKINGS, createApiRequestOptions('GET'));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookingsData = await response.json();
    
    // Transform the API response to match our Booking type
    return bookingsData.map((booking: any) => ({
      id: booking.id.toString(),
      sno: booking.sno || `EVENT-${booking.id}`,
      eventId: booking.event.toString(),
      eventName: booking.event_name || 'Unknown Event',
      eventDate: new Date(booking.event_date).toLocaleDateString(),
      eventTime: new Date(booking.event_date).toLocaleTimeString(),
      userName: booking.user_name,
      email: booking.email,
      qrCodeUrl: booking.qr_code_url || '',
      is_activated: booking.is_activated || false,
    }));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
}

export async function getBookingsByHost(hostId: string): Promise<Booking[]> {
  try {
    const response = await fetch(API_ENDPOINTS.BOOKINGS_BY_HOST(hostId), createApiRequestOptions('GET'));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookingsData = await response.json();
    
    // Transform the API response to match our Booking type
    return bookingsData.map((booking: any) => ({
      id: booking.id.toString(),
      sno: booking.sno || `EVENT-${booking.id}`,
      eventId: booking.event.toString(),
      eventName: booking.event_name || 'Unknown Event',
      eventDate: new Date(booking.event_date).toLocaleDateString(),
      eventTime: new Date(booking.event_date).toLocaleTimeString(),
      userName: booking.user_name,
      email: booking.email,
      qrCodeUrl: booking.qr_code_url || '',
      is_activated: booking.is_activated || false,
    }));
  } catch (error) {
    console.error('Error fetching bookings by host:', error);
    throw error;
  }
}

export async function getBookingsByEvent(eventId: string): Promise<Booking[]> {
  try {
    const response = await fetch(API_ENDPOINTS.EVENT_BOOKINGS(eventId), createApiRequestOptions('GET'));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookingsData = await response.json();
    
    // Transform the API response to match our Booking type
    return bookingsData.map((booking: any) => ({
      id: booking.id.toString(),
      sno: booking.sno || `EVENT-${booking.id}`,
      eventId: booking.event.toString(),
      eventName: booking.event_name || 'Unknown Event',
      eventDate: new Date(booking.event_date).toLocaleDateString(),
      eventTime: new Date(booking.event_date).toLocaleTimeString(),
      userName: booking.user_name,
      email: booking.email,
      qrCodeUrl: booking.qr_code_url || '',
      is_activated: booking.is_activated || false,
    }));
  } catch (error) {
    console.error('Error fetching bookings by event:', error);
    throw error;
  }
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
  try {
    const response = await fetch(API_ENDPOINTS.BOOKING_SCAN(bookingId), createApiRequestOptions('POST', {}));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const bookingData = responseData.booking;
    
    // Transform the API response to match our Booking type
    return {
      id: bookingData.id.toString(),
      sno: bookingData.sno || `EVENT-${bookingData.id}`,
      eventId: bookingData.event.toString(),
      eventName: bookingData.event_name || 'Unknown Event',
      eventDate: new Date(bookingData.event_date).toLocaleDateString(),
      eventTime: new Date(bookingData.event_date).toLocaleTimeString(),
      userName: bookingData.user_name,
      email: bookingData.email,
      qrCodeUrl: bookingData.qr_code_url || '',
      is_activated: bookingData.is_activated || false,
    };
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

export async function scanQrBySno(sno: string, status?: string): Promise<Booking> {
  try {
    const response = await fetch(API_ENDPOINTS.BOOKING_SCAN(sno), createApiRequestOptions('POST', {}));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    const bookingData = responseData.booking;
    
    // Transform the API response to match our Booking type
    return {
      id: bookingData.id.toString(),
      sno: bookingData.sno || `EVENT-${bookingData.id}`,
      eventId: bookingData.event.toString(),
      eventName: bookingData.event_name || 'Unknown Event',
      eventDate: new Date(bookingData.event_date).toLocaleDateString(),
      eventTime: new Date(bookingData.event_date).toLocaleTimeString(),
      userName: bookingData.user_name,
      email: bookingData.email,
      qrCodeUrl: bookingData.qr_code_url || '',
      is_activated: bookingData.is_activated || false,
    };
  } catch (error) {
    console.error('Error scanning QR by SNO:', error);
    throw error;
  }
}

export async function getBookingBySno(sno: string): Promise<Booking> {
  try {
    // First try to get from API
    const response = await fetch(API_ENDPOINTS.BOOKING_BY_SNO(sno), createApiRequestOptions('GET'));

    if (response.ok) {
      const bookingData = await response.json();
      
      // Transform the API response to match our Booking type
      return {
        id: bookingData.id.toString(),
        sno: bookingData.sno || `EVENT-${bookingData.id}`,
        eventId: bookingData.event.toString(),
        eventName: bookingData.event_name || 'Unknown Event',
        eventDate: new Date(bookingData.event_date).toLocaleDateString(),
        eventTime: new Date(bookingData.event_date).toLocaleTimeString(),
        userName: bookingData.user_name,
        email: bookingData.email,
        qrCodeUrl: bookingData.qr_code_url || '',
        is_activated: bookingData.is_activated || false,
      };
    }
  } catch (error) {
    console.error('Error fetching booking by SNO from API:', error);
  }

  // Fallback to mock data - import mock data if needed
  const { bookings } = await import('@/lib/mock-data');
  const mockBooking = bookings.find(b => b.sno === sno);
  if (mockBooking) {
    return mockBooking;
  }

  throw new Error(`Booking with SNO ${sno} not found`);
}

export async function getBookingsByPackage(eventId: string, packageId: string): Promise<Booking[]> {
  // Fetch all bookings for the event, then filter by packageId
  const bookings = await getBookingsByEvent(eventId);
  // If the backend returns package info in each booking, filter here
  // This assumes each booking has a selectedPackage or packageId field
  return bookings.filter((booking: any) => {
    // Try both possible fields for compatibility
    return (
      booking.selectedPackage?.id === packageId ||
      booking.packageId === packageId
    );
  });
}
