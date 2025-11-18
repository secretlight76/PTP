# Deployment Guide - PTP Simulator

## 🏗️ Project Structure

```
PTP/
├── src/                    # 🔒 Protected source code
│   ├── js/                # JavaScript modules
│   ├── css/               # Stylesheets
│   └── assets/            # Static assets
│
├── public/                # 🛠️ Development environment
│   ├── index.html        # Main HTML
│   └── src/              # Dev files (symlinked to src/)
│
├── dist/                  # 📦 Production build output (gitignored)
│   └── ...               # Built files ready for deployment
│
├── scripts/              # 🔧 Build scripts
│   └── build.js          # Production build script
│
├── .nvmrc                # Node version lock (22.21.1)
├── .node-version         # Alternative Node version file
├── wrangler.toml         # Cloudflare Pages configuration
└── package.json          # Project dependencies & scripts
```

## 🚀 Deployment Process

### 1. **Development**
```bash
npm run dev
# Runs local dev server on port 8080
# Uses files from public/ directory
```

### 2. **Build for Production**
```bash
npm run build
# Creates optimized build in dist/ folder
# Copies files from protected src/ to dist/
```

### 3. **Deploy to Cloudflare Pages**

#### Deploy to Production (Main Branch)
```bash
npm run deploy:production
```
This will:
- Build the project (`npm run build`)
- Deploy to branch: `claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb`
- **Always deploys to the SAME production environment**

#### Preview Deploy (Testing)
```bash
npm run deploy
```
Creates a preview deployment (not production)

### 4. **Clean Build**
```bash
npm run clean
# Removes dist/ folder
```

## 📋 Cloudflare Pages Configuration

### Production Branch
**Branch:** `claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb`

This is your main production branch. All deployments to this branch will update the **same production environment**, not create new ones.

### Settings in Cloudflare Dashboard

1. **Go to:** Cloudflare Dashboard → Pages → simulateur-ptp → Settings

2. **Production branch:**
   - Set to: `claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb`

3. **Build settings:**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`

4. **Environment variables:**
   - `NODE_VERSION`: `22.21.1`
   - `ENVIRONMENT`: `production`

## 🔒 Security & Protection

### Protected Source Files
All source code is in the `src/` directory, separated from public files:
- `src/js/` - Protected JavaScript modules
- `src/css/` - Protected stylesheets
- `src/assets/` - Protected assets

### Build Process
The build script (`scripts/build.js`) copies files from `src/` to `dist/` for deployment, ensuring:
- Clean builds every time
- Version tracking (build-info.json)
- Production-ready output

## 🔧 Node.js Version

**Locked to:** Node.js `22.21.1` (LTS)

Version files:
- `.nvmrc` - For nvm (Node Version Manager)
- `.node-version` - For other version managers

To use:
```bash
nvm use        # If using nvm
# or
node --version # Verify current version
```

## 📊 Build Info

Each build creates a `build-info.json` file with:
- Version number
- Build timestamp
- Node.js version
- Environment

## 🎯 Best Practices

1. **Always test locally first:**
   ```bash
   npm run dev
   ```

2. **Build before deploying:**
   ```bash
   npm run build
   # Check dist/ folder
   ```

3. **Deploy to production:**
   ```bash
   npm run deploy:production
   ```

4. **Verify deployment:**
   - Check Cloudflare Pages dashboard
   - Test on production URL
   - Verify build-info.json

## 🐛 Troubleshooting

### Issue: Multiple environments created
**Solution:** Ensure you're always deploying to the same branch:
- Use `npm run deploy:production`
- Check branch name in wrangler.toml
- Verify production branch in Cloudflare settings

### Issue: Build fails
**Solution:**
- Check Node.js version: `node --version`
- Clean and rebuild: `npm run clean && npm run build`
- Check build logs in scripts/build.js

### Issue: Files not updating
**Solution:**
- Clear browser cache (Ctrl+Shift+R)
- Verify build completed: check dist/ folder
- Trigger Cloudflare cache purge in dashboard

## 📚 Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Node.js LTS](https://nodejs.org/)
