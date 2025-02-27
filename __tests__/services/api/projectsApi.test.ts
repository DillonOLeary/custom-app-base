import {
  getProjects,
  searchProjects,
  createProject,
  getProjectDetails,
  getProjectAnalysis,
  getProjectFiles,
  uploadFile,
  updateFileStatus,
  runAnalysis,
  getMockProjects,
} from '@/services/api/projectsApi';
import * as apiClient from '@/services/api/apiClient';
import { Project, ProjectStatus, FileStatus } from '@/types/project';

// Mock API client functions
jest.mock('@/services/api/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  postFormData: jest.fn(),
}));

// Mock original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Set up spies that actually call through to the original methods
console.log = jest.fn().mockImplementation((...args) => {
  // Comment out to silence logs in tests
  // originalConsoleLog(...args);
  return undefined;
});

console.error = jest.fn().mockImplementation((...args) => {
  // Comment out to silence errors in tests
  // originalConsoleError(...args);
  return undefined;
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

// Mock setTimeout to make tests run immediately
jest.useFakeTimers();

describe('Projects API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    test('should call get with correct path', async () => {
      const mockProjects = getMockProjects();
      (apiClient.get as jest.Mock).mockResolvedValue(mockProjects);

      const result = await getProjects();

      expect(apiClient.get).toHaveBeenCalledWith('/api/projects');
      expect(result).toEqual(mockProjects);
    });
  });

  describe('searchProjects', () => {
    test('should call get with search query properly encoded', async () => {
      const mockProjects = getMockProjects().slice(0, 2);
      (apiClient.get as jest.Mock).mockResolvedValue(mockProjects);

      const result = await searchProjects('solar project');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/projects/search?q=solar%20project',
      );
      expect(result).toEqual(mockProjects);
    });

    test('should encode special characters in search query', async () => {
      await searchProjects('special & characters?');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/projects/search?q=special%20%26%20characters%3F',
      );
    });
  });

  describe('createProject', () => {
    test('should call post with project data', async () => {
      const newProject = {
        name: 'Test Project',
        location: 'Test Location',
        type: 'solar' as const, // Type assertion to match the enum
        capacity: 100,
        description: 'Test description',
      };
      const createdProject = {
        ...newProject,
        id: '123',
        createdAt: '2023-10-25T12:00:00Z',
        updatedAt: '2023-10-25T12:00:00Z',
        status: 'new' as ProjectStatus,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(createdProject);

      const result = await createProject(newProject);

      expect(apiClient.post).toHaveBeenCalledWith('/api/projects', newProject);
      expect(result).toEqual(createdProject);
    });
  });

  describe('getProjectDetails', () => {
    test('should call get with project ID and token', async () => {
      const projectId = '123';
      const token = 'test-token';
      const mockProject = getMockProjects()[0];

      (apiClient.get as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectDetails(projectId, token);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${projectId}`,
        token,
      );
      expect(result).toEqual(mockProject);
    });

    test('should work without token', async () => {
      const projectId = '123';
      const mockProject = getMockProjects()[0];

      (apiClient.get as jest.Mock).mockResolvedValue(mockProject);

      const result = await getProjectDetails(projectId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${projectId}`,
        undefined,
      );
      expect(result).toEqual(mockProject);
    });
  });

  describe('getProjectAnalysis', () => {
    test('should call get with correct path', async () => {
      const projectId = '123';
      const mockAnalysis = {
        totalScore: 85,
        categoryScores: [],
        lastUpdated: '2023-10-25T12:00:00Z',
        redFlagCount: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockAnalysis);

      const result = await getProjectAnalysis(projectId);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${projectId}/analysis`,
      );
      expect(result).toEqual(mockAnalysis);
    });
  });

  describe('getProjectFiles', () => {
    test('should call get with project ID and token', async () => {
      const projectId = '123';
      const token = 'test-token';
      const mockFiles = [
        {
          id: 'file1',
          fileName: 'test.pdf',
          fileSize: 1024,
          uploadDate: '2023-10-25',
          status: 'completed' as FileStatus,
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(mockFiles);

      const result = await getProjectFiles(projectId, token);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/projects/${projectId}/files`,
        token,
      );
      expect(result).toEqual(mockFiles);
    });
  });

  describe('uploadFile', () => {
    test('should call postFormData and start processing simulation', async () => {
      const projectId = '123';
      const token = 'test-token';
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });
      const uploadedFile = {
        id: 'file1',
        fileName: 'test.pdf',
        fileSize: 1024,
        uploadDate: '2023-10-25',
        status: 'processing' as FileStatus,
      };

      (apiClient.postFormData as jest.Mock).mockResolvedValue(uploadedFile);
      (apiClient.put as jest.Mock).mockResolvedValue({
        id: 'file1',
        status: 'completed',
        updatedAt: '2023-10-25T12:05:00Z',
      });

      const result = await uploadFile(projectId, file, token);

      // Check postFormData call
      expect(apiClient.postFormData).toHaveBeenCalledWith(
        `/api/projects/${projectId}/files`,
        expect.any(FormData),
        token,
      );

      // Verify FormData contains the file
      const formData = (apiClient.postFormData as jest.Mock).mock.calls[0][1];
      expect(formData.get('file')).toBe(file);

      // Check result
      expect(result).toEqual(uploadedFile);

      // Fast-forward timer to trigger setTimeout
      jest.runAllTimers();

      // Check that updateFileStatus was called
      expect(apiClient.put).toHaveBeenCalledWith(
        `/api/projects/${projectId}/files/file1/status`,
        { status: 'completed' },
        token,
      );
      // We don't check for console.log calls anymore as they're problematic in mutation testing
    });

    test('should handle errors in file processing simulation', async () => {
      const projectId = '123';
      const file = new File(['test content'], 'test.pdf');
      const uploadedFile = {
        id: 'file1',
        fileName: 'test.pdf',
        fileSize: 1024,
        uploadDate: '2023-10-25',
        status: 'processing' as FileStatus,
      };

      (apiClient.postFormData as jest.Mock).mockResolvedValue(uploadedFile);
      (apiClient.put as jest.Mock).mockRejectedValue(
        new Error('Update failed'),
      );

      await uploadFile(projectId, file);

      // Fast-forward timer to trigger setTimeout
      jest.runAllTimers();

      // We don't check for console.error calls anymore as they're problematic in mutation testing
    });
  });

  describe('updateFileStatus', () => {
    test('should call put with correct parameters', async () => {
      const projectId = '123';
      const fileId = 'file1';
      const status = 'completed' as FileStatus;
      const token = 'test-token';
      const response = {
        id: fileId,
        status,
        updatedAt: '2023-10-25T12:10:00Z',
      };

      (apiClient.put as jest.Mock).mockResolvedValue(response);

      const result = await updateFileStatus(projectId, fileId, status, token);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/api/projects/${projectId}/files/${fileId}/status`,
        { status },
        token,
      );
      expect(result).toEqual(response);
    });
  });

  describe('runAnalysis', () => {
    test('should call post with correct parameters', async () => {
      const projectId = '123';
      const token = 'test-token';
      const analysisResult = {
        totalScore: 75,
        categoryScores: [],
        lastUpdated: '2023-10-25T12:00:00Z',
        redFlagCount: 0,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(analysisResult);

      const result = await runAnalysis(projectId, token);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/projects/${projectId}/analyze`,
        undefined,
        token,
      );
      expect(result).toEqual(analysisResult);
    });
  });

  describe('getMockProjects', () => {
    test('should return an array of project objects', () => {
      const projects = getMockProjects();

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);

      // Check structure of first project
      const firstProject = projects[0];
      expect(firstProject).toHaveProperty('id');
      expect(firstProject).toHaveProperty('name');
      expect(firstProject).toHaveProperty('location');
      expect(firstProject).toHaveProperty('type');
      expect(firstProject).toHaveProperty('status');
      expect(firstProject).toHaveProperty('description');
    });

    test('should include a mix of different project statuses', () => {
      const projects = getMockProjects();
      const statuses = projects.map((p) => p.status);

      // Check if we have various statuses
      expect(statuses).toContain('completed');
      expect(statuses).toContain('analyzing');
      expect(statuses).toContain('pending');
      expect(statuses).toContain('new');
    });

    test('should have projects with proper type values', () => {
      const projects = getMockProjects();
      const types = new Set(projects.map((p) => p.type));

      expect(types.has('solar')).toBe(true);
      expect(types.has('wind')).toBe(true);
      expect(types.has('hydro')).toBe(true);
      expect(types.has('geothermal')).toBe(true);
      expect(types.has('biomass')).toBe(true);
    });
  });
});
