import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from '@/lib/api';

export interface Amenity {
  id: number;
  title: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export async function getAmenities(): Promise<Amenity[]> {
  const res = await fetch(API_ENDPOINTS.AMENITIES, createApiRequestOptions('GET'));
  return handleApiResponse<Amenity[]>(res);
}

export async function getAmenity(id: string): Promise<Amenity> {
  const res = await fetch(API_ENDPOINTS.AMENITY_BY_ID(id), createApiRequestOptions('GET'));
  return handleApiResponse<Amenity>(res);
}

export async function createAmenity(amenityData: Partial<Amenity>): Promise<Amenity> {
  const res = await fetch(API_ENDPOINTS.AMENITIES, createApiRequestOptions('POST', amenityData));
  return handleApiResponse<Amenity>(res);
}

export async function updateAmenity(id: string, amenityData: Partial<Amenity>): Promise<Amenity> {
  const res = await fetch(API_ENDPOINTS.AMENITY_BY_ID(id), createApiRequestOptions('PUT', amenityData));
  return handleApiResponse<Amenity>(res);
}

export async function deleteAmenity(id: string): Promise<void> {
  const res = await fetch(API_ENDPOINTS.AMENITY_BY_ID(id), createApiRequestOptions('DELETE'));
  if (!res.ok) {
    throw new Error(`Failed to delete amenity: ${res.status} ${res.statusText}`);
  }
} 