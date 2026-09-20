// Adapted from React Bits WarpText by David Haz (2026).
// Upstream: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/TextAnimations/WarpText
// License: ./WarpText.LICENSE.md
import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import './WarpText.css';

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;

  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.04 * (0.35 + lens * 1.65);

  vec4 base = sampleText(displaced);
  float r = sampleText(displaced + split).r;
  float g = base.g;
  float b = sampleText(displaced - split).b;
  float a = max(max(sampleText(displaced + split).a, base.a), sampleText(displaced - split).a);

  vec3 color = vec3(r, g, b);
  fragColor = vec4(color, a);
}
`;


interface WarpTextProps {
  text: string;
  color?: string;
  warpStrength?: number;
  warpScale?: number;
  speed?: number;
  pointerInfluence?: number;
  pointerStrength?: number;
  refraction?: number;
  ripple?: boolean;
  fontFamily?: 'inherit';
}

export default function WarpText({ text, color = '#f8f5ff', warpStrength = .05,
  warpScale = 1.7, speed = .35, pointerInfluence = .38, pointerStrength = .28,
  refraction = .01, ripple = true }: WarpTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const label = textRef.current;
    const heading = label?.parentElement;
    if (!label || !heading) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse), (max-width: 900px)');
    const padding = 16;
    let visible = false, disposed = false, lost = false, ready = false;
    let frame = 0, last = 0, elapsed = 0, rasterVersion = 0, rasterKey = '';
    let renderer: Renderer | undefined;
    let program: Program, geometry: Triangle, texture: Texture, mesh: Mesh;
    let canvas: HTMLCanvasElement | undefined;
    let width = 0, height = 0;
    const pointer = { x: .5, y: .5, tx: .5, ty: .5, active: 0, target: 0 };
    const allowed = () => visible && !document.hidden && !preference.matches && !disposed && !lost;
    const render = () => {
      if (renderer && ready && allowed()) renderer.render({ scene: mesh });
    };
    const rasterize = async () => {
      if (!renderer || !allowed()) return;
      const version = ++rasterVersion;
      const style = getComputedStyle(heading);
      await document.fonts.load(style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily).catch(() => {});
      if (disposed || lost || version !== rasterVersion || !allowed()) return;
      // Use layout dimensions, not transformed scroll-animation bounds.
      const css = getComputedStyle(heading);
      const nextWidth = heading.clientWidth + padding * 2;
      const nextHeight = heading.clientHeight + padding * 2;
      const key = [nextWidth, nextHeight, css.fontFamily, css.fontSize, css.fontWeight, css.letterSpacing, css.lineHeight, css.textAlign, text, color].join(':');
      if (key === rasterKey) return;
      rasterKey = key;
      width = nextWidth; height = nextHeight;
      renderer.setSize(width, height);
      canvas!.style.width = width + 'px';
      canvas!.style.height = height + 'px';
      program.uniforms.uResolution.value.set([width, height]);
      // One cached, off-DOM texture; the real heading remains in the document.
      const raster = document.createElement('canvas');
      raster.width = Math.round(width * renderer.dpr);
      raster.height = Math.round(height * renderer.dpr);
      const context = raster.getContext('2d');
      if (!context) return;
      context.scale(renderer.dpr, renderer.dpr);
      context.font = css.fontStyle + ' ' + css.fontWeight + ' ' + css.fontSize + ' ' + css.fontFamily;
      context.letterSpacing = css.letterSpacing === 'normal' ? '0px' : css.letterSpacing;
      context.fontKerning = 'normal';
      context.fillStyle = color;
      context.textBaseline = 'alphabetic';
      const metrics = context.measureText(text);
      const lineHeight = parseFloat(css.lineHeight);
      const baseline = padding + (lineHeight - metrics.fontBoundingBoxAscent - metrics.fontBoundingBoxDescent) / 2 + metrics.fontBoundingBoxAscent;
      const centered = css.textAlign === 'center';
      context.textAlign = centered ? 'center' : 'left';
      context.fillText(text, centered ? width / 2 : padding, baseline);
      texture.image = raster;
      texture.needsUpdate = true;
      ready = true;
      render();
      heading.classList.add('warp-ready');
      sync();
    };
    const initialize = () => {
      if (renderer || lost) return;
      try {
        renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: false,
          antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 1.25) });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        canvas = gl.canvas as HTMLCanvasElement;
        canvas.className = 'warp-text-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        heading.appendChild(canvas);
        texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR,
          wrapS: gl.CLAMP_TO_EDGE, wrapT: gl.CLAMP_TO_EDGE });
        geometry = new Triangle(gl);
        program = new Program(gl, { vertex, fragment, transparent: true, depthTest: false, depthWrite: false,
          uniforms: {
            uTextTexture: { value: texture }, uResolution: { value: new Float32Array([1, 1]) },
            uPointer: { value: new Float32Array([.5, .5]) }, uPointerActive: { value: 0 }, uTime: { value: 0 },
            uWarpStrength: { value: warpStrength }, uWarpScale: { value: warpScale }, uSpeed: { value: speed },
            uPointerInfluence: { value: pointerInfluence }, uPointerStrength: { value: pointerStrength },
            uRefraction: { value: refraction }, uRipple: { value: ripple ? 1 : 0 }, uMotion: { value: 1 }
          } });
        mesh = new Mesh(gl, { geometry, program });
        canvas.addEventListener('webglcontextlost', onContextLost);
      } catch {
        lost = true;
        heading.classList.remove('warp-ready');
      }
    };
    const loop = (now: number) => {
      frame = 0;
      if (!allowed() || !ready) return;
      const interval = 1000 / (pointer.target || pointer.active > .01 ? 45 : 15);
      if (!last || now - last >= interval) {
        const delta = last ? Math.min(now - last, 100) : interval;
        last = now; elapsed += delta / 1000;
        const positionEase = 1 - Math.exp(-delta / 80);
        const activeEase = 1 - Math.exp(-delta / 170);
        pointer.x += (pointer.tx - pointer.x) * positionEase;
        pointer.y += (pointer.ty - pointer.y) * positionEase;
        pointer.active += (pointer.target - pointer.active) * activeEase;
        program.uniforms.uPointer.value.set([pointer.x, pointer.y]);
        program.uniforms.uPointerActive.value = pointer.active;
        program.uniforms.uTime.value = elapsed;
        render();
      }
      frame = requestAnimationFrame(loop);
    };
    function sync() {
      cancelAnimationFrame(frame); frame = 0; last = 0;
      heading!.classList.toggle('warp-ready', ready && !preference.matches && !lost);
      if (!allowed()) { pointer.target = 0; return; }
      initialize();
      void rasterize();
      if (!ready) return;
      frame = requestAnimationFrame(loop);
    }
    const onMove = (event: PointerEvent) => {
      if (!allowed() || !canvas || event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
      pointer.target = 1;
    };
    const onLeave = () => { pointer.target = 0; };
    function onContextLost(event: Event) {
      event.preventDefault(); lost = true; ready = false; sync();
    }
    const onResize = () => { if (allowed()) { initialize(); void rasterize(); } };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    const resizeObserver = new ResizeObserver(onResize);
    observer.observe(heading); resizeObserver.observe(heading);
    heading.addEventListener('pointermove', onMove, { passive: true });
    heading.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', onResize);
    preference.addEventListener('change', sync);
    return () => {
      disposed = true; ++rasterVersion; cancelAnimationFrame(frame);
      observer.disconnect(); resizeObserver.disconnect();
      heading.removeEventListener('pointermove', onMove);
      heading.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', onResize);
      preference.removeEventListener('change', sync);
      heading.classList.remove('warp-ready');
      canvas?.removeEventListener('webglcontextlost', onContextLost);
      if (renderer && !lost) {
        renderer.gl.deleteTexture(texture?.texture); geometry?.remove(); program?.remove();
        renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
      canvas?.remove();
    };
  }, [text, color, warpStrength, warpScale, speed, pointerInfluence, pointerStrength, refraction, ripple]);
  return <span ref={textRef} className="warp-text-source">{text}</span>;
}
