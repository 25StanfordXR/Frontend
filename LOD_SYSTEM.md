# Distance-based LOD System for SPZ Point Clouds

## Overview

This project now supports a **Level of Detail (LOD) system** that dynamically switches between high-quality and low-quality point cloud chunks based on camera distance. This optimization is specifically designed for **Meta Quest 3** to maximize performance while maintaining visual quality.

## Features

- **Automatic Quality Switching**: High-quality chunks near camera (< 5m), low-quality far away (> 10m)
- **Smooth Cross-fade Transitions**: Opacity-based blending between quality levels
- **Frustum Culling**: Only renders chunks visible to the camera
- **Lazy Loading**: High-quality chunks loaded on-demand as camera approaches
- **Memory Management**: Automatically unloads distant chunks to stay within Quest 3 limits (20 chunks max)
- **Backward Compatible**: Still supports legacy single SPZ file mode

## Architecture

### Key Components

1. **LODManager** (`src/utils/LODManager.ts`)
   - Core LOD management logic
   - Distance calculations and quality switching
   - Cross-fade animations
   - Memory management

2. **SPZViewer** (`src/components/SPZViewer/SPZViewer.tsx`)
   - Integrated LOD manager into render loop
   - Supports both single source and chunks array
   - Updates LOD system every frame

3. **App.tsx**
   - Detects chunked vs single file responses
   - Processes chunk metadata from backend
   - Groups files by chunk_id and lod_level

### Data Flow

```
Backend Response
    ↓
processChunkedFiles() → ChunkLODData[]
    ↓
SPZViewer receives chunks prop
    ↓
LODManager.initializeChunks()
    ↓
Animation Loop → LODManager.update(deltaTime)
    ↓
Distance calculations → Visibility/Opacity updates
    ↓
Spark.js renders visible meshes
```

## Configuration

### LOD Distance Thresholds

Default configuration optimized for Meta Quest 3:

```typescript
{
  nearDistance: 5.0,      // Meters - high quality within this
  farDistance: 10.0,      // Meters - low quality beyond this
  fadeDuration: 0.3,      // Seconds - cross-fade animation time
  maxLoadedChunks: 20,    // Memory limit
  enableFrustumCulling: true
}
```

### Adjusting Thresholds

To modify thresholds, edit `src/components/SPZViewer/SPZViewer.tsx` line 263:

```typescript
const lodManager = new LODManager(sceneRef.current, cameraRef.current, {
  nearDistance: 7.0,   // Increase for larger high-quality radius
  farDistance: 15.0,   // Increase for wider cross-fade zone
  fadeDuration: 0.5,   // Slower cross-fade
  maxLoadedChunks: 30, // More chunks (higher memory usage)
  enableFrustumCulling: true,
});
```

## Backend API Requirements

### Chunked File Format

For LOD mode to activate, the backend must return files with these additional fields:

```typescript
interface MapFileInfo {
  kind: 'plz' | 'ply';
  file_name: string;
  url: string;
  // LOD extensions:
  lod_level?: 'high' | 'low';
  chunk_id?: string;
  chunk_bounds?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}
```

### Example Response

```json
{
  "map_id": "map_001",
  "title": "Cyber Port",
  "description": "Neon-lit industrial port",
  "confidence": 0.95,
  "files": [
    {
      "kind": "plz",
      "file_name": "chunk_0_high.spz",
      "url": "/assets/maps/map_001/chunk_0_high.spz",
      "lod_level": "high",
      "chunk_id": "chunk_0",
      "chunk_bounds": {
        "min": [-10, 0, -10],
        "max": [0, 5, 0]
      }
    },
    {
      "kind": "plz",
      "file_name": "chunk_0_low.spz",
      "url": "/assets/maps/map_001/chunk_0_low.spz",
      "lod_level": "low",
      "chunk_id": "chunk_0",
      "chunk_bounds": {
        "min": [-10, 0, -10],
        "max": [0, 5, 0]
      }
    },
    {
      "kind": "plz",
      "file_name": "chunk_1_high.spz",
      "url": "/assets/maps/map_001/chunk_1_high.spz",
      "lod_level": "high",
      "chunk_id": "chunk_1",
      "chunk_bounds": {
        "min": [0, 0, -10],
        "max": [10, 5, 0]
      }
    },
    {
      "kind": "plz",
      "file_name": "chunk_1_low.spz",
      "url": "/assets/maps/map_001/chunk_1_low.spz",
      "lod_level": "low",
      "chunk_id": "chunk_1",
      "chunk_bounds": {
        "min": [0, 0, -10],
        "max": [10, 5, 0]
      }
    }
  ]
}
```

### Fallback Mode

If `chunk_id` or `lod_level` fields are missing, the system automatically falls back to legacy single-file mode using the first `plz` file found.

## Testing Guide

### Testing Without Backend Changes

For testing the LOD system without modifying your backend, you can create mock chunk data:

1. **Create Test Files**:
   - Place test SPZ files in `public/test-lod/`
   - Create both high and low quality versions
   - Example: `chunk_0_high.spz`, `chunk_0_low.spz`

2. **Mock the Response**:

Edit `src/App.tsx` and temporarily modify `handlePromptSubmit`:

```typescript
const handlePromptSubmit = useCallback(async (value: string) => {
  const normalized = value.trim();
  if (!normalized) {
    setApiError('Description cannot be empty');
    return;
  }

  setPhase('loading');
  setApiError(null);

  try {
    // MOCK DATA FOR TESTING - Remove when backend is ready
    const mockResult: MapMatchResponse = {
      map_id: 'test_001',
      title: 'Test LOD Scene',
      description: 'Testing distance-based LOD',
      confidence: 1.0,
      reasoning: 'Mock data for LOD testing',
      files: [
        {
          kind: 'plz',
          file_name: 'chunk_0_high.spz',
          url: '/test-lod/chunk_0_high.spz',
          lod_level: 'high',
          chunk_id: 'chunk_0',
          chunk_bounds: {
            min: [-10, 0, -10],
            max: [0, 5, 0],
          },
        },
        {
          kind: 'plz',
          file_name: 'chunk_0_low.spz',
          url: '/test-lod/chunk_0_low.spz',
          lod_level: 'low',
          chunk_id: 'chunk_0',
          chunk_bounds: {
            min: [-10, 0, -10],
            max: [0, 5, 0],
          },
        },
        {
          kind: 'plz',
          file_name: 'chunk_1_high.spz',
          url: '/test-lod/chunk_1_high.spz',
          lod_level: 'high',
          chunk_id: 'chunk_1',
          chunk_bounds: {
            min: [0, 0, -10],
            max: [10, 5, 0],
          },
        },
        {
          kind: 'plz',
          file_name: 'chunk_1_low.spz',
          url: '/test-lod/chunk_1_low.spz',
          lod_level: 'low',
          chunk_id: 'chunk_1',
          chunk_bounds: {
            min: [0, 0, -10],
            max: [10, 5, 0],
          },
        },
      ],
    };

    setPrompt(normalized);
    setMatchResult(mockResult);
    setPhase('ready');

    // Real API call (commented out for testing)
    // const result = await requestMapMatch(normalized);
    // setPrompt(normalized);
    // setMatchResult(result);
    // setPhase('ready');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Match failed';
    setApiError(message);
    setPhase('error');
  }
}, []);
```

### Testing Checklist

- [ ] Single file mode still works (backward compatibility)
- [ ] Chunks load with both high and low quality versions
- [ ] Camera movement triggers quality switches
- [ ] Cross-fade is smooth (no pop-in)
- [ ] Frustum culling hides chunks outside view
- [ ] High-quality chunks lazy load when approaching
- [ ] Memory limit enforced (check console for LOD stats)
- [ ] VR mode works with LOD system on Quest 3
- [ ] Performance is 72 FPS on Quest 3

### Debug Mode

Add debug output to console by modifying `src/utils/LODManager.ts`:

After line 226 in the `update` method, add:

```typescript
// Debug output every 60 frames (~1 second)
if (Math.random() < 0.016) {
  console.log('LOD Stats:', this.getStats());
}
```

Expected console output:
```
LOD Stats: {
  totalChunks: 4,
  loadedChunks: 8,
  highQualityVisible: 1,
  lowQualityVisible: 2,
  crossfading: 1
}
```

## Performance Optimization Tips

### For Quest 3

1. **Splat Count Recommendations**:
   - High quality: 500K - 1M splats per chunk
   - Low quality: 50K - 250K splats per chunk (10-25% of high)
   - Total visible: ~3-5M splats for 72 FPS

2. **Chunk Size**:
   - Spatial extent: 10-20 meters per chunk
   - Smaller chunks = more granular LOD control
   - Larger chunks = fewer state transitions

3. **Distance Tuning**:
   - Increase `nearDistance` if high quality too limited
   - Decrease `farDistance` if performance suffers
   - Balance visual quality vs frame rate

### Dynamic Foveation

The system already uses maximum foveation (level 1) for Quest 3. For additional optimization, add dynamic foveation based on visible chunks:

```typescript
// In SPZViewer animation loop, after LOD update
if (renderer.xr.isPresenting && lodManagerRef.current) {
  const stats = lodManagerRef.current.getStats();
  const visibleChunks = stats.highQualityVisible + stats.lowQualityVisible;
  renderer.xr.setFoveation(visibleChunks > 10 ? 1 : 0.5);
}
```

## Troubleshooting

### Issue: Chunks not loading

**Symptoms**: Viewer shows placeholder, no SPZ loaded

**Solutions**:
- Check browser console for errors
- Verify backend response includes `lod_level` and `chunk_id` fields
- Ensure both high and low quality files exist for each chunk
- Check `chunk_bounds` are valid (min < max for all axes)

### Issue: All chunks show low quality

**Symptoms**: Only low-quality visible regardless of distance

**Solutions**:
- Check `nearDistance` threshold (default 5m)
- Move camera closer to chunk centers
- Verify high-quality files are accessible (check network tab)
- Check console for loading errors

### Issue: Performance drops on Quest 3

**Symptoms**: Frame rate below 72 FPS, stuttering

**Solutions**:
- Reduce `maxLoadedChunks` (try 15 or 10)
- Decrease low-quality splat count (aim for 10% of high)
- Increase `nearDistance` to limit high-quality radius
- Enable more aggressive frustum culling
- Check total splat count isn't exceeding 5M

### Issue: Cross-fade is jarring

**Symptoms**: Visible pop-in when quality switches

**Solutions**:
- Increase `fadeDuration` (try 0.5 or 0.7 seconds)
- Widen cross-fade zone (increase gap between near/far distance)
- Check opacity values in LODManager (should be 0-1 range)

## Future Enhancements

Potential improvements to the LOD system:

1. **Adaptive Thresholds**: Adjust distances based on detected frame rate
2. **Preloading Strategy**: Predictive loading based on movement direction
3. **Compression Levels**: Support 3+ quality tiers (ultra-low, low, medium, high)
4. **Streaming**: Progressive loading of splat chunks
5. **Occlusion Culling**: Hide chunks behind walls/objects
6. **User Controls**: UI sliders to adjust quality/performance balance in VR

## API Reference

### LODManager

```typescript
class LODManager {
  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    config?: LODManagerConfig
  );

  // Initialize with chunk data array
  async initializeChunks(chunks: ChunkLODData[]): Promise<void>;

  // Update LOD system (call every frame)
  update(deltaTime: number): void;

  // Get current statistics
  getStats(): {
    totalChunks: number;
    loadedChunks: number;
    highQualityVisible: number;
    lowQualityVisible: number;
    crossfading: number;
  };

  // Update configuration at runtime
  updateConfig(config: Partial<LODManagerConfig>): void;

  // Clean up resources
  dispose(): void;
}
```

### LODManagerConfig

```typescript
interface LODManagerConfig {
  nearDistance?: number;         // Default: 5.0 meters
  farDistance?: number;          // Default: 10.0 meters
  fadeDuration?: number;         // Default: 0.3 seconds
  maxLoadedChunks?: number;      // Default: 20 chunks
  enableFrustumCulling?: boolean; // Default: true
}
```

### ChunkLODData

```typescript
interface ChunkLODData {
  chunkId: string;
  highQualityUrl: string;
  lowQualityUrl: string;
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
}
```

## Credits

LOD system implemented for 25XR World Matching Agent. Optimized for Meta Quest 3 using Spark.js Gaussian splatting renderer.
