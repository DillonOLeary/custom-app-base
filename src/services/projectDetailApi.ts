import { AnalysisResult, FileUpload, Project } from '@/types/project';
import { mockProject } from '../../__tests__/support/testUtils';

// Fetch project details
export async function getProjectDetails(projectId: string): Promise<Project> {
  try {
    const response = await fetch(`/api/projects/${projectId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
}

// Fetch project analysis results
export async function getProjectAnalysis(
  projectId: string,
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`/api/projects/${projectId}/analysis`);

    if (!response.ok) {
      throw new Error(`Failed to fetch analysis: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching project analysis:', error);
    throw error;
  }
}

// Fetch project files
export async function getProjectFiles(
  projectId: string,
): Promise<FileUpload[]> {
  try {
    const response = await fetch(`/api/projects/${projectId}/files`);

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching project files:', error);
    throw error;
  }
}

// Upload a file to a project
export async function uploadFile(
  projectId: string,
  file: File,
): Promise<FileUpload> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/projects/${projectId}/files`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status}`);
    }

    const newFile = await response.json();

    // Simulate the file processing and status change
    simulateFileProcessing(projectId, newFile.id);

    return newFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Update file status
export async function updateFileStatus(
  projectId: string,
  fileId: string,
  status: FileUpload['status'],
): Promise<{ id: string; status: string; updatedAt: string }> {
  try {
    const response = await fetch(
      `/api/projects/${projectId}/files/${fileId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update file status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating file status:', error);
    throw error;
  }
}

// Run analysis on all project files
export async function runAnalysis(projectId: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(`/api/projects/${projectId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to run analysis: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error running analysis:', error);
    throw error;
  }
}

// Helper function to simulate file processing
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
