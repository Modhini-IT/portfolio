import { useRef, type PointerEvent } from 'react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import type { StudentProfile } from '../types/student';

interface AboutProps {
  profile: StudentProfile;
}

const FACTS = [
  { label: 'CURRENTLY', lines: ['2ND YEAR IT'] },
  { label: 'INTERESTED IN', lines: ['WEB DEVELOPMENT', 'NETWORKING', 'CLOUD'] },
  { label: 'CURRENTLY LEARNING', lines: ['FULL STACK', 'AWS CLOUD'] },
];

function AboutFact({ fact, index, progress, reducedMotion }: { fact: typeof FACTS[number]; index: number; progress: ReturnType<typeof useScroll>['scrollYProgress']; reducedMotion: boolean }) {
  const start = 0.36 + index * 0.055;
  const opacity = useTransform(progress, [start, start + 0.13], [reducedMotion ? 1 : 0, 1]);
  const y = useTransform(progress, [start, start + 0.13], [reducedMotion ? 0 : 22, 0]);

  return (
    <motion.div className="about-fact" style={{ opacity, y }}>
      <span>{fact.label}</span>
      <p>{fact.lines.map((line) => <span key={line}>{line}</span>)}</p>
    </motion.div>
  );
}

export default function About({ profile }: AboutProps) {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const labelOpacity = useTransform(scrollYProgress, [0.08, 0.2], [reducedMotion ? 1 : 0, 1]);
  const headingX = useTransform(scrollYProgress, [0.1, 0.32], [reducedMotion ? 0 : -72, 0]);
  const headingClip = useTransform(scrollYProgress, [0.1, 0.31], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);
  const photoX = useTransform(scrollYProgress, [0.16, 0.4], [reducedMotion ? 0 : 74, 0]);
  const photoOpacity = useTransform(scrollYProgress, [0.14, 0.32], [reducedMotion ? 1 : 0, 1]);
  const copyY = useTransform(scrollYProgress, [0.22, 0.44], [reducedMotion ? 0 : 44, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.22, 0.4], [reducedMotion ? 1 : 0, 1]);

  const pointerXTarget = useMotionValue(0);
  const pointerYTarget = useMotionValue(0);
  const pointerRotateTarget = useMotionValue(-1.2);
  const pointerScaleTarget = useMotionValue(1);
  const springConfig = { stiffness: 190, damping: 24, mass: 0.55 };
  const pointerX = useSpring(pointerXTarget, springConfig);
  const pointerY = useSpring(pointerYTarget, springConfig);
  const pointerRotate = useSpring(pointerRotateTarget, springConfig);
  const pointerScale = useSpring(pointerScaleTarget, springConfig);
  const noteX = useTransform(pointerX, (value) => value * -0.45);

  const resetPhoto = () => {
    pointerXTarget.set(0);
    pointerYTarget.set(0);
    pointerRotateTarget.set(-1.2);
    pointerScaleTarget.set(1);
  };

  const handlePhotoPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    const vertical = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    pointerXTarget.set(horizontal * 3);
    pointerYTarget.set(vertical * 3);
    pointerRotateTarget.set(-1.2 + horizontal);
    pointerScaleTarget.set(1.01);
  };

  return (
    <section ref={stageRef} id="about" className="about-stage scroll-stage" aria-labelledby="about-title">
      <div className="about-sticky stage-sticky section-shell">
        <div className="about-heading">
          <motion.p className="section-index" style={{ opacity: labelOpacity }}>02 / ABOUT</motion.p>
          <motion.h2 id="about-title" style={{ x: headingX, clipPath: reducedMotion ? 'none' : headingClip }}>
            A LITTLE<br />ABOUT ME.
          </motion.h2>
        </div>

        <motion.div className="about-photo-column" style={{ x: photoX, opacity: photoOpacity }}>
          <motion.div
            className="about-photo-frame"
            style={{ x: pointerX, y: pointerY, rotate: pointerRotate, scale: pointerScale }}
            onPointerMove={handlePhotoPointer}
            onPointerLeave={resetPhoto}
          >
            <img src={profile.circularPhoto} alt={`${profile.name} at a student event`} />
          </motion.div>
          <motion.p className="hand-note about-note" style={{ x: noteX }}>hi again :)</motion.p>
        </motion.div>

        <motion.div className="about-copy" style={{ y: copyY, opacity: copyOpacity }}>
          <p>I'm Modhini, an Information Technology student at SVCE who enjoys building things and understanding how they work.</p>
          <p>I like experimenting with web development, APIs, databases and networking, and I'm always trying to learn something new by actually building with it.</p>
          <div className="about-facts">
            {FACTS.map((fact, index) => (
              <AboutFact key={fact.label} fact={fact} index={index} progress={scrollYProgress} reducedMotion={reducedMotion} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
