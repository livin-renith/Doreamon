"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface Doraemon3DProps {
  className?: string;
  onModelClick?: () => void;
}

const Doraemon3D = memo(function Doraemon3D({ className = "", onModelClick }: Doraemon3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const onClickRef = useRef(onModelClick);
  onClickRef.current = onModelClick;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    let isDisposed = false;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // Perspective Camera: looking at Doraemon centered with comfortable headroom
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 0.08, 3.0);
    camera.lookAt(0, 0.08, 0);

    // High performance WebGLRenderer with transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // --- Lighting ---
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Light (warm high front-right)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.3);
    keyLight.position.set(3.5, 4.5, 3.5);
    scene.add(keyLight);

    // Rim Light (cool cartoon sky-blue contour from back-left)
    const rimLight = new THREE.DirectionalLight(0x7ed6fa, 1.7);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);

    // Fill Light (soft frontal)
    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.9);
    fillLight.position.set(-2.5, 1.0, 2.5);
    scene.add(fillLight);

    // Ground bounce light
    const bounceLight = new THREE.DirectionalLight(0xbae6fd, 0.5);
    bounceLight.position.set(0, -2.5, 1.5);
    scene.add(bounceLight);

    // --- Model Hierarchy Groups ---
    // Doraemon's height in the GLB is 1.80 (from Y=0 to Y=1.80, center at Y=0.90)
    // By setting rootGroup Y to -0.90, the center of Doraemon is at (0, 0, 0)
    const rootGroup = new THREE.Group();
    rootGroup.position.set(0, -0.90, 0);
    scene.add(rootGroup);

    const bodyGroup = new THREE.Group();
    rootGroup.add(bodyGroup);

    // Neck pivot around Y ~0.835, Z ~0.04 in GLB coordinates
    const neckY = 0.835;
    const neckZ = 0.04;
    const neckPivot = new THREE.Vector3(0, neckY, neckZ);
    const invNeck = new THREE.Vector3(0, -neckY, -neckZ);

    const headGroup = new THREE.Group();
    headGroup.position.copy(neckPivot);
    rootGroup.add(headGroup);

    // Eyes / pupils group (child of headGroup, allows independent pupil tracking)
    const eyesGroup = new THREE.Group();
    headGroup.add(eyesGroup);

    // --- Mouse & Physics State ---
    const mouse = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    let hopY = 0;
    let hopVel = 0;

    // Helper to create sub-meshes for split geometry
    function createSubMesh(
      originalMesh: THREE.Mesh,
      indices: number[],
      offset: THREE.Vector3,
      isEye = false
    ): THREE.Mesh | null {
      if (!indices || indices.length === 0) return null;
      const originalGeom = originalMesh.geometry as THREE.BufferGeometry;
      const geom = originalGeom.clone();
      geom.setIndex(indices);

      let mat = originalMesh.material;
      if (isEye) {
        if (Array.isArray(mat)) {
          mat = mat.map((m) => {
            const cm = m.clone();
            cm.polygonOffset = true;
            cm.polygonOffsetFactor = -1.5;
            cm.polygonOffsetUnits = -1.5;
            return cm;
          });
        } else {
          mat = mat.clone();
          mat.polygonOffset = true;
          mat.polygonOffsetFactor = -1.5;
          mat.polygonOffsetUnits = -1.5;
        }
      }

      const subMesh = new THREE.Mesh(geom, mat);
      subMesh.position.copy(offset);
      return subMesh;
    }

    // --- Load Doraemon GLB ---
    const loader = new GLTFLoader();
    loader.load(
      "/3D/doraemon.glb",
      (gltf) => {
        if (isDisposed) return;

        gltf.scene.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const name = obj.name;
          const geom = obj.geometry as THREE.BufferGeometry;
          const pos = geom.attributes.position;
          const index = geom.index;

          // 1. Eye Glint mesh (highlights)
          if (name === "Doraemon_4") {
            const eyeMesh = obj.clone();
            eyeMesh.position.copy(invNeck);
            if (!Array.isArray(eyeMesh.material)) {
              eyeMesh.material.polygonOffset = true;
              eyeMesh.material.polygonOffsetFactor = -2;
              eyeMesh.material.polygonOffsetUnits = -2;
            }
            eyesGroup.add(eyeMesh);
            return;
          }

          // 2. Head meshes (Mouth, Tongue, Face Seam)
          if (["Doraemon_6", "Doraemon_7", "Doraemon_8"].includes(name)) {
            const headMesh = obj.clone();
            headMesh.position.copy(invNeck);
            headGroup.add(headMesh);
            return;
          }

          // 3. Body meshes (Pocket, Rim, Bell, Dark Bell ring, Tail)
          if (["Doraemon_9", "Doraemon_10", "Doraemon_11", "Doraemon_12", "Doraemon_13"].includes(name)) {
            bodyGroup.add(obj.clone());
            return;
          }

          if (!index) {
            bodyGroup.add(obj.clone());
            return;
          }

          // 4. Multi-part meshes: Doraemon_1 (Blue), Doraemon_2 (White), Doraemon_3 (Black), Doraemon_5 (Red)
          const headIdx: number[] = [];
          const bodyIdx: number[] = [];
          const eyeIdx: number[] = [];

          for (let i = 0; i < index.count; i += 3) {
            const a = index.getX(i);
            const b = index.getX(i + 1);
            const c = index.getX(i + 2);

            const avgY = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3;
            const avgZ = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3;

            if (name === "Doraemon_3" && avgY > 1.45 && avgZ > 0.45) {
              // Pupils (Black)
              eyeIdx.push(a, b, c);
            } else if (name === "Doraemon_5" && avgY > 1.2) {
              // Nose (Red, Head)
              headIdx.push(a, b, c);
            } else if (name === "Doraemon_5") {
              // Collar (Red, Body)
              bodyIdx.push(a, b, c);
            } else if (avgY >= neckY) {
              // Head
              headIdx.push(a, b, c);
            } else {
              // Body
              bodyIdx.push(a, b, c);
            }
          }

          const bMesh = createSubMesh(obj, bodyIdx, new THREE.Vector3(0, 0, 0));
          if (bMesh) bodyGroup.add(bMesh);

          const hMesh = createSubMesh(obj, headIdx, invNeck);
          if (hMesh) headGroup.add(hMesh);

          const eMesh = createSubMesh(obj, eyeIdx, invNeck, true);
          if (eMesh) eyesGroup.add(eMesh);
        });

        setIsLoaded(true);
      },
      undefined,
      (err) => {
        console.error("Error loading Doraemon 3D model:", err);
      }
    );

    // --- Cursor Tracking Across The Whole Screen ---
    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from Doraemon's center, normalized smoothly
      const dx = (e.clientX - centerX) / (window.innerWidth * 0.4);
      const dy = (e.clientY - centerY) / (window.innerHeight * 0.4);

      mouse.targetX = Math.max(-1.4, Math.min(1.4, dx));
      mouse.targetY = Math.max(-1.4, Math.min(1.4, dy));
    };

    const handleMouseLeave = () => {
      // Return to center when mouse leaves window
      mouse.targetX = 0;
      mouse.targetY = 0;
    };

    // Window click detection (triggers hop without requiring pointer events on canvas)
    const handleWindowClick = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      // Check if click was in the vicinity of Doraemon
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        hopVel = 0.08;
        if (onClickRef.current) onClickRef.current();
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("click", handleWindowClick, { passive: true });

    // --- Resize Handling ---
    const handleResize = () => {
      if (!container || isDisposed) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;

      // Responsive framing: Doraemon fits centered vertically & horizontally with headroom
      if (width < 640) {
        camera.position.set(0, 0.08, 3.4);
        camera.fov = 38;
      } else if (width < 1024) {
        camera.position.set(0, 0.08, 3.1);
        camera.fov = 36;
      } else {
        camera.position.set(0, 0.08, 2.95);
        camera.fov = 35;
      }

      camera.lookAt(0, 0.08, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    handleResize();

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth cursor lerping for fluid tracking
      const lerpSpeed = 0.1;
      mouse.currentX += (mouse.targetX - mouse.currentX) * lerpSpeed;
      mouse.currentY += (mouse.targetY - mouse.currentY) * lerpSpeed;

      // Click hop animation
      if (hopVel !== 0 || hopY !== 0) {
        hopVel -= 0.6 * delta;
        hopY += hopVel;
        if (hopY <= 0) {
          hopY = 0;
          hopVel = 0;
        }
      }

      // Gentle cartoon breathing
      const idleBreathing = Math.sin(time * 2.2) * 0.012;
      const idleSway = Math.sin(time * 1.5) * 0.015;

      // 1. Body & Root Position
      rootGroup.position.y = -0.90 + idleBreathing + hopY;
      bodyGroup.rotation.y = mouse.currentX * 0.16 + idleSway * 0.4;
      bodyGroup.rotation.x = -mouse.currentY * 0.08;
      bodyGroup.rotation.z = -mouse.currentX * 0.04;

      // 2. Head follows cursor with expressive angles
      headGroup.rotation.y = mouse.currentX * 0.58 + idleSway;
      headGroup.rotation.x = -mouse.currentY * 0.40;
      headGroup.rotation.z = -mouse.currentX * 0.12;

      // 3. Eyes / Pupils shift slightly to look directly at the cursor across the eyeballs
      eyesGroup.position.x = mouse.currentX * 0.030;
      eyesGroup.position.y = -mouse.currentY * 0.024;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleWindowClick);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []); // Run effect ONCE on mount to prevent any re-mount / blinking!

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full pointer-events-none transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
});

export default Doraemon3D;
