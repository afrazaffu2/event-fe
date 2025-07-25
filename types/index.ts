export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Draft';
export type EventType = 'Conference' | 'Webinar' | 'Meetup' | 'Workshop' | 'Other';
export type EventCategory = 'Technology' | 'Business' | 'Arts' | 'Health' | 'Community';
export type Amenity = 'Wi-Fi' | 'Parking' | 'Food' | 'Drinks' | 'AC';
export type EventTag = string;

export type FAQ = {
  id: string;
  question: string;
  answer: string;
};

export type User = {
  email: string;
  role: 'admin' | 'host';
};

export type Package = {
  id: string;
  title: string;
  description: string;
  limit?: number;
  price: number;
  endDate?: Date;
};

export type Host = {
  id: string;
  name: string;
  email: string;
};

export type AdditionalMembersConfig = {
  mode: 'pax' | 'type' | 'none';
  fields?: { id: string; name: string; type: 'string' | 'number' | 'select'; options?: string[] }[];
};

export type FoodPreferenceConfig = {
  enabled: boolean;
  options: string[];
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string; // Supports rich text
  tags: EventTag[];
  category: EventCategory;
  faq: FAQ[];
  termsAndConditions: string;
  amenities: Amenity[];
  images: {
    cover: string;
    thumbnail: string;
    square: string;
  };
  isPublished: boolean;
  packages: Package[];
  assignedHostIds: string[];
  additionalMembersConfig: AdditionalMembersConfig;
  foodPreferenceConfig: FoodPreferenceConfig;
  date: Date;
  location: string;
  status: EventStatus;
  type: EventType;
};

export type Booking = {
  id: string;
  sno: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  userName: string;
  email: string;
  qrCodeUrl: string;
  is_activated: boolean;
};


export type Transaction = {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
};
export type Budget = {
  id: string;
  category: string;
  amount: number;
  spent: number;
};
export type Schedule = {
  id: string;
  name: string;
  amount: number;
  date: string;
};
