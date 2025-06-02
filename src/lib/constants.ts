import type { Role } from '@/types';

export const ROLES: { value: Role; label: string }[] = [
  { value: 'veteran', label: 'Veteran' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'employer', label: 'Employer' },
];

export const COMMON_SKILLS: string[] = [
  'Leadership',
  'Project Management',
  'Teamwork',
  'Communication',
  'Problem Solving',
  'Technical Repair',
  'Logistics Management',
  'Operations Management',
  'Data Analysis',
  'Cybersecurity',
  'Instruction & Training',
  'Strategic Planning',
  'Risk Management',
  'Adaptability',
  'Discipline',
  'Attention to Detail',
  'Mechanical Aptitude',
  'Electrical Systems',
  'Software Development',
  'Network Administration',
];

export const MILITARY_BRANCHES: string[] = [
  'Army', 'Navy', 'Air Force', 'Marine Corps', 'Coast Guard', 'Space Force'
];
