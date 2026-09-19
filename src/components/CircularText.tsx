import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

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
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const chars = Array.from(text);

  useEffect(() => setImageFailed(false), [imageSrc]);

  const duration = hovered
    ? onHover === 'speedUp'
      ? spinDuration * 0.55
      : onHover === 'slowDown'
        ? spinDuration * 1.7
        : 999999
    : spinDuration;

  return (
    <div
      className="circular-badge"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Modhini's portfolio portrait"
    >
      <motion.div
        className="circular-text-ring"
        animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {chars.map((char, index) => {
          const angle = (360 / chars.length) * index;
          return (
            <span
              key={`${char}-${index}`}
              className="circular-letter"
              style={{ transform: `rotate(${angle}deg) translateY(-50%)` }}
              aria-hidden="true"
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </motion.div>

      <div className="circular-portrait-shell">
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
      </div>
    </div>
  );
}
