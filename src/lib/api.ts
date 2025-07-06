// API Configuration - Centralized configuration for all API calls
// This file automatically handles local vs production environments

import { CURRENT_ENV } from '../../config/environment';

// Base URL configuration with automatic environment detection
export const API_BASE_URL = (() => {
  // Priority order for API URL:
  // 1. Environment variable (for production deployment)
  // 2. Environment configuration file
  // 3. Fallback to localhost
  
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // Use environment configuration
  return CURRENT_ENV.API_BASE_URL;
})();

// API Endpoints - Centralized for easy maintenance
export const API_ENDPOINTS = {
  // Events
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/events/slug/${slug}`,
  EVENT_BY_ID: (id: string) => `${API_BASE_URL}/api/events/${id}`,
  EVENTS_BY_HOST: (hostId: string) => `${API_BASE_URL}/api/events/host/${hostId}`,
  EVENTS_BY_HOST_STATS: (hostId: string) => `${API_BASE_URL}/api/events/host/${hostId}/stats`,
  EVENTS_BY_HOST_YEARLY: (hostId: string) => `${API_BASE_URL}/api/events/host/${hostId}/yearly`,
  EVENTS_FILTERED: `${API_BASE_URL}/api/events/filtered`,
  EVENTS_UPCOMING_ONGOING: `${API_BASE_URL}/api/events/upcoming-ongoing`,
  EVENT_REGISTER: (eventId: string) => `${API_BASE_URL}/api/events/${eventId}/register`,
  EVENT_BOOKINGS: (eventId: string) => `${API_BASE_URL}/api/events/${eventId}/bookings`,
  
  // Bookings
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  BOOKING_BY_SNO: (sno: string) => `${API_BASE_URL}/api/bookings/sno/${sno}`,
  BOOKING_SCAN: (sno: string) => `${API_BASE_URL}/api/bookings/sno/${sno}/scan`,
  BOOKINGS_BY_HOST: (hostId: string) => `${API_BASE_URL}/api/bookings/host/${hostId}`,
  
  // Hosts
  HOSTS: `${API_BASE_URL}/api/hosts`,
  HOST_LOGIN: `${API_BASE_URL}/api/hosts/login`,
  
  // Categories
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  CATEGORY_BY_ID: (id: string) => `${API_BASE_URL}/api/categories/${id}`,
  
  // Amenities
  AMENITIES: `${API_BASE_URL}/api/amenities`,
  AMENITY_BY_ID: (id: string) => `${API_BASE_URL}/api/amenities/${id}`,
  
  // Transactions
  HITPAY_TRANSACTIONS: `${API_BASE_URL}api/hitpay-transactions/`,
  
  // Media files
  MEDIA: `${API_BASE_URL}/media`,
} as const;

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
  }
  return response.json() as Promise<T>;
}

// Helper function to create API request options
export function createApiRequestOptions(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', body?: any, additionalHeaders?: Record<string, string>) {
  const options: RequestInit = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
    cache: 'no-store', // Ensure fresh data
  };
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  return options;
}

// Debug information (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    environment: CURRENT_ENV.DESCRIPTION,
    apiBaseUrl: API_BASE_URL,
    nodeEnv: process.env.NODE_ENV,
  });
} 