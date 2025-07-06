import type { Booking } from '@/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Calendar, Clock, User, Star } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

export function TicketDetails({ booking }: { booking: Booking }) {
  return (
    <Card className="w-full max-w-sm shadow-2xl overflow-hidden border-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with gradient */}
      <CardHeader className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-2 left-2 w-6 h-6 border-2 border-white rounded-full"></div>
          <div className="absolute top-4 right-4 w-3 h-3 border border-white rounded-full"></div>
          <div className="absolute bottom-2 left-4 w-4 h-4 border-2 border-white transform rotate-45"></div>
        </div>
        
        <CardTitle className="text-xl font-bold relative z-10">{booking.eventName}</CardTitle>
        <CardDescription className="text-white/90 mt-1 text-sm relative z-10">
          Your Official Event Ticket
        </CardDescription>
        
        {/* Status badge */}
        <div className="mt-2 relative z-10">
          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors text-xs">
            <Star className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* QR Code Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-20"></div>
            <Image
              src={booking.qrCodeUrl}
              alt={`QR Code for ${booking.userName}`}
              width={160}
              height={160}
              className="rounded-xl border-3 border-white shadow-lg relative z-10 bg-white"
              data-ai-hint="qr code"
            />
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium">Ticket Number</p>
            <p className="font-mono text-lg font-bold text-foreground bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {booking.sno}
            </p>
          </div>
        </div>

        <Separator className="my-4 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600" />

        {/* Attendee Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {booking.userName}
              </p>
              <p className="text-muted-foreground text-xs truncate">{booking.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-md">
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{booking.eventDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-md">
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{booking.eventTime}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
