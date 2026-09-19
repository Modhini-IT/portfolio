import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export default function Academics() {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const copyY = useTransform(scrollYProgress, [0.12, 0.48], [reducedMotion ? 0 : 80, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.08, 0.35], [0, 1]);
  const scoreScale = useTransform(scrollYProgress, [0.28, 0.66], [reducedMotion ? 1 : 0.72, 1]);
  const scoreX = useTransform(scrollYProgress, [0.28, 0.66], [reducedMotion ? 0 : 100, 0]);

  return (
    <section ref={stageRef} id="about" className="academics-stage scroll-stage" aria-labelledby="academics-title">
      <div className="academics-sticky stage-sticky section-shell">
        <motion.div className="academics-copy" style={{ y: copyY, opacity: copyOpacity }}>
          <p className="section-index">02 / ACADEMICS</p>
          <h2 id="academics-title">B.TECH<br />INFORMATION<br />TECHNOLOGY</h2>
          <p className="academic-college">SRI VENKATESWARA COLLEGE<br />OF ENGINEERING</p>
          <p className="academic-years">2025 — 2029</p>
        </motion.div>
        <motion.div className="cgpa-block" style={{ scale: scoreScale, x: scoreX }}>
          <span className="cgpa-label">CGPA</span>
          <strong>8.68</strong>
          <span className="cgpa-denominator">/ 10</span>
        </motion.div>
      </div>
    </section>
  );
}
