"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useMobile } from "@/hooks/use-mobile";

function AgentMesh() {
  const agentGroup = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);
  const outerRing = useRef<THREE.Mesh>(null);
  const innerRing = useRef<THREE.Mesh>(null);
  const eyeMesh = useRef<THREE.Mesh>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const clockRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to screen coordinates [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;

      // Soft clamp so agent doesn't break neck
      mouse.current.x = Math.max(-1.2, Math.min(1.2, nx * 1.4));
      mouse.current.y = Math.max(-0.9, Math.min(0.9, ny * 1.2));
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const t = clockRef.current;

    if (agentGroup.current) {
      // Floating harmonic hover physics
      agentGroup.current.position.y = Math.sin(t * 2) * 0.12;
      agentGroup.current.position.x = Math.cos(t * 1.2) * 0.05;
    }

    if (headGroup.current) {
      // Smooth LERP look-at rotation towards mouse
      const targetRotY = mouse.current.x * 0.6;
      const targetRotX = -mouse.current.y * 0.5;

      headGroup.current.rotation.y += (targetRotY - headGroup.current.rotation.y) * 0.1;
      headGroup.current.rotation.x += (targetRotX - headGroup.current.rotation.x) * 0.1;
    }

    // Gyroscopic orbital ring rotations
    if (outerRing.current) {
      outerRing.current.rotation.x = t * 0.7;
      outerRing.current.rotation.y = t * 0.5;
    }

    if (innerRing.current) {
      innerRing.current.rotation.y = -t * 0.9;
      innerRing.current.rotation.z = t * 0.6;
    }

    // Eye pulse
    if (eyeMesh.current) {
      const scale = 1 + Math.sin(t * 4) * 0.08;
      eyeMesh.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={agentGroup}>
      {/* Outer Gyro Ring */}
      <mesh ref={outerRing}>
        <torusGeometry args={[1.35, 0.035, 16, 48]} />
        <meshStandardMaterial
          color="#0052FF"
          emissive="#0052FF"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Inner Inclined Ring */}
      <mesh ref={innerRing}>
        <torusGeometry args={[1.15, 0.025, 16, 48]} />
        <meshStandardMaterial
          color="#2563EB"
          emissive="#2563EB"
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Head / Core Group (Tracks Cursor) */}
      <group ref={headGroup}>
        {/* Main Sleek Ceramic Agent Sphere */}
        <mesh>
          <sphereGeometry args={[0.82, 32, 32]} />
          <meshStandardMaterial
            color="#0B0F19"
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* Visor / Curved Screen Band */}
        <mesh position={[0, 0.05, 0.42]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.92, 0.32, 0.45]} />
          <meshStandardMaterial
            color="#050B14"
            roughness={0.1}
            metalness={0.95}
          />
        </mesh>

        {/* Ocular Tracking Eye (Glows Nylex Blue) */}
        <mesh ref={eyeMesh} position={[0, 0.05, 0.72]}>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshBasicMaterial color="#0052FF" />
        </mesh>

        {/* Eye Reticle Ring */}
        <mesh position={[0, 0.05, 0.73]}>
          <ringGeometry args={[0.2, 0.23, 24]} />
          <meshBasicMaterial color="#3B82F6" side={THREE.DoubleSide} />
        </mesh>

        {/* Antenna / Communication Fin */}
        <mesh position={[0, 0.88, -0.1]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.04, 0.35, 12]} />
          <meshStandardMaterial color="#0052FF" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export default function FloatingAgent() {
  const isMobile = useMobile();
  const [isVisible, setIsVisible] = useState(true);

  if (isMobile) return null;

  return (
    <aside
      aria-label="Interactive 3D Agent"
      className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-40 flex flex-col items-end pointer-events-none select-none transition-all duration-500"
    >
      {/* Agent Canvas Box */}
      <div className="w-28 h-28 sm:w-36 sm:h-36 relative flex items-center justify-center">
        <Canvas
          camera={{ position: [0, 0, 3.4], fov: 45 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 5, 4]} intensity={2.2} color="#ffffff" />
          <pointLight position={[-3, -2, -2]} intensity={1.5} color="#0052FF" />
          <pointLight position={[0, 0, 2]} intensity={1.2} color="#0052FF" />
          <AgentMesh />
        </Canvas>
      </div>

      {/* Compact Agent Status Pill */}
      <div className="mr-3 -mt-2 px-3 py-1 rounded-full border border-[#0052FF]/30 bg-black/80 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(0,82,255,0.25)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] animate-ping" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#0052FF] font-semibold">
          AGENT &bull; ACTIVE
        </span>
      </div>
    </aside>
  );
}
