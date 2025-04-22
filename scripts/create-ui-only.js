#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const sourceDir = process.cwd(); // Assume script is run from the project root
const monorepoRoot = sourceDir; // Project root is the monorepo root
const intermediateDirName = 'ui-only';
const targetDirName = 'rosebud-mobile-ui-only'; // Mobile-specific target name
const targetDir = path.join(monorepoRoot, intermediateDirName, targetDirName);

// UI-relevant directories to copy (adjusted for this project)
const directoriesToCopy = [
  'app', // Main Expo Router directory
  'assets',
  'components',
  'constants',
  'hooks',
  // 'src', // Not present
  // 'screens', // Using 'app' directory structure
  // 'navigation', // Likely within 'app' or components
  // 'lib', // Or 'utils' - check if needed
  // 'context', // Check if needed
  // 'services', // Check if needed
  // 'theme', // Check if needed
  // 'public' // Check if needed
];

// Configuration files to copy (adjusted for this project)
const filesToCopy = [
  'package.json',
  'app.json', // Expo config
  'tsconfig.json',
  // 'babel.config.js', // Not present
  // 'metro.config.js', // Not present
  // '.eslintrc.json', // Not present
  // 'eas.json', // Not present
  // Add other relevant config files like specific .env files if needed
];

// Directories to exclude (will be ignored during copying)
const excludeDirs = [
  '.git',
  '.expo', // Expo cache/config
  'android', // Native build folders
  'ios', // Native build folders
  'node_modules',
  'coverage',
  'dist',
  '.idea',
  '.vscode',
  '__tests__'
];

// Clean and create target directory
function setupTargetDirectory() {
  console.log(`Setting up target directory: ${targetDir}`);
  
  if (fs.existsSync(targetDir)) {
    console.log('Target directory exists. Removing...');
    execSync(`rm -rf "${targetDir}"`);
  }
  
  console.log('Creating fresh target directory...');
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy directory with exclusions (same logic as web)
function copyDirectoryWithExclusions(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
      console.log(`Excluding directory: ${sourcePath}`);
      continue;
    }
    
    if (entry.isDirectory()) {
      // Check if the source directory actually exists before recursing
      if (fs.existsSync(sourcePath)) {
        copyDirectoryWithExclusions(sourcePath, targetPath);
      } else {
        console.log(`Warning: Source directory ${sourcePath} not found during recursion.`);
      }
    } else {
       // Check if the source file actually exists before copying
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
      } else {
         console.log(`Warning: Source file ${sourcePath} not found during copy.`);
      }
    }
  }
}


// Copy individual files (same logic as web)
function copyFiles() {
  console.log('Copying individual files...');
  
  for (const file of filesToCopy) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${file}`);
    } else {
      console.log(`Skipping (not found): ${file}`); // Changed log message slightly
    }
  }
}

// Create README for Mobile UI
function createReadme() {
  console.log('Creating README...');
  
  const readmeContent = `# Rosebud Mobile UI

This repository contains only the UI-related files for the Rosebud Mobile application. It has been generated to isolate UI components and configurations.

## Structure (Example)
- \`src/\` or \`app/\` - Main application code
- \`components/\` - Reusable UI components
- \`screens/\` or \`views/\` - Application screens
- \`navigation/\` - Navigation setup (e.g., React Navigation)
- \`assets/\` - Static assets (images, fonts)
- \`hooks/\` - Custom React hooks
- \`lib/\` or \`utils/\` - Utility functions
- \`context/\` - React context providers
- \`theme/\` - Styling and theme configuration

## Key UI Dependencies (Example)
- React Native
- Expo (if used)
- React Navigation
- UI component libraries (e.g., NativeBase, React Native Elements, custom)

Adjust the structure and dependency list based on your actual project setup.
`;

  fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);
}

// Validate UI dependencies in mobile package.json
function validateUIDependencies() {
  console.log('Validating Mobile UI dependencies...');
  
  const packageJsonPath = path.join(sourceDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('Warning: package.json not found.');
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Essential Mobile UI dependencies to check for (adjust as needed)
    const essentialUIDeps = [
      'react', 
      'react-native', 
      'expo', // If using Expo
      '@react-navigation', // Common navigation library
      // Add other critical UI libs like state management (zustand, redux) or component libs
    ];
    
    const dependencies = { 
      ...packageJson.dependencies || {}, 
      ...packageJson.devDependencies || {}
    };
    
    const missingDeps = essentialUIDeps.filter(dep => 
      !Object.keys(dependencies).some(key => key === dep || key.startsWith(`${dep}/`))
    );
    
    if (missingDeps.length > 0) {
      console.log(`Warning: Some essential Mobile UI dependencies may be missing or not listed: ${missingDeps.join(', ')}`);
    } else {
      console.log('Essential Mobile UI dependencies seem to be present.');
    }
  } catch (error) {
    console.error('Error validating package.json:', error.message);
  }
}

// Create minimal .env file for Mobile UI
function createEnvFile() {
  console.log('Creating minimal .env file...');
  
  // Add relevant default environment variables for the UI to function minimally
  const envContent = `# Mobile UI Environment Variables (Example)
# EXPO_PUBLIC_API_URL=your_mock_or_dev_api_url
# Add other necessary public env vars
`;

  fs.writeFileSync(path.join(targetDir, '.env'), envContent); // Often just .env for mobile
  console.log('Created .env with minimal Mobile UI environment variables');
}

// Main execution
function main() {
  console.log('Starting Mobile UI-only version creation...');
  
  // Validate UI dependencies first
  validateUIDependencies();
  
  // Setup target directory
  setupTargetDirectory();
  
  // Copy directories
  console.log('Copying directories...');
  for (const dir of directoriesToCopy) {
    const sourceSubDir = path.join(sourceDir, dir);
    const targetSubDir = path.join(targetDir, dir);
    
    if (fs.existsSync(sourceSubDir)) {
      console.log(`Copying directory: ${dir}`);
      copyDirectoryWithExclusions(sourceSubDir, targetSubDir);
    } else {
      console.log(`Skipping directory (not found): ${dir}`);
    }
  }
  
  // Copy files
  copyFiles();
  
  // Create README
  createReadme();
  
  // Create env file
  createEnvFile();
  
  // Print summary
  try {
    const fileCount = parseInt(execSync(`find "${targetDir}" -type f | wc -l`).toString().trim());
    const dirSize = execSync(`du -sh "${targetDir}"`).toString().trim();
    
    console.log('\\nSummary:');
    console.log(`Files: ${fileCount}`);
    console.log(`Size: ${dirSize}`);
    console.log(`Location: ${targetDir}`);
    console.log('\\nMobile UI-only version created successfully!');
  } catch (error) {
     console.error('\\nError calculating summary:', error.message);
     console.log(`\\nMobile UI-only version created, but summary failed. Location: ${targetDir}`);
  }
}

main(); 