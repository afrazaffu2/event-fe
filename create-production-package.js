#!/usr/bin/env node

/**
 * Create Production Package for Netlify Deployment
 * This script copies only the necessary files for production deployment
 */

const fs = require('fs');
const path = require('path');

const sourceDir = __dirname;
const targetDir = path.join(__dirname, 'production-build');

// Files and folders to copy for production
const filesToCopy = [
  // Build output (CRITICAL)
  '.next',
  
  // Configuration files
  'package.json',
  'package-lock.json',
  'next.config.ts',
  'netlify.toml',
  'tailwind.config.ts',
  'tsconfig.json',
  'postcss.config.mjs',
  'next-env.d.ts',
  'components.json',
  'ecosystem.config.js',
  
  // Source code
  'src',
  'components',
  'config',
  'contexts',
  'hooks',
  'lib',
  'services',
  'types',
  'app',
  'pages',
  'ai',
  'scripts'
];

// Files to exclude
const filesToExclude = [
  'node_modules',
  '.git',
  '.gitignore',
  '.modified',
  'production-build',
  'create-production-package.js',
  '*.md',
  '.env*'
];

function copyFileOrDir(src, dest) {
  const srcPath = path.join(sourceDir, src);
  const destPath = path.join(targetDir, src);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`⚠️  Skipping: ${src} (not found)`);
    return;
  }
  
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    // Copy directory recursively
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    const items = fs.readdirSync(srcPath);
    for (const item of items) {
      // Skip excluded files
      if (filesToExclude.some(exclude => 
        exclude.includes('*') ? 
          item.endsWith(exclude.replace('*', '')) : 
          item === exclude
      )) {
        continue;
      }
      
      copyFileOrDir(path.join(src, item), path.join(dest, item));
    }
  } else {
    // Copy file
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied: ${src}`);
  }
}

function createProductionPackage() {
  console.log('🚀 Creating Production Package for Netlify...');
  console.log('=' .repeat(50));
  
  // Clean target directory
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });
  
  // Copy files
  for (const file of filesToCopy) {
    copyFileOrDir(file, file);
  }
  
  // Create deployment info
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    buildCommand: 'npm run build:production',
    publishDirectory: '.next',
    environment: 'production',
    apiUrl: 'https://event-management-be-2.onrender.com'
  };
  
  fs.writeFileSync(
    path.join(targetDir, 'DEPLOYMENT_INFO.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Production package created successfully!');
  console.log(`📁 Location: ${targetDir}`);
  console.log('\n📋 Files included:');
  filesToCopy.forEach(file => console.log(`   - ${file}`));
  console.log('\n🚀 Ready to upload to Netlify!');
  console.log('\n📝 Instructions:');
  console.log('1. Go to Netlify Dashboard');
  console.log('2. Click "Add new site" → "Deploy manually"');
  console.log('3. Upload the entire "production-build" folder');
  console.log('4. Set build command: npm run build:production');
  console.log('5. Set publish directory: .next');
  console.log('6. Deploy!');
}

// Run the script
createProductionPackage(); 