// Environment Configuration
// This file allows easy switching between local and production environments

const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://192.168.7.20:8000', // Local Development Backend URL
    FRONTEND_URL: 'http://192.168.7.20:9002', // Local Development Frontend URL
    DESCRIPTION: 'Local Development Environment',
  },
  production: {
    API_BASE_URL: 'https://backend-rxua.onrender.com', // Production Backend URL
    FRONTEND_URL: 'https://event-fe.onrender.com', // Production Frontend URL
    DESCRIPTION: 'Production Environment',
  },
  custom: {
    API_BASE_URL: 'https://backend-rxua.onrender.com', // Alternative Production Backend URL
    FRONTEND_URL: 'https://event-fe.onrender.com', // Production Frontend URL
    DESCRIPTION: 'Alternative Production Environment',
  },
};

// Set the active environment (change this to switch environments)
const ACTIVE_ENVIRONMENT: keyof typeof ENVIRONMENTS = 'production';

// Get current environment configuration
export const getCurrentEnv = () => {
  return ENVIRONMENTS[ACTIVE_ENVIRONMENT];
};

// Export current environment
export const CURRENT_ENV = getCurrentEnv();

// Debug information
if (typeof window !== 'undefined') {
  console.log('🌍 Environment Configuration:', {
    active: ACTIVE_ENVIRONMENT,
    config: CURRENT_ENV,
  });
}
