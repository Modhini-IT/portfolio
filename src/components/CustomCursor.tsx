import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

const interactiveSelector = 'a, button, .toolkit-item, .upload-button, input[type="file"]';

export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const xTarget = useMotionValue(-40);
  const yTarget = useMotionValue(-40);
  const scaleTarget = useMotionValue(1);
  const x = useSpring(xTarget, { stiffness: 720, damping: 46, mass: 0.22 });
  const y = useSpring(yTarget, { stiffness: 720, damping: 46, mass: 0.22 });
  const scale = useSpring(scaleTarget, { stiffness: 560, damping: 34, mass: 0.2 });

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const updateEnabled = () => setEnabled(finePointer.matches && !reducedMotion);

    updateEnabled();
    finePointer.addEventListener('change', updateEnabled);
    return () => finePointer.removeEventListener('change', updateEnabled);
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle('has-dot-cursor', enabled);
    return () => document.documentElement.classList.remove('has-dot-cursor');
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (event: PointerEvent) => {
      xTarget.set(event.clientX);
      yTarget.set(event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      scaleTarget.set(target?.closest(interactiveSelector) ? 1.375 : 1);
    };
    const resetCursor = () => scaleTarget.set(1);

    window.addEventListener('pointermove', moveCursor, { passive: true });
    window.addEventListener('pointerout', resetCursor, { passive: true });
    return () => {
      window.removeEventListener('pointermove', moveCursor);
      window.removeEventListener('pointerout', resetCursor);
    };
  }, [enabled, scaleTarget, xTarget, yTarget]);

  if (!enabled) return null;

  return <motion.div className="custom-cursor" aria-hidden="true" style={{ x, y, scale }} />;
}
