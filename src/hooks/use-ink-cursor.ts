import { type RefObject, useEffect } from "react";
import { fsRender, fsUpdate, vs } from "@/components/react/shaders/ink";
import { createFBO, createProgram } from "@/lib/webgl";

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

    const updateProg = createProgram(gl, vs, fsUpdate);
    const renderProg = createProgram(gl, vs, fsRender);

    if (!updateProg || !renderProg) return;

    const quadBuffer = gl.createBuffer();
    if (!quadBuffer) return;

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
      const y = height - (e.clientY - rect.top); // Flip Y for WebGL

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
      const dt = Math.min((now - lastTime) / 1000.0, 0.1); // clamp dt
      const time = (now - startTime) / 1000.0;
      lastTime = now;

      gl.viewport(0, 0, width, height);

      const isMoved =
        hasMoved &&
        (lastDrawnMouse.x !== targetMouse.x ||
          lastDrawnMouse.y !== targetMouse.y);

      // 1. Update Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, fboB.fbo);
      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method
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

      // 2. Swap FBOs
      const temp = fboA;
      fboA = fboB;
      fboB = temp;

      // 3. Render Pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API method
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
