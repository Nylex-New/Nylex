import { type HTMLAttributes, useCallback, useEffect, useRef } from "react";
import { WebGLHoverEffect } from "@/components/react/shaders/webgl-hover";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils/cn";

interface ImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  isContain?: boolean;
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
}

export const Image = ({
  src,
  alt,
  className = "",
  isContain,
  grid = 12,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  ...props
}: ImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<WebGLHoverEffect | null>(null);
  const destroyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useMobile();

  const initEffect = useCallback(() => {
    if (!containerRef.current || effectRef.current) return;
    effectRef.current = new WebGLHoverEffect(containerRef.current, src, {
      grid,
      mouse,
      strength,
      relaxation,
    });
  }, [src, grid, mouse, strength, relaxation]);

  const destroyEffect = useCallback(() => {
    if (intentTimeoutRef.current) {
      clearTimeout(intentTimeoutRef.current);
      intentTimeoutRef.current = null;
    }
    if (effectRef.current) {
      effectRef.current.destroy();
      effectRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isMobile) return;
    // Abort if parent carousel is currently being dragged
    if (containerRef.current?.closest('[data-dragging="true"]')) return;

    if (destroyTimeoutRef.current) {
      clearTimeout(destroyTimeoutRef.current);
      destroyTimeoutRef.current = null;
    }

    // Debounce WebGL creation by 120ms to prevent context allocation during fast scroll/drag
    intentTimeoutRef.current = setTimeout(() => {
      initEffect();
      if (containerRef.current) {
        containerRef.current.dispatchEvent(new MouseEvent("mouseenter"));
      }
    }, 120);
  }, [initEffect, isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (intentTimeoutRef.current) {
      clearTimeout(intentTimeoutRef.current);
      intentTimeoutRef.current = null;
    }
    if (destroyTimeoutRef.current) clearTimeout(destroyTimeoutRef.current);

    if (effectRef.current) {
      destroyTimeoutRef.current = setTimeout(() => {
        destroyEffect();
      }, 800);
    }
  }, [destroyEffect]);

  useEffect(() => {
    return () => {
      if (destroyTimeoutRef.current) clearTimeout(destroyTimeoutRef.current);
      if (intentTimeoutRef.current) clearTimeout(intentTimeoutRef.current);
      destroyEffect();
    };
  }, [destroyEffect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          if (destroyTimeoutRef.current) clearTimeout(destroyTimeoutRef.current);
          destroyEffect();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [destroyEffect]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden w-full h-full contain-paint",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <img
        src={src}
        alt={alt || ""}
        className={`pointer-events-none select-none absolute inset-0 w-full h-full ${
          isContain ? "object-contain" : "object-cover"
        }`}
        decoding="async"
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};
