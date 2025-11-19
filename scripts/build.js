#!/usr/bin/env node
/**
 * Build script for PTP Simulator
 * Simple copy from public/ to dist/ for Cloudflare Pages compatibility
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');

console.log('🚀 Building PTP Simulator for Cloudflare Pages...\n');

// Clean dist folder
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
    console.log('✓ Cleaned dist folder');
}

// Copy entire public/ directory to dist/
const copyDir = (src, dest) => {
    if (!fs.existsSync(src)) {
        console.error(`❌ Source directory not found: ${src}`);
        process.exit(1);
    }

    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ ${path.relative(ROOT, destPath)}`);
        }
    }
};

console.log('📦 Copying public/ to dist/...\n');
copyDir(PUBLIC, DIST);

// Create build info
const buildInfo = {
    version: require('../package.json').version,
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    source: 'public/',
    note: 'Direct copy - no transpilation needed'
};

fs.writeFileSync(
    path.join(DIST, 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
);

console.log('\n✅ Build completed successfully!');
console.log(`📊 Version: ${buildInfo.version}`);
console.log(`📁 Output: ${DIST}`);
console.log(`\n💡 Note: dist/ is a direct copy of public/ for Cloudflare Pages compatibility`);
