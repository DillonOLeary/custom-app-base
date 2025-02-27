import { ScoreCategory } from '@/types/project';

interface CategoryDescription {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORY_DESCRIPTIONS: Record<ScoreCategory, CategoryDescription> =
  {
    completeness: {
      title: 'Completeness',
      description:
        'Evaluates whether all necessary documentation for proper due diligence is present in the data room.',
      icon: '📋',
      color: 'var(--color-tertiary-1)',
    },
    financialClaims: {
      title: 'Financial Claims',
      description:
        'Assesses the quality and reliability of financial projections and statements.',
      icon: '💰',
      color: 'var(--color-tertiary-3)',
    },
    contractCoverage: {
      title: 'Contract Coverage',
      description:
        'Measures whether all necessary contracts are in place for the project.',
      icon: '📑',
      color: 'var(--color-tertiary-2)',
    },
    contractQuality: {
      title: 'Contract Quality',
      description:
        'Evaluates the terms, conditions, and legal quality of the existing contracts.',
      icon: '⚖️',
      color: 'var(--color-primary)',
    },
    reputationScreening: {
      title: 'Reputation Screening',
      description:
        'Screens project participants for historical performance and reputation issues.',
      icon: '🔍',
      color: 'var(--color-secondary)',
    },
  };
