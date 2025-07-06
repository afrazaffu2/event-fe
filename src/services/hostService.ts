import type { Host } from '@/types';
import { API_ENDPOINTS, handleApiResponse, createApiRequestOptions } from '@/lib/api';

export async function getHosts(): Promise<Host[]> {
  const res = await fetch(API_ENDPOINTS.HOSTS, createApiRequestOptions('GET'));
  return handleApiResponse<Host[]>(res);
}

export async function getHost(id: string): Promise<Host> {
  const res = await fetch(`${API_ENDPOINTS.HOSTS}/${id}`, createApiRequestOptions('GET'));
  return handleApiResponse<Host>(res);
}

export async function createHost(hostData: Partial<Host>): Promise<Host> {
  const res = await fetch(API_ENDPOINTS.HOSTS, createApiRequestOptions('POST', hostData));
  return handleApiResponse<Host>(res);
}

// Alias for backward compatibility
export const addHost = createHost;

export async function updateHost(id: string, hostData: Partial<Host>): Promise<Host> {
  const res = await fetch(`${API_ENDPOINTS.HOSTS}/${id}`, createApiRequestOptions('PUT', hostData));
  return handleApiResponse<Host>(res);
}

export async function deleteHost(id: string): Promise<void> {
  const res = await fetch(`${API_ENDPOINTS.HOSTS}/${id}`, createApiRequestOptions('DELETE'));
  if (!res.ok) {
    throw new Error(`Failed to delete host: ${res.status} ${res.statusText}`);
  }
}

export async function hostLogin(email: string, password: string): Promise<Host> {
  const res = await fetch(API_ENDPOINTS.HOST_LOGIN, createApiRequestOptions('POST', { email, password }));
  return handleApiResponse<Host>(res);
} 