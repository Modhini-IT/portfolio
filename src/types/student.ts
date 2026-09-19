export interface StudentProfile {
  name: string;
  department: string;
  year: string;
  college: string;
  bio: string;
  skills: string[];
  github: string;
  linkedin: string;
  email: string;
  photo: string;
  circularPhoto: string;
}

export type ProfileErrors = Partial<Record<'name' | 'department' | 'year' | 'email' | 'github' | 'linkedin' | 'skills', string>>;
