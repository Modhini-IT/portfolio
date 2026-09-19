import { motion, type MotionValue, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import type { StudentProfile } from '../types/student';

interface SkillsProps {
  profile: StudentProfile;
}

const CATEGORY_MAP: Record<string, string[]> = {
  LANGUAGES: ['C', 'C++', 'Python', 'TypeScript'],
  'WEB / API': ['React', 'REST APIs', 'FastAPI'],
  DATABASE: ['SQL', 'MySQL', 'DBMS', 'Database Design'],
  TOOLS: ['Git', 'GitHub'],
  NETWORKING: ['CCNA', 'LAN/WAN', 'VLAN', 'DHCP', 'DNS', 'RIP', 'OSPF', 'EIGRP'],
  'CURRENTLY LEARNING': ['Full Stack Web Development', 'AWS Cloud'],
};

function SkillGroup({ category, skills, index, progress }: { category: string; skills: string[]; index: number; progress: MotionValue<number> }) {
  const start = 0.08 + index * 0.1;
  const opacity = useTransform(progress, [start, start + 0.2], [0, 1]);
  const x = useTransform(progress, [start, start + 0.2], [48, 0]);

  return (
    <motion.div className="skill-group" style={{ opacity, x }}>
      <h3>{category}</h3>
      <div className="skill-tags">
        {skills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}
      </div>
    </motion.div>
  );
}

export default function Skills({ profile }: SkillsProps) {
  const stageRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const configuredSkills = Object.values(CATEGORY_MAP).flat();
  const groups = Object.entries(CATEGORY_MAP)
    .map(([category, baseSkills]) => [category, baseSkills.filter((skill) => profile.skills.includes(skill))] as const)
    .filter(([, skills]) => skills.length);
  const otherSkills = profile.skills.filter((skill) => !configuredSkills.includes(skill));

  return (
    <section ref={stageRef} id="skills" className="skills-section scroll-stage" aria-labelledby="skills-title">
      <div className="skills-sticky stage-sticky section-shell">
      <div className="section-heading">
        <p className="section-index">04 / SKILLS</p>
        <h2 id="skills-title">THINGS I<br />WORK WITH.</h2>
      </div>

      <div className="skill-groups">
        {groups.map(([category, skills], index) => (
          <SkillGroup key={category} category={category} skills={skills} index={index} progress={scrollYProgress} />
        ))}

        {otherSkills.length > 0 && (
          <div className="skill-group">
            <h3>OTHER</h3>
            <div className="skill-tags">{otherSkills.map((skill) => <span className="skill-tag" key={skill}>{skill}</span>)}</div>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
