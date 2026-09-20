import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';

interface PlasmaProps {
  color?: string;
  speed?: number;
  direction?: 'forward' | 'reverse' | 'pingpong';
  scale?: number;
  opacity?: number;
  mouseInteractive?: boolean;
  renderScale?: number;
  maxDpr?: number;
  targetFps?: number;
  iterations?: number;
  lightMode?: boolean;
}

type MutableVec2 = Float32Array;

const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 0.5, 0.2];
  return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
};

const vertex = `#version 300 es
precision highp float;
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const ORIGINAL_QUALITY = 60;

const buildFragment = (_iterations: number) => `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uCustomColor;
uniform float uUseCustomColor;
uniform float uSpeed;
uniform float uDirection;
uniform float uScale;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseInteractive;
uniform float uQuality;
uniform float uStepScale;
uniform float uLightMode;
out vec4 fragColor;

void mainImage(out vec4 o, vec2 C) {
  vec2 center = iResolution.xy * 0.5;
  C = (C - center) / uScale + center;
  vec2 mouseOffset = (uMouse - center) * 0.0002;
  C += mouseOffset * length(C - center) * step(0.5, uMouseInteractive);

  float i = 0.0, d = 0.0, z = 0.0, T = iTime * uSpeed * uDirection;
  vec3 O = vec3(0.0), p, S;
  for (vec2 r = iResolution.xy, Q; ++i < 60.0; O += o.w/d*o.xyz) {
    p = z*normalize(vec3(C-.5*r,r.y));
    p.z -= 4.;
    S = p;
    d = p.y-T;
    p.x += .4*(1.+p.y)*sin(d + p.x*0.1)*cos(.34*d + p.x*0.05);
    Q = p.xz *= mat2(cos(p.y+vec4(0,11,33,0)-T));
    z += d = (abs(sqrt(length(Q*Q)) - .25*(5.+S.y))/3.+8e-4) * uStepScale;
    o = 1.+sin(S.y+p.z*.5+S.z-length(S-p)+vec4(2,1,0,8));
    if (i >= uQuality) break;
  }
  o.xyz = tanh(O/1e4);
}

bool finite1(float x){ return !(isnan(x) || isinf(x)); }
vec3 sanitize(vec3 c){
  return vec3(finite1(c.r) ? c.r : 0.0, finite1(c.g) ? c.g : 0.0, finite1(c.b) ? c.b : 0.0);
}

void main() {
  vec4 o = vec4(0.0);
  mainImage(o, gl_FragCoord.xy);
  vec3 rgb = sanitize(o.rgb);
  float intensity = (rgb.r + rgb.g + rgb.b) / 3.0;
  vec3 customColor = intensity * uCustomColor;
  vec3 finalColor = mix(rgb, customColor, step(0.5, uUseCustomColor));
  float alpha = length(rgb) * uOpacity;
  fragColor = uLightMode > 0.5 ? vec4(finalColor, 1.0) : vec4(finalColor, alpha);
}`;

export default function Plasma({
  color = '#ffffff',
  speed = 1,
  direction = 'forward',
  scale = 1,
  opacity = 1,
  mouseInteractive = true,
  renderScale = 0.55,
  maxDpr = 1.5,
  targetFps = 60,
  iterations = 60,
  lightMode = false,
}: PlasmaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pendingMouse = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let raf = 0;
    let lastFrame = 0;
    let elapsed = 0;
    let previousTime = 0;
    const customColorRgb = hexToRgb(color);
    const directionMultiplier = direction === 'reverse' ? -1 : 1;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, maxDpr),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    containerEl.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment: buildFragment(iterations),
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uCustomColor: { value: new Float32Array(customColorRgb) },
        uUseCustomColor: { value: 1 },
        uSpeed: { value: speed * 0.4 },
        uDirection: { value: directionMultiplier },
        uScale: { value: scale },
        uOpacity: { value: opacity },
        uMouse: { value: new Float32Array([0, 0]) },
        uMouseInteractive: { value: mouseInteractive ? 1 : 0 },
        uQuality: { value: iterations },
        uStepScale: { value: ORIGINAL_QUALITY / iterations },
        uLightMode: { value: lightMode ? 1 : 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const setSize = () => {
      const rect = containerEl.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width * renderScale)), Math.max(1, Math.floor(rect.height * renderScale)));
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const res = program.uniforms.iResolution.value as MutableVec2;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      if (visible && !document.hidden) renderer.render({ scene: mesh });
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(containerEl);
    setSize();

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseInteractive || motionPreference.matches || !visible || document.hidden) return;
      const rect = containerEl.getBoundingClientRect();
      pendingMouse.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    if (mouseInteractive) containerEl.addEventListener('mousemove', handleMouseMove, { passive: true });


    const frameInterval = 1000 / targetFps;

    const renderFrame = (time: number) => {
      raf = 0;
      if (!visible || document.hidden || motionPreference.matches) return;
      if (time - lastFrame < frameInterval) {
        raf = requestAnimationFrame(renderFrame);
        return;
      }
      lastFrame = time;

      if (pendingMouse.current) {
        const mouse = program.uniforms.uMouse.value as MutableVec2;
        mouse[0] = pendingMouse.current.x;
        mouse[1] = pendingMouse.current.y;
        pendingMouse.current = null;
      }

      if (previousTime) elapsed += (time - previousTime) * 0.001;
      previousTime = time;
      program.uniforms.iTime.value = direction === 'pingpong' ? 5 + Math.sin(elapsed * 0.35) * 5 : elapsed;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(renderFrame);
    };

    const syncAnimation = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      previousTime = 0;
      lastFrame = 0;
      if (!visible || document.hidden) return;
      if (motionPreference.matches) renderer.render({ scene: mesh });
      else raf = requestAnimationFrame(renderFrame);
    };
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    visibilityObserver.observe(containerEl);
    document.addEventListener('visibilitychange', syncAnimation);
    motionPreference.addEventListener('change', syncAnimation);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
      motionPreference.removeEventListener('change', syncAnimation);
      geometry.remove();
      gl.deleteProgram(program.program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      containerEl.removeEventListener('mousemove', handleMouseMove);
      if (canvas.parentNode === containerEl) containerEl.removeChild(canvas);
    };
  }, [color, speed, direction, scale, opacity, mouseInteractive, renderScale, maxDpr, targetFps, iterations, lightMode]);

  return <div ref={containerRef} className="plasma-container" aria-hidden="true" />;
}
