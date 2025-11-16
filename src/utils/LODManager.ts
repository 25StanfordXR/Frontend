import * as THREE from 'three';
import { SplatMesh } from '@sparkjsdev/spark';
import { ChunkLODData } from '../types';

type LODLevel = 'high' | 'low' | 'crossfade';

interface ChunkLOD {
  chunkId: string;
  bounds: THREE.Box3;
  centerPoint: THREE.Vector3;
  highQualityMesh: SplatMesh | null;
  lowQualityMesh: SplatMesh | null;
  currentLOD: LODLevel;
  fadeProgress: number; // 0 = full high quality, 1 = full low quality
  isHighLoaded: boolean;
  isLowLoaded: boolean;
  isHighLoading: boolean;
  isLowLoading: boolean;
}

export interface LODManagerConfig {
  nearDistance?: number; // Distance threshold for high quality (meters)
  farDistance?: number; // Distance threshold for low quality (meters)
  fadeDuration?: number; // Cross-fade animation duration (seconds)
  maxLoadedChunks?: number; // Memory limit for Quest 3
  enableFrustumCulling?: boolean;
}

const DEFAULT_CONFIG: Required<LODManagerConfig> = {
  nearDistance: 5.0,
  farDistance: 10.0,
  fadeDuration: 0.3,
  maxLoadedChunks: 20,
  enableFrustumCulling: true,
};

export class LODManager {
  private chunks: ChunkLOD[] = [];
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private config: Required<LODManagerConfig>;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private frustumMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private cameraWorldPos: THREE.Vector3 = new THREE.Vector3();
  private loadedChunkCount = 0;

  constructor(scene: THREE.Scene, camera: THREE.Camera, config?: LODManagerConfig) {
    this.scene = scene;
    this.camera = camera;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize chunks from LOD data array
   */
  async initializeChunks(chunkDataArray: ChunkLODData[]): Promise<void> {
    // Clear existing chunks
    this.dispose();

    // Create chunk LOD structures
    for (const data of chunkDataArray) {
      const bounds = new THREE.Box3(
        new THREE.Vector3(...data.bounds.min),
        new THREE.Vector3(...data.bounds.max)
      );

      const centerPoint = new THREE.Vector3();
      bounds.getCenter(centerPoint);

      const chunk: ChunkLOD = {
        chunkId: data.chunkId,
        bounds,
        centerPoint,
        highQualityMesh: null,
        lowQualityMesh: null,
        currentLOD: 'low',
        fadeProgress: 1.0,
        isHighLoaded: false,
        isLowLoaded: false,
        isHighLoading: false,
        isLowLoading: false,
      };

      this.chunks.push(chunk);

      // Start loading low quality meshes immediately
      this.loadLowQualityMesh(chunk, data.lowQualityUrl);
    }

    // Store chunk data for lazy high-quality loading
    this.chunkDataMap = new Map(chunkDataArray.map((d) => [d.chunkId, d]));
  }

  private chunkDataMap: Map<string, ChunkLODData> = new Map();

  /**
   * Load low quality mesh for a chunk
   */
  private async loadLowQualityMesh(chunk: ChunkLOD, url: string): Promise<void> {
    if (chunk.isLowLoaded || chunk.isLowLoading) return;

    chunk.isLowLoading = true;

    try {
      const mesh = new SplatMesh({ url });
      mesh.rotation.x = Math.PI; // Match SPZViewer convention
      mesh.position.set(0, 0, 0);
      mesh.visible = false; // Initially hidden until LOD system activates it

      await mesh.initialized;

      chunk.lowQualityMesh = mesh;
      chunk.isLowLoaded = true;
      chunk.isLowLoading = false;

      this.scene.add(mesh);
      this.loadedChunkCount++;
    } catch (error) {
      console.error(`Failed to load low quality mesh for chunk ${chunk.chunkId}:`, error);
      chunk.isLowLoading = false;
    }
  }

  /**
   * Load high quality mesh for a chunk (lazy loaded when camera gets close)
   */
  private async loadHighQualityMesh(chunk: ChunkLOD, url: string): Promise<void> {
    if (chunk.isHighLoaded || chunk.isHighLoading) return;

    chunk.isHighLoading = true;

    try {
      const mesh = new SplatMesh({ url });
      mesh.rotation.x = Math.PI;
      mesh.position.set(0, 0, 0);
      mesh.visible = false;

      await mesh.initialized;

      chunk.highQualityMesh = mesh;
      chunk.isHighLoaded = true;
      chunk.isHighLoading = false;

      this.scene.add(mesh);
      this.loadedChunkCount++;

      // Enforce memory limits
      this.enforceMemoryLimit();
    } catch (error) {
      console.error(`Failed to load high quality mesh for chunk ${chunk.chunkId}:`, error);
      chunk.isHighLoading = false;
    }
  }

  /**
   * Update LOD system each frame
   */
  update(deltaTime: number = 0.016): void {
    if (this.chunks.length === 0) return;

    // Update camera world position
    this.camera.getWorldPosition(this.cameraWorldPos);

    // Update frustum if culling is enabled
    if (this.config.enableFrustumCulling) {
      this.frustumMatrix.multiplyMatrices(
        this.camera.projectionMatrix,
        this.camera.matrixWorldInverse
      );
      this.frustum.setFromProjectionMatrix(this.frustumMatrix);
    }

    // Update each chunk
    for (const chunk of this.chunks) {
      this.updateChunk(chunk, deltaTime);
    }
  }

  /**
   * Update individual chunk LOD based on distance and frustum
   */
  private updateChunk(chunk: ChunkLOD, deltaTime: number): void {
    // Frustum culling
    if (this.config.enableFrustumCulling) {
      if (!this.frustum.intersectsBox(chunk.bounds)) {
        // Outside frustum - hide both meshes
        if (chunk.highQualityMesh) chunk.highQualityMesh.visible = false;
        if (chunk.lowQualityMesh) chunk.lowQualityMesh.visible = false;
        return;
      }
    }

    // Calculate distance from camera to chunk center
    const distance = this.cameraWorldPos.distanceTo(chunk.centerPoint);

    // Lazy load high quality mesh if camera is approaching
    const preloadDistance = this.config.farDistance + 5.0; // Preload 5m before transition
    if (distance < preloadDistance && !chunk.isHighLoaded && !chunk.isHighLoading) {
      const chunkData = this.chunkDataMap.get(chunk.chunkId);
      if (chunkData) {
        this.loadHighQualityMesh(chunk, chunkData.highQualityUrl);
      }
    }

    // Determine target LOD state
    let targetLOD: LODLevel;
    let targetFadeProgress: number;

    if (distance < this.config.nearDistance) {
      // Near zone: full high quality
      targetLOD = 'high';
      targetFadeProgress = 0.0;
    } else if (distance > this.config.farDistance) {
      // Far zone: full low quality
      targetLOD = 'low';
      targetFadeProgress = 1.0;
    } else {
      // Crossfade zone
      targetLOD = 'crossfade';
      const t =
        (distance - this.config.nearDistance) /
        (this.config.farDistance - this.config.nearDistance);
      targetFadeProgress = t;
    }

    // Animate fade progress smoothly
    const fadeSpeed = 1.0 / this.config.fadeDuration;
    const fadeDirection = targetFadeProgress > chunk.fadeProgress ? 1 : -1;
    const fadeDelta = fadeSpeed * deltaTime * fadeDirection;

    if (Math.abs(targetFadeProgress - chunk.fadeProgress) > 0.01) {
      chunk.fadeProgress = THREE.MathUtils.clamp(
        chunk.fadeProgress + fadeDelta,
        0.0,
        1.0
      );
    } else {
      chunk.fadeProgress = targetFadeProgress;
    }

    chunk.currentLOD = targetLOD;

    // Apply visibility and opacity based on fade progress
    this.applyLODState(chunk);
  }

  /**
   * Apply LOD state to chunk meshes (visibility and opacity)
   */
  private applyLODState(chunk: ChunkLOD): void {
    const { highQualityMesh, lowQualityMesh, fadeProgress } = chunk;

    if (!lowQualityMesh?.isInitialized) {
      // Low quality not ready yet, hide everything
      if (highQualityMesh) {
        highQualityMesh.visible = false;
      }
      return;
    }

    if (!highQualityMesh?.isInitialized) {
      // High quality not loaded yet, show only low quality
      lowQualityMesh.visible = true;
      lowQualityMesh.opacity = 1.0;
      return;
    }

    // Both meshes available - apply crossfade
    if (fadeProgress < 0.01) {
      // Full high quality
      highQualityMesh.visible = true;
      highQualityMesh.opacity = 1.0;
      lowQualityMesh.visible = false;
    } else if (fadeProgress > 0.99) {
      // Full low quality
      highQualityMesh.visible = false;
      lowQualityMesh.visible = true;
      lowQualityMesh.opacity = 1.0;
    } else {
      // Crossfade both
      highQualityMesh.visible = true;
      highQualityMesh.opacity = 1.0 - fadeProgress;
      lowQualityMesh.visible = true;
      lowQualityMesh.opacity = fadeProgress;
    }
  }

  /**
   * Enforce memory limits by unloading distant high quality meshes
   */
  private enforceMemoryLimit(): void {
    if (this.loadedChunkCount <= this.config.maxLoadedChunks) return;

    // Find chunks with loaded high quality meshes, sorted by distance
    const chunksWithHigh = this.chunks
      .filter((c) => c.isHighLoaded && c.highQualityMesh)
      .map((c) => ({
        chunk: c,
        distance: this.cameraWorldPos.distanceTo(c.centerPoint),
      }))
      .sort((a, b) => b.distance - a.distance); // Furthest first

    // Unload furthest chunks until under limit
    const toUnload = this.loadedChunkCount - this.config.maxLoadedChunks;
    for (let i = 0; i < Math.min(toUnload, chunksWithHigh.length); i++) {
      const { chunk } = chunksWithHigh[i];
      this.unloadHighQualityMesh(chunk);
    }
  }

  /**
   * Unload high quality mesh from a chunk
   */
  private unloadHighQualityMesh(chunk: ChunkLOD): void {
    if (!chunk.highQualityMesh) return;

    this.scene.remove(chunk.highQualityMesh);
    // SplatMesh doesn't have explicit dispose, but removing from scene frees GPU resources
    chunk.highQualityMesh = null;
    chunk.isHighLoaded = false;
    chunk.isHighLoading = false;
    this.loadedChunkCount--;
  }

  /**
   * Get LOD statistics for debugging
   */
  getStats(): {
    totalChunks: number;
    loadedChunks: number;
    highQualityVisible: number;
    lowQualityVisible: number;
    crossfading: number;
  } {
    const stats = {
      totalChunks: this.chunks.length,
      loadedChunks: this.loadedChunkCount,
      highQualityVisible: 0,
      lowQualityVisible: 0,
      crossfading: 0,
    };

    for (const chunk of this.chunks) {
      if (chunk.currentLOD === 'high' && chunk.highQualityMesh?.visible) {
        stats.highQualityVisible++;
      } else if (chunk.currentLOD === 'low' && chunk.lowQualityMesh?.visible) {
        stats.lowQualityVisible++;
      } else if (chunk.currentLOD === 'crossfade') {
        stats.crossfading++;
      }
    }

    return stats;
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<LODManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    for (const chunk of this.chunks) {
      if (chunk.highQualityMesh) {
        this.scene.remove(chunk.highQualityMesh);
      }
      if (chunk.lowQualityMesh) {
        this.scene.remove(chunk.lowQualityMesh);
      }
    }

    this.chunks = [];
    this.chunkDataMap.clear();
    this.loadedChunkCount = 0;
  }
}
