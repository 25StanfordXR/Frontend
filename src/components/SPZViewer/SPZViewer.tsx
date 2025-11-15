import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import '../../utils/patchSparkFetch';
// @ts-ignore - Spark.js types may not be complete
import { SplatMesh } from '@sparkjsdev/spark';
import './SPZViewer.css';

interface SPZViewerProps {
  source: string | File;
  onError: (error: string) => void;
  onLoadComplete: () => void;
}

export default function SPZViewer({ source, onError, onLoadComplete }: SPZViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const splatMeshRef = useRef<SplatMesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const movementRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const xrButtonRef = useRef<HTMLElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const MOVE_SPEED = 0.08;

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    try {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a1a);
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75,
        containerRef.current.clientWidth / containerRef.current.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.xr.enabled = true;
      containerRef.current.appendChild(renderer.domElement);
      const xrButton = VRButton.createButton(renderer);
      xrButton.style.position = 'absolute';
      xrButton.style.bottom = '16px';
      xrButton.style.right = '16px';
      xrButtonRef.current = xrButton;
      containerRef.current.appendChild(xrButton);
      rendererRef.current = renderer;

      // Add orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 1;
      controls.maxDistance = 100;
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      setIsInitialized(true);

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;

        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    } catch (error) {
      onError(`Failed to initialize 3D viewer: ${error}`);
    }
  }, [isInitialized, onError]);

  // Load SPZ file
  useEffect(() => {
    if (!isInitialized || !sceneRef.current) return;

    const loadSPZ = async () => {
      try {
        // Remove previous splat mesh if exists
        if (splatMeshRef.current) {
          sceneRef.current?.remove(splatMeshRef.current);
          splatMeshRef.current = null;
        }

        let splatURL: string;

        // Convert File to URL if needed
        if (source instanceof File) {
          splatURL = URL.createObjectURL(source);
        } else {
          splatURL = source;
        }

        // Create and load SplatMesh
        // Spark.js will handle WASM initialization automatically
        const splatMesh = new SplatMesh({ url: splatURL });
        splatMesh.rotation.x = Math.PI;

        // Add to scene
        splatMesh.position.set(0, 0, 0);
        sceneRef.current?.add(splatMesh);
        splatMeshRef.current = splatMesh;

        // Notify loading complete
        // Note: The actual SPZ data loads asynchronously
        onLoadComplete();

        // Clean up blob URL if created
        if (source instanceof File) {
          URL.revokeObjectURL(splatURL);
        }
      } catch (error) {
        onError(`Failed to load SPZ file: ${error}`);
      }
    };

    loadSPZ();
  }, [source, isInitialized, onError, onLoadComplete]);

  // Animation loop
  useEffect(() => {
    if (!isInitialized || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;

    const renderer = rendererRef.current;
    const forwardVector = new THREE.Vector3();
    const rightVector = new THREE.Vector3();
    const moveVector = new THREE.Vector3();

    const renderScene = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (cameraRef.current && controlsRef.current) {
        const { forward, backward, left, right } = movementRef.current;
        if (forward || backward || left || right) {
          cameraRef.current.getWorldDirection(forwardVector);
          forwardVector.y = 0;
          if (forwardVector.lengthSq() > 0) {
            forwardVector.normalize();
          }
          rightVector.copy(forwardVector).cross(cameraRef.current.up).normalize();

          moveVector.set(0, 0, 0);
          if (forward) moveVector.add(forwardVector);
          if (backward) moveVector.sub(forwardVector);
          if (right) moveVector.add(rightVector);
          if (left) moveVector.sub(rightVector);

          if (moveVector.lengthSq() > 0) {
            moveVector.normalize().multiplyScalar(MOVE_SPEED);
            cameraRef.current.position.add(moveVector);
            controlsRef.current.target.add(moveVector);
          }
        }
      }

      if (renderer && sceneRef.current && cameraRef.current) {
        renderer.render(sceneRef.current, cameraRef.current);
      }
    };

    if (renderer.setAnimationLoop) {
      renderer.setAnimationLoop(renderScene);
    } else {
      const animateFallback = () => {
        animationFrameRef.current = requestAnimationFrame(animateFallback);
        renderScene();
      };
      animateFallback();
    }

    return () => {
      if (renderer.setAnimationLoop) {
        renderer.setAnimationLoop(null);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      if (xrButtonRef.current && containerRef.current?.contains(xrButtonRef.current)) {
        containerRef.current.removeChild(xrButtonRef.current);
      }
      if (splatMeshRef.current) {
        sceneRef.current?.remove(splatMeshRef.current);
      }
    };
  }, []);

  // Reset camera function
  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 5);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Expose reset function
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).resetCamera = resetCamera;
    }
  }, []);

  useEffect(() => {
    const handleMovementChange = (event: KeyboardEvent, isActive: boolean) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'w') movementRef.current.forward = isActive;
      if (key === 's') movementRef.current.backward = isActive;
      if (key === 'a') movementRef.current.left = isActive;
      if (key === 'd') movementRef.current.right = isActive;
    };

    const handleKeyDown = (event: KeyboardEvent) => handleMovementChange(event, true);
    const handleKeyUp = (event: KeyboardEvent) => handleMovementChange(event, false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return <div ref={containerRef} className="spz-viewer-container" />;
}
