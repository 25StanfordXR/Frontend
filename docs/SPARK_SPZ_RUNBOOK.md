# Spark.js SPZ Runbook

Authoritative reference for how the current Vite/React front‑end boots Spark.js and renders `.spz` Gaussian splats. Keep this handy when onboarding new contributors or when we revisit the integration later.

## 1. Quick Start (Local Setup)

1. **Install deps** – `npm install`
2. **Start dev server** – `npm run dev` (default: `http://localhost:5173`)
3. **Load a splat** – Use the landing page to either paste an `.spz` URL or upload a local file.
4. **Interact** – Use orbit/mouse controls or WASD keys; hit "Reset Camera" when needed.

> Build for release with `npm run build` and preview via `npm run preview`. The Spark shim works in all modes because it runs before Spark first touches `fetch`.

## 2. Execution Pipeline

| Stage | File(s) | Purpose |
| --- | --- | --- |
| Bootstrap | `src/main.tsx` | Imports `./utils/patchSparkFetch` **before** mounting React so all subsequent Spark `fetch` calls see the shim. |
| App Shell | `src/App.tsx` | Owns `viewerState`, provides upload/URL inputs, and renders `<SPZViewer />` only when a file/URL is selected. |
| SPZ Rendering | `src/components/SPZViewer/SPZViewer.tsx` | Creates the Three.js scene, renderer, `OrbitControls`, loads Spark’s `SplatMesh`, and exposes `resetCamera`. |
| Controls/UI | `src/components/FileUpload`, `src/components/Controls`, `src/components/LoadingSpinner` | Handle UX chrome, loading overlays, and error surfaces. |

The only data flow is `viewerState.loadedFile → <SPZViewer source={...} />`. All heavy work stays isolated in `SPZViewer`, so the shell never touches Spark APIs directly.

## 3. Spark WASM Shim (`src/utils/patchSparkFetch.ts`)

Spark bundles its WASM binary inside its own ESM package as a `data:application/wasm;base64,…` URL. Vite dev server cannot serve that payload, so Spark’s call to `fetch('data:…@sparkjsdev/spark')` would fail unless we intercept it.

- The shim monkey‑patches `window.fetch` once (`window.__sparkWasmFetchShimApplied` guards multiple runs).
- `extractUrl()` normalizes any `Request/string/URL`.
- Requests that contain both `@sparkjsdev/spark` and the WASM prefix get short‑circuited: we decode the Base64, cache the `Uint8Array`, and return a synthetic `Response` with `Content-Type: application/wasm`.
- Spark then proceeds with `WebAssembly.instantiateStreaming/instantiate` as if it fetched a normal `.wasm` file.

If Spark ever switches to shipping an external `.wasm` asset we can delete the shim and instead add the file to `public/`.

## 4. Loading `.spz` Assets (`src/components/SPZViewer/SPZViewer.tsx`)

1. **Initialization effect**: once the container `div` exists, we configure the Three.js scene, camera, renderer (`renderer.xr.enabled = true` for future XR), lighting, `OrbitControls`, resize listeners, and a WebXR button via `VRButton`.
2. **Data effect**: when `source` changes:
   - Convert `File` → `blob URL` or pass through the string URL.
   - Build `new SplatMesh({ url })`. Spark streams the `.spz` data and internally triggers WASM compilation (already shimmed).
   - Insert the mesh into the scene, rotate it (`rotation.x = Math.PI`), and notify the parent via `onLoadComplete()`. Errors bubble through `onError`.
3. **Render loop**: `renderer.setAnimationLoop` updates `OrbitControls`, applies WASD camera deltas, and renders every frame.
4. **Cleanup**: dispose renderer, remove DOM nodes, cancel RAF, revoke blob URLs, and drop meshes on unmount or when a new file replaces the previous one.

## 5. App-Level UX Hooks (`src/App.tsx`)

- `handleLoadUrl` / `handleLoadFile` populate `viewerState.loadedFile` and flip `isLoading`.
- `<SPZViewer />` fires `onLoadComplete` once the mesh is attached; we hide the overlay then.
- `handleError` shows an error overlay and allows the user to go back/reset.
- `handleReset` reaches into the viewer container to call the injected `resetCamera`.
- `handleClearFile` removes the current source and returns to the upload screen.

## 6. Testing / Troubleshooting References

- `TROUBLESHOOTING.md` – includes Spark-specific fixes (e.g., ensure `vite.config.ts` excludes `@sparkjsdev/spark` from dependency pre-bundling to avoid WASM MIME issues).
- `docs/SPZ_VIEWER_DESIGN.md` – deeper architectural notes and future considerations (Quest 3, performance hooks, multi-mesh scenes).

## 7. Common Pitfalls & Tips

- **Spark import timing** – `patchSparkFetch` must execute before any module imports `@sparkjsdev/spark`. Keeping the import at the top of `main.tsx` (and inside `SPZViewer` as a sanity check) avoids race conditions.
- **Dev-server port** – Spark loads `.spz` from absolute URLs. If you host files locally, ensure CORS headers or use the built-in upload flow to generate blob URLs.
- **Memory** – When loading large `.spz` blobs from disk, Spark streams the data; still, releasing `URL.createObjectURL` immediately after `SplatMesh` attaches prevents leaks.
- **XR readiness** – `renderer.xr.enabled` plus the `VRButton` already exist; hooking up `SparkControls` or controller-based interactions can build on the same viewer component.

With this runbook, we now have a frozen snapshot of the integration. Future iterations (Quest-specific UX, asset managers, etc.) can reference this document to understand the current baseline.
