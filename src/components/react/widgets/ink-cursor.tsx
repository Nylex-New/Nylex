import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useInkCursor } from "@/hooks/use-ink-cursor";
import { useMobile } from "@/hooks/use-mobile";

interface InkCursorProps {
  hideOnScroll?: boolean;
}

function InkCursorCanvas({ hideOnScroll }: InkCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useInkCursor(canvasRef);

  useEffect(() => {
    if (canvasRef.current) {
      gsap.fromTo(
        canvasRef.current,
        { opacity: 0, filter: "blur(5px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 3.5,
          delay: 1.0,
          ease: "power2.out",
        },
      );
    }
  }, []);

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      if (!canvasRef.current) return;
      const progress = window.scrollY / window.innerHeight;
      let targetOpacity = 1;
      if (progress > 0.7) {
        targetOpacity = Math.max(0, 1 - (progress - 0.6) / 0.1);
      }

      gsap.to(canvasRef.current, {
        opacity: targetOpacity,
        duration: 0.3,
        overwrite: "auto",
        ease: "power1.out",
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideOnScroll]);

  return (
    <canvas
      ref={canvasRef}
      className="ink-cursor pointer-events-none fixed inset-0 z-10 screen"
    />
  );
}

export default function InkCursor({ hideOnScroll = false }: InkCursorProps) {
  const { ref, inView } = useInView();
  const isMobile = useMobile();

  if (isMobile) return null;

  return (
    <>
      <div
        ref={ref}
        className="absolute top-0 left-0 w-full h-screen pointer-events-none"
      />
      {inView && <InkCursorCanvas hideOnScroll={hideOnScroll} />}
    </>
  );
}
