import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
uniform vec4 uResolution;
uniform vec2 uMouse;
uniform float uHovered;
varying vec2 vUv;

// Simple random hash for grain
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  
  // Object-fit: cover logic
  vec2 coverUv = (uv - vec2(0.5)) * uResolution.zw + vec2(0.5);
  
  // Lens zoom effect under the cursor
  vec2 aspect = vec2(1.0, uResolution.y / uResolution.x);
  float dist = distance(uv * aspect, uMouse * aspect);
  float lensRadius = 0.15;
  
  if (uHovered > 0.5 && dist < lensRadius) {
      float power = smoothstep(lensRadius, 0.0, dist);
      // Map uMouse to cover space to act as the zoom center
      vec2 coverMouse = (uMouse - vec2(0.5)) * uResolution.zw + vec2(0.5);
      // Mix coverUv towards coverMouse for a zoom effect
      coverUv = mix(coverUv, coverMouse, power * 0.3);
  }
  
  vec4 offset = texture2D(uDataTexture, uv);
  
  // Scaled down distortion
  vec2 distortedUv = coverUv + offset.rg * 0.05;
  
  // Scaled down chromatic aberration
  float r = texture2D(uTexture, distortedUv + offset.rg * 0.004).r;
  float g = texture2D(uTexture, distortedUv).g;
  float b = texture2D(uTexture, distortedUv - offset.rg * 0.004).b;
  float a = texture2D(uTexture, distortedUv).a;
  
  vec3 color = vec3(r, g, b);
  
  // Add fine grain
  float n = hash(gl_FragCoord.xy);
  color += (n - 0.5) * 0.08;
  
  gl_FragColor = vec4(color, a);
}
`;

export class WebGLHoverEffect {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private dataTexture: THREE.DataTexture;
  private data: Float32Array;

  private grid: number;
  private mouseRadius: number;
  private strength: number;
  private relaxation: number;

  private mouse = new THREE.Vector2(-10, -10);
  private prevMouse = new THREE.Vector2(-10, -10);
  private animationFrameId: number | null = null;
  private isRunning = false;
  private isHovered = false;
  private bounds = { left: 0, top: 0, width: 0, height: 0 };

  constructor(
    container: HTMLElement,
    imageUrl: string,
    options: {
      grid?: number;
      mouse?: number;
      strength?: number;
      relaxation?: number;
    } = {},
  ) {
    this.container = container;
    this.grid = options.grid || 15;
    this.mouseRadius = options.mouse || 0.1;
    this.strength = options.strength || 0.15;
    this.relaxation = options.relaxation || 0.9;

    this.scene = new THREE.Scene();

    // Orthographic camera for 2D plane
    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    this.camera.position.z = 1;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.canvas = this.renderer.domElement;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none"; // Let underlying elements handle events if needed
    this.container.appendChild(this.canvas);

    // Initialize Data Texture for the grid
    const size = this.grid * this.grid;
    this.data = new Float32Array(size * 4);
    for (let i = 0; i < size; i++) {
      this.data[i * 4] = 0;
      this.data[i * 4 + 1] = 0;
      this.data[i * 4 + 2] = 0;
      this.data[i * 4 + 3] = 1;
    }

    this.dataTexture = new THREE.DataTexture(
      this.data,
      this.grid,
      this.grid,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    this.dataTexture.magFilter = THREE.LinearFilter;
    this.dataTexture.minFilter = THREE.LinearFilter;
    this.dataTexture.needsUpdate = true;

    // Load Image Texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageUrl, () => {
      // Image loaded, recalculate cover ratios
      this.resize();
    });
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: texture },
        uDataTexture: { value: this.dataTexture },
        uResolution: { value: new THREE.Vector4(1, 1, 1, 1) },
        uMouse: { value: new THREE.Vector2(-1, -1) },
        uHovered: { value: 0.0 },
      },
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.resize();
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener("resize", this.resize);
    window.addEventListener("scroll", this.updateBounds, { passive: true });
    this.container.addEventListener("scroll", this.updateBounds, {
      passive: true,
    });
    this.container.addEventListener("mouseenter", this.onMouseEnter);
    this.container.addEventListener("mouseleave", this.onMouseLeave);
    this.container.addEventListener("mousemove", this.onMouseMove);
  }

  private unbindEvents() {
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("scroll", this.updateBounds);
    this.container.removeEventListener("scroll", this.updateBounds);
    this.container.removeEventListener("mouseenter", this.onMouseEnter);
    this.container.removeEventListener("mouseleave", this.onMouseLeave);
    this.container.removeEventListener("mousemove", this.onMouseMove);
  }

  private updateBounds = () => {
    const { left, top, width, height } = this.container.getBoundingClientRect();
    this.bounds = { left, top, width, height };
  };

  private resize = () => {
    if (!this.container) return;
    this.updateBounds();
    const { width, height } = this.bounds;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Update resolution uniform for object-fit: cover
    if (this.material?.uniforms.uTexture.value) {
      const tex = this.material.uniforms.uTexture.value;
      if (tex.image) {
        const iWidth = tex.image.width || tex.image.naturalWidth;
        const iHeight = tex.image.height || tex.image.naturalHeight;

        const imageAspect = iHeight / iWidth;
        let a1: unknown, a2: unknown;

        if (height / width > imageAspect) {
          a1 = (width / height) * imageAspect;
          a2 = 1;
        } else {
          a1 = 1;
          a2 = height / width / imageAspect;
        }

        this.material.uniforms.uResolution.value.set(width, height, a1, a2);
      }
    }
  };

  private onMouseEnter = () => {
    this.isHovered = true;
    this.start();
  };

  private onMouseLeave = () => {
    this.isHovered = false;
    this.mouse.set(-10, -10);
    this.prevMouse.set(-10, -10);
    this.start();
  };

  private onMouseMove = (e: MouseEvent) => {
    const x = (e.clientX - this.bounds.left) / this.bounds.width;
    const y = 1.0 - (e.clientY - this.bounds.top) / this.bounds.height; // WebGL uses bottom-left origin

    if (!this.isHovered) {
      this.prevMouse.set(x, y);
    } else {
      this.prevMouse.copy(this.mouse);
    }

    this.mouse.set(x, y);
    this.start();
  };

  private updateDataTexture(): boolean {
    let needsUpdate = false;
    const size = this.grid;
    const data = this.data;

    // Calculate mouse velocity
    let velocityX = this.mouse.x - this.prevMouse.x;
    let velocityY = this.mouse.y - this.prevMouse.y;

    // Decrease velocity impact
    velocityX *= this.strength * 100;
    velocityY *= this.strength * 100;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = (i * size + j) * 4;

        // Calculate distance from mouse to this cell
        const gridX = j / (size - 1);
        const gridY = i / (size - 1);

        const dx = gridX - this.mouse.x;
        const dy = gridY - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Add velocity based on distance
        if (dist < this.mouseRadius && this.isHovered) {
          const force = 1.0 - dist / this.mouseRadius;
          data[index] += velocityX * force;
          data[index + 1] += velocityY * force;
        }

        // Apply relaxation/decay
        data[index] *= this.relaxation;
        data[index + 1] *= this.relaxation;

        // Ensure we update if data is non-zero
        if (
          Math.abs(data[index]) > 0.001 ||
          Math.abs(data[index + 1]) > 0.001
        ) {
          needsUpdate = true;
        }
      }
    }

    if (needsUpdate) {
      this.dataTexture.needsUpdate = true;
      this.prevMouse.copy(this.mouse);
    }

    return needsUpdate;
  }

  private render = () => {
    if (!this.isRunning) {
      this.animationFrameId = null;
      return;
    }

    // Update uniforms
    if (this.material) {
      this.material.uniforms.uMouse.value.copy(this.mouse);
      this.material.uniforms.uHovered.value = this.isHovered ? 1.0 : 0.0;
    }

    const hasMotion = this.updateDataTexture();
    this.renderer.render(this.scene, this.camera);

    if (hasMotion) {
      this.animationFrameId = requestAnimationFrame(this.render);
    } else {
      this.stop();
    }
  };

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.render();
  }

  private stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public destroy() {
    this.stop();
    this.unbindEvents();

    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }

    this.mesh?.geometry?.dispose();
    this.material?.dispose();
    this.dataTexture?.dispose();
    this.renderer.dispose();
  }
}
