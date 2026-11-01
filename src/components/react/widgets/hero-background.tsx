"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { ref: containerRef, inView } = useInView({ threshold: 0.02 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vsSource = `
      attribute vec2 a_pos;
      void main() {
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;

      // Deterministic hash noise for micro-dither
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec2 st = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Gravitational cursor warp: gently pulls mathematical spacetime towards cursor
        float dMouse = length(st - mouse);
        float mouseAttract = smoothstep(1.3, 0.0, dMouse);
        vec2 warp = (st - mouse) * mouseAttract * 0.18;
        vec2 p = st - warp;

        // Base luxurious deep space background: #05070e to #091226
        vec3 colDark = vec3(0.02, 0.027, 0.055);
        vec3 colNavy = vec3(0.035, 0.075, 0.16);
        vec3 colBlue = vec3(0.0, 0.32, 1.0);     // Nylex Electric Blue #0052FF
        vec3 colCyan = vec3(0.0, 0.82, 1.0);     // Luminous Cyan Core

        float radialBase = length(p * vec2(0.85, 1.15));
        vec3 color = mix(colNavy * 0.65, colDark, smoothstep(0.15, 1.35, radialBase));

        // Sculpted Kinetic Light Ribbons (Harmonic mathematical wave fields)
        float t = u_time * 0.38;

        // Primary ribbon: Central sweeping auroral wave
        float y1 = sin(p.x * 1.5 + t * 0.85) * 0.28 + cos(p.x * 2.5 - t * 0.65) * 0.11;
        float dist1 = abs(p.y - y1);
        float r1 = smoothstep(0.38, 0.0, dist1);
        float core1 = smoothstep(0.065, 0.0, dist1);

        // Secondary ribbon: Counter-harmonic lower wave
        float y2 = cos(p.x * 1.8 - t * 0.75 + 1.3) * 0.22 + sin(p.x * 3.0 + t * 0.5) * 0.08 - 0.22;
        float dist2 = abs(p.y - y2);
        float r2 = smoothstep(0.42, 0.0, dist2);
        float core2 = smoothstep(0.055, 0.0, dist2);

        // Tertiary ribbon: Delicate upper light strand
        float y3 = sin(p.x * 3.1 + t * 1.05 + 2.4) * 0.15 + 0.32;
        float dist3 = abs(p.y - y3);
        float r3 = smoothstep(0.32, 0.0, dist3);
        float core3 = smoothstep(0.045, 0.0, dist3);

        // Color blending with luminous photonic scattering
        color += colBlue * (r1 * 0.52 + r2 * 0.44 + r3 * 0.34);
        color += colCyan * (pow(core1, 1.5) * 0.85 + pow(core2, 1.6) * 0.72 + pow(core3, 1.8) * 0.58);

        // Interactive mouse focus energy aura (Radiates vibrant Nylex Blue glow)
        float mouseGlow = pow(mouseAttract, 2.4);
        float mouseCore = pow(mouseAttract, 5.5);
        color += colBlue * (mouseGlow * 0.6);
        color += colCyan * (mouseCore * 0.4);

        // Architectural Perspective Horizon Hairlines (Anchors the lower space)
        float horizonY = -0.68;
        if (p.y < horizonY) {
          float depth = (horizonY - p.y) * 4.2;
          float gridX = abs(fract(p.x * (1.0 + depth * 0.85) * 4.0) - 0.5);
          float gridY = abs(fract(depth * 3.2) - 0.5);
          float line = smoothstep(0.47, 0.49, max(1.0 - gridX * 2.0, 1.0 - gridY * 2.0));
          float gridFade = smoothstep(2.6, 0.0, depth) * 0.15;
          color += colBlue * line * gridFade;
        }

        // Cinematic vignette to naturally elevate typography
        float vig = smoothstep(1.75, 0.5, length(st * vec2(0.85, 1.05)));
        color *= vig;

        // Subtle film micro-dither (completely avoids gradient banding)
        float dither = (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * 0.012;
        color += dither;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vs = createShader(gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Link error:", gl.getProgramInfoLog(prog));
      return;
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(prog, "a_pos");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");

    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Mouse coordinates tracking with smooth damping lerp
    let targetX = width / 2;
    let targetY = height / 2;
    let currentX = targetX;
    let currentY = targetY;

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = height - e.clientY; // Invert for WebGL coordinates
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let animId = 0;
    const startTime = performance.now();

    const render = () => {
      if (!inView) {
        // Pause render loop when scrolled away from Hero to save battery & GPU
        animId = requestAnimationFrame(render);
        return;
      }

      // Smooth mouse lerp
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      gl.uniform2f(uRes, width * dpr, height * dpr);
      gl.uniform2f(uMouse, currentX * dpr, currentY * dpr);
      gl.uniform1f(uTime, (performance.now() - startTime) / 1000.0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(posBuffer);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none -z-10 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        aria-hidden="true"
      />
    </div>
  );
}

