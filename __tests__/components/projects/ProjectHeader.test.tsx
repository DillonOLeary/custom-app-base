import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectHeader } from '@/components/project-detail/ProjectHeader';
import { mockProject } from '../../utils/test-utils';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid="back-link">
      {children}
    </a>
  );
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('ProjectHeader', () => {
  test('renders project details correctly', () => {
    render(<ProjectHeader project={mockProject} />);

    // Check main project info is displayed
    expect(
      screen.getByText(mockProject.name.toUpperCase()),
    ).toBeInTheDocument();
    expect(screen.getByText(mockProject.location)).toBeInTheDocument();
    expect(screen.getByText(`${mockProject.capacity} MW`)).toBeInTheDocument();

    // Check status badge is displayed
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Check CEARTscore is displayed
    expect(screen.getByText('CEARTscore:')).toBeInTheDocument();
    expect(screen.getByText('72')).toBeInTheDocument();

    // Check back link is present
    const backLink = screen.getByTestId('back-link');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });

  test('handles project without score', () => {
    const projectWithoutScore = { ...mockProject, score: undefined };
    render(<ProjectHeader project={projectWithoutScore} />);

    // CEARTscore should not be displayed
    expect(screen.queryByText('CEARTscore:')).not.toBeInTheDocument();

    // Other details should still be present
    expect(
      screen.getByText(mockProject.name.toUpperCase()),
    ).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });
});
