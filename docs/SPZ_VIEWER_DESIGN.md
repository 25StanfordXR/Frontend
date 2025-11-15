# SPZ Viewer – Architecture & Key Code

This document captures how the current React/Vite application loads and displays Gaussian Splat (`.spz`) scenes with Spark.js, including the critical integration details we need to keep in mind while iterating on the UI/UX.

## High-Level Flow

1. **Bootstrap**
   - `src/main.tsx` imports the Spark fetch shim (`src/utils/patchSparkFetch.ts`), ensuring the shim is installed before Spark’s ESM module executes.
   - React renders `<App />` inside `StrictMode`.

2. **App Shell (`src/App.tsx`)**
   - Manages the overall `viewerState` (`isLoading`, `error`, `loadedFile`).
   - Provides UI for uploading a file or entering a URL, and shows controls/reset/back actions once the SPZ viewer is active.
   - All callbacks (`handleLoadUrl`, `handleLoadFile`, `handleError`, `handleLoadComplete`, `handleReset`, `handleClearFile`) are memoized with `useCallback` to avoid re-triggering expensive effects inside the viewer.

3. **GAUSSIAN Splat Viewer (`src/components/SPZViewer/SPZViewer.tsx`)**
   - Sets up `THREE.Scene`, `PerspectiveCamera`, `WebGLRenderer`, lighting, and `OrbitControls`.
   - Instantiates Spark’s `SplatMesh` with either a URL or a blob produced via `URL.createObjectURL(file)`.
   - Notifies the parent when loading succeeds or fails.
   - Maintains an animation loop that updates orbit controls and renders each frame.
   - Exposes a `resetCamera` method through the container ref so the parent can trigger a camera reset.

4. **Spark WASM Shim (`src/utils/patchSparkFetch.ts`)**
   - Spark bundles its WASM payload as a `data:application/wasm;base64,…` URL. Vite dev server cannot serve this path, so Spark’s `fetch` would fail.
   - The shim monkey-patches `window.fetch`, detects Spark’s data-URL requests, decodes the Base64 payload, and returns a synthetic `Response` with `Content-Type: application/wasm`.
   - This guarantees `WebAssembly.instantiateStreaming`/`instantiate` always receive actual bytes without hitting the dev server.

5. **Three.js Controls UI (`src/components/Controls`) & File Upload UI (`src/components/FileUpload`)**
   - Provide user-facing actions (reset camera, load another file, etc.) and maintain consistent styling.

## Key Code Snippets

### 1. Spark WASM Fetch Shim
```ts
// src/utils/patchSparkFetch.ts
const SPARK_WASM_PREFIX = 'data:application/wasm;base64,';
const respondWithWasm = createWasmResponseFactory();

window.fetch = (input, init) => {
  const url = extractUrl(input);
  if (url && url.includes('@sparkjsdev/spark') && url.includes(SPARK_WASM_PREFIX)) {
    return Promise.resolve(respondWithWasm(url));
  }
  return originalFetch(input, init);
};
```

### 2. App-Level State Handling
```tsx
// src/App.tsx
const [viewerState, setViewerState] = useState<ViewerState>({
  isLoading: false,
  error: null,
  loadedFile: null,
});

const handleLoadFile = useCallback((file: File) => {
  setViewerState({ isLoading: true, error: null, loadedFile: { file } });
}, []);

const handleError = useCallback((error: string) => {
  setViewerState((prev) => ({ ...prev, isLoading: false, error }));
}, []);
```

### 3. SPZViewer Effect Skeleton
```tsx
// src/components/SPZViewer/SPZViewer.tsx
useEffect(() => {
  if (!containerRef.current || isInitialized) return;
  // set up scene, camera, renderer, orbit controls, lights
  setIsInitialized(true);
}, [isInitialized, onError]);

useEffect(() => {
  if (!isInitialized || !sceneRef.current) return;
  const splatMesh = new SplatMesh({ url: splatURL });
  sceneRef.current.add(splatMesh);
  splatMeshRef.current = splatMesh;
  onLoadComplete();
}, [source, isInitialized, onLoadComplete, onError]);
```

### 4. Camera Reset Exposure
```tsx
const resetCamera = () => {
  cameraRef.current?.position.set(0, 0, 5);
  controlsRef.current?.target.set(0, 0, 0);
  controlsRef.current?.update();
};

useEffect(() => {
  if (containerRef.current) {
    (containerRef.current as any).resetCamera = resetCamera;
  }
}, [resetCamera]);
```

## Considerations for Future Design Work

- **WebXR / Quest 3**: Spark exposes `SparkControls`, `PointerControls`, `VRButton`, and `XrHands`. We can extend the viewer to enable `renderer.xr.enabled = true` and provide VR interaction controls (select, drag, pinch) directly in this component.
- **Multiple SPZ Objects**: If we need to drag/transform different splat assets independently, consider wrapping each `SplatMesh` in a `THREE.Group` and managing transforms there.
- **Error & Loading UX**: The current overlays are simple; we may want richer status indicators, progress bars, or retry options.
- **Performance Monitoring**: Hooking into Spark’s `onFrame` callback can help surface frame times/FPS for debugging.

This document should serve as the reference point for the current implementation and guide us when designing new UX or integrating additional features (e.g., Quest 3 controls, drag/drop interactions).

