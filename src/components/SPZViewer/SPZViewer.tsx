import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import '../../utils/patchSparkFetch';
// @ts-ignore - Spark.js types may not be complete
import { SplatMesh } from '@sparkjsdev/spark';
import './SPZViewer.css';

interface SPZViewerProps {
  source: string | File;
  onError: (error: string) => void;
  onLoadComplete: () => void;
  onRegisterReset?: (reset: () => void) => void;
}

const MAX_PIXEL_RATIO = 1.5;
const XR_PIXEL_RATIO = 1.0;
const applyDeadzone = (value: number, threshold = 0.2) => (Math.abs(value) < threshold ? 0 : value);
const pickPrimaryAxes = (axes: readonly number[]): { x: number; y: number } => {
  const pairs: Array<[number, number]> = axes.length >= 4 ? [[0, 1], [2, 3]] : [[0, 1]];
  let selected: { x: number; y: number; weight: number } = { x: 0, y: 0, weight: 0 };
  for (const [i, j] of pairs) {
    const x = axes[i] ?? 0;
    const y = axes[j] ?? 0;
    const weight = Math.abs(x) + Math.abs(y);
    if (weight > selected.weight) {
      selected = { x, y, weight };
    }
  }
  return { x: selected.x, y: selected.y };
};

const getFirstXRCamera = (camera: THREE.Camera): THREE.Camera => {
  const maybeArray = camera as THREE.ArrayCamera;
  if ((maybeArray as THREE.ArrayCamera).isArrayCamera && maybeArray.cameras.length > 0) {
    return maybeArray.cameras[0];
  }
  return camera;
};

export default function SPZViewer({ source, onError, onLoadComplete, onRegisterReset }: SPZViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rigRef = useRef<THREE.Group | null>(null);
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
  const controllerDataRef = useRef<THREE.Group[]>([]);
  const xrAxesRef = useRef({ forward: 0, turn: 0 });
  const xrButtonRef = useRef<HTMLElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const MOVE_SPEED = 0.08;
  const TURN_SPEED = 0.05;

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
      camera.position.set(0, 0, 0);
      camera.lookAt(0, 0, -1);
      cameraRef.current = camera;
      const rig = new THREE.Group();
      rig.name = 'xr-rig';
      rig.add(camera);
      scene.add(rig);
      rigRef.current = rig;

      // Create renderer
      const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local-floor');
      renderer.xr.setFoveation(1);
      containerRef.current.appendChild(renderer.domElement);
      const xrButton = VRButton.createButton(renderer, { requiredFeatures: ['local-floor'] });
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
      controls.target.set(0, 0, -1);
      controls.update();
      controlsRef.current = controls;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const controllerModelFactory = new XRControllerModelFactory();
      const controllerLineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -0.5),
      ]);
      const setupController = (index: number) => {
        const controller = renderer.xr.getController(index);
        controller.addEventListener('connected', (event) => {
          controller.userData.inputSource = event.data;
          controllerDataRef.current[index] = controller;
        });
        controller.addEventListener('disconnected', () => {
          delete controller.userData.inputSource;
          controllerDataRef.current[index] = controller;
          xrAxesRef.current = { forward: 0, turn: 0 };
        });
        const line = new THREE.Line(controllerLineGeometry);
        line.scale.z = 1.5;
        controller.add(line);
        scene.add(controller);

        const grip = renderer.xr.getControllerGrip(index);
        grip.add(controllerModelFactory.createControllerModel(grip));
        scene.add(grip);
      };

      setupController(0);
      setupController(1);

      setIsInitialized(true);

      // Handle window resize
      const handleResize = () => {
        if (!containerRef.current || !camera || !renderer) return;

        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      };

      window.addEventListener('resize', handleResize);

      const handleSessionStart = () => {
        controls.enabled = false;
        renderer.setPixelRatio(XR_PIXEL_RATIO);
      };

      const handleSessionEnd = () => {
        controls.enabled = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      };

      renderer.xr.addEventListener('sessionstart', handleSessionStart);
      renderer.xr.addEventListener('sessionend', handleSessionEnd);

      return () => {
        window.removeEventListener('resize', handleResize);
        renderer.xr.removeEventListener('sessionstart', handleSessionStart);
        renderer.xr.removeEventListener('sessionend', handleSessionEnd);
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
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    const renderScene = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (renderer.xr.isPresenting && rigRef.current) {
        const xrRenderCamera = renderer.xr.getCamera();
        const xrCamera = getFirstXRCamera(xrRenderCamera);
        if (xrCamera) {
          xrCamera.matrixWorld.decompose(tempPosition, tempQuaternion, tempScale);
          rigRef.current.position.sub(tempPosition);
          tempPosition.set(0, 0, 0);
          const rigRotation = rigRef.current.quaternion.clone();
          xrCamera.matrixWorld.compose(tempPosition, rigRotation, tempScale);
          xrCamera.matrixWorldInverse.copy(xrCamera.matrixWorld).invert();
        }
      }

      if (renderer.xr.isPresenting) {
        let forwardAxis = 0;
        let turnAxis = 0;
        controllerDataRef.current.forEach((controller) => {
          const inputSource = controller?.userData?.inputSource as XRInputSource | undefined;
          const gamepad = inputSource?.gamepad;
          if (!inputSource || !gamepad) return;
          const { x, y } = pickPrimaryAxes(gamepad.axes);
          if (inputSource.handedness === 'left') {
            forwardAxis += applyDeadzone(-y);
          }
          if (inputSource.handedness === 'right') {
            turnAxis += applyDeadzone(x);
          }
        });
        xrAxesRef.current = { forward: forwardAxis, turn: turnAxis };
      } else if (xrAxesRef.current.forward !== 0 || xrAxesRef.current.turn !== 0) {
        xrAxesRef.current = { forward: 0, turn: 0 };
      }

      if (cameraRef.current) {
        const orbitControls = controlsRef.current;
        const { forward, backward, left, right } = movementRef.current;
        const keyboardForward = (forward ? 1 : 0) + (backward ? -1 : 0);
        const keyboardTurn = (right ? 1 : 0) + (left ? -1 : 0);
        const totalForward = keyboardForward + xrAxesRef.current.forward;
        const totalTurn = keyboardTurn + xrAxesRef.current.turn;

        if (totalForward !== 0 || totalTurn !== 0) {
          cameraRef.current.getWorldDirection(forwardVector);
          forwardVector.y = 0;
          if (forwardVector.lengthSq() > 0) {
            forwardVector.normalize();
          }
          rightVector.copy(forwardVector).cross(cameraRef.current.up).normalize();

          const movementAnchor = renderer.xr.isPresenting ? rigRef.current : cameraRef.current;
          if (movementAnchor) {
            moveVector.set(0, 0, 0);
            if (totalForward !== 0) {
              moveVector.addScaledVector(forwardVector, totalForward);
            }

            if (moveVector.lengthSq() > 0) {
              moveVector.normalize().multiplyScalar(MOVE_SPEED);
              movementAnchor.position.add(moveVector);
              if (orbitControls) {
                orbitControls.target.add(moveVector);
              }
            }

            if (totalTurn !== 0) {
              movementAnchor.rotateY(totalTurn * TURN_SPEED);
              orbitControls?.update();
            }
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
  const resetCamera = useCallback(() => {
    if (rigRef.current) {
      rigRef.current.position.set(0, 0, 0);
      rigRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 0);
      cameraRef.current.rotation.set(0, 0, 0);
      controlsRef.current.target.set(0, 0, -1);
      controlsRef.current.update();
    }
  }, []);

  // Expose reset function
  useEffect(() => {
    if (!onRegisterReset) {
      return undefined;
    }
    onRegisterReset(resetCamera);
    return () => onRegisterReset(() => undefined);
  }, [onRegisterReset, resetCamera]);

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
