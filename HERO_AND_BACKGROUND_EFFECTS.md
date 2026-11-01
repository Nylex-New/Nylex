# Technical Guide: Hero GPGPU Fluid Ink Simulation & Dynamic Scroll Background Transitions

> **Target Audience**: AI Agents & Creative Developers  
> **Objective**: Reusable, drop-in implementations for:
> 1. High-performance **WebGL GPGPU Fluid Ink Cursor Trail** with chromatic dispersion, 2D value noise turbulence, and film grain.
> 2. Smooth **Scroll-Driven Background & Foreground Theme Inversion** (White to Black) using GSAP ScrollTrigger and dynamic OKLCH color resolution.

---

## Part 1: Hero WebGL GPGPU Fluid Ink Cursor

### 1.1 Architecture & Concept: Ping-Pong Framebuffer Objects
Standard HTML5 canvas drawing cannot retain historical fluid trails without heavy CPU overhead. This system uses **GPGPU double-buffered Framebuffer Objects (FBOs)** in WebGL:

```
[Mouse Event: pointermove]
         │ (x, y coordinates normalized to WebGL viewport)
         ▼
┌─────────────────┐       Update Pass (fsUpdate)       ┌─────────────────┐
│  Texture FBO A  │ ─────────────────────────────────► │  Texture FBO B  │
│ (Frame N-1 Data)│ ◄───────────────────────────────── │ (Frame N Output)│
└─────────────────┘           Swap FBOs                └─────────────────┘
         │
         ▼ Final Screen Pass (fsRender)
┌────────────────────────────────────────────────────────────────────────┐
│ Screen Quad Canvas (CSS: mix-blend-mode: exclusion, pointer-events: none)│
└────────────────────────────────────────────────────────────────────────┘
```

1. **`fboA`** stores fluid density and velocity from the previous frame.
2. **`fsUpdate`** samples `fboA`, calculates the mouse motion line segment distance, injects dynamic color and turbulence, decays existing ink over time, and renders into **`fboB`**.
3. **Swap**: `fboA` and `fboB` swap roles every frame.
4. **`fsRender`** applies chromatic aberration dispersion, vignette, and grain noise before writing to the screen.

---

### 1.2 WebGL Helper Utilities (`webgl-utils.ts`)

```ts
// src/lib/webgl-utils.ts

export const createShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

export const createProgram = (
  gl: WebGLRenderingContext,
  vsSource: string,
  fsSource: string,
): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) return null;
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
};

export const createFBO = (
  gl: WebGLRenderingContext,
  width: number,
  height: number,
) => {
  const texture = gl.createTexture();
  if (!texture) return null;

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  if (!fbo) {
    gl.deleteTexture(texture);
    return null;
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  return { fbo, texture, width, height };
};
```

---

### 1.3 Complete GLSL Shaders (`ink-shaders.ts`)

```ts
// src/components/shaders/ink-shaders.ts

export const vsSource = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const fsUpdate = `
precision highp float;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform vec2 u_prevMouse;
uniform vec2 u_resolution;
uniform float u_dt;
uniform float u_time;
uniform int u_isMoved;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// 2D Value Noise for organic fluid eddies
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Distance from pixel to line segment drawn between frames
float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    // 1. Organic turbulence displacement
    vec2 distort = vec2(
        noise(vUv * 9.0 + u_time * 0.6) - 0.5, 
        noise(vUv * 15.0 - u_time * 0.5) - 0.5
    );
    
    // 2. RGB Prism diffusion: Separate channel offsets
    float r = texture2D(u_texture, vUv + distort * 0.002).r;
    float g = texture2D(u_texture, vUv + distort * 0.0035).g;
    float b = texture2D(u_texture, vUv + distort * 0.005).b;
    float a = texture2D(u_texture, vUv + distort * 0.003).a;
    
    vec3 color = vec3(r, g, b);
    
    // 3. Fluid decay (gradually fades out)
    float fadeRate = 0.5; 
    float density = max(0.0, a - u_dt * fadeRate);
    
    // 4. Inject new ink on mouse movement
    if (u_isMoved == 1) {
        float d = distToSegment(gl_FragCoord.xy, u_prevMouse, u_mouse);
        
        float n = noise(gl_FragCoord.xy * 0.60 + u_time);
        float radius = 70.0 + n * 70.0;
        float intensity = smoothstep(radius, radius - 3.0, d);
        
        // Cyclic spectral color formula
        vec3 spectrum = 0.2 + 0.5 * cos(u_time * 1.5 + gl_FragCoord.xyx * 0.001 + vec3(0.0, 2.0, 4.0));
        
        // Normalize colors to avoid clipping
        float rMax = max(spectrum.r, max(spectrum.g, spectrum.b));
        float rMin = min(spectrum.r, min(spectrum.g, spectrum.b));
        spectrum = (spectrum - rMin) / (rMax - rMin + 0.0001); 
        
        float colorBlend = smoothstep(0.0, 1.0, intensity);
        color = mix(color, spectrum, colorBlend);
        density = max(density, intensity);
    }
    
    gl_FragColor = vec4(color, density);
}
`;

export const fsRender = `
precision highp float;
uniform sampler2D u_texture;
varying vec2 vUv;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    float n = hash(gl_FragCoord.xy);
    
    // Vintage optical lens aberration expanding towards boundaries
    vec2 dispersion = vec2(0.003, 0.002) * (n - 0.5) * (1.0 + dist * 4.5);
    
    float r = texture2D(u_texture, vUv + dispersion * 1.0).r;
    float g = texture2D(u_texture, vUv + dispersion * 1.5).g;
    float b = texture2D(u_texture, vUv - dispersion * 1.5).b;
    float a = texture2D(u_texture, vUv).a;
    
    vec3 color = vec3(r, g, b);
    
    // Add fine film grain
    float grain = pow(n, 2.0);
    color += grain * (0.1 + dist * 0.2);
    
    // Vintage vignette edge falloff
    float vignette = smoothstep(2.4, 0.75, dist);
    a *= vignette;
    color *= vignette * 1.4;
    
    gl_FragColor = vec4(color, a);
}
`;
```

---

### 1.4 The React Hook & Lifecycle (`use-ink-cursor.ts`)

```ts
// src/hooks/use-ink-cursor.ts
import { type RefObject, useEffect } from "react";
import { fsRender, fsUpdate, vsSource } from "../components/shaders/ink-shaders";
import { createFBO, createProgram } from "../lib/webgl-utils";

export function useInkCursor(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      depth: false,
      antialias: false,
    });
    if (!gl) return;

    const updateProg = createProgram(gl, vsSource, fsUpdate);
    const renderProg = createProgram(gl, vsSource, fsRender);
    if (!updateProg || !renderProg) return;

    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let fboA = createFBO(gl, width, height);
    let fboB = createFBO(gl, width, height);
    if (!fboA || !fboB) return;

    const updateLocs = {
      position: gl.getAttribLocation(updateProg, "position"),
      u_texture: gl.getUniformLocation(updateProg, "u_texture"),
      u_mouse: gl.getUniformLocation(updateProg, "u_mouse"),
      u_prevMouse: gl.getUniformLocation(updateProg, "u_prevMouse"),
      u_resolution: gl.getUniformLocation(updateProg, "u_resolution"),
      u_dt: gl.getUniformLocation(updateProg, "u_dt"),
      u_time: gl.getUniformLocation(updateProg, "u_time"),
      u_isMoved: gl.getUniformLocation(updateProg, "u_isMoved"),
    };

    const renderLocs = {
      position: gl.getAttribLocation(renderProg, "position"),
      u_texture: gl.getUniformLocation(renderProg, "u_texture"),
    };

    let targetMouse = { x: -1000, y: -1000 };
    let lastDrawnMouse = { x: -1000, y: -1000 };
    let hasMoved = false;
    const startTime = performance.now();
    let lastTime = performance.now();
    let animationFrameId: number;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = height - (e.clientY - rect.top); // WebGL Y is inverted
      targetMouse = { x, y };
      if (!hasMoved) {
        lastDrawnMouse = { x, y };
        hasMoved = true;
      }
    };

    window.addEventListener("pointermove", onPointerMove);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      if (fboA) {
        gl.deleteFramebuffer(fboA.fbo);
        gl.deleteTexture(fboA.texture);
      }
      if (fboB) {
        gl.deleteFramebuffer(fboB.fbo);
        gl.deleteTexture(fboB.texture);
      }
      fboA = createFBO(gl, width, height);
      fboB = createFBO(gl, width, height);
    };
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!fboA || !fboB) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000.0, 0.1); // Clamp delta time
      const time = (now - startTime) / 1000.0;
      lastTime = now;

      gl.viewport(0, 0, width, height);

      const isMoved =
        hasMoved &&
        (lastDrawnMouse.x !== targetMouse.x || lastDrawnMouse.y !== targetMouse.y);

      // 1. Update Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo);
      gl.useProgram(updateProg);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(updateLocs.position);
      gl.vertexAttribPointer(updateLocs.position, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.texture);
      gl.uniform1i(updateLocs.u_texture, 0);

      gl.uniform2f(updateLocs.u_mouse, targetMouse.x, targetMouse.y);
      gl.uniform2f(updateLocs.u_prevMouse, lastDrawnMouse.x, lastDrawnMouse.y);
      gl.uniform2f(updateLocs.u_resolution, width, height);
      gl.uniform1f(updateLocs.u_dt, dt);
      gl.uniform1f(updateLocs.u_time, time);
      gl.uniform1i(updateLocs.u_isMoved, isMoved ? 1 : 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (isMoved) {
        lastDrawnMouse = { ...targetMouse };
      }

      // 2. Ping-Pong Swap
      const temp = fboA;
      fboA = fboB;
      fboB = temp;

      // 3. Screen Render Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(renderProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(renderLocs.position);
      gl.vertexAttribPointer(renderLocs.position, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fboA.texture);
      gl.uniform1i(renderLocs.u_texture, 0);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.disable(gl.BLEND);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);

      if (fboA) {
        gl.deleteFramebuffer(fboA.fbo);
        gl.deleteTexture(fboA.texture);
      }
      if (fboB) {
        gl.deleteFramebuffer(fboB.fbo);
        gl.deleteTexture(fboB.texture);
      }
      gl.deleteProgram(updateProg);
      gl.deleteProgram(renderProg);
      gl.deleteBuffer(quadBuffer);
    };
  }, [canvasRef]);
}
```

---

### 1.5 React Island Wrapper with Auto-Unmount on Scroll (`ink-cursor.tsx`)

```tsx
// src/components/react/widgets/ink-cursor.tsx
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import gsap from "gsap";
import { useInkCursor } from "../../hooks/use-ink-cursor";

export default function InkCursor({ hideOnScroll = true }: { hideOnScroll?: boolean }) {
  const { ref, inView } = useInView();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Disable completely on touch devices to conserve mobile battery
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return null;

  useInkCursor(canvasRef);

  // Smooth fade-in on mount
  useEffect(() => {
    if (canvasRef.current) {
      gsap.fromTo(canvasRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" });
    }
  }, []);

  // Fade out as user scrolls down
  useEffect(() => {
    if (!hideOnScroll) return;

    const onScroll = () => {
      if (!canvasRef.current) return;
      const progress = window.scrollY / window.innerHeight;
      const opacity = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;
      gsap.to(canvasRef.current, { opacity, duration: 0.2, overwrite: "auto" });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOnScroll]);

  return (
    <>
      <div ref={ref} className="absolute top-0 left-0 w-full h-screen pointer-events-none" />
      {/* Unmounts WebGL completely when scrolled past hero */}
      {inView && (
        <canvas
          ref={canvasRef}
          style={{ mixBlendMode: "exclusion" }}
          className="fixed inset-0 z-10 w-screen h-screen pointer-events-none"
        />
      )}
    </>
  );
}
```

---

## Part 2: Scroll-Driven Background Color Transitions (Black to White & White to Black)

### 2.1 The Issue with Raw CSS Variables in GSAP
Modern frameworks define themes with custom properties (e.g. `var(--color-bg)` or `oklch(0.145 0 0)`). GSAP cannot smoothly interpolate raw CSS variables or OKLCH strings on every frame without causing forced style re-computations and frame drops.

### 2.2 Color Resolution Helper (`resolve-colors.ts`)
Converts any CSS variable or theme token into computed `rgb(r, g, b)` once on page load:

```ts
// src/lib/resolve-colors.ts
export const resolveColor = (cssVariable: string): string => {
  const temp = document.createElement("div");
  temp.style.color = `var(${cssVariable})`;
  document.body.appendChild(temp);
  const computedColor = getComputedStyle(temp).color;
  temp.remove();
  return computedColor; // e.g. "rgb(15, 15, 15)"
};
```

### 2.3 Active Production Pattern: Black to White (Hero Section into "WHAT WE DO")
When the **Hero** section is dark/black (`#08090f`) and the downstream sections (**WHAT WE DO / Digital Solutions**) transition to a pristine white theme (`#ffffff`), use `gsap.fromTo` directly attached to the `<body>` element.

```astro
---
// src/components/static/widgets/digital-solutions.astro
---

<!-- Section MUST have bg-transparent so the body background transition shines through seamlessly -->
<section id="solutions" class="w-full py-28 md:py-36 px-6 md:px-12 lg:px-20 border-t border-neutral-200/50 relative bg-transparent text-neutral-950 overflow-hidden">
  <!-- Content -->
</section>

<script>
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  const initThemeTransition = () => {
    // Smoothly shift <body> background and text colors from Black to White
    gsap.fromTo(
      "body",
      {
        backgroundColor: "#08090f", // Dark Hero background
        color: "#ffffff",          // Light Hero text
      },
      {
        backgroundColor: "#ffffff", // Pure White Solutions background
        color: "#0a0a0a",          // Dark crisp text
        ease: "none",
        scrollTrigger: {
          trigger: "#solutions",
          start: "top 75%",  // Animation starts when WHAT WE DO enters 75% down viewport
          end: "top 20%",    // Fully turns pure white as WHAT WE DO reaches 20%
          scrub: true,       // Linked directly to scroll velocity
          invalidateOnRefresh: true,
        },
      }
    );
  };

  document.addEventListener("astro:page-load", initThemeTransition);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    initThemeTransition();
  }
</script>
```

### 2.4 Alternative Direction: White to Black
For projects where Hero is white and downstream sections are dark:

```typescript
// Smoothly shift <body> from White to Black
gsap.to("body", {
  backgroundColor: resolveColor("--color-secondary"), // dark background
  color: resolveColor("--color-background"),          // light text
  scrollTrigger: {
    trigger: "#theme-switch-trigger",
    start: "top 60%",
    end: "top 20%",
    scrub: true,
  },
});
```

### 2.5 Critical Architectural Rules for Liquid Smooth Transitions
1. **No CSS Transition Fights**: The `<body>` tag must **not** have `transition-colors duration-500` in its class list. CSS transitions fight GSAP's 60-120 FPS scrub calculations, causing noticeable stutter.
2. **Transparent Section Wrappers**: The trigger section and its parent wrapper must have `bg-transparent` rather than a hardcoded `bg-white` or `bg-black`, allowing the background interpolation of the body to show through without an abrupt visual cutoff.
3. **Subsequent Sections**: Keep downstream white-theme sections on `bg-transparent` so they inherit the `#ffffff` body background naturally. Fixed-theme elements (such as a dark Footer) can use solid utility classes (`bg-[#05070f] text-neutral-300`).
