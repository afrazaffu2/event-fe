#!/usr/bin/env node

/**
 * Deployment Script for Event Management System
 * 
 * This script helps you easily switch between local and production environments
 * 
 * Usage:
 *   node scripts/deploy.js local     - Switch to local development
 *   node scripts/deploy.js production - Switch to production deployment
 *   node scripts/deploy.js custom     - Switch to custom environment
 */

const fs = require('fs');
const path = require('path');

const ENV_CONFIG_PATH = path.join(__dirname, '../config/environment.ts');

// Environment configurations
const ENVIRONMENTS = {
  LOCAL: {
    name: 'LOCAL',
    description: 'Local Development Environment',
    apiUrl: 'https://event-management-be-2.onrender.com',
    frontendUrl: 'https://event-management-fe.onrender.com'
  },
  PRODUCTION: {
    name: 'PRODUCTION',
    description: 'Production Environment',
    apiUrl: 'https://event-management-be-2.onrender.com',
    frontendUrl: 'https://event-management-fe.onrender.com'
  },
  CUSTOM: {
    name: 'CUSTOM',
    description: 'Custom Environment',
    apiUrl: 'https://event-management-be-2.onrender.com',
    frontendUrl: 'https://event-management-fe.onrender.com'
  }
};

function updateEnvironmentConfig(targetEnv) {
  const env = ENVIRONMENTS[targetEnv.toUpperCase()];
  
  if (!env) {
    console.error(`❌ Invalid environment: ${targetEnv}`);
    console.log('Available environments: local, production, custom');
    process.exit(1);
  }

  // Read current config
  let configContent = fs.readFileSync(ENV_CONFIG_PATH, 'utf8');
  
  // Update the active environment
  configContent = configContent.replace(
    /export const ACTIVE_ENVIRONMENT = ['"`][^'"`]*['"`];/,
    `export const ACTIVE_ENVIRONMENT = '${env.name}';`
  );
  
  // Write updated config
  fs.writeFileSync(ENV_CONFIG_PATH, configContent);
  
  console.log(`✅ Successfully switched to ${env.description}`);
  console.log(`🌐 API URL: ${env.apiUrl}`);
  console.log(`🎨 Frontend URL: ${env.frontendUrl}`);
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. Clear browser cache if needed');
  console.log('3. Test your API connections');
}

function showCurrentEnvironment() {
  const configContent = fs.readFileSync(ENV_CONFIG_PATH, 'utf8');
  const match = configContent.match(/export const ACTIVE_ENVIRONMENT = ['"`]([^'"`]*)['"`];/);
  
  if (match) {
    const currentEnv = ENVIRONMENTS[match[1]];
    if (currentEnv) {
      console.log(`🌍 Current Environment: ${currentEnv.description}`);
      console.log(`🌐 API URL: ${currentEnv.apiUrl}`);
      console.log(`🎨 Frontend URL: ${currentEnv.frontendUrl}`);
    } else {
      console.log(`🌍 Current Environment: ${match[1]} (unknown)`);
    }
  } else {
    console.log('❌ Could not determine current environment');
  }
}

function showHelp() {
  console.log(`
🚀 Event Management System - Deployment Script

Usage:
  node scripts/deploy.js <environment>

Environments:
  local       - Switch to local development (localhost:8000)
  production  - Switch to production deployment (https://event-management-be-2.onrender.com)
  custom      - Switch to custom environment (edit config/environment.ts first)
  status      - Show current environment configuration

Examples:
  node scripts/deploy.js local
  node scripts/deploy.js production
  node scripts/deploy.js status

Note: After switching environments, restart your development server.
  `);
}

// Main script logic
const targetEnv = process.argv[2];

if (!targetEnv || targetEnv === 'help' || targetEnv === '--help' || targetEnv === '-h') {
  showHelp();
} else if (targetEnv === 'status') {
  showCurrentEnvironment();
} else {
  updateEnvironmentConfig(targetEnv);
} 