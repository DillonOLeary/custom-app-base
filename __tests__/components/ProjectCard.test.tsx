import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/ProjectCard';
import { Project } from '@/types/project';

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href} data-testid="next-link">{children}</a>;
  };
});

describe('ProjectCard', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Solar Project',
    location: 'Arizona, USA',
    type: 'solar',
    capacity: 100,
    status: 'completed',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-10T00:00:00Z',
    score: 85,
  };

  test('should render project card with correct information and flex layout', () => {
    const { container } = render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Solar Project')).toBeInTheDocument();
    expect(screen.getByText('Arizona, USA')).toBeInTheDocument();
    expect(screen.getByText('100 MW')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    
    // Verify flex layout and full height for grid - we use partial matching for class check
    const card = screen.getByTestId(`project-card-${mockProject.id}`);
    expect(card.classList.toString()).toContain('flex');
    expect(card.classList.toString()).toContain('flex-col');
    expect(card.classList.toString()).toContain('h-full');
  });
  
  test('should link to the project detail page', () => {
    render(<ProjectCard project={mockProject} />);
    
    const link = screen.getByTestId('next-link');
    expect(link).toHaveAttribute('href', '/projects/1');
  });
  
  test('should not show score if not available', () => {
    const projectWithoutScore = { ...mockProject, score: undefined };
    render(<ProjectCard project={projectWithoutScore} />);
    
    expect(screen.queryByText('Quality Score:')).not.toBeInTheDocument();
  });
});