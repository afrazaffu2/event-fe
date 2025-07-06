import type { Event, Host, EventCategory, Amenity, EventStatus, EventType, Booking } from '@/types';

export const eventCategories: EventCategory[] = ['Technology', 'Business', 'Arts', 'Health', 'Community'];
export const amenities: Amenity[] = ['Wi-Fi', 'Parking', 'Food', 'Drinks', 'AC'];
export const eventStatuses: EventStatus[] = ['Upcoming', 'Ongoing', 'Completed', 'Draft'];
export const eventTypes: EventType[] = ['Conference', 'Webinar', 'Meetup', 'Workshop', 'Other'];

export let hosts: Host[] = [
  { id: 'host-1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: 'host-2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 'host-3', name: 'AI Events Corp', email: 'contact@aievents.com' },
];

export let events: Event[] = [
    {
        id: '1',
        slug: 'global-tech-summit-2024',
        title: 'Global Tech Summit 2024',
        description: 'Join us for the largest tech summit of the year, bringing together innovators, developers, and leaders from around the globe.',
        tags: ['AI', 'Cloud', 'DevOps'],
        category: 'Technology',
        faq: [
            { id: 'faq-1', question: 'Is this event online or in-person?', answer: 'This is a hybrid event. You can attend in-person or online.' },
            { id: 'faq-2', question: 'What is the dress code?', answer: 'Business casual is recommended.' }
        ],
        termsAndConditions: 'Tickets are non-refundable. The event schedule is subject to change.',
        amenities: ['Wi-Fi', 'Food', 'Parking'],
        images: {
            cover: 'https://placehold.co/1200x400.png',
            thumbnail: 'https://placehold.co/400x300.png',
            square: 'https://placehold.co/400x400.png',
        },
        isPublished: true,
        packages: [
            { id: 'pkg-1', title: 'General Admission', description: 'Access to all talks and networking events.', price: 199 },
            { id: 'pkg-2', title: 'VIP Pass', description: 'Includes front-row seats and exclusive swag.', price: 499, endDate: new Date('2024-09-01') }
        ],
        assignedHostIds: ['host-1'],
        additionalMembersConfig: { mode: 'pax' },
        foodPreferenceConfig: { enabled: true, options: ['Vegetarian', 'Non-Vegetarian', 'Vegan'] },
        date: new Date('2024-09-15T09:00:00'),
        location: 'San Francisco, CA',
        status: 'Upcoming',
        type: 'Conference',
    },
    {
        id: '2',
        slug: 'advanced-react-workshop',
        title: 'Advanced React Workshop',
        description: 'A deep-dive workshop into advanced React patterns, hooks, and performance optimization techniques.',
        tags: ['React', 'Frontend', 'JavaScript'],
        category: 'Technology',
        faq: [],
        termsAndConditions: 'All sales are final.',
        amenities: ['Wi-Fi', 'Drinks'],
        images: {
            cover: 'https://placehold.co/1200x400.png',
            thumbnail: 'https://placehold.co/400x300.png',
            square: 'https://placehold.co/400x400.png',
        },
        isPublished: true,
        packages: [
            { id: 'pkg-3', title: 'Workshop Ticket', description: 'Full-day workshop access.', price: 249 }
        ],
        assignedHostIds: ['host-2'],
        additionalMembersConfig: { mode: 'none' },
        foodPreferenceConfig: { enabled: false, options: [] },
        date: new Date('2024-07-25T10:00:00'),
        location: 'Online',
        status: 'Upcoming',
        type: 'Workshop',
    },
    {
        id: '3',
        slug: 'local-devs-meetup',
        title: 'Local Devs Meetup',
        description: 'A casual meetup for local developers to connect, share ideas, and network.',
        tags: ['Community', 'Networking'],
        category: 'Community',
        faq: [],
        termsAndConditions: '',
        amenities: ['Drinks'],
        images: {
            cover: 'https://placehold.co/1200x400.png',
            thumbnail: 'https://placehold.co/400x300.png',
            square: 'https://placehold.co/400x400.png',
        },
        isPublished: true,
        packages: [],
        assignedHostIds: ['host-1'],
        additionalMembersConfig: { mode: 'none' },
        foodPreferenceConfig: { enabled: false, options: [] },
        date: new Date('2024-06-30T18:00:00'),
        location: 'Community Hub, Downtown',
        status: 'Completed',
        type: 'Meetup',
    }
];


export const bookings: Booking[] = [
  {
    id: 'booking-1',
    sno: 'GTS24-001',
    eventId: '1',
    eventName: 'Global Tech Summit 2024',
    eventDate: 'Sep 15, 2024',
    eventTime: '09:00 AM',
    userName: 'Alice Johnson',
    email: 'alice@example.com',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking-1',
    is_activated: false,
  },
  {
    id: 'booking-2',
    sno: 'GTS24-002',
    eventId: '1',
    eventName: 'Global Tech Summit 2024',
    eventDate: 'Sep 15, 2024',
    eventTime: '09:00 AM',
    userName: 'Bob Williams',
    email: 'bob@example.com',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking-2',
    is_activated: true,
  },
  {
    id: 'booking-3',
    sno: 'ARW24-001',
    eventId: '2',
    eventName: 'Advanced React Workshop',
    eventDate: 'Jul 25, 2024',
    eventTime: '10:00 AM',
    userName: 'Charlie Brown',
    email: 'charlie@example.com',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking-3',
    is_activated: false,
  },
  {
    id: 'booking-4',
    sno: 'LDM24-001',
    eventId: '3',
    eventName: 'Local Devs Meetup',
    eventDate: 'Jun 30, 2024',
    eventTime: '06:00 PM',
    userName: 'Diana Prince',
    email: 'diana@example.com',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking-4',
    is_activated: false,
  },
  {
    id: 'booking-5',
    sno: 'C-001',
    eventId: '1',
    eventName: 'Global Tech Summit 2024',
    eventDate: 'Sep 15, 2024',
    eventTime: '09:00 AM',
    userName: 'Emma Wilson',
    email: 'emma@example.com',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=booking-5',
    is_activated: false,
  },
];


// The following data is no longer used but kept to avoid breaking imports in unused files.
export const categories = [
  { value: 'housing', label: 'Housing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'food', label: 'Food' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'personal', label: 'Personal Spending' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'savings', label: 'Savings' },
];
export const budgets = [
  {
    id: 'budget-1',
    category: 'housing',
    amount: 1500,
    spent: 1200,
  },
  {
    id: 'budget-2',
    category: 'food',
    amount: 500,
    spent: 450,
  },
  {
    id: 'budget-3',
    category: 'entertainment',
    amount: 200,
    spent: 150,
  },
];
export const schedules = [
  { id: 'schedule-1', name: 'Rent', amount: 1500, date: '2024-07-01' },
  { id: 'schedule-2', name: 'Electricity Bill', amount: 150, date: '2024-07-15' },
];
export const transactions = [
  { id: 'txn-1', date: '2024-07-01', amount: -1500, category: 'housing', description: 'Monthly Rent' },
  { id: 'txn-2', date: '2024-07-03', amount: -50, category: 'food', description: 'Groceries' },
  { id: 'txn-3', date: '2024-07-05', amount: -20, category: 'entertainment', description: 'Movie Tickets' },
  { id: 'txn-4', date: '2024-07-08', amount: 2000, category: 'income', description: 'Salary' },
  { id: 'txn-5', date: '2024-07-10', amount: -30, category: 'transportation', description: 'Gas' },
  { id: 'txn-6', date: '2024-07-12', amount: -40, category: 'food', description: 'Eating out' },
];
