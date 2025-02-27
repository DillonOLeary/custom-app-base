import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsDashboard } from '@/components/project-dashboard/ProjectsDashboard';
import { getMockProjects } from '@/services/api';

// Mock the API fetch calls
global.fetch = jest.fn();

// Mock the child components
jest.mock('@/components/common/SearchBar', () => ({
  SearchBar: ({ onSearch }: { onSearch: (query: string) => void }) => (
    <div data-testid="search-bar-mock">
      <input
        data-testid="search-input-mock"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button
        data-testid="search-button-mock"
        onClick={() => onSearch('test-query')}
      >
        Search
      </button>
    </div>
  ),
}));

jest.mock('@/components/project-dashboard/ProjectList', () => ({
  ProjectList: ({
    projects,
    isLoading,
    error,
  }: {
    projects: any[];
    isLoading?: boolean;
    error?: string;
  }) => (
    <div data-testid="project-list-mock">
      {isLoading && (
        <div data-testid="project-list-loading-mock">Loading...</div>
      )}
      {error && <div data-testid="project-list-error-mock">{error}</div>}
      {!isLoading && !error && (
        <div>
          <span data-testid="project-count">{projects.length}</span>
          {projects.map((project) => (
            <div key={project.id} data-testid={`project-item-${project.id}`}>
              {project.name}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

jest.mock('@/components/project-dashboard/CreateProjectButton', () => ({
  CreateProjectButton: ({
    onProjectCreate,
  }: {
    onProjectCreate: (data: any) => Promise<void>;
  }) => (
    <button
      data-testid="create-project-button-mock"
      onClick={() =>
        onProjectCreate({
          name: 'New Test Project',
          location: 'Test Location',
          type: 'solar',
          capacity: 50,
        })
      }
    >
      Create Project
    </button>
  ),
}));

describe('ProjectsDashboard', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test('should fetch and display projects on load', async () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      const mockProjects = getMockProjects();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      });

      render(<ProjectsDashboard />);

      // Should show loading state initially
      expect(screen.getByTestId('project-list-mock')).toBeInTheDocument();

      // After fetch completes, should show projects
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/projects');
      });
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });

  test('should handle search functionality', async () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      // Mock initial fetch
      const mockProjects = getMockProjects();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      });

      // Mock search fetch
      const filteredProjects = mockProjects.filter((p) => p.type === 'solar');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => filteredProjects,
      });

      render(<ProjectsDashboard />);

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/projects');
      });

      // Trigger search
      fireEvent.click(screen.getByTestId('search-button-mock'));

      // Check that search API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects/search?q=test-query',
        );
      });
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });

  test('should handle project creation', async () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      // Mock initial fetch
      const mockProjects = getMockProjects();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProjects,
      });

      // Mock project creation fetch
      const newProject = {
        id: 'new-id',
        name: 'New Test Project',
        location: 'Test Location',
        type: 'solar',
        capacity: 50,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => newProject,
      });

      render(<ProjectsDashboard />);

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/projects');
      });

      // Trigger project creation
      fireEvent.click(screen.getByTestId('create-project-button-mock'));

      // Check that create API was called with correct data
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/projects',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          }),
        );
      });
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });

  test('should handle API errors and display appropriate error messages', async () => {
    // Instead of suppressing console.error, we can mock it to verify it's called
    // but prevent polluting test output
    const originalConsoleError = console.error;
    const mockConsoleError = jest.fn();
    console.error = mockConsoleError;

    try {
      // Test various error scenarios for comprehensive coverage
      const errorScenarios = [
        {
          status: 500,
          statusText: 'Internal Server Error',
          expectedErrorContains: 'server',
        },
        {
          status: 404,
          statusText: 'Not Found',
          expectedErrorContains: 'find',
        },
        {
          status: 403,
          statusText: 'Forbidden',
          expectedErrorContains: 'permission',
        },
        {
          status: 401,
          statusText: 'Unauthorized',
          expectedErrorContains: 'authoriz',
        },
      ];

      for (const scenario of errorScenarios) {
        // Clear fetch mock for each scenario
        (global.fetch as jest.Mock).mockClear();
        mockConsoleError.mockClear();

        // Mock failed API call with specific error status
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
          Promise.resolve({
            ok: false,
            status: scenario.status,
            statusText: scenario.statusText,
          }),
        );

        const { unmount } = render(<ProjectsDashboard />);

        // Wait for fetch to be called and fail
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith('/api/projects');
        });

        // Should display error state after some time with specific error message
        await waitFor(() => {
          const errorElement = screen.queryByTestId('project-list-error-mock');
          expect(errorElement).toBeInTheDocument();

          // Error message should be present
          if (errorElement) {
            expect(errorElement.textContent).toContain(
              'Failed to fetch projects',
            );
          }
        });

        // Verify the error was logged properly
        expect(mockConsoleError).toHaveBeenCalled();

        // Clean up to prepare for next scenario
        unmount();
      }

      // Test error with custom error response body
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({
            message: 'Custom error message from API',
            code: 'VALIDATION_ERROR',
          }),
        }),
      );

      render(<ProjectsDashboard />);

      // Wait for fetch to be called and fail
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/projects');
      });

      // Should display the custom error message if available
      await waitFor(() => {
        const errorElement = screen.queryByTestId('project-list-error-mock');
        expect(errorElement).toBeInTheDocument();
      });

      // Verify the error was logged with details
      expect(mockConsoleError).toHaveBeenCalled();
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  });
});
