import type { Event } from '@/types';
import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from '@/lib/api';

export async function getEvents(): Promise<Event[]> {
  const res = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('GET'));
  return handleApiResponse<Event[]>(res);
}

export async function getFilteredEvents(params: {
  filter?: 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'custom';
  host_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<Event[]> {
  const searchParams = new URLSearchParams();
  
  if (params.filter) {
    searchParams.append('filter', params.filter);
  }
  if (params.host_id) {
    searchParams.append('host_id', params.host_id);
  }
  if (params.start_date) {
    searchParams.append('start_date', params.start_date);
  }
  if (params.end_date) {
    searchParams.append('end_date', params.end_date);
  }
  
  const url = `${API_ENDPOINTS.EVENTS_FILTERED}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const res = await fetch(url, createApiRequestOptions('GET'));
  return handleApiResponse<Event[]>(res);
}

export async function getEvent(id: string): Promise<Event> {
  const res = await fetch(API_ENDPOINTS.EVENT_BY_ID(id), createApiRequestOptions('GET'));
  return handleApiResponse<Event>(res);
}

export async function createEvent(eventData: Partial<Event>): Promise<Event> {
  const res = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('POST', eventData));
  return handleApiResponse<Event>(res);
}

// Alias for backward compatibility
export const addEvent = createEvent;

export async function addEventWithImages(eventData: Partial<Event>, images?: {
  cover?: File;
  thumbnail?: File;
  square?: File;
}): Promise<Event> {
  const formData = new FormData();
  
  // Add all event data as JSON string
  const eventDataWithoutImages = { ...eventData };
  delete (eventDataWithoutImages as any).images;
  formData.append('data', JSON.stringify(eventDataWithoutImages));
  
  // Add image files if provided
  if (images) {
    if (images.cover) {
      formData.append('cover', images.cover);
    }
    if (images.thumbnail) {
      formData.append('thumbnail', images.thumbnail);
    }
    if (images.square) {
      formData.append('square', images.square);
    }
  }
  
  const res = await fetch(API_ENDPOINTS.EVENTS, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: formData,
  });
  return handleApiResponse<Event>(res);
}

export async function updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
  const res = await fetch(API_ENDPOINTS.EVENT_BY_ID(id), createApiRequestOptions('PUT', eventData));
  return handleApiResponse<Event>(res);
}

export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(API_ENDPOINTS.EVENT_BY_ID(id), createApiRequestOptions('DELETE'));
  if (!res.ok) {
    throw new Error(`Failed to delete event: ${res.status} ${res.statusText}`);
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(API_ENDPOINTS.EVENT_BY_SLUG(slug), createApiRequestOptions('GET'));
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    return await res.json() as Event;
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return null;
  }
}

export async function getRelatedEvents(currentEvent: Event): Promise<Event[]> {
  const events = await getEvents();
  const related = events.filter(
    (event) =>
      event.id !== currentEvent.id &&
      (event.category === currentEvent.category ||
        event.tags.some((tag) => currentEvent.tags.includes(tag)))
  );
  return related.slice(0, 4);
}

export async function getEventsByHost(hostId: string): Promise<Event[]> {
  const res = await fetch(API_ENDPOINTS.EVENTS_BY_HOST(hostId), createApiRequestOptions('GET'));
  return handleApiResponse<Event[]>(res);
}

export async function getEventStatsByHost(hostId: string): Promise<{ total: number; ongoing: number; upcoming: number }> {
  const res = await fetch(API_ENDPOINTS.EVENTS_BY_HOST_STATS(hostId), createApiRequestOptions('GET'));
  return handleApiResponse(res);
}

export async function getYearlyEventCountByHost(hostId: string): Promise<{ year: number; count: number }[]> {
  const res = await fetch(API_ENDPOINTS.EVENTS_BY_HOST_YEARLY(hostId), createApiRequestOptions('GET'));
  return handleApiResponse(res);
}

export async function getUpcomingOngoingEvents(): Promise<Event[]> {
  const res = await fetch(API_ENDPOINTS.EVENTS_UPCOMING_ONGOING, createApiRequestOptions('GET'));
  return handleApiResponse<Event[]>(res);
} 