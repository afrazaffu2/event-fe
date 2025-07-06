# 🎉 Environment Setup Complete!

Your Event Management System now has a **centralized API configuration system** that makes it easy to switch between local and production environments.

## ✅ What's Been Implemented

### 1. **Centralized API Configuration** (`src/lib/api.ts`)
- ✅ Automatic environment detection
- ✅ Centralized API endpoints
- ✅ Helper functions for API requests
- ✅ Debug logging in development

### 2. **Environment Configuration** (`config/environment.ts`)
- ✅ Easy switching between LOCAL, PRODUCTION, and CUSTOM environments
- ✅ Centralized URL management
- ✅ Environment-specific settings

### 3. **Deployment Script** (`scripts/deploy.js`)
- ✅ One-command environment switching
- ✅ Status checking
- ✅ Helpful feedback and instructions

### 4. **API Testing Script** (`scripts/test-api.js`)
- ✅ Connectivity testing
- ✅ Environment validation
- ✅ Troubleshooting guidance

### 5. **Updated Services**
- ✅ `eventService.ts` - Uses centralized API
- ✅ `bookingService.ts` - Uses centralized API  
- ✅ `hostService.ts` - Uses centralized API
- ✅ `auth-context.tsx` - Uses centralized API

### 6. **Updated Components**
- ✅ Registration forms use centralized API
- ✅ Payment success page uses centralized API
- ✅ Schedule table uses centralized API

## 🚀 How to Use

### Quick Commands

```bash
# Switch to local development
npm run env:local

# Switch to production
npm run env:production

# Check current environment
npm run env:status

# Test API connectivity
npm run test:api

# Start development with local environment
npm run dev:local

# Start development with production environment
npm run dev:production
```

### Manual Environment Switching

```bash
# Using the deployment script directly
node scripts/deploy.js local
node scripts/deploy.js production
node scripts/deploy.js custom
node scripts/deploy.js status
```

## 🌍 Environment Configurations

### Local Development
- **API URL**: `http://localhost:8000`
- **Frontend URL**: `http://localhost:3000`
- **Use Case**: Development and testing

### Production
- **API URL**: `http://192.168.1.95:8000`
- **Frontend URL**: `http://192.168.1.95:9002`
- **Use Case**: Network deployment

### Custom
- **API URL**: `http://your-custom-ip:8000`
- **Frontend URL**: `http://your-custom-ip:9002`
- **Use Case**: Custom server setup

## 🔧 Configuration Priority

The system uses this priority order for API URLs:

1. **Environment Variable** (`NEXT_PUBLIC_API_BASE_URL`) - Highest priority
2. **Environment Configuration** (`config/environment.ts`)
3. **Fallback** (`http://localhost:8000`) - Lowest priority

## 📋 Available API Endpoints

All endpoints are now centralized in `API_ENDPOINTS`:

```typescript
// Events
API_ENDPOINTS.EVENTS                    // GET /api/events
API_ENDPOINTS.EVENT_BY_SLUG(slug)       // GET /api/events/slug/{slug}
API_ENDPOINTS.EVENT_BY_ID(id)           // GET /api/events/{id}
API_ENDPOINTS.EVENT_REGISTER(eventId)   // POST /api/events/{id}/register

// Bookings
API_ENDPOINTS.BOOKINGS                  // GET /api/bookings
API_ENDPOINTS.BOOKING_BY_SNO(sno)       // GET /api/bookings/sno/{sno}
API_ENDPOINTS.BOOKING_SCAN(sno)         // POST /api/bookings/sno/{sno}/scan

// Hosts
API_ENDPOINTS.HOSTS                     // GET /api/hosts
API_ENDPOINTS.HOST_LOGIN                // POST /api/hosts/login
```

## 🛠️ Helper Functions

### Standardized API Requests
```typescript
import { API_ENDPOINTS, createApiRequestOptions, handleApiResponse } from '@/lib/api';

// GET request
const res = await fetch(API_ENDPOINTS.EVENTS, createApiRequestOptions('GET'));
const events = await handleApiResponse<Event[]>(res);

// POST request
const res = await fetch(API_ENDPOINTS.EVENT_REGISTER(eventId), 
  createApiRequestOptions('POST', { user_name: 'John', email: 'john@example.com' }));
const booking = await handleApiResponse<Booking>(res);
```

## 🔍 Debug Information

In development mode, you'll see helpful debug information in the browser console:

```
🔧 API Configuration: {
  environment: "Local Development Environment",
  apiBaseUrl: "http://localhost:8000",
  isDevelopment: true,
  isProduction: false
}
```

## 📝 Migration Guide

If you have existing code with hardcoded URLs, replace them:

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

## 🚨 Troubleshooting

### Common Issues

1. **API calls failing after environment switch**
   - Restart your development server
   - Clear browser cache
   - Check console for environment logs

2. **Wrong API URL being used**
   - Run `npm run env:status` to check current environment
   - Verify `config/environment.ts` has correct `ACTIVE_ENVIRONMENT`

3. **Environment variable not working**
   - Ensure variable name is `NEXT_PUBLIC_API_BASE_URL`
   - Restart development server after setting environment variable

### Testing Your Setup

```bash
# Test API connectivity
npm run test:api

# Check current environment
npm run env:status

# Switch to local and test
npm run env:local
npm run test:api
```

## 🎯 Next Steps

1. **Test the setup**: Run `npm run test:api` to verify connectivity
2. **Switch environments**: Try `npm run env:local` and `npm run env:production`
3. **Update IP addresses**: Edit `config/environment.ts` with your actual production IPs
4. **Deploy**: Use `npm run env:production` before deploying to production

## 📚 Documentation

- **API Configuration Guide**: `API_CONFIGURATION.md`
- **Network Setup**: `NETWORK_SETUP.md` (existing)
- **Environment Configuration**: `config/environment.ts`

---

🎉 **Congratulations!** Your Event Management System now has a robust, centralized API configuration system that makes environment switching effortless! 