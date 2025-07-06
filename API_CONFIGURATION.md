# API Configuration Guide

This guide explains how to use the centralized API configuration system for switching between local and production environments.

## 🚀 Quick Start

### For Local Development
```bash
node scripts/deploy.js local
npm run dev
```

### For Production Deployment
```bash
node scripts/deploy.js production
npm run build
npm start
```

## 📁 File Structure

```
frontend/
├── config/
│   └── environment.ts          # Environment configuration
├── src/
│   └── lib/
│       └── api.ts             # Centralized API configuration
├── scripts/
│   └── deploy.js              # Deployment script
└── API_CONFIGURATION.md       # This file
```

## 🔧 Configuration Files

### 1. Environment Configuration (`config/environment.ts`)

This file contains all environment-specific settings:

```typescript
export const ENV_CONFIG = {
  LOCAL: {
    API_BASE_URL: 'http://localhost:8000',
    FRONTEND_URL: 'http://localhost:3000',
    DESCRIPTION: 'Local Development Environment',
  },
  PRODUCTION: {
    API_BASE_URL: 'https://event-management-be-2.onrender.com',
    FRONTEND_URL: 'https://your-frontend-domain.com',
    DESCRIPTION: 'Production Environment',
  },
  CUSTOM: {
    API_BASE_URL: 'https://event-management-be-2.onrender.com',
    FRONTEND_URL: 'http://your-custom-ip:9002',
    DESCRIPTION: 'Custom Environment',
  },
};

export const ACTIVE_ENVIRONMENT = 'LOCAL'; // Change this to switch environments
```

### 2. API Configuration (`src/lib/api.ts`)

This file provides centralized API endpoints and utilities:

```typescript
import { CURRENT_ENV } from '../../config/environment';

export const API_BASE_URL = CURRENT_ENV.API_BASE_URL;

export const API_ENDPOINTS = {
  EVENTS: `${API_BASE_URL}/api/events`,
  EVENT_BY_SLUG: (slug: string) => `${API_BASE_URL}/api/events/slug/${slug}`,
  // ... more endpoints
};

export function createApiRequestOptions(method, body?, headers?) {
  // Standardized request options
}
```

## 🛠️ Usage

### Switching Environments

Use the deployment script to easily switch between environments:

```bash
# Switch to local development
node scripts/deploy.js local

# Switch to production
node scripts/deploy.js production

# Switch to custom environment
node scripts/deploy.js custom

# Check current environment
node scripts/deploy.js status
```

### Using API in Components

```typescript
import { API_ENDPOINTS, createApiRequestOptions, handleApiResponse } from '@/lib/api';

// Example API call
export async function getEvents() {
  const res = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('GET'));
  return handleApiResponse<Event[]>(res);
}
```

## 🌍 Environment Variables

You can also use environment variables for production deployment:

```bash
# Set environment variable
export NEXT_PUBLIC_API_BASE_URL=https://your-production-api.com

# Or in .env.local (for local development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

The system prioritizes:
1. Environment variables (`NEXT_PUBLIC_API_BASE_URL`)
2. Environment configuration file
3. Fallback to localhost

## 🔄 Migration from Old System

If you have existing code using hardcoded URLs, replace them:

### Before
```typescript
const API_BASE_URL = 'http://192.168.1.95:8000';
const response = await fetch(`${API_BASE_URL}/api/events`);
```

### After
```typescript
import { API_ENDPOINTS, createApiRequestOptions } from '@/lib/api';
const response = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('GET'));
```

## 📋 Available Endpoints

All API endpoints are centralized in `API_ENDPOINTS`:

- **Events**: `API_ENDPOINTS.EVENTS`
- **Event by Slug**: `API_ENDPOINTS.EVENT_BY_SLUG(slug)`
- **Event by ID**: `API_ENDPOINTS.EVENT_BY_ID(id)`
- **Bookings**: `API_ENDPOINTS.BOOKINGS`
- **Booking by SNO**: `API_ENDPOINTS.BOOKING_BY_SNO(sno)`
- **Hosts**: `API_ENDPOINTS.HOSTS`
- **Host Login**: `API_ENDPOINTS.HOST_LOGIN`

## 🚨 Troubleshooting

### Common Issues

1. **API calls failing after environment switch**
   - Restart your development server
   - Clear browser cache
   - Check console for environment configuration logs

2. **Wrong API URL being used**
   - Run `node scripts/deploy.js status` to check current environment
   - Verify `config/environment.ts` has correct `ACTIVE_ENVIRONMENT`

3. **Environment variable not working**
   - Ensure variable name is `NEXT_PUBLIC_API_BASE_URL`
   - Restart development server after setting environment variable

### Debug Information

The system logs debug information in development:

```javascript
// Check browser console for:
🔧 API Configuration: {
  environment: "Local Development Environment",
  apiBaseUrl: "http://localhost:8000",
  isDevelopment: true,
  isProduction: false
}
```

## 📝 Best Practices

1. **Always use centralized endpoints** - Don't hardcode URLs in components
2. **Use helper functions** - Use `createApiRequestOptions` and `handleApiResponse`
3. **Test both environments** - Verify local and production work before deploying
4. **Update IP addresses** - Keep production IP addresses current in `config/environment.ts`

## 🔗 Related Files

- `frontend/services/eventService.ts` - Updated to use centralized API
- `frontend/services/bookingService.ts` - Updated to use centralized API
- `frontend/services/hostService.ts` - Updated to use centralized API
- `frontend/contexts/auth-context.tsx` - Updated to use centralized API
- `frontend/next.config.ts` - Updated environment configuration 