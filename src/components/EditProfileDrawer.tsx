import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import type { ProfileErrors, StudentProfile } from '../types/student';

interface EditProfileDrawerProps {
  open: boolean;
  profile: StudentProfile;
  onClose: () => void;
  onSave: (nextProfile: StudentProfile) => void;
}

const isReasonableUrl = (value: string, domain: string) => {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes(domain);
  } catch {
    return false;
  }
};

export default function EditProfileDrawer({ open, profile, onClose, onSave }: EditProfileDrawerProps) {
  const [draft, setDraft] = useState<StudentProfile>(profile);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    if (open) {
      setDraft(profile);
      setSkillInput('');
      setErrors({});
    }
  }, [open, profile]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const previewName = useMemo(() => draft.photo.startsWith('blob:') ? 'Selected local image' : 'Current profile image', [draft.photo]);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || draft.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return;
    setDraft((current) => ({ ...current, skills: [...current.skills, skill] }));
    setSkillInput('');
    setErrors((current) => ({ ...current, skills: undefined }));
  };

  const validate = (): ProfileErrors => {
    const next: ProfileErrors = {};
    if (!draft.name.trim()) next.name = 'Name is required.';
    if (!draft.department.trim()) next.department = 'Department is required.';
    if (!draft.year.trim()) next.year = 'Year is required.';
    if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) next.email = 'Enter a valid email address.';
    if (!isReasonableUrl(draft.github, 'github.com')) next.github = 'Use a valid GitHub URL.';
    if (!isReasonableUrl(draft.linkedin, 'linkedin.com')) next.linkedin = 'Use a valid LinkedIn URL.';
    if (draft.skills.some((skill) => !skill.trim())) next.skills = 'Skills cannot be empty.';
    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave({ ...draft, skills: draft.skills.map((skill) => skill.trim()).filter(Boolean) });
  };

  const handlePhoto = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setDraft((current) => ({ ...current, photo: url }));
  };

  const handleSkillKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSkill();
    }
  };

  return (
    <div className={`drawer-layer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button className="drawer-backdrop" type="button" onClick={onClose} aria-label="Close edit profile panel" tabIndex={open ? 0 : -1} />
      <aside className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-header">
          <div>
            <p className="section-index">EDIT / PROFILE</p>
            <h2 id="drawer-title">Make it yours.</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close drawer"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="photo-field">
            <img src={draft.photo} alt="Profile preview" />
            <div>
              <span className="field-label">Profile Photo</span>
              <label className="upload-button">
                <Upload size={15} aria-hidden="true" />
                Choose image
                <input type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} />
              </label>
              <small>{previewName}</small>
            </div>
          </div>

          {[
            ['name', 'Name'],
            ['department', 'Department'],
            ['year', 'Year'],
            ['github', 'GitHub'],
            ['linkedin', 'LinkedIn'],
            ['email', 'Email'],
          ].map(([field, label]) => {
            const key = field as keyof Pick<StudentProfile, 'name' | 'department' | 'year' | 'github' | 'linkedin' | 'email'>;
            const error = errors[key as keyof ProfileErrors];
            return (
              <label className="form-field" key={field}>
                <span>{label}</span>
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  value={draft[key]}
                  onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.value }))}
                  aria-invalid={Boolean(error)}
                />
                {error && <small className="field-error">{error}</small>}
              </label>
            );
          })}

          <label className="form-field">
            <span>Bio</span>
            <textarea
              value={draft.bio}
              rows={4}
              onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
            />
          </label>

          <div className="form-field">
            <span>Skills</span>
            <div className="editable-skills">
              {draft.skills.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className="editable-skill"
                  onClick={() => setDraft((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }))}
                  aria-label={`Remove ${skill}`}
                >
                  {skill}<X size={12} />
                </button>
              ))}
            </div>
            <div className="skill-input-row">
              <input
                value={skillInput}
                placeholder="Add a skill..."
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
              <button className="icon-button" type="button" onClick={addSkill} aria-label="Add skill"><Plus size={18} /></button>
            </div>
            {errors.skills && <small className="field-error">{errors.skills}</small>}
          </div>

          <div className="drawer-actions">
            <button className="quiet-button" type="button" onClick={onClose}>Cancel</button>
            <button className="save-button" type="submit">Save Changes</button>
          </div>
        </form>
      </aside>
    </div>
  );
}
