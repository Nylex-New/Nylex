import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { lazy, Suspense } from "react";
import { useInView } from "react-intersection-observer";
import { useMobile } from "@/hooks/use-mobile";

const Model = lazy(() => import("./robot-model"));

export default function RobotRenderer() {
  const { ref, inView } = useInView();
  const isMobile = useMobile();

  if (isMobile) return;

  return (
    <div ref={ref} className="w-72 h-72 sm:w-96 sm:h-96 lg:w-130 lg:h-130 relative lg:absolute lg:right-8 lg:bottom-16 pointer-events-none mx-auto flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        frameloop={inView ? "always" : "never"}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 0, 5]} intensity={2} color="#85c2ff" />
        <spotLight
          position={[-10, 5, 5]}
          intensity={20}
          color="#ffbe4f"
          penumbra={1}
          angle={0.5}
        />
        <spotLight
          position={[10, 10, -10]}
          intensity={30}
          color="#85c2ff"
          penumbra={1}
          angle={0.5}
        />
        <spotLight
          position={[0, 10, 0]}
          intensity={15}
          penumbra={1}
          angle={0.3}
          color="#ffffff"
        />
        <Suspense fallback={null}>
          <Model position={[0, 0, 0]} scale={2.4} />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
