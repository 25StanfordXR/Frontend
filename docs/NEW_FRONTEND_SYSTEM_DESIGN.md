# Next-Gen Frontend System Design

This document captures the blueprint for the next iteration of the SPZ/Spark frontend. The goal is to move from a single-page viewer into a modular platform that supports multi-asset workflows, Quest-class XR controls, collaboration primitives, and integration with managed storage.

## 1. Goals & Non-Goals

### Goals
- **Multi-modal loading**: URL, uploaded files, workspace library (backed by API), and shared links.
- **Stateful sessions**: Persist camera poses, annotations, and active assets per user/session.
- **Quest-ready UI**: Dedicated XR interaction layer with controller + hand tracking affordances.
- **Diagnostics**: Surface FPS, WASM loading telemetry, and Spark warnings inline.
- **Extensibility**: Feature flags and plugin slots so research teams can test new tools without forking.

### Non-Goals (for initial release)
- Full SPZ editing (color/point manipulation)
- Offline-first caching
- Server-side rendering for viewer scenes (regular SPA hydration is acceptable)

## 2. High-Level Architecture

```
┌──────────────────────────┐
│      App Shell (SPA)     │
│ ┌──────────────────────┐ │
│ │    Router Layouts    │ │
│ │• Marketing / Docs    │ │
│ │• Workspace Dashboard │ │
│ │• Viewer (2D / XR)    │ │
│ └──────────────────────┘ │
│      Global Providers     │
│ • QueryClient (React Query)│
│ • Zustand viewer store    │
│ • Theming + i18n          │
└──────────┬───────────────┘
           │
┌──────────▼─────────┐
│     Service Layer   │
│ • AssetService      │→ REST/GraphQL API (files, metadata)
│ • SessionService    │→ Persists layouts, annotations
│ • TelemetryService  │→ Post client metrics/logs
│ • XRService         │→ Wraps WebXR + Spark controls
└──────────┬─────────┘
           │
┌──────────▼─────────┐
│  Rendering Engines  │
│ • Spark.js (Splat)  │
│ • Three.js (UI)     │
│ • React Native Web? │ (Optional for shared UI)
└─────────────────────┘
```

## 3. Page / Module Breakdown

| Module | Description | Key Components |
| --- | --- | --- |
| **Landing / Docs** | Entry screen with onboarding, sample SPZ gallery, and docs links. | `Hero`, `SampleGallery`, `ChangelogTicker` |
| **Workspace Dashboard** | Lists uploaded scenes, metadata, FPS stats, and quick actions. | `AssetTable`, `UploadWizard`, `UsageStats`, `RecentSessions` |
| **Viewer (Desktop)** | Core 3D viewport with timeline, annotations, inspection tools. | `ViewportLayout`, `SplatViewport`, `SceneTree`, `InspectorPanel`, `PlaybackBar` |
| **Viewer (XR)** | Quest-optimized UI that reuses viewer logic but swaps input surfaces. | `XRViewport`, `XRHUD`, `ControllerBindingsPanel` |
| **Session Review** | Compares saved camera paths/annotations side-by-side. | `SessionList`, `ComparisonViewer`, `NotesPanel` |

Each page composes lower-level packages: `@app/ui`, `@app/viewer`, `@app/services`, enabling code sharing between desktop/mobile builds.

## 4. Viewer Subsystem

### State Model

- `viewerStore` (Zustand):
  - `activeAssetId`, `loadedMeshes[]`, `cameraState`, `lightingProfile`, `selection`, `xrMode`.
  - Actions: `loadAsset`, `setCamera`, `toggleXR`, `applyTransform`, `addAnnotation`.
- `react-query` caches remote data: asset metadata, thumbnails, saved sessions.

### Rendering Flow

1. `ViewerRoute` resolves `assetId` → fetch metadata via `AssetService`.
2. `SplatViewport` lazily loads Spark + fetch shim, instantiates `SplatMesh`.
3. `SceneOrchestrator` manages Three.js scene graph (multiple `Group`s so we can have layered splats, sky domes, measurement gizmos).
4. `InteractionManager` multiplexes input devices:
   - Desktop: `OrbitControls`, WASD, gizmo handles (via `three/examples/jsm/controls/TransformControls`).
   - XR: `SparkControls`, controller raycasters, hand-joint gestures.
5. `EffectsPipeline` toggles post-processing (bloom, tone mapping) via `three/examples/jsm/postprocessing`.
6. `HUD` subscribes to `viewerStore` to display FPS, active tool, selection info.
7. `SessionRecorder` captures camera + annotation events, syncs to backend via websockets/backoff REST.

### Error / Telemetry

- Global error boundary around Spark components to catch WASM init failures.
- `TelemetryService` dispatches events (`splat_loaded`, `wasm_retry`, `fps_drop`, etc.) for analysis.
- Built-in log console (collapsible) for SPZ parsing stats.

## 5. Service Contracts

| Service | Methods | Notes |
| --- | --- | --- |
| `AssetService` | `listAssets`, `getAsset(id)`, `uploadAsset(file,buckets)`, `deleteAsset`, `generateShareLink` | Uses signed URLs + background workers to generate downsampled previews. |
| `SessionService` | `saveSession(payload)`, `listSessions(assetId)`, `getSession(id)`, `deleteSession` | Payload stores `cameraKeyframes`, `annotations`, `metrics`. |
| `TelemetryService` | `track(event, payload)` | Fire-and-forget; degrade gracefully when offline. |
| `XRService` | `enterVR()`, `exitVR()`, `onControllerEvent`, `onHandPose` | Wraps WebXR session + emits to `viewerStore`. |

APIs can be stubbed locally using MSW (Mock Service Worker) so the UI remains testable without real backends.

## 6. Technology Choices

- **React 19 + Vite** for SPA; consider migrating to Next.js if we later need SSR for marketing pages.
- **TypeScript strict mode** + path aliases for package-style imports.
- **Zustand** for viewer state (small, ergonomic, avoids context waterfalls).
- **@tanstack/react-query** for async data and caching/invalidation.
- **Radix UI + Tailwind** (or CSS modules) for accessible, themeable UI primitives.
- **Vitest + Testing Library** for unit/component tests; Playwright for e2e (desktop) and WebXR smoke tests.
- **Storybook** to document UI components and viewer HUD states.

## 7. Data & File Handling

- Support drag/drop of multiple `.spz` files; queue uploads with progress bars.
- When loading remote URLs, proxy requests through backend to enforce CORS + auth and to preflight file size.
- Introduce `Asset Manifest` JSON (store in backend) describing meta (author, capture date, recommended lighting).
- Cache recently opened assets in IndexedDB with eviction policy so offline usage is partially available.

## 8. Security & Permissions

- Auth via OAuth provider; issue short-lived JWT/Access Tokens to call APIs.
- Asset-level ACLs (owner, collaborators, viewers); UI should hide actions for unauthorized users.
- Signed share links expire automatically; viewer warns before loading untrusted remote URLs.
- CSP headers + WASM MIME enforcement; continue to shim Spark fetch but prefer hosting `.wasm` in `public/` for prod.

## 9. Incremental Delivery Plan

1. **Foundation Sprint**
   - Scaffold new SPA with routing, theming, Zustand, react-query.
   - Port existing viewer into `packages/viewer`.
2. **Asset Workspace**
   - Build dashboard list, upload wizard w/ MSW mocks.
   - Wire `AssetService` to backend staging.
3. **Enhanced Viewer**
   - Multi-asset scene graph, inspector panel, diagnostics HUD.
   - Integrate session recording + telemetry.
4. **XR Mode**
   - Implement XR layout, controller bindings, dual-render (desktop + headset).
5. **Collaboration & Sharing**
   - Session review page, share links, comment threads.
6. **Hardening**
   - E2E/Playwright suite, Lighthouse perf budget, accessibility audit.

## 10. Open Questions

1. What backend stack will manage assets (S3 + Lambda, Supabase, custom)? Impacts upload flows.
2. Do we need auth for v1 or can we defer to later?
3. Quest deployment: will we host a PWA or side-load through Oculus Browser bookmarks?
4. Should we modularize as pnpm workspace (frontend packages) or stay monorepo-simple?
5. How many simultaneous splats should we target (performance budget & memory constraints)?

Answering these will refine the backlog and align with infra decisions. Meanwhile, this document should serve as the north star for implementation discussions.
