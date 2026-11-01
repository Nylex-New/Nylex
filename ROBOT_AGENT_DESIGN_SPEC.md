# 🤖 NYLEX STUDIO — 3D FLOATING ROBOT AGENT DESIGN SPECIFICATION
> **Prompt & Engineering Blueprint for Claude / AI Assistants**  
> Use this document along with the reference image to generate the exact, production-grade 3D Robot Agent for the Nylex Studio website in Antigravity.

---

## 🎯 Objective
Generate the complete code for `src/components/static/widgets/floating-agent.astro`.  
The agent must:
1. **Visually match the provided reference image with 100% accuracy** (materials, proportions, glowing accents, and details).
2. **Track the user's mouse cursor across the entire webpage in real-time** (head, eyes, and body look directly at the cursor wherever it is on the screen).
3. **Comply strictly with the Zero-Lag Architecture** defined for Antigravity (Vanilla Three.js, 60fps locked, zero memory leaks, mobile bypass).

---

## 🛠️ Technical Stack & Target Environment
- **Framework**: Astro 5 (`.astro` single-file component)
- **3D Graphics Engine**: **Vanilla Three.js** (`import * as THREE from "three"`)
- **Styling**: Tailwind CSS v4 for container positioning
- **Target File Path**: `src/components/static/widgets/floating-agent.astro`
- **Output Requirement**: Claude must return the **complete, standalone `.astro` file code** with no missing imports or placeholder pseudo-code, so it can be pasted directly into Antigravity.

---

## 🎨 Visual Breakdown from Reference Image

### 1. Color Palette & Materials
| Material | Three.js Material Type | Color / Config | Applied To |
|---|---|---|---|
| **White Ceramic Armor** | `MeshStandardMaterial` | `color: 0xffffff`, `roughness: 0.14`, `metalness: 0.15` | Helmet, torso armor, shoulders, forearms, hand casings |
| **Dark Charcoal Metal** | `MeshStandardMaterial` | `color: 0x111622`, `roughness: 0.35`, `metalness: 0.85` | Neck collar, antenna stem, ear muff brackets, elbow joints, fingers, thruster nozzles |
| **Glossy Obsidian Visor** | `MeshStandardMaterial` | `color: 0x060913`, `roughness: 0.04`, `metalness: 0.95` | Face screen & center lens of Arc Reactor |
| **Electric Cyan Neon Glow** | `MeshStandardMaterial` | `color: 0x00d2ff`, `emissive: 0x00b4ff`, `emissiveIntensity: 2.2`, `roughness: 0.1` | Antenna beacon sphere, forehead light bar, ear rings, shoulder accents, chest arc reactor ring, side seams |
| **Cyan Laser Core** | `MeshBasicMaterial` | `color: 0x00f5ff` | LED capsule eyes, reactor core point, orbital spark motes |
| **Thruster Jet Flame** | `MeshBasicMaterial` | `color: 0x00e5ff`, `transparent: true`, `opacity: 0.9` | Inverted conical rocket flames underneath |
| **Orbital Halo Ring** | `MeshBasicMaterial` | `color: 0x38bdf8`, `transparent: true`, `opacity: 0.35` | Angled energy ring hovering around the waist |

---

### 2. Anatomical & Geometry Specifications

#### A. Head & Helmet (Chibi Proportions)
- **Helmet**: Rounded, wide chibi squarish-sphere (`SphereGeometry(0.86, 36, 32)` scaled `(1.18, 0.96, 1.05)`).
- **Forehead Arch & Cyan Slot Light**:
  - Brow ridge arch running across the forehead.
  - Horizontal sleek glowing cyan capsule light bar (`CapsuleGeometry(0.032, 0.32)`) embedded in the forehead above the visor.
- **Glossy Visor Screen**:
  - Seamless closed curved capsule geometry (`CapsuleGeometry(0.27, 0.52)` scaled `(1.12, 1.0, 0.55)`).
  - **Crucial Rule**: Must be a closed, smooth geometry to prevent any polygonal clipping artifacts or black dots on the side of the face!
- **Glowing LED Eyes**:
  - Two large, friendly vertical cyan capsules (`CapsuleGeometry(0.082, 0.17)`).
  - Left eye positioned at `x = -0.25`, Right eye at `x = +0.25`.
  - Shift dynamically inside the visor based on cursor position.
  - Perform natural blinking (brief vertical scale compression every 3–5 seconds).
- **Top Antenna**:
  - Dark collar socket base on the crown of the helmet.
  - Cylindrical charcoal stem (`length ≈ 0.28`).
  - Bright glowing cyan beacon sphere at the tip (`SphereGeometry(0.13)`).
- **Left & Right Ear Muff Discs**:
  - Symmetrical headphone-style circular sensor pods.
  - Dark charcoal inner bracket connecting to helmet.
  - White ceramic outer rim disc.
  - Concentric glowing cyan neon ring (`TorusGeometry`) on the outer face.
  - Dark circular center disc.

#### B. Torso & Arc Reactor
- **Neck**: Dark charcoal cylindrical collar connecting head to torso.
- **Chest Armor**: Aerodynamic, tapered white ceramic torso (`CylinderGeometry(0.56, 0.44, 0.68)`).
- **Chest Arc Reactor (Exact Match to Image)**:
  - Located in the exact center of the chest.
  - Recessed dark circular socket bezel.
  - Glowing cyan neon concentric ring (`TorusGeometry(0.145, 0.028)`).
  - Dark glossy convex lens center.
  - Gently pulses with breathing animation.
- **Torso Side Seams**: Symmetrical curved cyan neon accent stripes running along the left and right rib plates.
- **Lower Abdomen**: Tapered white armor piece housing the lower propulsion system.

#### C. Thrusters & Jet Flames
- **Twin Rocket Nozzles**: Dark charcoal cylinders with white outer collar rings at `x = -0.22` and `x = +0.22`.
- **Twin Cyan Jet Flames**: Inverted cones (`ConeGeometry(0.12, 0.52)`) with high-frequency scale jitter (`Math.sin(clock * 32)`).
- **Ground Glow Pool**: Circular gradient disc projected underneath the thrusters to simulate lighting bounce.

#### D. Arms & Posed Hands
- **Shoulders**: White spherical shoulder caps (`SphereGeometry(0.18)`) with glowing cyan oval accent rings on top.
- **Upper & Forearms**: Natural hovering pose (upper arm pointing slightly out/down, forearm angled forward).
- **Hands**: Robotic palm casing with 3 articulated mechanical fingers curled slightly forward/inward in a natural hover stance.

#### E. Orbital Halo Ring
- Angled glowing cyan energy ring (`TorusGeometry(1.42, 0.018)`) floating around the robot's waist.
- 4 orbiting glowing cyan spark motes traveling around the ring.

---

## 🖱️ Accurate Mouse Cursor Tracking (Mandatory)
The agent sits in the bottom-right corner of the website (`fixed right-3 sm:right-6 bottom-3 sm:bottom-6`).  
**Mouse tracking must calculate the true direction vector from the agent's screen position to the cursor**:

```typescript
// 1. Calculate the exact screen center of the robot canvas
const rect = canvas.getBoundingClientRect();
const agentScreenX = rect.left + rect.width / 2;
const agentScreenY = rect.top + rect.height / 2;

// 2. Compute vector from agent to mouse
const dx = e.clientX - agentScreenX;
const dy = e.clientY - agentScreenY;

// 3. Smoothly map to pitch (X-axis) and yaw (Y-axis) rotation limits
const normX = dx / Math.max(window.innerWidth * 0.75, 450);
const normY = dy / Math.max(window.innerHeight * 0.75, 450);

const maxYaw = 0.95;   // ~55 degrees horizontal limit
const maxPitch = 0.72; // ~41 degrees vertical limit

mouse.targetYaw = Math.max(-maxYaw, Math.min(maxYaw, normX * 1.6));
mouse.targetPitch = Math.max(-maxPitch, Math.min(maxPitch, normY * 1.5));
```

### Motion Details in Animation Loop:
- **Head**: Smoothly interpolates (LERP with factor `0.095`) toward `mouse.targetYaw` and `mouse.targetPitch`.
- **Body**: Follows head with secondary drag (factor `0.38` of yaw, `0.22` of pitch).
- **Eyes**: Pupils shift slightly inside the visor towards the cursor for lifelike eye-contact.
- **Harmonic Breathing**: Gentle vertical hover bob (`Math.sin(clock * 2.2) * 0.1`) and subtle roll (`Math.sin(clock * 1.8) * 0.025`).
- **Arms**: Subtle sympathetic sway with phase offset.

---

## ⚡ Zero-Lag Performance Rules for Antigravity

Claude must strictly observe these rules to prevent lag, battery drain, or memory leaks:

1. **Mobile Bypass**:  
   If screen width `< 768px` or touch device (`pointer: coarse`), immediately return without initializing WebGL.
2. **Tab Visibility Pausing**:  
   Listen to `document.addEventListener("visibilitychange", ...)`. When `document.hidden` is true, pause `requestAnimationFrame` (0% CPU / 0% GPU when user is on another tab).
3. **Retina DPR Clamping**:  
   Clamp pixel ratio: `const dpr = Math.min(window.devicePixelRatio || 1, 2)`.
4. **Memory Cleanup on Page Navigation**:  
   Listen to Astro's `astro:before-swap` event to cancel `requestAnimationFrame`, remove window event listeners, and call `renderer.dispose()`.
5. **Renderer Optimizations**:  
   `powerPreference: "high-performance"`, `alpha: true`, `antialias: true`, `toneMapping: THREE.ACESFilmicToneMapping`, `toneMappingExposure: 1.35`.

---

## 📦 Desired Astro File Structure

The generated file `floating-agent.astro` must look like this:

```astro
---
// Server frontmatter
---

<aside
  id="floating-agent-container"
  aria-label="Interactive 3D Robot Agent"
  class="fixed right-3 sm:right-6 bottom-3 sm:bottom-6 z-40 flex flex-col items-center pointer-events-none select-none transition-all duration-700 opacity-0 translate-y-4"
>
  <!-- 3D Robot Canvas Box -->
  <div class="w-44 h-48 sm:w-52 sm:h-56 relative flex items-center justify-center filter drop-shadow-[0_16px_36px_rgba(0,163,255,0.4)]">
    <canvas id="vanilla-agent-canvas" class="w-full h-full"></canvas>
  </div>

  <!-- Polished Minimal Status Pill -->
  <div class="px-3.5 py-1 -mt-1 rounded-full border border-[#00d2ff]/30 bg-black/85 backdrop-blur-md flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.3)]">
    <span class="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping"></span>
    <span class="font-mono text-[9px] uppercase tracking-widest text-[#00d2ff] font-semibold">
      NYLEX AGENT &bull; ONLINE
    </span>
  </div>
</aside>

<script>
  import * as THREE from "three";

  const initRobotAgent = () => {
    // 1. Mobile check
    // 2. Scene, Camera, Renderer
    // 3. Studio Lights
    // 4. Materials
    // 5. Procedural 3D Geometry Assembly (Head, Visor, Eyes, Antenna, Ears, Torso, Arc Reactor, Arms, Thrusters, Halo)
    // 6. Vector Cursor Tracking
    // 7. 60FPS RAF Loop with Hover Physics, Jitter Flames & Blinking
    // 8. astro:before-swap disposal
  };

  document.addEventListener("astro:page-load", initRobotAgent);
</script>
```

---

## 📋 Instruction to Claude
When providing code to the user:
> "Write the complete, pristine code for `src/components/static/widgets/floating-agent.astro`. Ensure every single geometric detail from the reference image is included (glossy visor without clipping, glowing cyan forehead strip, top antenna beacon, ear muffs, chest arc reactor, articulated arms, thruster flames with floor glow, and orbital halo). Ensure cursor tracking smoothly follows the mouse anywhere on screen."

