import type { Event } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarDays, MapPin, ParkingSquare, Utensils, Wifi, Wind } from 'lucide-react';
import { RegistrationButton } from './registration-button';
import { format } from 'date-fns';

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Wi-Fi': <Wifi className="h-5 w-5 text-primary" />,
  'Parking': <ParkingSquare className="h-5 w-5 text-primary" />,
  'Food': <Utensils className="h-5 w-5 text-primary" />,
  'Drinks': <Utensils className="h-5 w-5 text-primary" />,
  'AC': <Wind className="h-5 w-5 text-primary" />,
};

export function EventDetails({ event }: { event: Event }) {
  return (
    <div className="space-y-8">
      <div className="relative w-full">
        <Image
          src={event.images.cover}
          alt={`Cover image for ${event.title}`}
          width={1200}
          height={400}
          priority
          className="object-cover rounded-lg shadow-lg w-full h-auto"
          data-ai-hint="event cover photo"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-lg flex flex-col justify-end p-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">{event.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>

          {event.packages?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tickets & Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.packages.map((pkg) => (
                  <div key={pkg.id} className="p-4 border rounded-lg flex justify-between items-center bg-background hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.title}</h3>
                      <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      {pkg.endDate && <p className="text-xs text-destructive font-medium mt-1">Ends on: {format(pkg.endDate, 'PPP')}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xl font-bold text-foreground">${pkg.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {event.faq?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {event.faq.map((faqItem) => (
                    <AccordionItem key={faqItem.id} value={faqItem.id}>
                      <AccordionTrigger className='text-left'>{faqItem.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faqItem.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

           {event.termsAndConditions && (
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{event.termsAndConditions}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Event Gallery</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Image
                src={event.images.thumbnail}
                alt={`Thumbnail for ${event.title}`}
                width={400}
                height={300}
                className="rounded-lg object-cover w-full h-auto"
                data-ai-hint="event thumbnail"
              />
              <Image
                src={event.images.square}
                alt={`Square image for ${event.title}`}
                width={400}
                height={400}
                className="rounded-lg object-cover w-full h-auto"
                data-ai-hint="event photo"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RegistrationButton event={event} />

          <Card>
            <CardContent className="pt-6 space-y-4">
               <div className="flex items-center gap-4">
                 <CalendarDays className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                 <span className="font-medium">{format(event.date, 'PPP')}</span>
               </div>
               <div className="flex items-center gap-4">
                 <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                 <span className="font-medium">{event.location}</span>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </CardContent>
          </Card>

          {event.amenities?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-4">
                    {amenityIcons[amenity]}
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
