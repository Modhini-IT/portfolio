import { type PointerEvent, useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { StudentProfile } from '../types/student';
import CircularText from './CircularText';

interface HeroProps {
  profile: StudentProfile;
}

export default function Hero({ profile }: HeroProps) {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoHover, setPhotoHover] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0, scale: 1 });
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const photoX = useTransform(scrollYProgress, [0, 0.38], [reducedMotion ? 0 : -100, 0]);
  const photoRotate = useTransform(scrollYProgress, [0, 0.38], [reducedMotion ? -1.6 : -5, -1.6]);
  const copyY = useTransform(scrollYProgress, [0.08, 0.42], [reducedMotion ? 0 : 70, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.08, 0.34], [0, 1]);
  const badgeX = useTransform(scrollYProgress, [0.12, 0.5], [reducedMotion ? 0 : 90, 0]);

  useEffect(() => setPhotoFailed(false), [profile.photo]);

  const resetPhotoHover = () => setPhotoHover({ rotateX: 0, rotateY: 0, x: 0, y: 0, scale: 1 });

  const handlePhotoPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover || reducedMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    setPhotoHover({
      rotateX: vertical * -1.5,
      rotateY: horizontal * 2,
      x: horizontal * 2.5,
      y: vertical * 2.5,
      scale: 1.012,
    });
  };

  return (
    <section ref={stageRef} id="hero" className="hero-stage scroll-stage" aria-labelledby="hero-name">
      <div className="hero stage-sticky section-shell">
      <motion.div className="hero-photo-column" style={{ x: photoX }}>
        <motion.div
          className="hero-photo-frame"
          style={{ rotate: photoRotate, transformPerspective: 900 }}
          animate={photoHover}
          transition={{ type: 'spring', stiffness: 220, damping: 22, mass: 0.6 }}
          onPointerMove={handlePhotoPointerMove}
          onPointerLeave={resetPhotoHover}
        >
          <div className="photo-tape" aria-hidden="true" />
          {!photoFailed ? (
            <img
              className="hero-photo"
              src={profile.photo}
              alt={`${profile.name} mirror selfie`}
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="hero-photo photo-fallback" role="img" aria-label={`${profile.name} photo unavailable`}>
              <span>MV</span>
            </div>
          )}
        </motion.div>
        <p className="hand-note photo-note">that's me :)</p>
      </motion.div>

      <motion.div className="hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <p className="eyebrow">HELLO, I'M</p>
        <h1 id="hero-name">{profile.name}</h1>
        <div className="hero-meta">
          <span>{profile.department}</span>
          <span>{profile.year.toUpperCase()}</span>
          <span>{profile.college}</span>
        </div>
        <p className="hero-bio">{profile.bio}</p>
      </motion.div>

      <motion.div className="hero-badge" style={{ x: badgeX }}>
        <CircularText
          text="MODHINI'S • PORTFOLIO • MODHINI'S • PORTFOLIO • "
          imageSrc={profile.circularPhoto}
          imageAlt={`${profile.name} in a red shirt`}
          spinDuration={18}
          onHover="speedUp"
        />
      </motion.div>
      </div>
    </section>
  );
}
