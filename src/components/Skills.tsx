import { type ComponentType, useRef } from 'react';
import { Database } from 'lucide-react';
import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { FaAws } from 'react-icons/fa';
import {
  SiC,
  SiCplusplus,
  SiFastapi,
  SiGit,
  SiGithub,
  SiMysql,
  SiPython,
  SiReact,
  SiTypescript,
} from 'react-icons/si';
import { VscVscode } from 'react-icons/vsc';
import type { StudentProfile } from '../types/student';

interface SkillsProps {
  profile: StudentProfile;
}

type ToolkitIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

interface ToolkitEntry {
  label: string;
  profileSkill?: string;
  Icon: ToolkitIcon;
}

const TOOLKIT: ToolkitEntry[] = [
  { label: 'C', profileSkill: 'C', Icon: SiC },
  { label: 'C++', profileSkill: 'C++', Icon: SiCplusplus },
  { label: 'Python', profileSkill: 'Python', Icon: SiPython },
  { label: 'TypeScript', profileSkill: 'TypeScript', Icon: SiTypescript },
  { label: 'React', profileSkill: 'React', Icon: SiReact },
  { label: 'FastAPI', profileSkill: 'FastAPI', Icon: SiFastapi },
  { label: 'SQL', profileSkill: 'SQL', Icon: Database },
  { label: 'MySQL', profileSkill: 'MySQL', Icon: SiMysql },
  { label: 'Git', profileSkill: 'Git', Icon: SiGit },
  { label: 'GitHub', profileSkill: 'GitHub', Icon: SiGithub },
  { label: 'AWS', profileSkill: 'AWS Cloud', Icon: FaAws },
  { label: 'VS Code', Icon: VscVscode },
];

const NETWORKING = ['CCNA', 'VLAN', 'LAN/WAN', 'DHCP', 'DNS', 'RIP', 'OSPF', 'EIGRP'];

function ToolkitItem({
  item,
  index,
  progress,
  reducedMotion,
}: {
  item: ToolkitEntry;
  index: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  const start = 0.2 + index * 0.018;
  const opacity = useTransform(progress, [start, start + 0.11], [reducedMotion ? 1 : 0, 1]);
  const y = useTransform(progress, [start, start + 0.11], [reducedMotion ? 0 : 18, 0]);
  const { Icon } = item;

  return (
    <motion.div className="toolkit-item" role="listitem" style={{ opacity, y }}>
      <span className="toolkit-icon-wrap" aria-hidden="true">
        <Icon className="toolkit-icon" />
      </span>
      <span className="toolkit-name">{item.label}</span>
    </motion.div>
  );
}

export default function Skills({ profile }: SkillsProps) {
  const stageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const labelOpacity = useTransform(scrollYProgress, [0.07, 0.18], [reducedMotion ? 1 : 0, 1]);
  const headingY = useTransform(scrollYProgress, [0.1, 0.26], [reducedMotion ? 0 : 34, 0]);
  const headingOpacity = useTransform(scrollYProgress, [0.1, 0.23], [reducedMotion ? 1 : 0, 1]);
  const dividerScale = useTransform(scrollYProgress, [0.16, 0.34], [reducedMotion ? 1 : 0, 1]);
  const networkingOpacity = useTransform(scrollYProgress, [0.38, 0.52], [reducedMotion ? 1 : 0, 1]);
  const toolkit = TOOLKIT.filter(({ profileSkill }) => !profileSkill || profile.skills.includes(profileSkill));
  const networking = NETWORKING.filter((skill) => profile.skills.includes(skill));

  return (
    <section
      ref={stageRef}
      id="skills"
      className={`skills-section scroll-stage ${reducedMotion ? 'is-reduced' : ''}`}
      aria-labelledby="skills-title"
    >
      <div className="skills-sticky stage-sticky section-shell">
        <div className="section-heading skills-heading">
          <motion.p className="section-index" style={{ opacity: labelOpacity }}>05 / SKILLS</motion.p>
          <motion.h2 id="skills-title" style={{ opacity: headingOpacity, y: headingY }}>
            THINGS I<br />WORK WITH.
          </motion.h2>
          <motion.p className="skills-support" style={{ opacity: headingOpacity, y: headingY }}>
            A mix of languages, frameworks,<br />databases and tools I use to build,<br />learn and experiment.
          </motion.p>
        </div>

        <div className="toolkit-panel">
          <div className="toolkit-header">
            <h3 className="toolkit-title">MY TOOLKIT</h3>
            <p className="toolkit-note">things I break stuff with →</p>
          </div>
          <motion.div className="toolkit-divider" style={{ scaleX: dividerScale }} aria-hidden="true" />

          <div className="toolkit-grid" role="list" aria-label="Technology toolkit">
            {toolkit.map((item, index) => (
              <ToolkitItem
                key={item.label}
                item={item}
                index={index}
                progress={scrollYProgress}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>

          {networking.length > 0 && (
            <motion.div className="networking-area" style={{ opacity: networkingOpacity }}>
              <h3>NETWORKING</h3>
              <div className="networking-list" aria-label="Networking skills">
                {networking.map((skill) => (
                  <span className="networking-label" key={skill} tabIndex={0}>
                    <span className="networking-word">{skill}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
