# Troubleshooting Guide

## Known Issues and Solutions

### 1. WebAssembly Loading Issues

#### Problem Description
```
WebAssembly.instantiateStreaming failed because your server does not serve Wasm with application/wasm MIME type
```

#### Cause
Spark.js uses WebAssembly (WASM) to implement high-performance Gaussian Splatting rendering. Vite needs to be properly configured to serve WASM files.

#### Solution
Already added to `vite.config.ts`:
```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['@sparkjsdev/spark']  // Exclude Spark.js from pre-build optimization
  },
  assetsInclude: ['**/*.wasm'],      // Include WASM files as assets
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
```

### 2. 431 Request Header Fields Too Large

#### Problem Description
```
Server responded with status code 431
```

#### Cause
Browser extensions (such as password managers, ad blockers) may add numerous request headers that exceed server limits.

#### Solutions

**Option 1: Disable Browser Extensions**
1. Open the application in incognito/private mode
2. Or temporarily disable browser extensions

**Option 2: Increase Vite Server Limits**
If needed, you can add to `vite.config.ts`:
```typescript
server: {
  middlewareMode: false,
  // Other configurations...
}
```

**Option 3: Use a Different Browser**
Try using another browser or a browser profile with fewer extensions.

### 3. SPZ File Loading Failures

#### Problem Description
SPZ file fails to load or displays a blank scene

#### Possible Causes and Solutions

**1. Incorrect File Format**
- Ensure the file is a valid `.spz` format
- Verify the file is not corrupted

**2. CORS Issues (URL Loading)**
If loading files from a URL:
- Ensure the target server allows CORS
- Check if the file URL is accessible
- Try using file hosting services that support CORS

**3. File Too Large**
- SPZ files can be very large (tens to hundreds of MB)
- Wait longer for the file to load
- Check the browser console's network tab to view download progress

**4. WebGL Not Supported**
- Ensure the browser supports WebGL 2.0
- Visit https://get.webgl.org/ to test WebGL support
- Update graphics drivers

### 4. Performance Issues

#### Problem Description
3D scene stuttering or low frame rate

#### Solutions

**1. Lower Quality Settings**
- Use smaller SPZ files
- Close other browser tabs

**2. Hardware Acceleration**
Ensure browser hardware acceleration is enabled:
- Chrome: `chrome://settings/` → System → Use hardware acceleration
- Firefox: `about:preferences` → Performance → Use recommended performance settings

**3. Memory Issues**
- Large SPZ files can consume significant memory
- Monitor browser memory usage
- Reload the page to free memory

### 5. Development Server Issues

#### Problem Description
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

#### Solution
Development server has stopped, restart it:
```bash
npm run dev
```

### 6. TypeScript Type Errors

#### Problem Description
Spark.js type definitions may be incomplete

#### Solution
`@ts-ignore` comments have been added in the code to skip certain type checks:
```typescript
// @ts-ignore - Spark.js types may not be complete
import { SplatMesh } from '@sparkjsdev/spark';
```

This does not affect runtime behavior, it just tells TypeScript to ignore certain type warnings.

## Debugging Tips

### 1. Check Browser Console
Open developer tools (F12) to view:
- Error messages
- Network request status
- WebGL support information

### 2. Network Tab
In the developer tools network tab:
- View SPZ file download progress
- Check if WASM files loaded successfully
- Verify HTTP status codes

### 3. Performance Monitoring
In the developer tools performance tab:
- Monitor frame rate (FPS)
- Check memory usage
- Identify performance bottlenecks

### 4. WebGL Inspector
Use WebGL inspector extensions to debug 3D rendering issues.

## Getting Help

If the problem persists:

1. **Check Spark.js Documentation**
   https://sparkjs.dev/docs/

2. **Three.js Documentation**
   https://threejs.org/docs/

3. **GitHub Issues**
   Create an issue in the project repository, providing:
   - Browser and version
   - Operating system
   - Error message screenshots
   - Console logs

4. **Test Environment**
   - Browser: Chrome 120+, Firefox 120+, Safari 17+
   - WebGL: 2.0 support
   - Memory: At least 4GB RAM recommended

## Frequently Asked Questions (FAQ)

### Q: Why is SPZ file loading so slow?
A: SPZ files can be large (50-500MB) and require time to download and parse. This is normal.

### Q: Which browsers are supported?
A: Chrome 90+, Firefox 88+, Safari 14+. WebGL 2.0 support required.

### Q: Can multiple SPZ files be loaded simultaneously?
A: The current version supports one file at a time. Multi-file support is planned for future versions.

### Q: Why can't some SPZ files be loaded?
A: Ensure the file format is correct and compatible with Spark.js v0.1.10.

### Q: How can I get SPZ files for testing?
A: You can generate them from 3D Gaussian Splatting training tools, or search online for sample files.

## Changelog

### v0.0.1 (2025-11-14)
- ✅ Initial release
- ✅ Basic SPZ file viewing functionality
- ✅ URL and local file loading
- ✅ 3D interactive controls
- ⚠️ Known WebAssembly MIME type warning (does not affect functionality)
- ⚠️ Known 431 error (caused by browser extensions)
