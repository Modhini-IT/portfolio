import { useEffect, useState, type PointerEvent } from 'react';
import { Pencil } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import './App.css';
import EditProfileDrawer from './components/EditProfileDrawer';
import About from './components/About';
import Academics from './components/Academics';
import Experience from './components/Experience';
import Hero from './components/Hero';
import OpeningStage from './components/OpeningStage';
import Plasma from './components/Plasma';
import Skills from './components/Skills';
import SocialLinks from './components/SocialLinks';
import CustomCursor from './components/CustomCursor';
import type { StudentProfile } from './types/student';

const initialProfile: StudentProfile = {
  name: 'Modhini V',
  department: 'Information Technology',
  year: '2nd Year',
  college: 'SVCE',
  bio: 'I like building things, breaking them, and figuring out why they broke.',
  skills: ['C', 'C++', 'Python', 'TypeScript', 'React', 'REST APIs', 'FastAPI', 'SQL', 'MySQL', 'DBMS', 'Database Design', 'Git', 'GitHub', 'CCNA', 'LAN/WAN', 'VLAN', 'DHCP', 'DNS', 'RIP', 'OSPF', 'EIGRP', 'Full Stack Web Development', 'AWS Cloud'],
  github: 'https://github.com/Modhini-IT',
  linkedin: 'https://www.linkedin.com/in/modhini-v-074640385',
  email: '2025it1089@svce.ac.in',
  photo: '/modhini-main.jpg',
  circularPhoto: '/modhini-red.jpg',
};

type NavLinkProps = { href: string; number: string; children: string };

function MagneticNavLink({ href, number, children }: NavLinkProps) {
  const xTarget = useMotionValue(0);
  const yTarget = useMotionValue(0);
  const scaleTarget = useMotionValue(1);
  const x = useSpring(xTarget, { stiffness: 520, damping: 30, mass: 0.22 });
  const y = useSpring(yTarget, { stiffness: 520, damping: 30, mass: 0.22 });
  const scale = useSpring(scaleTarget, { stiffness: 520, damping: 30, mass: 0.22 });

  const reset = () => {
    xTarget.set(0);
    yTarget.set(0);
    scaleTarget.set(1);
  };

  const handleMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    xTarget.set(((event.clientX - rect.left) / rect.width - 0.5) * 5);
    yTarget.set(-2 + ((event.clientY - rect.top) / rect.height - 0.5) * 4);
  };

  return (
    <motion.a
      href={href}
      style={{ x, y, scale }}
      onPointerEnter={() => {
        yTarget.set(-2);
        scaleTarget.set(1.03);
      }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
    >
      <span>{number}</span> {children}
    </motion.a>
  );
}

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;
    const timeout = window.setTimeout(() => setToastVisible(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [toastVisible]);

  const saveProfile = (next: StudentProfile) => {
    setProfile({ ...next, name: next.name.trim().replace(/\.+$/, '') });
    setDrawerOpen(false);
    setToastVisible(true);
  };

  return (
    <div className="site-root">
      <div className="plasma-layer">
        <Plasma color="#315C9B" speed={0.25} direction="forward" scale={1.15} opacity={0.28} mouseInteractive={false} targetFps={30} />
      </div>
      <div className="readability-overlay" aria-hidden="true" />

      <header className="top-nav">
        <a className="brand-mark" href="#opening" aria-label="Go to home">M.</a>
        <nav aria-label="Main navigation">
          <MagneticNavLink href="#opening" number="01">HOME</MagneticNavLink>
          <MagneticNavLink href="#about" number="02">ABOUT</MagneticNavLink>
          <MagneticNavLink href="#academics" number="03">ACADEMICS</MagneticNavLink>
          <MagneticNavLink href="#experience" number="04">EXPERIENCE</MagneticNavLink>
          <MagneticNavLink href="#skills" number="05">SKILLS</MagneticNavLink>
          <MagneticNavLink href="#connect" number="06">CONNECT</MagneticNavLink>
        </nav>
        <button className="nav-edit" type="button" onClick={() => setDrawerOpen(true)}>
          <Pencil size={15} /> Edit Profile <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main>
        <OpeningStage />
        <Hero profile={profile} />
        <About profile={profile} />
        <Academics />
        <Experience />
        <Skills profile={profile} />
        <SocialLinks profile={profile} />
      </main>

      <footer className="site-footer">
        <span>© 2026 Modhini V</span>
        <span>Information Technology · SVCE</span>
        <span>Built with React + TypeScript</span>
      </footer>

      <EditProfileDrawer open={drawerOpen} profile={profile} onClose={() => setDrawerOpen(false)} onSave={saveProfile} />
      <div className={`toast ${toastVisible ? 'is-visible' : ''}`} role="status" aria-live="polite">Profile updated</div>
      <CustomCursor />
    </div>
  );
}
