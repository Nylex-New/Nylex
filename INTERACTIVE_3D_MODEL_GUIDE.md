# Technical Guide: Zero-Lag Interactive 3D Cursor-Tracking Model (React Three Fiber & Drei)

> **Target Audience**: AI Agents & Creative Frontend Developers  
> **Objective**: A reusable, drop-in production guide for rendering interactive 3D models that look towards the user's cursor with realistic studio lighting, harmonic floating physics, soft contact shadows, and **0% idle GPU usage**.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Astro Section Shell                             │
│                     (Static HTML & Typography)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
               client:only="react"  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3D Canvas Island Wrapper                          │
│                      (RobotRenderer / ModelRenderer)                   │
├────────────────────────────────────────────────────────────────────────┤
│  IntersectionObserver: inView ? "always" : "never"                     │
│  ├── frameloop="never" when off-screen  (0% GPU / 0% CPU)              │
│  └── frameloop="always" when in-view    (60-120 FPS active loop)       │
├────────────────────────────────────────────────────────────────────────┤
│  Studio Lighting Setup:                                                │
│  ├── Ambient Light + Directional Fill                                  │
│  ├── 3x Color-Tuned Spotlights with Penumbra                           │
│  ├── Environment Map (preset="city")                                   │
│  └── ContactShadows (Ground Contact Soft Blur)                         │
├────────────────────────────────────────────────────────────────────────┤
│  Lazy-Loaded 3D Mesh Component (Suspense Fallback):                    │
│  ├── useGLTF with Draco Compression                                    │
│  ├── Mouse Position Stored in mutable Ref (Zero React Re-renders)      │
│  ├── LERP Rotation Interpolation on useFrame                           │
│  └── Harmonic Sine-Wave Floating Physics                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 3D Asset Compression Pipeline

### 2.1 The Problem
Raw 3D `.gltf` and uncompressed `.glb` files easily exceed 10–30 MB, causing seconds of network blocking and frame freezing during asset parsing.

### 2.2 The Solution: Draco Mesh Quantization
In your `astro.config.mjs` / `vite.config.ts`, integrate `@gltf-transform` and Draco compression:

```ts
import gltf from "vite-plugin-gltf";
import { draco } from "@gltf-transform/functions";

export default {
  plugins: [
    gltf({
      transforms: [draco()], // Automatically quantizes vertices and indices
    }),
  ],
};
```

Using Draco reduces high-poly meshes by 70–90%, compressing complex models to **under 900 KB** with near-instant client decoding.

---

## 3. The Canvas Renderer Component (`3d-renderer.tsx`)

This component mounts the WebGL canvas, configures studio illumination, and controls the critical **`frameloop={inView ? "always" : "never"}`** mechanism.

```tsx
// src/components/react/3d/3d-renderer.tsx
import { lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { useInView } from "react-intersection-observer";

// Code-split 3D model geometry to avoid bundling Three.js with initial page JS
const Model = lazy(() => import("./interactive-model"));

export default function Interactive3DRenderer() {
  const { ref, inView } = useInView({
    threshold: 0.1, // Triggers as soon as 10% enters viewport
  });

  // Guard: Completely bypass 3D WebGL initialization on mobile/touch screens
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return null;

  return (
    <div ref={ref} className="w-[320px] h-[320px] md:w-[500px] md:h-[500px] relative pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 48 }}
        // THE GOLDEN RULE OF 3D PERFORMANCE:
        // Freezes the WebGL render loop to 0% GPU/CPU when scrolled away!
        frameloop={inView ? "always" : "never"}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Studio Three-Point Lighting */}
        <ambientLight intensity={0.15} />
        
        {/* Cool directional key light */}
        <directionalLight position={[0, 0, 5]} intensity={2.2} color="#85c2ff" />
        
        {/* Warm key spotlight */}
        <spotLight
          position={[-10, 5, 5]}
          intensity={20}
          color="#ffbe4f"
          penumbra={1}
          angle={0.5}
        />
        
        {/* Cool rim/kicker spotlight */}
        <spotLight
          position={[10, 10, -10]}
          intensity={30}
          color="#85c2ff"
          penumbra={1}
          angle={0.5}
        />
        
        {/* Overhead fill spotlight */}
        <spotLight
          position={[0, 10, 0]}
          intensity={15}
          color="#ffffff"
          penumbra={1}
          angle={0.3}
        />

        <Suspense fallback={null}>
          <Model position={[0, 0, 0]} scale={2.4} />
          
          {/* HDRI City environment reflections */}
          <Environment preset="city" />
          
          {/* Soft contact ground shadow */}
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.5}
            scale={8}
            blur={2.2}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

---

## 4. The Interactive Model Component (`interactive-model.tsx`)

This component loads the compressed geometry, calculates cursor offsets relative to the canvas center, applies clamping limits, and interpolates position using **Linear Interpolation (LERP)** inside `useFrame`.

```tsx
// src/components/react/3d/interactive-model.tsx
import { useEffect, useRef } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import { Center, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

const MODEL_PATH = "/3d/model-compressed.glb";

export default function InteractiveModel(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF(MODEL_PATH);
  const gl = useThree((state) => state.gl);
  
  const meshGroupRef = useRef<THREE.Group>(null);
  
  // CRITICAL: Store mouse coordinates in a mutable ref.
  // Using React useState would cause 120 re-renders per second of the entire component tree!
  const targetRotation = useRef({ x: 0, y: 0 });
  const elapsedTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const canvas = gl.domElement;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Rotational angle constraints (prevents awkward 360 degree flips)
      const limitX = Math.PI / 6; // ±30 degrees yaw
      const limitY = Math.PI / 8; // ±22.5 degrees pitch

      const rawY = (event.clientY - centerY) * 0.0008;
      const rawX = (event.clientX - centerX) * 0.0008;

      targetRotation.current.y = Math.max(-limitY, Math.min(limitY, rawY));
      targetRotation.current.x = Math.max(-limitX, Math.min(limitX, rawX));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [gl]);

  // High-performance animation frame loop
  useFrame((_state, delta) => {
    elapsedTime.current += delta;

    if (meshGroupRef.current) {
      // 1. Smooth Linear Interpolation (LERP) damping towards mouse
      meshGroupRef.current.rotation.y +=
        (targetRotation.current.x - meshGroupRef.current.rotation.y) * 0.1;
      meshGroupRef.current.rotation.x +=
        (targetRotation.current.y - meshGroupRef.current.rotation.x) * 0.1;

      // 2. Harmonic harmonic sine-wave floating motion
      meshGroupRef.current.position.y = Math.sin(elapsedTime.current * 2) * 0.1;
    }
  });

  return (
    <group {...props}>
      <group ref={meshGroupRef}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  );
}

// Preload asset to avoid hitch on initial view
useGLTF.preload(MODEL_PATH);
```

---

## 5. Integrating into Static Sections (`contact-section.astro`)

```astro
---
// src/components/static/widgets/contact-section.astro
import Interactive3DRenderer from "../react/3d/3d-renderer";
---

<section id="contact-cta" class="relative min-h-[80vh] flex flex-col justify-between p-8 md:p-16 overflow-hidden">
  <div class="z-10">
    <a href="/contact" class="text-6xl md:text-9xl font-bold uppercase hover:opacity-80 transition-opacity">
      Say Hello.
    </a>
  </div>

  <!-- 3D Interactive Mascot Island (Mounted only in browser) -->
  <div class="absolute right-8 bottom-8 md:right-24 md:bottom-20 z-0">
    <Interactive3DRenderer client:only="react" />
  </div>
</section>
```

---

## 6. Verification Checklist for Agents

- [ ] Is `frameloop` dynamically switched based on viewport visibility (`inView ? "always" : "never"`)?
- [ ] Are mouse coordinates saved in `useRef` rather than `useState`?
- [ ] Is the 3D model quantized using Draco compression (< 1 MB)?
- [ ] Are rotation bounds strictly clamped with `Math.min`/`Math.max`?
- [ ] Is the model component code-split with `React.lazy()`?
- [ ] Is mobile WebGL bypassed with a pointer/media query guard?
