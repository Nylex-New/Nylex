import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

export default function CursorFollower() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const OFFSET = 30;

  useEffect(() => {
    if (!cursorRef.current) return;

    gsap.set(cursorRef.current, {
      xPercent: 0,
      yPercent: 0,
      scale: 0,
      opacity: 0,
    });

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX + OFFSET,
        y: e.clientY + OFFSET,
        duration: 0.8,
        delay: 0.08,
        ease: "back.out(0.5)",
        overwrite: "auto",
      });

      const target = e.target as HTMLElement | null;
      setIsVisible(!!target?.closest("#services"));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        scale: isVisible ? 1 : 0,
        opacity: isVisible ? 1 : 0,
        duration: 0.4,
        ease: "back.out(1.5)",
        overwrite: "auto",
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className="hidden lg:flex pointer-events-none fixed left-0 top-0 z-100 h-30 w-30 items-center justify-center rounded-full bg-background/80 opacity-0 backdrop-blur-xl text-foreground"
    >
      <span className="text-center text-base font-medium leading-5 whitespace-nowrap">
        Our <br /> Services
      </span>
    </div>
  );
}
