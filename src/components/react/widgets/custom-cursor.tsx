import { gsap } from "gsap";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMobile } from "@/hooks/use-mobile";

export default function CustomCursor({
  label = "View",
  activeSelector = ".work-img-zone",
}: {
  label?: string;
  activeSelector?: string;
}) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const moveX = useRef<gsap.QuickToFunc | null>(null);
  const moveY = useRef<gsap.QuickToFunc | null>(null);
  const isVisibleRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useMobile();

  useEffect(() => {
    if (!cursorRef.current) return;
    if (isMobile) return;

    gsap.set(cursorRef.current, {
      xPercent: -50,
      yPercent: -50,
      scale: 0,
      opacity: 0,
    });

    moveX.current = gsap.quickTo(cursorRef.current, "x", {
      duration: 0.2,
      ease: "power3.out",
    });
    moveY.current = gsap.quickTo(cursorRef.current, "y", {
      duration: 0.2,
      ease: "power3.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      moveX.current?.(e.clientX);
      moveY.current?.(e.clientY);

      const target = e.target as HTMLElement | null;
      const nextIsVisible = !!target?.closest(activeSelector);
      if (nextIsVisible !== isVisibleRef.current) {
        isVisibleRef.current = nextIsVisible;
        setIsVisible(nextIsVisible);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      moveX.current = null;
      moveY.current = null;
    };
  }, [activeSelector, isMobile]);

  useEffect(() => {
    if (!cursorRef.current) return;
    if (isMobile) return;

    gsap.to(cursorRef.current, {
      scale: isVisible ? 1 : 0,
      opacity: isVisible ? 1 : 0,
      duration: 0.35,
      ease: "back.out(1.5)",
      overwrite: "auto",
    });
  }, [isVisible, isMobile]);

  if (isMobile) return;
  return (
    <div
      ref={cursorRef}
      className="hidden lg:flex pointer-events-none fixed left-0 top-0 z-9999 h-24 w-24 items-center justify-center gap-1 rounded-full bg-background/50 opacity-0 backdrop-blur-xl text-foreground flex-col"
    >
      <ArrowUpRight size={18} strokeWidth={2} />
      <span className="text-xs font-semibold uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
