import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { mockProject } from '../../support/testUtils';
import * as projectDetailApi from '@/services/projectDetailApi';

// Mock the API functions
jest.mock('@/services/projectDetailApi', () => ({
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
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockImplementation(() => new Promise(() => {}));
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockImplementation(() => new Promise(() => {}));
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Should show loading skeleton
    expect(screen.getByLabelText('Loading project data')).toBeInTheDocument();
  });

  test('renders project with analysis results correctly', async () => {
    // Setup mocks
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(mockProject);
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(mockProject.name.toUpperCase())).toBeInTheDocument();
    });
    
    // Analysis results should be visible first
    expect(screen.getByText('ANALYSIS RESULTS')).toBeInTheDocument();
    // Use getAllByText and check the first occurrence (since there might be multiple instances of the score)
    const scoreElements = screen.getAllByText(mockProject.analysisResult!.totalScore.toString());
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
    
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(projectWithoutAnalysis);
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(mockProject.name.toUpperCase())).toBeInTheDocument();
    });
    
    // Should show analysis pending message
    expect(screen.getByText('ANALYSIS PENDING')).toBeInTheDocument();
    expect(screen.getByText('Your files are ready for analysis. Run CEARTscore analysis to evaluate your project.')).toBeInTheDocument();
    
    // Should show run analysis button
    expect(screen.getByTestId('run-analysis-button')).toBeInTheDocument();
    
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
    
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(analyzingProject);
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(mockProject.name.toUpperCase())).toBeInTheDocument();
    });
    
    // Should show analysis in progress message
    expect(screen.getByText('ANALYSIS IN PROGRESS')).toBeInTheDocument();
    expect(screen.getByText("We're analyzing your project files to generate a CEARTscore.")).toBeInTheDocument();
    
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
      analysisError: 'Analysis failed due to incomplete documentation and missing permit information.'
    };
    
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(failedProject);
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(mockProject.name.toUpperCase())).toBeInTheDocument();
    });
    
    // Should show analysis failed message
    expect(screen.getByText('ANALYSIS FAILED')).toBeInTheDocument();
    expect(screen.getByText('Analysis failed due to incomplete documentation and missing permit information.')).toBeInTheDocument();
    
    // Should show retry button
    expect(screen.getByTestId('retry-analysis-button')).toBeInTheDocument();
    expect(screen.getByText('Retry Analysis')).toBeInTheDocument();
    
    // File upload section should be below the failed message
    expect(screen.getByText('UPLOAD PROJECT FILES')).toBeInTheDocument();
  });

  test('runs analysis when button is clicked', async () => {
    // Setup mocks with a pending project that has files but no analysis
    const pendingProject = {
      ...mockProject,
      analysisResult: undefined,
      status: 'pending',
    };
    
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(pendingProject);
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);
    
    const mockRunAnalysis = projectDetailApi.runAnalysis as jest.Mock;
    mockRunAnalysis.mockResolvedValue(mockProject.analysisResult);
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(mockProject.name.toUpperCase())).toBeInTheDocument();
    });
    
    // Click the run analysis button
    const runButton = screen.getByTestId('run-analysis-button');
    fireEvent.click(runButton);
    
    // Should call runAnalysis API
    expect(mockRunAnalysis).toHaveBeenCalledWith('test-id');
    
    // Should call getProjectDetails again to refresh data
    await waitFor(() => {
      expect(mockGetProjectDetails).toHaveBeenCalledTimes(2);
    });
  });
  
  test('retries analysis for failed projects', async () => {
    // Setup mocks with a failed project
    const failedProject = {
      ...mockProject,
      analysisResult: undefined,
      status: 'failed',
      analysisError: 'Analysis failed due to incomplete documentation.'
    };
    
    const mockGetProjectDetails = projectDetailApi.getProjectDetails as jest.Mock;
    mockGetProjectDetails.mockResolvedValue(failedProject);
    
    const mockGetProjectFiles = projectDetailApi.getProjectFiles as jest.Mock;
    mockGetProjectFiles.mockResolvedValue(mockProject.files);
    
    const mockRunAnalysis = projectDetailApi.runAnalysis as jest.Mock;
    mockRunAnalysis.mockResolvedValue(mockProject.analysisResult);
    
    render(<ProjectDetail projectId="test-id" />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(mockProject.name.toUpperCase())).toBeInTheDocument();
    });
    
    // Click the retry analysis button
    const retryButton = screen.getByTestId('retry-analysis-button');
    fireEvent.click(retryButton);
    
    // Should call runAnalysis API
    expect(mockRunAnalysis).toHaveBeenCalledWith('test-id');
    
    // Should call getProjectDetails again to refresh data
    await waitFor(() => {
      expect(mockGetProjectDetails).toHaveBeenCalledTimes(2);
    });
  });
});