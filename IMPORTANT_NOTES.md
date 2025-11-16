# ⚠️ IMPORTANT NOTES

## 431 Error Caused by Browser Extensions

### Problem
If you see this in your browser console:
```
Server responded with status code 431 (Request Header Fields Too Large)
```

### Cause
This is caused by excessive HTTP request headers added by browser extensions (such as 1Password, LastPass, ad blockers, etc.).

### Solutions (Recommended Order)

#### ✅ Solution 1: Use Incognito/Private Mode (Easiest)
1. **Chrome/Edge**: Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
2. **Firefox**: Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. **Safari**: Press `Cmd+Shift+N`
4. Visit `http://localhost:3000` in the incognito window

This will disable most extensions and avoid the 431 error.

#### ✅ Solution 2: Temporarily Disable Extensions
1. Open browser extension management page
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
   - Safari: Safari → Preferences → Extensions
2. Temporarily disable all extensions
3. Refresh the page

#### ✅ Solution 3: Use a Different Browser
If your primary browser has many extensions, temporarily use another clean browser.

## Spark.js / WebAssembly Notes

### About WASM Warnings

You may see warnings like this in the console:
```
WebAssembly.instantiateStreaming failed because your server does not serve
Wasm with application/wasm MIME type
```

**This is normal!**

- Spark.js will automatically fall back to a slower WASM loading method
- It does not affect application functionality
- SPZ files can still load and display normally

### SPZ File Loading

Since SPZ files are typically large (50MB - 500MB+), loading may take some time:
- **Local files**: Loading speed depends on file size
- **Remote URLs**: Loading speed depends on network connection and file size

**Please be patient with the loading progress bar!**

## Testing the Application

### Don't Have SPZ Files?

If you don't have SPZ files for testing:

1. **Search Online for Examples**
   - Search for "gaussian splatting demo" or "3d gaussian splatting examples"
   - Find publicly available SPZ file URLs

2. **Generate Your Own SPZ Files**
   - Use 3D Gaussian Splatting training tools
   - Convert from NeRF models
   - Use online tools like Luma AI

3. **Test URLs**
   - Ensure the URL points directly to a `.spz` file
   - Check CORS settings (file server needs to allow cross-origin access)

## Development Environment

### Recommended Configuration

For the best development experience:

1. **Develop in Incognito Mode**
   - Avoid extension interference
   - Faster development speed
   - Less console noise

2. **Browser Developer Tools**
   - Open the Network tab to view file loading progress
   - Open the Console to view errors and warnings
   - Use the Performance tab to monitor performance

3. **WebGL Check**
   - Visit https://get.webgl.org/ to confirm WebGL 2.0 support
   - Ensure hardware acceleration is enabled

## Quick Problem Reference

| Problem | Solution |
|---------|----------|
| 431 Error | Use incognito mode |
| WASM Warning | Ignore, does not affect functionality |
| Slow Loading | Normal, SPZ files are large |
| Blank Scene | Wait for file loading to complete |
| Cannot Rotate | Check mouse control instructions |

## Quick Start (Avoiding Issues)

```bash
# 1. Start development server
npm run dev

# 2. Open incognito window
# Chrome/Edge: Ctrl+Shift+N (Win) / Cmd+Shift+N (Mac)
# Firefox: Ctrl+Shift+P (Win) / Cmd+Shift+P (Mac)

# 3. Visit
http://localhost:3000

# 4. Upload or enter SPZ file URL

# 5. Wait for loading to complete
```

## Production Deployment

When deploying to production:

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Server Configuration**
   - Ensure the server supports large file uploads (if needed)
   - Configure correct MIME types
   - Enable GZIP compression

3. **CORS Settings**
   - If loading remote SPZ files, ensure CORS is configured

## Performance Tips

- **File Size**: Smaller SPZ files (< 100MB) load faster
- **Network**: Using local files is faster than remote URLs
- **Browser**: Latest version of Chrome performs best
- **Hardware**: Requires a graphics card that supports WebGL 2.0

## Getting Help

If problems persist:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Make sure to use incognito mode
3. View detailed error messages in the browser console
4. Submit an issue on the GitHub repository

---

**Remember**: Most problems can be solved by using **incognito/private mode**!
