import { ArrowUpRight } from 'lucide-react';
import type { StudentProfile } from '../types/student';

interface SocialLinksProps {
  profile: StudentProfile;
}

export default function SocialLinks({ profile }: SocialLinksProps) {
  const links = [
    { label: 'GITHUB', href: profile.github, detail: 'github.com/Modhini-IT', external: true },
    { label: 'LINKEDIN', href: profile.linkedin, detail: 'linkedin.com/in/modhini-v-074640385', external: true },
    { label: 'EMAIL', href: profile.email ? `mailto:${profile.email}` : '', detail: profile.email || 'Add an email in Edit Profile', external: false },
  ];

  return (
    <section id="connect" className="connect-section scroll-stage" aria-labelledby="connect-title">
      <div className="connect-sticky stage-sticky section-shell">
      <div className="section-heading connect-heading">
        <p className="section-index">05 / CONNECT</p>
        <h2 id="connect-title">LET'S<br />CONNECT.</h2>
      </div>

      <div className="social-list">
        {links.map(({ label, href, detail, external }) => (
          <a
            key={label}
            href={href || undefined}
            className={`social-row ${!href ? 'is-disabled' : ''}`}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            aria-disabled={!href}
          >
            <span className="social-copy">
              <strong>{label}</strong>
              <small>{detail}</small>
            </span>
            <ArrowUpRight className="social-arrow" size={22} aria-hidden="true" />
          </a>
        ))}
      </div>
      </div>
    </section>
  );
}
