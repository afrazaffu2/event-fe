'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Booking } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getBookings } from '@/services/bookingService';
import { Search, QrCode, ExternalLink, Copy, CheckCircle, Calendar, Clock, User, Circle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const QrScanner = dynamic(
  () => import('./qr-scanner').then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" />,
  }
);

// QR Code Generator Component
function QRCodeDisplay({ url }: { url: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate QR code using a free QR code API
    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    setQrCodeUrl(qrCodeApiUrl);
  }, [url]);

  return (
    <div className="flex flex-col items-center space-y-2">
      {qrCodeUrl ? (
        <div className="border-2 border-gray-200 rounded-lg p-2 bg-white">
          <img 
            src={qrCodeUrl} 
            alt="QR Code for activation URL" 
            className="w-32 h-32"
          />
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-gray-200 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <p className="text-xs text-muted-foreground text-center">
        Scan with your phone to activate ticket
      </p>
    </div>
  );
}

export function ScheduleTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [showActivationUrl, setShowActivationUrl] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);
  const [showScanResult, setShowScanResult] = useState(false);
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const localIP = API_BASE_URL.replace('http://', '').replace(':8000', '');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter(booking =>
      booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.sno.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookings(filtered);
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch bookings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (result: string | null) => {
    if (result) {
      console.log('QR Code scanned:', result);
      
      // Handle different QR code formats
      let ticketSno = null;
      
      // Format 1: Frontend URL (new format)
      if (result.includes('/activate/')) {
        ticketSno = result.split('/activate/')[1];
      }
      // Format 2: Old format (event:sn:name)
      else if (result.includes(':')) {
        const parts = result.split(':');
        if (parts.length >= 2) {
          ticketSno = parts[1];
        }
      }
      // Format 3: Just the ticket number
      else {
        ticketSno = result.trim();
      }
      
      if (ticketSno) {
        // Find the booking with this ticket number
        const booking = bookings.find(b => b.sno === ticketSno);
        
        if (booking) {
          // Set the scanned booking and show result modal
          setScannedBooking(booking);
          setShowScanResult(true);
          setScannerOpen(false);
          
          // Show success message
          toast({
            title: 'QR Code Scanned!',
            description: `Found ticket for ${booking.userName}`,
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Ticket Not Found',
            description: `No ticket found with number ${ticketSno}`,
          });
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid QR Code',
          description: 'The scanned QR code is not in the expected format',
        });
      }
    }
  };

  const getActivationUrl = (sno: string) => {
    // Use local network IP for public access on WiFi
    const localIP = API_BASE_URL.replace('http://', '').replace(':8000', '');
    const port = '9002'; // Frontend port
    return `http://${localIP}:${port}/activate/${sno}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast({
          title: 'Copied!',
          description: 'Activation URL copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for browsers without clipboard API
        fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Clipboard API failed:', error);
      // Fallback to manual copy
      fallbackCopyToClipboard(text);
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
        setCopied(true);
        toast({
          title: 'Copied!',
          description: 'Activation URL copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Copy Failed',
          description: 'Could not copy URL. Please copy manually.',
        });
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Could not copy URL. Please copy manually.',
      });
    }
  };

  const openActivationUrl = (sno: string) => {
    const url = getActivationUrl(sno);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading bookings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">Event Schedule</CardTitle>
              <p className="text-muted-foreground">Manage and scan event tickets</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchBookings}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Refresh
              </Button>
              <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                <DialogTrigger asChild>
                  <Button disabled={user?.role === 'admin'} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Scan QR Code</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <QrScanner onScan={handleScan} />
                    <p className="text-sm text-muted-foreground text-center">
                      Point your camera at the QR code to scan
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, event, or ticket number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Guest</th>
                    <th className="text-left p-3 font-semibold">Event</th>
                    <th className="text-left p-3 font-semibold">Date & Time</th>
                    <th className="text-left p-3 font-semibold">Ticket #</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{booking.userName}</div>
                          <div className="text-sm text-muted-foreground">{booking.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{booking.eventName}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{booking.eventDate}</div>
                          <div className="text-muted-foreground">{booking.eventTime}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {booking.sno}
                        </code>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={booking.is_activated ? "default" : "secondary"}
                          className={booking.is_activated ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {booking.is_activated ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowActivationUrl(true);
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Show URL
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activation URL Modal */}
      <Dialog open={showActivationUrl} onOpenChange={setShowActivationUrl}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Ticket Activation URL
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Ticket Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedBooking.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedBooking.eventName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.eventDate} at {selectedBooking.eventTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-center block">QR Code for Activation</label>
                <div className="flex justify-center">
                  <QRCodeDisplay url={getActivationUrl(selectedBooking.sno)} />
                </div>
              </div>

              {/* Activation URL */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Activation URL</label>
                <div className="flex gap-2">
                  <Input
                    value={getActivationUrl(selectedBooking.sno)}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(getActivationUrl(selectedBooking.sno))}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong> 
                  <br />• Scan the QR code above with your phone
                  <br />• Or copy the URL below and share it
                  <br />• When visited, the ticket status will be toggled (Active ↔ Inactive)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  onClick={() => openActivationUrl(selectedBooking.sno)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open URL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowActivationUrl(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scan Result Modal */}
      <Dialog open={showScanResult} onOpenChange={setShowScanResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              Scan Result
            </DialogTitle>
          </DialogHeader>
          
          {scannedBooking && (
            <div className="space-y-4">
              {/* User Status */}
              <div className={`p-4 rounded-lg border-2 ${
                scannedBooking.is_activated 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    scannedBooking.is_activated 
                      ? 'bg-green-100' 
                      : 'bg-yellow-100'
                  }`}>
                    {scannedBooking.is_activated ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${
                      scannedBooking.is_activated 
                        ? 'text-green-800' 
                        : 'text-yellow-800'
                    }`}>
                      {scannedBooking.is_activated ? '✅ User is Inside' : '⏳ User has not come yet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ticket Status: {scannedBooking.is_activated ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{scannedBooking.userName}</p>
                    <p className="text-sm text-muted-foreground">{scannedBooking.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{scannedBooking.eventName}</p>
                    <p className="text-sm text-muted-foreground">
                      {scannedBooking.eventDate} at {scannedBooking.eventTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <QrCode className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Ticket Number</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {scannedBooking.sno}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => {
                    setShowScanResult(false);
                    setScannerOpen(true);
                  }}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan Another
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowScanResult(false)}
                >
                  Close
                </Button>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> 
                  <br />• If user is not inside, they need to activate their ticket
                  <br />• If user is already inside, they can be marked as present
                  <br />• You can scan multiple tickets in sequence
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 