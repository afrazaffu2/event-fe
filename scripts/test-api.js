#!/usr/bin/env node

/**
 * API Configuration Test Script
 * 
 * This script tests the current API configuration and connectivity
 * 
 * Usage:
 *   node scripts/test-api.js
 */

const https = require('https');
const http = require('http');

// Import the environment configuration
const envConfigPath = require.resolve('../config/environment.ts');
const envConfigContent = require('fs').readFileSync(envConfigPath, 'utf8');

// Extract the active environment
const activeEnvMatch = envConfigContent.match(/export const ACTIVE_ENVIRONMENT = ['"`]([^'"`]*)['"`];/);
const activeEnv = activeEnvMatch ? activeEnvMatch[1] : 'LOCAL';

// Extract API URL from the config
const apiUrlMatch = envConfigContent.match(new RegExp(`${activeEnv}:\\s*{[^}]*API_BASE_URL:\\s*['"`]([^'"`]*)['"`]`));
const apiUrl = apiUrlMatch ? apiUrlMatch[1] : 'http://localhost:8000';

console.log('🧪 API Configuration Test');
console.log('========================');
console.log(`🌍 Active Environment: ${activeEnv}`);
console.log(`🌐 API URL: ${apiUrl}`);
console.log('');

// Test API connectivity
function testApiConnection(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const testUrl = `${url}/api/events`;
    
    console.log(`🔍 Testing: ${testUrl}`);
    
    const req = protocol.get(testUrl, (res) => {
      console.log(`✅ Status: ${res.statusCode} ${res.statusMessage}`);
      if (res.statusCode === 200) {
        console.log('🎉 API is accessible and responding!');
      } else {
        console.log('⚠️  API responded but with unexpected status');
      }
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      console.log('💡 Make sure your backend server is running');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('⏰ Timeout: API request took too long');
      req.destroy();
      resolve(false);
    });
  });
}

// Test environment variable override
function testEnvironmentVariable() {
  const envVar = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envVar) {
    console.log(`🔧 Environment Variable Override: ${envVar}`);
    console.log('📝 Note: Environment variable takes priority over config file');
  } else {
    console.log('🔧 No environment variable override found');
  }
  console.log('');
}

// Run tests
async function runTests() {
  testEnvironmentVariable();
  
  console.log('🚀 Testing API Connectivity...');
  const success = await testApiConnection(apiUrl);
  
  console.log('');
  if (success) {
    console.log('✅ All tests passed! Your API configuration is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check your configuration.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure your backend server is running');
    console.log('2. Check if the API URL is correct');
    console.log('3. Verify network connectivity');
    console.log('4. Try switching environments: node scripts/deploy.js local');
  }
}

runTests(); 