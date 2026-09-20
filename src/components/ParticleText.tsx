import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface ParticleTextProps {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  fontSize?: string;
  fontWeight?: number;
  fontFamily?: string;
  className?: string;
  id?: string;
}

interface Particle {
  x: number;
  y: number;
}

export default function ParticleText({
  text,
  particleSize = 1.5,
  density = 3,
  color = '#F2EFE8',
  fontSize = 'clamp(4.8rem, 8vw, 8.5rem)',
  fontWeight = 600,
  fontFamily = 'inherit',
  className = '',
  id,
}: ParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [coarsePointer, setCoarsePointer] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;
  const staticMode = reducedMotion || coarsePointer;

  useEffect(() => {
    const media = window.matchMedia('(hover: none), (pointer: coarse)');
    const update = () => setCoarsePointer(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const heading = headingRef.current;
    if (!canvas || !heading || staticMode) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let disposed = false;
    let lastRaster = '';
    const buildParticles = () => {
      if (disposed) return;
      const bounds = heading.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const rasterKey = `${width}:${height}:${document.fonts.status}`;
      if (rasterKey === lastRaster) return;
      lastRaster = rasterKey;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = width;
      sampleCanvas.height = height;
      const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
      if (!sampleContext) return;

      const computed = window.getComputedStyle(heading);
      let computedSize = Number.parseFloat(computed.fontSize);
      const resolvedFamily = fontFamily === 'inherit' ? computed.fontFamily : fontFamily;
      sampleContext.font = `${fontWeight} ${computedSize}px ${resolvedFamily}`;
      const horizontalPadding = 4;
      const initialWidth = sampleContext.measureText(text).width;
      if (initialWidth > width - horizontalPadding * 2) {
        computedSize *= (width - horizontalPadding * 2) / initialWidth;
        sampleContext.font = `${fontWeight} ${computedSize}px ${resolvedFamily}`;
      }

      sampleContext.fillStyle = '#fff';
      sampleContext.textAlign = 'center';
      sampleContext.textBaseline = 'middle';
      sampleContext.fillText(text, width / 2, height / 2 + computedSize * 0.03);
      const pixels = sampleContext.getImageData(0, 0, width, height).data;
      const gap = Math.max(2, Math.round(density));
      const nextParticles: Particle[] = [];

      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          if (pixels[(y * width + x) * 4 + 3] > 120) {
            nextParticles.push({
              x,
              y,
            });
          }
        }
      }
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.beginPath();
      for (const particle of nextParticles) {
        context.moveTo(particle.x + particleSize, particle.y);
        context.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
      }
      context.fill();
    };

    const observer = new ResizeObserver(buildParticles);
    observer.observe(heading);
    document.fonts.load(`${fontWeight} 100px ${fontFamily === 'inherit' ? getComputedStyle(heading).fontFamily : fontFamily}`).then(() => {
      lastRaster = '';
      buildParticles();
    });
    buildParticles();

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [color, density, fontFamily, fontWeight, particleSize, staticMode, text]);

  return (
    <h1
      ref={headingRef}
      id={id}
      className={`particle-text-heading ${className}`.trim()}
      style={{ fontSize, fontWeight, fontFamily }}
      aria-label={text}
    >
      <span className="particle-static-text" aria-hidden="true">{text}</span>
      <canvas ref={canvasRef} className="particle-text-canvas" aria-hidden="true" />
    </h1>
  );
}
