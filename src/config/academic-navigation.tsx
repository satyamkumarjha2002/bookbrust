import { ReactElement } from 'react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: ReactElement;
  description: string;
  component?: ReactElement;
}

export const moduleColors = {
  standards: { bg: 'bg-blue-500/10', text: 'text-blue-500', hover: 'hover:bg-blue-500/20' },
  competencies: { bg: 'bg-green-500/10', text: 'text-green-500', hover: 'hover:bg-green-500/20' },
  curriculum: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', hover: 'hover:bg-indigo-500/20' },
  syllabus: { bg: 'bg-violet-500/10', text: 'text-violet-500', hover: 'hover:bg-violet-500/20' },
  resources: { bg: 'bg-amber-500/10', text: 'text-amber-500', hover: 'hover:bg-amber-500/20' },
  assessment: { bg: 'bg-rose-500/10', text: 'text-rose-500', hover: 'hover:bg-rose-500/20' },
  outcomes: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', hover: 'hover:bg-cyan-500/20' },
  calendar: { bg: 'bg-orange-500/10', text: 'text-orange-500', hover: 'hover:bg-orange-500/20' },
  dashboard: { bg: 'bg-primary/10', text: 'text-primary', hover: 'hover:bg-primary/20' },
  default: { bg: 'bg-gray-100', text: 'text-gray-700', hover: 'hover:bg-gray-200' }
}; 