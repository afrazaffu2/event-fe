#!/usr/bin/env node

/**
 * Create Deployment Package for Netlify
 * This script creates a package WITHOUT the .next folder so Netlify can rebuild
 */

const fs = require('fs');
const path = require('path');

const sourceDir = __dirname;
const targetDir = path.join(__dirname, 'deployment-package');

// Files and folders to copy for deployment (EXCLUDING .next)
const filesToCopy = [
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
  'deployment-package',
  'create-production-package.js',
  'create-deployment-package.js',
  '*.md',
  '.env*',
  '.next' // Exclude the build output
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

function createDeploymentPackage() {
  console.log('🚀 Creating Deployment Package for Netlify...');
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
  console.log('✅ Deployment package created successfully!');
  console.log(`📁 Location: ${targetDir}`);
  console.log('\n📋 Files included:');
  filesToCopy.forEach(file => console.log(`   - ${file}`));
  console.log('\n🚀 Ready to upload to Netlify!');
  console.log('\n📝 Instructions:');
  console.log('1. Go to Netlify Dashboard');
  console.log('2. Click "Add new site" → "Deploy manually"');
  console.log('3. Upload the entire "deployment-package" folder');
  console.log('4. Netlify will automatically:');
  console.log('   - Install dependencies');
  console.log('   - Run: npm run build:production');
  console.log('   - Serve from: .next directory');
  console.log('5. Deploy!');
}

// Run the script
createDeploymentPackage(); 