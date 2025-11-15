# Quick Start Guide

This guide will help you get the SPZ Viewer up and running in minutes.

## Prerequisites

- Node.js 16 or higher
- npm (comes with Node.js)

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser in INCOGNITO/PRIVATE MODE:**
   - **Chrome/Edge**: Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - **Firefox**: Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - **Safari**: Press `Cmd+Shift+N`

   Navigate to: `http://localhost:3000`

   ⚠️ **Important**: Using incognito mode avoids browser extension conflicts that cause "431 Request Header Fields Too Large" errors.

## Using the Viewer

### Loading Files

**Option 1: Load from URL**
1. Paste the URL of an SPZ file into the input field
2. Click "Load from URL"
3. Wait for the file to load

**Option 2: Upload Local File**
1. Click "Choose SPZ File"
2. Select an SPZ file from your computer
3. The viewer will automatically load it

### 3D Navigation

- **Rotate:** Click and drag with left mouse button
- **Pan:** Click and drag with right mouse button
- **Zoom:** Use mouse wheel to zoom in/out
- **Reset:** Click "Reset Camera" button to return to default view

## Where to Find SPZ Files

SPZ files are created from 3D Gaussian Splatting pipelines. You can:

- Generate them using [3D Gaussian Splatting tools](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/)
- Find sample files in online Gaussian Splatting demos
- Convert NeRF outputs to SPZ format
- Use photogrammetry software that supports Gaussian Splats

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Troubleshooting

### Build Errors
If you encounter build errors, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### File Won't Load
- Verify the file is a valid .spz file
- Check that the URL is accessible (no CORS restrictions)
- Ensure the file isn't corrupted

### Performance Issues
- Try using a smaller SPZ file
- Close other browser tabs
- Check that your browser supports WebGL 2.0

## Development

- **Lint code:** `npm run lint`
- **Preview production build:** `npm run preview`

## Need Help?

- Check the [full README](./README.md) for detailed documentation
- Review the [Spark.js documentation](https://sparkjs.dev/docs/)
- Check the [Three.js documentation](https://threejs.org/docs/)
