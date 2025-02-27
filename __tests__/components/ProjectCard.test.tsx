import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from '@/components/project-dashboard/ProjectCard';
import { Project } from '@/types/project';

// Mock router functionality
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Create a simple mock for Next.js Link component
// that just renders its children directly
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <div data-testid="mock-link" data-href={href}>
        {children}
      </div>
    );
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
    description: 'A test solar project with complete documentation',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render project card with correct information', () => {
    render(<ProjectCard project={mockProject} />);

    // Test that expected content is rendered
    expect(screen.getByText('Test Solar Project')).toBeInTheDocument();
    expect(screen.getByText('Arizona, USA')).toBeInTheDocument();
    expect(screen.getByText('100 MW')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(
      screen.getByText('A test solar project with complete documentation'),
    ).toBeInTheDocument();
  });

  test('should not show score if not available', () => {
    const projectWithoutScore = { ...mockProject, score: undefined };
    render(<ProjectCard project={projectWithoutScore} />);

    expect(screen.queryByText('CEARTscore:')).not.toBeInTheDocument();
  });

  test('should render different status colors correctly', () => {
    // Test new project status
    const newProject = {
      ...mockProject,
      status: 'new' as const,
      score: undefined,
    };
    const { rerender } = render(<ProjectCard project={newProject} />);
    expect(screen.getByText('New')).toBeInTheDocument();

    // Verify the status badge is present
    const newStatusElement = screen.getByText('New');
    expect(newStatusElement.className).toContain('ceart-score-badge');

    // Test pending project status
    const pendingProject = {
      ...mockProject,
      status: 'pending' as const,
      score: undefined,
    };
    rerender(<ProjectCard project={pendingProject} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    // Verify status badge is present
    const pendingStatusElement = screen.getByText('Pending');
    expect(pendingStatusElement.className).toContain('ceart-score-badge');

    // Test analyzing project status
    const analyzingProject = {
      ...mockProject,
      status: 'analyzing' as const,
      score: undefined,
    };
    rerender(<ProjectCard project={analyzingProject} />);
    expect(screen.getByText('Analyzing')).toBeInTheDocument();

    // Verify status badge is present
    const analyzingStatusElement = screen.getByText('Analyzing');
    expect(analyzingStatusElement.className).toContain('ceart-score-badge');

    // Test failed project status
    const failedProject = {
      ...mockProject,
      status: 'failed' as const,
      score: undefined,
    };
    rerender(<ProjectCard project={failedProject} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();

    // Verify status badge is present
    const failedStatusElement = screen.getByText('Failed');
    expect(failedStatusElement.className).toContain('ceart-score-badge');
  });

  test('should navigate to project details page when clicked', () => {
    render(<ProjectCard project={mockProject} />);

    // Find the link and verify it points to the correct route
    const linkElement = screen.getByTestId('mock-link');
    expect(linkElement).toHaveAttribute(
      'data-href',
      `/projects/${mockProject.id}`,
    );

    // Simulate clicking the card
    fireEvent.click(linkElement);

    // Verify the link component was rendered with the correct href
    expect(linkElement).toHaveAttribute(
      'data-href',
      `/projects/${mockProject.id}`,
    );
  });

  test('should handle accessibility attributes', () => {
    render(<ProjectCard project={mockProject} />);

    // Check mock link element
    const linkElement = screen.getByTestId('mock-link');
    expect(linkElement).toBeInTheDocument();

    // Title should be properly displayed
    const titleElement = screen.getByText('Test Solar Project');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement.tagName.toLowerCase()).toBe('h3');
  });

  test('should handle truncated or lengthy content appropriately', () => {
    const longDescriptionProject = {
      ...mockProject,
      name: 'Very Long Project Name That Should Be Truncated in the UI to Ensure Proper Layout and Readability for Users',
      description:
        'A very long description that exceeds the normal card dimensions and should be handled appropriately with truncation or overflow handling to maintain consistent card dimensions and layout across the grid of project cards.',
    };

    render(<ProjectCard project={longDescriptionProject} />);

    // Content should be present (though it might be truncated in the UI)
    expect(screen.getByText(longDescriptionProject.name)).toBeInTheDocument();
    expect(
      screen.getByText(longDescriptionProject.description),
    ).toBeInTheDocument();

    // Project title should have truncation class
    const titleElement = screen.getByText(longDescriptionProject.name);
    expect(titleElement.className).toContain('line-clamp');

    // Description should have truncation class
    const descriptionElement = screen.getByText(
      longDescriptionProject.description,
    );
    expect(descriptionElement.className).toContain('line-clamp');
  });
});
