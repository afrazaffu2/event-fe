import { getBookings } from '@/services/bookingService';

export default async function TestBookingsPage() {
  const bookings = await getBookings();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Bookings</h1>
      <p className="mb-4">Total bookings: {bookings.length}</p>
      <div className="space-y-2">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 border rounded">
            <p><strong>SNO:</strong> {booking.sno}</p>
            <p><strong>Name:</strong> {booking.userName}</p>
            <p><strong>Event:</strong> {booking.eventName}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 