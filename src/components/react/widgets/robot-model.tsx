import { Center, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type JSX, useEffect, useRef } from "react";
import type * as THREE from "three";

export default function Model(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/3d/Robo_Ball-812.glb");
  const gl = useThree((state) => state.gl);
  const ref = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const t = useRef(0);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const canvas = gl.domElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const limitX = Math.PI / 6;
      const limitY = Math.PI / 8;
      const rawY = (event.clientY - centerY) * 0.0008;
      const rawX = (event.clientX - centerX) * 0.0008;
      mouse.current.y = Math.max(-limitY, Math.min(limitY, rawY));
      mouse.current.x = Math.max(-limitX, Math.min(limitX, rawX));
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, [gl]);

  useFrame((_state, delta) => {
    t.current += delta;
    if (ref.current) {
      ref.current.rotation.y +=
        (mouse.current.x - ref.current.rotation.y) * 0.1;
      ref.current.rotation.x +=
        (mouse.current.y - ref.current.rotation.x) * 0.1;
      ref.current.position.y = Math.sin(t.current * 2) * 0.1;
    }
  });

  return (
    <group {...props}>
      <group ref={ref}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  );
}

useGLTF.preload("/3d/Robo_Ball-812.glb");
