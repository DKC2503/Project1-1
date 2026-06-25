import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getCategoryBadgeClass(category: string): string {
  const cat = (category || '').toLowerCase().trim();
  switch (cat) {
    case 'national': return 'badge-national';
    case 'global': return 'badge-global';
    case 'politics': return 'badge-politics';
    case 'business': return 'badge-business';
    case 'sports': return 'badge-sports';
    case 'entertainment': return 'badge-entertainment';
    case 'automobile': return 'badge-automobile';
    case 'lifestyle': return 'badge-lifestyle';
    case 'movies': return 'badge-movies';
    case 'startups': return 'badge-startups';
    case 'studies': return 'badge-studies';
    case 'case studies':
    case 'case-studies': return 'badge-case-studies';
    case 'technology': return 'badge-technology';
    default: return 'badge-default';
  }
}

