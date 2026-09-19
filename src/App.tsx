import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import './App.css';
import EditProfileDrawer from './components/EditProfileDrawer';
import Academics from './components/Academics';
import Experience from './components/Experience';
import Hero from './components/Hero';
import OpeningStage from './components/OpeningStage';
import Plasma from './components/Plasma';
import Skills from './components/Skills';
import SocialLinks from './components/SocialLinks';
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
  email: '',
  photo: '/modhini-main.jpg',
  circularPhoto: '/modhini-red.jpg',
};

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
    setProfile(next);
    setDrawerOpen(false);
    setToastVisible(true);
  };

  return (
    <div className="site-root">
      <div className="plasma-layer">
        <Plasma color="#315C9B" speed={0.25} direction="forward" scale={1.15} opacity={0.28} mouseInteractive />
      </div>
      <div className="readability-overlay" aria-hidden="true" />

      <header className="top-nav">
        <a className="brand-mark" href="#opening" aria-label="Go to home">M.</a>
        <nav aria-label="Main navigation">
          <a href="#opening"><span>01</span> HOME</a>
          <a href="#about"><span>02</span> ABOUT</a>
          <a href="#experience"><span>03</span> EXPERIENCE</a>
          <a href="#skills"><span>04</span> SKILLS</a>
          <a href="#connect"><span>05</span> CONNECT</a>
        </nav>
        <button className="nav-edit" type="button" onClick={() => setDrawerOpen(true)}>
          <Pencil size={15} /> Edit Profile <span aria-hidden="true">↗</span>
        </button>
      </header>

      <main>
        <OpeningStage />
        <Hero profile={profile} />
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
    </div>
  );
}
