import { Project, AnalysisResult, FileUpload } from '@/types/project';
import { get, post, put, postFormData } from './apiClient';

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  return await get<Project[]>('/api/projects');
}

/**
 * Search projects
 */
export async function searchProjects(query: string): Promise<Project[]> {
  return await get<Project[]>(
    `/api/projects/search?q=${encodeURIComponent(query)}`,
  );
}

/**
 * Create a new project
 */
export async function createProject(
  project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
): Promise<Project> {
  return await post<Project>('/api/projects', project);
}

/**
 * Get project details by ID
 */
export async function getProjectDetails(projectId: string): Promise<Project> {
  return await get<Project>(`/api/projects/${projectId}`);
}

/**
 * Get project analysis
 */
export async function getProjectAnalysis(
  projectId: string,
): Promise<AnalysisResult> {
  return await get<AnalysisResult>(`/api/projects/${projectId}/analysis`);
}

/**
 * Get project files
 */
export async function getProjectFiles(
  projectId: string,
): Promise<FileUpload[]> {
  return await get<FileUpload[]>(`/api/projects/${projectId}/files`);
}

/**
 * Upload a file
 */
export async function uploadFile(
  projectId: string,
  file: File,
): Promise<FileUpload> {
  const formData = new FormData();
  formData.append('file', file);

  const newFile = await postFormData<FileUpload>(
    `/api/projects/${projectId}/files`,
    formData,
  );

  // Simulate file processing and status change (this would be handled by real backend)
  simulateFileProcessing(projectId, newFile.id);

  return newFile;
}

/**
 * Update file status
 */
export async function updateFileStatus(
  projectId: string,
  fileId: string,
  status: FileUpload['status'],
): Promise<{ id: string; status: string; updatedAt: string }> {
  return await put<{ id: string; status: string; updatedAt: string }>(
    `/api/projects/${projectId}/files/${fileId}/status`,
    { status },
  );
}

/**
 * Run analysis for a project
 */
export async function runAnalysis(projectId: string): Promise<AnalysisResult> {
  return await post<AnalysisResult>(`/api/projects/${projectId}/analyze`);
}

/**
 * Helper function to simulate file processing
 */
function simulateFileProcessing(projectId: string, fileId: string) {
  // Wait 3-5 seconds before changing status to completed
  const processingTime = 3000 + Math.random() * 2000;

  setTimeout(async () => {
    try {
      await updateFileStatus(projectId, fileId, 'completed');
      console.log(`File ${fileId} processing completed`);
    } catch (error) {
      console.error('Error updating file status:', error);
    }
  }, processingTime);
}

// Mock data for development purposes
export const getMockProjects = (): Project[] => [
  {
    id: '1',
    name: 'Desert Sun Solar Farm',
    location: 'Arizona, USA',
    type: 'solar',
    capacity: 150,
    status: 'completed',
    createdAt: '2023-08-15T10:30:00Z',
    updatedAt: '2023-09-02T14:45:00Z',
    score: 87,
    description:
      'A large utility-scale solar project with high CEARTscore and all documentation complete.',
  },
  {
    id: '2',
    name: 'Coastal Winds',
    location: 'Maine, USA',
    type: 'wind',
    capacity: 75,
    status: 'analyzing',
    createdAt: '2023-10-05T08:20:00Z',
    updatedAt: '2023-10-05T08:20:00Z',
    description:
      'Offshore wind farm with analysis currently in progress. Documents uploaded.',
  },
  {
    id: '3',
    name: 'Mountain Stream Hydro',
    location: 'Colorado, USA',
    type: 'hydro',
    capacity: 25,
    status: 'pending',
    createdAt: '2023-10-10T11:15:00Z',
    updatedAt: '2023-10-10T11:15:00Z',
    description:
      'Run-of-river hydro project with documents uploaded awaiting analysis.',
  },
  {
    id: '4',
    name: 'Geothermal Springs Plant',
    location: 'Idaho, USA',
    type: 'geothermal',
    capacity: 40,
    status: 'completed',
    createdAt: '2023-07-22T09:10:00Z',
    updatedAt: '2023-08-30T16:40:00Z',
    score: 92,
    description:
      'Geothermal project with excellent CEARTscore and complete documentation.',
  },
  {
    id: '5',
    name: 'Agricultural Biomass Facility',
    location: 'Iowa, USA',
    type: 'biomass',
    capacity: 30,
    status: 'failed',
    createdAt: '2023-09-18T13:25:00Z',
    updatedAt: '2023-09-25T17:30:00Z',
    description:
      'Biomass project with uploaded documents but analysis failed due to incomplete documentation.',
  },
  {
    id: '6',
    name: 'New Solar Development',
    location: 'Nevada, USA',
    type: 'solar',
    capacity: 55,
    status: 'new',
    createdAt: '2023-10-24T09:00:00Z',
    updatedAt: '2023-10-24T09:00:00Z',
    description: 'New project just created. No documents uploaded yet.',
  },
];
