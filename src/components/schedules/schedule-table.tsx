'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
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
import { Button } from '../ui/button';
import { Download, ScanLine, Copy, RefreshCw, User, Calendar, Clock, Star, QrCode, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import type { Booking } from '@/types';
import { useAuth } from '@/contexts/auth-context';
import { getBookings, getBookingsByHost, updateBookingStatus, scanQrBySno } from '@/services/bookingService';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { QrScanner } from './qr-scanner';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/lib/api';
import { CURRENT_ENV } from '../../../config/environment';

const QrScannerComponent = dynamic(
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();
  const { user } = useAuth();

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
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let data;
      
      // Role-based booking fetching
      if (user?.role === 'admin') {
        // Admin sees all bookings
        data = await getBookings();
      } else if (user?.role === 'host') {
        // Host sees only their event bookings
        data = await getBookingsByHost(user.id);
      } else {
        // Fallback to all bookings for unknown roles
        data = await getBookings();
      }
      
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
            title: 'Invalid Ticket Number',
            description: 'Please enter a valid ticket number.',
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
    // Use environment configuration to get the correct frontend URL
    const frontendUrl = CURRENT_ENV.FRONTEND_URL;
    
    // Remove any trailing slash and construct the activation URL
    const baseUrl = frontendUrl.replace(/\/$/, '');
    return `${baseUrl}/activate/${sno}`;
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportExcel = () => {
    const data = filteredBookings.map(b => ({
      'Guest Name': b.userName,
      'Email': b.email,
      'Event Name': b.eventName,
      'Event Date': b.eventDate,
      'Event Time': b.eventTime,
      'Ticket #': b.sno,
      'Status': b.is_activated ? 'Active' : 'Inactive',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, 'bookings.xlsx');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking List</CardTitle>
          <CardDescription>Loading bookings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Booking List</CardTitle>
            <CardDescription>
              {user?.role === 'admin' 
                ? 'A list of all event bookings. Scan QR codes for attendance.'
                : 'A list of your event bookings. Scan QR codes for attendance.'
              }
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={fetchBookings} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
              <DialogTrigger asChild>
                <Button 
                  disabled={user?.role === 'admin'}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Ticket
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
            <Button 
              variant="outline" 
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
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
                className="pl-10 bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-300 hover:shadow-sm"
              />
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                    <th className="text-left p-4 font-semibold text-slate-700 w-16">S.No</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Guest</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Event</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Date & Time</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Ticket #</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking, index) => (
                    <tr 
                      key={booking.id} 
                      className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full text-white text-sm font-semibold">
                          {startIndex + index + 1}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {booking.userName.charAt(0).toUpperCase()}
                          </div>
                        <div>
                            <div className="font-medium text-slate-900">{booking.userName}</div>
                            <div className="text-sm text-slate-500">{booking.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{booking.eventName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="font-medium text-slate-900">{booking.eventDate}</div>
                          <div className="text-slate-500">{booking.eventTime}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1.5 rounded-md text-sm font-mono text-slate-700 border border-slate-200">
                          {booking.sno}
                        </code>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={booking.is_activated ? "default" : "secondary"}
                          className={`${
                            booking.is_activated 
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200" 
                              : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200"
                          } font-medium px-3 py-1`}
                        >
                          <div className="flex items-center space-x-1">
                            {booking.is_activated ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                            <span>{booking.is_activated ? 'Active' : 'Inactive'}</span>
                          </div>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowActivationUrl(true);
                            }}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-300 shadow-sm hover:shadow-md"
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No bookings found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `No bookings match "${searchTerm}". Try adjusting your search terms.`
                    : "There are no bookings to display at the moment."
                  }
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredBookings.length > 0 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-slate-200 hover:border-slate-300 transition-all duration-300"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                              : "bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-slate-200 hover:border-slate-300 transition-all duration-300"
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-slate-200 hover:border-slate-300 transition-all duration-300"
                  >
                    Next
                  </Button>
                </div>
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
