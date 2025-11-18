#!/usr/bin/env node
/**
 * Build script for PTP Simulator
 * Copies and organizes files for production deployment
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

console.log('🚀 Building PTP Simulator for production...\n');

// Clean dist folder
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
    console.log('✓ Cleaned dist folder');
}

// Create dist structure
fs.mkdirSync(DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'src', 'js'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'src', 'css'), { recursive: true });
fs.mkdirSync(path.join(DIST, 'src', 'assets'), { recursive: true });

console.log('✓ Created dist folder structure');

// Copy files
const copyFile = (src, dest) => {
    fs.copyFileSync(src, dest);
    console.log(`  → ${path.relative(ROOT, dest)}`);
};

const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) return;

    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    }
};

// Copy index.html
copyFile(path.join(PUBLIC, 'index.html'), path.join(DIST, 'index.html'));

// Copy source files from protected src/ folder
console.log('\n📦 Copying source files...');
copyDir(SRC, path.join(DIST, 'src'));

// Copy assets if any
if (fs.existsSync(path.join(PUBLIC, 'src', 'assets'))) {
    copyDir(path.join(PUBLIC, 'src', 'assets'), path.join(DIST, 'src', 'assets'));
}

// Create build info
const buildInfo = {
    version: require('../package.json').version,
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.ENVIRONMENT || 'production'
};

fs.writeFileSync(
    path.join(DIST, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
);

console.log('\n✅ Build completed successfully!');
console.log(`\n📊 Build info:`);
console.log(`   Version: ${buildInfo.version}`);
console.log(`   Node: ${buildInfo.nodeVersion}`);
console.log(`   Date: ${buildInfo.buildDate}`);
console.log(`\n📁 Output: ${DIST}`);
