import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const PROJECTS = [
  {
    number: '01',
    name: 'ECO-TRACK',
    summary: 'Smart Attendance Tracking System',
    achievement: 'Winner · iCube Hackathon 5.0',
    stack: 'OpenCV / YuNet / SFace',
  },
  {
    number: '02',
    name: 'NETWORK SEGMENTATION',
    summary: 'VLAN / Inter-VLAN Routing',
    achievement: 'Cisco Packet Tracer',
    stack: '',
  },
  {
    number: '03',
    name: 'PRICERACE',
    summary: 'Commerce Comparison Platform',
    achievement: 'Top 5 · Signal Shift 2K26',
    stack: 'Frontend / Web / ESP32 Integration',
  },
];

function ProjectPanel({ project, index, progress }: { project: typeof PROJECTS[number]; index: number; progress: MotionValue<number> }) {
  const start = index / PROJECTS.length;
  const middle = (index + 0.5) / PROJECTS.length;
  const end = (index + 1) / PROJECTS.length;
  const opacity = useTransform(progress, [Math.max(0, start - 0.08), start + 0.04, middle, Math.min(1, end - 0.02), Math.min(1, end + 0.05)], [0, 1, 1, 1, index === PROJECTS.length - 1 ? 1 : 0]);
  const y = useTransform(progress, [start, end], [48, -48]);

  return (
    <motion.article className="project-panel" style={{ opacity, y }} aria-label={`Project ${project.number}: ${project.name}`}>
      <span className="project-number" aria-hidden="true">{project.number}</span>
      <div className="project-copy">
        <p>PROJECT / {project.number}</p>
        <h3>{project.name}</h3>
        <p className="project-summary">{project.summary}</p>
        <p>{project.achievement}</p>
        {project.stack && <p className="project-stack">{project.stack}</p>}
      </div>
    </motion.article>
  );
}

export default function Experience() {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start start', 'end end'] });

  return (
    <section ref={stageRef} id="experience" className={`experience-stage scroll-stage ${reducedMotion ? 'is-reduced' : ''}`} aria-labelledby="experience-title">
      <div className="experience-sticky stage-sticky section-shell">
        <header className="experience-heading">
          <p className="section-index">03 / EXPERIENCE</p>
          <h2 id="experience-title">WHAT I'VE<br />BEEN BUILDING.</h2>
        </header>
        <div className="project-sequence">
          {PROJECTS.map((project, index) => (
            <ProjectPanel key={project.number} project={project} index={index} progress={scrollYProgress} />
          ))}
        </div>
        <div className="experience-progress" aria-hidden="true">
          {PROJECTS.map((project) => <span key={project.number}>{project.number}</span>)}
        </div>
      </div>
    </section>
  );
}
