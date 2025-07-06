'use client';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
// Define event statuses and types locally since mock-data was removed
const eventStatuses = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Upcoming', label: 'Upcoming' },
  { value: 'Ongoing', label: 'Ongoing' },
  { value: 'Completed', label: 'Completed' }
];

const eventTypes = [
  { value: 'Conference', label: 'Conference' },
  { value: 'Webinar', label: 'Webinar' },
  { value: 'Meetup', label: 'Meetup' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Other', label: 'Other' }
];

const eventCategories = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Business', label: 'Business' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Health', label: 'Health' },
  { value: 'Community', label: 'Community' }
];

const allAmenities = [
  { id: '1', title: 'Wi-Fi', location: 'Venue' },
  { id: '2', title: 'Parking', location: 'Venue' },
  { id: '3', title: 'Catering', location: 'Venue' },
  { id: '4', title: 'Audio/Video', location: 'Venue' },
  { id: '5', title: 'Transportation', location: 'Venue' }
];
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { addEvent } from '@/services/eventService';
import { getHosts } from '@/services/hostService';
import type { Host } from '@/types';
import { useState, useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Event title must be at least 3 characters.' }),
  description: z.string().optional(),
  date: z.date(),
  location: z.string().min(2, { message: 'Location is required.' }),
  type: z.string().min(1, 'Please select an event type.'),
  status: z.string().min(1, 'Please select a status.'),
  assignedHostId: z.string().min(1, 'Please assign a host.'),
  isPublished: z.boolean().default(false),
  category: z.string().min(1, 'Please select a category.'),
  tags: z.string().min(1, { message: 'Please enter at least one tag.' }), // Comma-separated
  amenities: z.array(z.string()).optional(),
  images: z.object({
    cover: z.any().optional(),
    thumbnail: z.any().optional(),
    square: z.any().optional(),
  }),
  packages: z.array(z.object({
    title: z.string().min(1, 'Package title is required'),
    description: z.string().optional(),
    price: z.coerce.number().min(0, 'Price must be positive'),
    limit: z.coerce.number().int().positive().optional(),
    endDate: z.date().optional(),
  })).optional(),
  additionalMembersConfig: z.object({
    mode: z.enum(['none', 'pax', 'type']),
  }),
  foodPreferenceConfig: z.object({
    enabled: z.boolean(),
    options: z.string().optional(), // Comma-separated
  }),
  faq: z.array(z.object({
    question: z.string().min(1, 'Question cannot be empty'),
    answer: z.string().min(1, 'Answer cannot be empty'),
  })).optional(),
  termsAndConditions: z.string().optional(),
});

type EventFormProps = {
  setOpen: (open: boolean) => void;
};

export function EventForm({ setOpen }: EventFormProps) {
  const { toast } = useToast();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    async function fetchHosts() {
      const fetchedHosts = await getHosts();
      setHosts(fetchedHosts);
    }
    fetchHosts();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date(),
      location: '',
      status: 'Draft',
      isPublished: false,
      tags: '',
      amenities: [],
      packages: [],
      additionalMembersConfig: { mode: 'none' },
      foodPreferenceConfig: { enabled: false, options: '' },
      faq: [],
      termsAndConditions: '',
      type: '',
      category: '',
      assignedHostId: '',
    },
  });

  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({
    control: form.control,
    name: 'faq',
  });

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control: form.control,
    name: 'packages',
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const preparedData = {
        ...values,
        tags: values.tags.split(',').map(tag => tag.trim()).filter(t => t),
        amenities: values.amenities || [],
        packages: values.packages?.map(p => ({...p, id: Math.random().toString() })) || [],
        faq: values.faq?.map(f => ({...f, id: Math.random().toString() })) || [],
        images: {
            cover: 'https://placehold.co/1200x400.png',
            thumbnail: 'https://placehold.co/400x300.png',
            square: 'https://placehold.co/400x400.png',
        },
        assignedHostIds: [values.assignedHostId],
        foodPreferenceConfig: {
            ...values.foodPreferenceConfig,
            options: values.foodPreferenceConfig.options?.split(',').map(o => o.trim()).filter(o => o) || []
        }
      };
      
      // We are passing assignedHostIds, so we don't need assignedHostId
      const { assignedHostId, ...eventPayload } = preparedData;

      await addEvent(eventPayload as any); 

      toast({
        title: 'Event Created',
        description: `Event "${values.title}" has been created successfully.`,
      });
      setOpen(false);
    } catch (error) {
        console.error("Failed to create event:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not create event. Please try again.',
        });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl><Input placeholder="e.g., Annual Tech Conference" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Describe the event..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal',!field.value && 'text-muted-foreground')}>
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl><Input placeholder="e.g., Online or City Hall" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>{eventTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>{eventStatuses.map(status => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>
            <FormField
              control={form.control}
              name="assignedHostId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a host" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hosts.map((host) => (
                        <SelectItem key={host.id} value={host.id}>
                          {host.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="isPublished" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Publish Event</FormLabel>
                        <FormDescription>Make this event visible to the public.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
            )}/>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>{eventCategories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl><Input placeholder="ai, tech, future" {...field} /></FormControl>
                <FormDescription>Comma-separated tags for discoverability.</FormDescription>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="amenities" render={({ field }) => (
              <FormItem>
                <FormLabel>Amenities</FormLabel>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {allAmenities.map((item) => (
                    <FormField key={item.id} control={form.control} name="amenities" render={({ field }) => (
                      <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.title)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), item.title])
                                : field.onChange(field.value?.filter((value) => value !== item.title));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{item.title}</FormLabel>
                      </FormItem>
                    )}/>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}/>
          </TabsContent>
          
          <TabsContent value="media" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
              <FormField control={form.control} name="images.cover" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl><Input type="file" onChange={e => field.onChange(e.target.files?.[0])} disabled /></FormControl>
                  <FormDescription>Recommended dimensions: 1200x400px. File uploads are not yet supported.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="images.thumbnail" render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
                  <FormControl><Input type="file" onChange={e => field.onChange(e.target.files?.[0])} disabled /></FormControl>
                   <FormDescription>Recommended dimensions: 400x300px. File uploads are not yet supported.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="images.square" render={({ field }) => (
                <FormItem>
                  <FormLabel>Square Image</FormLabel>
                  <FormControl><Input type="file" onChange={e => field.onChange(e.target.files?.[0])} disabled /></FormControl>
                   <FormDescription>Recommended dimensions: 400x400px. File uploads are not yet supported.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}/>
          </TabsContent>

          <TabsContent value="packages" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <Card>
              <CardHeader>
                <CardTitle>Event Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {packageFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-2 border p-3 rounded-md">
                    <div className='flex-1 space-y-2'>
                        <FormField control={form.control} name={`packages.${index}.title`} render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} placeholder="e.g. Early Bird"/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`packages.${index}.description`} render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} placeholder="Package details"/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                           <FormField control={form.control} name={`packages.${index}.price`} render={({ field }) => (
                                <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g. 99.00"/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`packages.${index}.limit`} render={({ field }) => (
                                <FormItem><FormLabel>Ticket Limit</FormLabel><FormControl><Input type="number" {...field} placeholder="Optional"/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`packages.${index}.endDate`} render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Sale End Date</FormLabel>
                                    <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'PPP') : <span>Pick an end date (optional)</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </div>
                    <Button type="button" variant="destructive" size="icon" onClick={() => removePackage(index)}><Trash2 /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => appendPackage({ title: '', description: '', price: 0, limit: undefined, endDate: undefined })}>
                  <PlusCircle className="mr-2 h-4 w-4"/> Add Package
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="additionalMembersConfig.mode" render={({ field }) => (
                <FormItem>
                    <FormLabel>Additional Members</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a mode" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="none">Disabled</SelectItem>
                            <SelectItem value="pax">Pax Count</SelectItem>
                            <SelectItem value="type">Structured Input (Not implemented)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>Configure how attendees can add guests.</FormDescription>
                    <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="foodPreferenceConfig.enabled" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Enable Food Preferences</FormLabel>
                        <FormDescription>Ask attendees for their food preference.</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
            )}/>
            {form.watch('foodPreferenceConfig.enabled') && (
                 <FormField control={form.control} name="foodPreferenceConfig.options" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Food Options</FormLabel>
                      <FormControl><Input placeholder="e.g. Veg, Non-Veg, Vegan" {...field} /></FormControl>
                      <FormDescription>Comma-separated list of options.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}/>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-2">
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {faqFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 border p-3 rounded-md">
                            <div className="flex-1 space-y-2">
                                <FormField control={form.control} name={`faq.${index}.question`} render={({ field }) => (
                                    <FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                                )}/>
                                <FormField control={form.control} name={`faq.${index}.answer`} render={({ field }) => (
                                    <FormItem><FormLabel>Answer</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                                )}/>
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => removeFaq(index)}><Trash2 /></Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => appendFaq({ question: '', answer: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add FAQ
                    </Button>
                </CardContent>
            </Card>
            <FormField control={form.control} name="termsAndConditions" render={({ field }) => (
              <FormItem>
                <FormLabel>Terms & Conditions</FormLabel>
                <FormControl><Textarea placeholder="Enter event terms and conditions..." {...field} rows={5} /></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 gap-2">
          {activeTab !== 'general' && (
            <Button type="button" variant="outline" onClick={e => {
              e.preventDefault();
              const order = ['general','details','media','packages','config','content'];
              const idx = order.indexOf(activeTab);
              if (idx > 0) setActiveTab(order[idx-1]);
            }}>
              Previous
            </Button>
          )}
          {activeTab !== 'content' ? (
            <Button type="button" onClick={e => {
              e.preventDefault();
              const order = ['general','details','media','packages','config','content'];
              const idx = order.indexOf(activeTab);
              if (idx < order.length-1) setActiveTab(order[idx+1]);
            }}>
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
