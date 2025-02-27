import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProjectList } from '@/components/ProjectList';
import { Project } from '@/types/project';

// Mock the ProjectCard component
jest.mock('@/components/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: Project }) => (
    <div data-testid={`project-card-mock-${project.id}`}>{project.name}</div>
  ),
}));

describe('ProjectList', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Solar Project 1',
      location: 'Arizona, USA',
      type: 'solar',
      capacity: 100,
      status: 'completed',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-10T00:00:00Z',
    },
    {
      id: '2',
      name: 'Wind Project 1',
      location: 'Maine, USA',
      type: 'wind',
      capacity: 75,
      status: 'analyzing',
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-10T00:00:00Z',
    },
  ];

  test('should render a list of projects in a grid layout', () => {
    const { container } = render(<ProjectList projects={mockProjects} />);

    expect(screen.getByTestId('project-list')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-mock-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-card-mock-2')).toBeInTheDocument();
    expect(screen.getByText('Solar Project 1')).toBeInTheDocument();
    expect(screen.getByText('Wind Project 1')).toBeInTheDocument();

    // Verify grid layout classes - we use partial matching since class names may have changed
    const gridElement = screen.getByTestId('project-list');
    expect(gridElement.classList.toString()).toContain('grid');
    expect(gridElement.classList.toString()).toContain('sm:grid-cols-2');
    expect(gridElement.classList.toString()).toContain('lg:grid-cols-3');
  });

  test('should render loading state', () => {
    render(<ProjectList projects={[]} isLoading={true} />);

    expect(screen.getByTestId('project-list-loading')).toBeInTheDocument();
    // Should render 6 loading skeletons
    expect(
      screen
        .getAllByRole('generic')
        .filter((el) => el.className.includes('animate-pulse')).length,
    ).toBe(6);
  });

  test('should render error state', () => {
    render(<ProjectList projects={[]} error="Test error message" />);

    expect(screen.getByTestId('project-list-error')).toBeInTheDocument();
    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  test('should render empty state', () => {
    render(<ProjectList projects={[]} />);

    expect(screen.getByTestId('project-list-empty')).toBeInTheDocument();
    expect(screen.getByText(/No projects found/)).toBeInTheDocument();
  });
});
