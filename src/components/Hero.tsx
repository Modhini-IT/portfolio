import { type PointerEvent, useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { StudentProfile } from '../types/student';
import CircularText from './CircularText';
import ParticleText from './ParticleText';

interface HeroProps {
  profile: StudentProfile;
}

export default function Hero({ profile }: HeroProps) {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const [photoFailed, setPhotoFailed] = useState(false);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const photoX = useTransform(scrollYProgress, [0, 0.38], [reducedMotion ? 0 : -100, 0]);
  const photoRotate = useTransform(scrollYProgress, [0, 0.38], [reducedMotion ? -1.6 : -5, -1.6]);
  const copyY = useTransform(scrollYProgress, [0.08, 0.42], [reducedMotion ? 0 : 70, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.08, 0.34], [0, 1]);
  const badgeX = useTransform(scrollYProgress, [0.12, 0.5], [reducedMotion ? 0 : 90, 0]);
  const hoverXTarget = useMotionValue(0);
  const hoverYTarget = useMotionValue(0);
  const rotateXTarget = useMotionValue(0);
  const rotateYTarget = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const springConfig = { stiffness: 220, damping: 22, mass: 0.6 };
  const hoverX = useSpring(hoverXTarget, springConfig);
  const hoverY = useSpring(hoverYTarget, springConfig);
  const hoverRotateX = useSpring(rotateXTarget, springConfig);
  const hoverRotateY = useSpring(rotateYTarget, springConfig);
  const hoverScale = useSpring(scaleTarget, springConfig);
  const heroName = profile.name.trim().replace(/\.+$/, '');

  useEffect(() => setPhotoFailed(false), [profile.photo]);

  const resetPhotoHover = () => {
    hoverXTarget.set(0);
    hoverYTarget.set(0);
    rotateXTarget.set(0);
    rotateYTarget.set(0);
    scaleTarget.set(1);
  };

  const handlePhotoPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover || reducedMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    rotateXTarget.set(vertical * -1.5);
    rotateYTarget.set(horizontal * 2);
    hoverXTarget.set(horizontal * 4);
    hoverYTarget.set(vertical * 4);
    scaleTarget.set(1.012);
  };

  return (
    <section ref={stageRef} id="hero" className="hero-stage scroll-stage" aria-labelledby="hero-name">
      <div className="hero stage-sticky section-shell">
      <motion.div className="hero-photo-column" style={{ x: photoX }}>
        <motion.div
          className="hero-photo-frame"
          style={{
            rotate: photoRotate,
            rotateX: hoverRotateX,
            rotateY: hoverRotateY,
            x: hoverX,
            y: hoverY,
            scale: hoverScale,
            transformPerspective: 900,
          }}
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
        <ParticleText
          id="hero-name"
          text={heroName}
          particleSize={0.85}
          density={3}
          color="#F2EFE8"
          fontSize="clamp(4.5rem, 7vw, 7.4rem)"
          fontWeight={400}
          fontFamily="DM Serif Display"
        />
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
