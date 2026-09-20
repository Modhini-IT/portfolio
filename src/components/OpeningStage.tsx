import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import WarpText from './WarpText';

export default function OpeningStage() {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  });

  const titleScale = useTransform(scrollYProgress, [0, 0.72], [1, reducedMotion ? 1 : 1.18]);
  const titleY = useTransform(scrollYProgress, [0, 0.72], ['0%', reducedMotion ? '0%' : '-26%']);
  const titleOpacity = useTransform(scrollYProgress, [0.18, 0.86], [1, 0]);
  const dividerScale = useTransform(scrollYProgress, [0, 0.7], [0.15, 1]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section ref={stageRef} id="opening" className="opening-stage scroll-stage" aria-label="Portfolio introduction">
      <div className="opening-sticky stage-sticky">
        <motion.div className="opening-kicker" style={{ opacity: introOpacity }}>
          <span>PORTFOLIO / 2026</span>
        </motion.div>
        <motion.h1 className="opening-title" style={{ scale: titleScale, y: titleY, opacity: titleOpacity }}>
          <WarpText
            text="Modhini V"
            color="#f8f5ff"
            warpStrength={0.05}
            warpScale={1.7}
            speed={0.35}
            pointerInfluence={0.38}
            pointerStrength={0.28}
            refraction={0.01}
            ripple
            fontFamily="inherit"
          />
        </motion.h1>
        <motion.div className="opening-divider" style={{ scaleX: dividerScale }} />
        <motion.div className="opening-footer" style={{ opacity: introOpacity }}>
          <p>INFORMATION TECHNOLOGY<br />FRONTEND / DEVELOPMENT</p>
          <p className="scroll-prompt">SCROLL TO EXPLORE ↓</p>
        </motion.div>
      </div>
    </section>
  );
}
