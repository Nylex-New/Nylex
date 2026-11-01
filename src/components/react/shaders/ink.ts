export const vs = `
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

float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
}

void main() {
    // base turbulence
    vec2 distort = vec2(noise(vUv * 9.0 + u_time * 0.6) - 0.5, noise(vUv * 15.0 - u_time * 0.5) - 0.5);
    
    // RGB prism diffusion (different distortion magnitude per channel)
    float r = texture2D(u_texture, vUv + distort * 0.002).r;
    float g = texture2D(u_texture, vUv + distort * 0.0035).g;
    float b = texture2D(u_texture, vUv + distort * 0.005).b;
    float a = texture2D(u_texture, vUv + distort * 0.003).a;
    
    vec3 color = vec3(r, g, b);
    
    // Slower fade (velocity)
    float fadeRate = 0.5; 
    float density = max(0.0, a - u_dt * fadeRate);
    
    if (u_isMoved == 1) {
        float d = distToSegment(gl_FragCoord.xy, u_prevMouse, u_mouse);
        
        // Dynamic turbulence on the radius
        float n = noise(gl_FragCoord.xy * 0.60 + u_time);
        float radius = 80.0 + n * 80.0; // larger size and more turbulence
        
        float intensity = smoothstep(radius, radius - 3.0, d);
        
        // Vibrant Rainbow color palette
        vec3 rainbow = 0.2 + 0.5 * cos(u_time * 1.5 + gl_FragCoord.xyx * 0.001 + vec3(0.0, 2.0, 4.0));
        
        // Normalize rainbow to guarantee it's bright and NEVER white (prevents black spots)
        float rMax = max(rainbow.r, max(rainbow.g, rainbow.b));
        float rMin = min(rainbow.r, min(rainbow.g, rainbow.b));
        rainbow = (rainbow - rMin) / (rMax - rMin + 0.0001); 
        
        // Smoothly blend color based on intensity (prevents hard shifts and banding)
        float colorBlend = smoothstep(0.0, 1.0, intensity);
        color = mix(color, rainbow, colorBlend);
        
        // Merge density using max (prevents overlapping trenches)
        density = max(density, intensity);
    }
    
    gl_FragColor = vec4(color, density);
}
`;

export const fsRender = `
precision highp float;
uniform sampler2D u_texture;
varying vec2 vUv;

// Simple random hash for grain
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    // Distance from screen center (0 at center, ~1.4 at corners)
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    
    // Generate fine-grained noise
    float n = hash(gl_FragCoord.xy);
    
    // Dispersion offset increases toward the screen edges (classic vintage lens aberration)
    vec2 dispersion = vec2(0.003, 0.002) * (n - 0.5) * (1.0 + dist * 4.5);
    
    // Sample RGB channels with slight offsets
    float r = texture2D(u_texture, vUv + dispersion * 1.0).r;
    float g = texture2D(u_texture, vUv + dispersion * 1.5).g;
    float b = texture2D(u_texture, vUv - dispersion * 1.5).b;
    
    // Density is sampled exactly without dispersion to keep edges clean
    float a = texture2D(u_texture, vUv).a;
    
    vec3 color = vec3(r, g, b);
    
    // Add black grain texture (adding white to the ink makes it black on screen due to difference blending)
    float grain = pow(n, 2.0); // Make the grain a bit sharper
    color += grain * (0.1 + dist * 0.2);
    
    // Vintage Vignette: smoothly fade out the ink at the extreme screen edges
    float vignette = smoothstep(2.4, 0.75, dist);
    a *= vignette;
    color *= vignette * 1.4;
    
    gl_FragColor = vec4(color, a);
}
`;
