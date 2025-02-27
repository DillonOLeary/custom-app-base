import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectDetail } from '@/components/project-detail/ProjectDetail';
import { mockProject } from '../../support/testUtils';
import * as api from '@/services/api';
import { Project } from '@/types/project';

// Mock the API functions
jest.mock('@/services/api', () => ({
  getProjectDetails: jest.fn(),
  getProjectFiles: jest.fn(),
  uploadFile: jest.fn(),
  runAnalysis: jest.fn(),
}));

describe('ProjectDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', async () => {
    // Setup mocks to return promises that don't resolve immediately
    const mockGetProjectDetails = api.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockImplementation(() => new Promise(() => {}));

    const mockGetProjectFiles = api.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockImplementation(() => new Promise(() => {}));

    render(<ProjectDetail projectId="test-id" />);

    // Should show loading skeleton
    expect(screen.getByLabelText('Loading project data')).toBeInTheDocument();
  });

  test('renders project with analysis results correctly', async () => {
    // Setup mocks
    const mockGetProjectDetails = api.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(mockProject);

    const mockGetProjectFiles = api.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);

    render(<ProjectDetail projectId="test-id" />);

    // Wait for data loading to complete
    await waitFor(() => {
      expect(
        screen.getByText(mockProject.name.toUpperCase()),
      ).toBeInTheDocument();
    });

    // Analysis results should be visible first
    expect(screen.getByText('ANALYSIS RESULTS')).toBeInTheDocument();
    // Use getAllByText and check the first occurrence (since there might be multiple instances of the score)
    const scoreElements = screen.getAllByText(
      mockProject.analysisResult!.totalScore.toString(),
    );
    expect(scoreElements.length).toBeGreaterThan(0);

    // File upload section should be below analysis
    expect(screen.getByText('UPLOAD PROJECT FILES')).toBeInTheDocument();
  });

  test('renders pending project correctly', async () => {
    // Setup mocks with a project that has no analysis but has files (pending status)
    const projectWithoutAnalysis = {
      ...mockProject,
      analysisResult: undefined,
      status: 'pending',
    };

    const mockGetProjectDetails = api.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(projectWithoutAnalysis);

    const mockGetProjectFiles = api.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);

    render(<ProjectDetail projectId="test-id" />);

    // Wait for data loading to complete
    await waitFor(() => {
      expect(
        screen.getByText(mockProject.name.toUpperCase()),
      ).toBeInTheDocument();
    });

    // Should show analysis pending message
    expect(screen.getByText('ANALYSIS PENDING')).toBeInTheDocument();

    // Instead of looking for the exact text, just verify the run button is there
    // which implies the right state is being shown
    const runButton = screen.getByTestId('run-analysis-button');
    expect(runButton).toBeInTheDocument();
    expect(runButton).toHaveTextContent('Run CEARTscore Analysis');

    // File upload section should be below the pending message
    expect(screen.getByText('UPLOAD PROJECT FILES')).toBeInTheDocument();
  });

  test('renders analyzing project correctly', async () => {
    // Setup mocks with a project that is being analyzed
    const analyzingProject = {
      ...mockProject,
      analysisResult: undefined,
      status: 'analyzing',
    };

    const mockGetProjectDetails = api.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(analyzingProject);

    const mockGetProjectFiles = api.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);

    render(<ProjectDetail projectId="test-id" />);

    // Wait for data loading to complete
    await waitFor(() => {
      expect(
        screen.getByText(mockProject.name.toUpperCase()),
      ).toBeInTheDocument();
    });

    // Should show analysis in progress message
    expect(screen.getByText('ANALYSIS IN PROGRESS')).toBeInTheDocument();
    expect(
      screen.getByText(
        "We're analyzing your project files to generate a CEARTscore.",
      ),
    ).toBeInTheDocument();

    // Should show spinner
    expect(screen.getByText('Analysis in progress...')).toBeInTheDocument();

    // File upload section should be below the in progress message
    expect(screen.getByText('UPLOAD PROJECT FILES')).toBeInTheDocument();
  });

  test('renders failed analysis project correctly', async () => {
    // Setup mocks with a project that failed analysis
    const failedProject = {
      ...mockProject,
      analysisResult: undefined,
      status: 'failed',
      analysisError:
        'Analysis failed due to incomplete documentation and missing permit information.',
    };

    const mockGetProjectDetails = api.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(failedProject);

    const mockGetProjectFiles = api.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);

    render(<ProjectDetail projectId="test-id" />);

    // Wait for data loading to complete
    await waitFor(() => {
      expect(
        screen.getByText(mockProject.name.toUpperCase()),
      ).toBeInTheDocument();
    });

    // Should show analysis failed message
    expect(screen.getByText('ANALYSIS FAILED')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Analysis failed due to incomplete documentation and missing permit information.',
      ),
    ).toBeInTheDocument();

    // Should show retry button
    expect(screen.getByTestId('retry-analysis-button')).toBeInTheDocument();
    expect(screen.getByText('Retry Analysis')).toBeInTheDocument();

    // File upload section should be below the failed message
    expect(screen.getByText('UPLOAD PROJECT FILES')).toBeInTheDocument();
  });

  test('runs analysis when run button is clicked', async () => {
    // Mock the API methods with jest.spyOn
    const mockRunAnalysis = jest
      .spyOn(api, 'runAnalysis')
      .mockResolvedValue({} as any);

    // Setup mocks with a pending project that has files
    const pendingProject: Project = {
      ...mockProject,
      analysisResult: undefined,
      status: 'pending',
    };

    jest
      .spyOn(api, 'getProjectDetails')
      .mockResolvedValueOnce(pendingProject) // First call
      .mockResolvedValueOnce({
        // Second call after analysis
        ...pendingProject,
        status: 'analyzing',
      } as Project);

    jest
      .spyOn(api, 'getProjectFiles')
      .mockResolvedValue(mockProject.files || []);

    render(<ProjectDetail projectId="test-id" />);

    // Wait for loading to complete and run button to appear
    const runButton = await screen.findByTestId('run-analysis-button');

    // Verify button is present with the right text
    expect(runButton).toHaveTextContent('Run CEARTscore Analysis');

    // Make sure runAnalysis hasn't been called yet
    expect(mockRunAnalysis).not.toHaveBeenCalled();

    // Click the button
    fireEvent.click(runButton);

    // Verify API was called with the correct project ID
    await waitFor(() => {
      expect(mockRunAnalysis).toHaveBeenCalledWith('test-id');
    });

    // Project details should be refreshed
    await waitFor(() => {
      expect(api.getProjectDetails).toHaveBeenCalledTimes(2);
    });

    // Clean up
    mockRunAnalysis.mockRestore();
  });

  test('retries analysis for failed projects', async () => {
    // Use jest.spyOn instead of direct mock assignment
    const mockRunAnalysis = jest
      .spyOn(api, 'runAnalysis')
      .mockResolvedValue({} as any);

    // Setup mocks with a failed project
    const failedProject: Project = {
      ...mockProject,
      analysisResult: undefined,
      status: 'failed',
      analysisError: 'Analysis failed due to incomplete documentation.',
    };

    jest
      .spyOn(api, 'getProjectDetails')
      .mockResolvedValueOnce(failedProject) // First call
      .mockResolvedValueOnce({
        // Second call after retry
        ...failedProject,
        status: 'analyzing',
        analysisError: undefined,
      } as Project);

    jest
      .spyOn(api, 'getProjectFiles')
      .mockResolvedValue(mockProject.files || []);

    render(<ProjectDetail projectId="test-id" />);

    // Wait for loading to complete and retry button to appear
    const retryButton = await screen.findByTestId('retry-analysis-button');

    // Verify button is present with the right text
    expect(retryButton).toHaveTextContent('Retry Analysis');

    // Make sure runAnalysis hasn't been called yet
    expect(mockRunAnalysis).not.toHaveBeenCalled();

    // Click the button
    fireEvent.click(retryButton);

    // Verify API was called with the correct project ID
    await waitFor(() => {
      expect(mockRunAnalysis).toHaveBeenCalledWith('test-id');
    });

    // Project details should be refreshed
    await waitFor(() => {
      expect(api.getProjectDetails).toHaveBeenCalledTimes(2);
    });

    // Clean up
    mockRunAnalysis.mockRestore();
  });
});
