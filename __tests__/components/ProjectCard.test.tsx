import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/ProjectCard';
import { Project } from '@/types/project';

// Create a simple mock for Next.js Link component
// that just renders its children directly
jest.mock('next/link', () => {
  return function MockLink({ children }: { children: React.ReactNode }) {
    return children;
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

  test('should render project card with correct information', () => {
    render(<ProjectCard project={mockProject} />);
    
    // Test that expected content is rendered
    expect(screen.getByText('Test Solar Project')).toBeInTheDocument();
    expect(screen.getByText('Arizona, USA')).toBeInTheDocument();
    expect(screen.getByText('100 MW')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });
  
  test('should not show score if not available', () => {
    const projectWithoutScore = { ...mockProject, score: undefined };
    render(<ProjectCard project={projectWithoutScore} />);
    
    expect(screen.queryByText('CEARTscore:')).not.toBeInTheDocument();
  });
});