import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

interface CircularTextProps {
  text: string;
  imageSrc: string;
  imageAlt: string;
  spinDuration?: number;
  onHover?: 'speedUp' | 'slowDown' | 'pause';
}

export default function CircularText({
  text,
  imageSrc,
  imageAlt,
  spinDuration = 18,
  onHover = 'speedUp',
}: CircularTextProps) {
  const badgeRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [imageFailed, setImageFailed] = useState(false);
  const chars = Array.from(text);
  const rotation = useMotionValue(0);
  const speedTarget = useMotionValue(1);
  const portraitXTarget = useMotionValue(0);
  const portraitYTarget = useMotionValue(0);
  const portraitScaleTarget = useMotionValue(1);
  const ringXTarget = useMotionValue(0);
  const ringYTarget = useMotionValue(0);
  const ringScaleTarget = useMotionValue(1);
  const springConfig = { stiffness: 180, damping: 23, mass: 0.6 };
  const speed = useSpring(speedTarget, { stiffness: 90, damping: 24 });
  const portraitX = useSpring(portraitXTarget, springConfig);
  const portraitY = useSpring(portraitYTarget, springConfig);
  const portraitScale = useSpring(portraitScaleTarget, springConfig);
  const ringX = useSpring(ringXTarget, springConfig);
  const ringY = useSpring(ringYTarget, springConfig);
  const ringScale = useSpring(ringScaleTarget, springConfig);

  useEffect(() => setImageFailed(false), [imageSrc]);

  useEffect(() => {
    const badge = badgeRef.current;
    if (!badge || reducedMotion) return;
    let visible = false;
    let frame = 0;
    let previous = 0;
    const tick = (time: number) => {
      if (previous) rotation.set((rotation.get() + 360 / (spinDuration * 1000) * (time - previous) * speed.get()) % 360);
      previous = time;
      frame = requestAnimationFrame(tick);
    };
    const syncAnimation = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    observer.observe(badge);
    document.addEventListener('visibilitychange', syncAnimation);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
    };
  }, [reducedMotion, rotation, speed, spinDuration]);

  const canInteract = (pointerType?: string) => !reducedMotion
    && pointerType !== 'touch'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!canInteract(event.pointerType)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    portraitXTarget.set(horizontal * 2.5);
    portraitYTarget.set(vertical * 2.5);
    ringXTarget.set(horizontal * -3.5);
    ringYTarget.set(vertical * -3.5);
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (!canInteract(event.pointerType)) return;
    speedTarget.set(onHover === 'speedUp' ? 1.35 : onHover === 'slowDown' ? 0.65 : 0);
    portraitScaleTarget.set(1.025);
    ringScaleTarget.set(1.035);
  };

  const handlePointerLeave = () => {
    speedTarget.set(1);
    portraitXTarget.set(0);
    portraitYTarget.set(0);
    portraitScaleTarget.set(1);
    ringXTarget.set(0);
    ringYTarget.set(0);
    ringScaleTarget.set(1);
  };

  return (
    <div
      ref={badgeRef}
      className="circular-badge"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      aria-label="Modhini's portfolio portrait"
    >
      <motion.div
        className="circular-text-ring"
        style={{ rotate: reducedMotion ? 0 : rotation, x: ringX, y: ringY, scale: ringScale }}
      >
        {chars.map((char, index) => {
          const angle = (360 / chars.length) * index;
          return (
            <span
              key={`${char}-${index}`}
              className="circular-letter"
              style={{ transform: `rotate(${angle}deg)` }}
              aria-hidden="true"
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </motion.div>

      <motion.div className="circular-portrait-shell" style={{ x: portraitX, y: portraitY, scale: portraitScale }}>
        {!imageFailed ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="circular-portrait"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="circular-portrait photo-fallback" role="img" aria-label={`${imageAlt} unavailable`}>
            <span>MV</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
