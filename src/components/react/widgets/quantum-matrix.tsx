"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  colorType: 0 | 1 | 2 | 3; // 0: Emerald, 1: Cyan, 2: Violet, 3: Starlight
  phase: number;
  pulseSpeed: number;
  energy: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  intensity: number;
  speed: number;
}

export default function QuantumMatrix() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ref: containerRef, inView } = useInView({ threshold: 0.05 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // DPR Clamping for retina screens
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const focalLength = 400;
    const particleCount = isMobile ? 55 : 120;
    const maxConnectionDist = isMobile ? 90 : 130;
    const gravityRadius = isMobile ? 140 : 220;

    const particles: Particle[] = [];
    const sparks: Spark[] = [];
    const shockwaves: Shockwave[] = [];

    // Color definitions based on official Nylex Royal Blue brand palette
    const colors = [
      { r: 0, g: 82, b: 255 },    // Nylex Royal Blue
      { r: 37, g: 99, b: 235 },   // Electric Cobalt
      { r: 59, g: 130, b: 246 },  // Radiant Blue
      { r: 240, g: 245, b: 255 }, // Starlight White
    ];

    // Seed 3D particles
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * width * 1.3;
      const y = (Math.random() - 0.5) * height * 1.3;
      const z = (Math.random() - 0.5) * 500;
      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.2 + 1.2,
        colorType: Math.floor(Math.random() * colors.length) as 0 | 1 | 2 | 3,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        energy: 0,
      });
    }

    // Mouse tracking with velocity
    let mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      vx: 0,
      vy: 0,
      speed: 0,
      isHovering: false,
    };

    let targetMouse = { x: -9999, y: -9999 };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse.x = e.clientX - rect.left;
      targetMouse.y = e.clientY - rect.top;
      mouse.isHovering = true;

      // Spawn stardust sparks on movement
      if (mouse.prevX !== -9999) {
        const dx = targetMouse.x - mouse.prevX;
        const dy = targetMouse.y - mouse.prevY;
        const dist = Math.hypot(dx, dy);

        if (dist > 4 && sparks.length < 50) {
          const spawnCount = Math.min(Math.floor(dist / 6), 3);
          for (let s = 0; s < spawnCount; s++) {
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.5;
            const spd = Math.random() * 2.5 + 0.5;
            const col = colors[Math.floor(Math.random() * colors.length)];
            sparks.push({
              x: targetMouse.x + (Math.random() - 0.5) * 10,
              y: targetMouse.y + (Math.random() - 0.5) * 10,
              vx: -Math.cos(angle) * spd + (Math.random() - 0.5) * 1.5,
              vy: -Math.sin(angle) * spd + (Math.random() - 0.5) * 1.5,
              radius: Math.random() * 2.5 + 1,
              alpha: 0.9,
              color: `rgba(${col.r}, ${col.g}, ${col.b},`,
            });
          }
        }
      }
    };

    const handlePointerLeave = () => {
      mouse.isHovering = false;
      targetMouse.x = -9999;
      targetMouse.y = -9999;
    };

    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Trigger quantum shockwave ripple
      shockwaves.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: Math.max(width, height) * 0.75,
        intensity: 22,
        speed: 12,
      });

      // Burst sparks
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20 + Math.random() * 0.2;
        const spd = Math.random() * 5 + 2;
        const col = colors[i % colors.length];
        sparks.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: Math.random() * 3 + 1.5,
          alpha: 1,
          color: `rgba(${col.r}, ${col.g}, ${col.b},`,
        });
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerleave", handlePointerLeave);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener("resize", handleResize);

    let animationFrameId: number;
    let clock = 0;

    // Render loop
    const render = () => {
      if (!inView) {
        // Halt loop when scrolled out of view for 0% GPU
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      clock += 0.016;

      // Smooth mouse interpolation
      if (mouse.prevX === -9999) {
        mouse.x = targetMouse.x;
        mouse.y = targetMouse.y;
        mouse.prevX = targetMouse.x;
        mouse.prevY = targetMouse.y;
      } else {
        mouse.vx = targetMouse.x - mouse.x;
        mouse.vy = targetMouse.y - mouse.y;
        mouse.speed = Math.hypot(mouse.vx, mouse.vy);
        mouse.prevX = mouse.x;
        mouse.prevY = mouse.y;
        mouse.x += mouse.vx * 0.15;
        mouse.y += mouse.vy * 0.15;
      }

      ctx.clearRect(0, 0, width, height);

      // Camera parallax tilt based on mouse
      const camTargetX = mouse.isHovering ? (mouse.x - width / 2) * 0.08 : 0;
      const camTargetY = mouse.isHovering ? (mouse.y - height / 2) * 0.08 : 0;

      // Update Shockwaves
      for (let w = shockwaves.length - 1; w >= 0; w--) {
        const sw = shockwaves[w];
        sw.radius += sw.speed;
        sw.intensity *= 0.96;

        // Draw faint glowing shockwave ring
        const ringAlpha = Math.max(0, (1 - sw.radius / sw.maxRadius) * 0.25);
        if (ringAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 82, 255, ${ringAlpha})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        if (sw.radius >= sw.maxRadius || sw.intensity < 0.2) {
          shockwaves.splice(w, 1);
        }
      }

      // Projected particle cache for rendering lines & nodes
      const projected: {
        px: number;
        py: number;
        scale: number;
        alpha: number;
        color: (typeof colors)[0];
        radius: number;
        energy: number;
      }[] = [];

      // Update & project particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Organic harmonic floating wave
        p.phase += p.pulseSpeed;
        const waveX = Math.sin(p.phase + clock * 0.8) * 18;
        const waveY = Math.cos(p.phase * 0.8 + clock * 0.6) * 18;
        const waveZ = Math.sin(clock * 0.5 + p.phase) * 25;

        // Spring force returning to anchor
        const k = 0.035; // spring stiffness
        const damp = 0.88; // velocity damping
        const fx = (p.baseX + waveX - p.x) * k;
        const fy = (p.baseY + waveY - p.y) * k;
        const fz = (p.baseZ + waveZ - p.z) * k;

        p.vx = (p.vx + fx) * damp;
        p.vy = (p.vy + fy) * damp;
        p.vz = (p.vz + fz) * damp;

        // 2. Gravitational Singularity & Vortex Field
        if (mouse.isHovering) {
          // Convert particle 3D position to 2D screen coordinate for mouse distance
          const effZ = p.z + focalLength;
          const s = focalLength / Math.max(effZ, 80);
          const scrX = p.x * s + width / 2;
          const scrY = p.y * s + height / 2;

          const dx = mouse.x - scrX;
          const dy = mouse.y - scrY;
          const dist = Math.hypot(dx, dy);

          if (dist < gravityRadius && dist > 1) {
            const factor = 1 - dist / gravityRadius;
            p.energy = Math.min(p.energy + factor * 0.35, 1);

            // Gravitational suction + swirling vortex
            const angle = Math.atan2(dy, dx);
            const swirlAngle = angle + Math.PI / 2.3; // Slight orbital angle
            const force = factor * factor * 16;

            // Push slightly outward if too close (cushion halo), otherwise pull
            const dir = dist < 45 ? -1.8 : 1;
            p.vx += (Math.cos(angle) * dir * force + Math.cos(swirlAngle) * force * 0.8) * 0.12;
            p.vy += (Math.sin(angle) * dir * force + Math.sin(swirlAngle) * force * 0.8) * 0.12;
            p.vz += (Math.sin(clock * 3 + p.phase) * force) * 0.1;
          }
        }

        // 3. Shockwave impact
        for (let w = 0; w < shockwaves.length; w++) {
          const sw = shockwaves[w];
          const s = focalLength / Math.max(p.z + focalLength, 80);
          const scrX = p.x * s + width / 2;
          const scrY = p.y * s + height / 2;
          const dx = scrX - sw.x;
          const dy = scrY - sw.y;
          const d = Math.hypot(dx, dy);

          const waveDist = Math.abs(d - sw.radius);
          if (waveDist < 60) {
            const push = (1 - waveDist / 60) * sw.intensity;
            const a = Math.atan2(dy, dx);
            p.vx += Math.cos(a) * push * 0.4;
            p.vy += Math.sin(a) * push * 0.4;
            p.vz += (Math.random() - 0.5) * push * 0.6;
            p.energy = 1;
          }
        }

        // Decay energy
        p.energy *= 0.94;

        // Apply motion
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // 4. 3D Perspective Projection
        const zRel = p.z + 200 + focalLength;
        const scale = focalLength / Math.max(zRel, 100);
        const px = (p.x - camTargetX) * scale + width / 2;
        const py = (p.y - camTargetY) * scale + height / 2;

        // Depth fog / alpha
        const depthAlpha = Math.max(0.15, Math.min(1, (scale - 0.4) * 1.5));
        const color = colors[p.colorType];

        projected.push({
          px,
          py,
          scale,
          alpha: depthAlpha,
          color,
          radius: p.radius * scale,
          energy: p.energy,
        });
      }

      // 5. Draw Dynamic Synaptic Filaments (Connection Beams)
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.hypot(dx, dy);

          const maxDist = maxConnectionDist * Math.min(p1.scale, p2.scale);
          if (dist < maxDist) {
            const distRatio = 1 - dist / maxDist;
            const baseAlpha = distRatio * distRatio * 0.35 * Math.min(p1.alpha, p2.alpha);
            const energyBoost = (p1.energy + p2.energy) * 0.45;
            const lineAlpha = Math.min(baseAlpha + energyBoost, 0.85);

            if (lineAlpha > 0.02) {
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);

              // If excited by cursor, glow in bright Nylex electric blue
              if (energyBoost > 0.1) {
                ctx.strokeStyle = `rgba(37, 99, 235, ${lineAlpha})`;
                ctx.lineWidth = 1.4;
              } else {
                ctx.strokeStyle = `rgba(0, 82, 255, ${lineAlpha * 0.75})`;
                ctx.lineWidth = 0.8;
              }
              ctx.stroke();
            }
          }
        }
      }

      // 6. Draw Particles (Nodes & Glowing Halos)
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const rad = Math.max(p.radius * (1 + p.energy * 0.8), 0.8);
        const baseAlpha = Math.min(p.alpha + p.energy * 0.5, 1);

        // Core dot
        ctx.beginPath();
        ctx.arc(p.px, p.py, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${baseAlpha})`;
        ctx.fill();

        // Glowing outer halo for energized or large nodes
        if (p.energy > 0.15 || p.scale > 0.8) {
          const haloRad = rad * (2.8 + p.energy * 3);
          const haloAlpha = (p.energy * 0.4 + 0.15) * p.alpha;
          const grad = ctx.createRadialGradient(p.px, p.py, rad * 0.5, p.px, p.py, haloRad);
          grad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${haloAlpha})`);
          grad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

          ctx.beginPath();
          ctx.arc(p.px, p.py, haloRad, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // 7. Update & Draw Stardust Sparks
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;
        sp.alpha -= 0.022;

        if (sp.alpha <= 0) {
          sparks.splice(s, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius * sp.alpha, 0, Math.PI * 2);
        ctx.fillStyle = `${sp.color} ${sp.alpha})`;
        ctx.fill();
      }

      // 8. Magnetic Cursor Aura Glow
      if (mouse.isHovering && mouse.x > 0 && mouse.y > 0) {
        const auraRad = 85 + Math.sin(clock * 4) * 8;
        const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, auraRad);
        auraGrad.addColorStop(0, "rgba(0, 82, 255, 0.2)");
        auraGrad.addColorStop(0.5, "rgba(37, 99, 235, 0.08)");
        auraGrad.addColorStop(1, "rgba(0, 82, 255, 0)");

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, auraRad, 0, Math.PI * 2);
        ctx.fillStyle = auraGrad;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [inView, isMobile]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-none opacity-90 transition-opacity duration-1000"
      />
    </div>
  );
}
