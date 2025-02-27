import { Project } from '@/types/project';

// This would be replaced with actual API calls to your FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

export async function getProjects(): Promise<Project[]> {
  try {
    // In a real implementation, this would call your FastAPI backend
    // For now, we'll return mock data
    const response = await fetch(`${API_BASE_URL}/projects`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function searchProjects(query: string): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search projects: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching projects:', error);
    throw error;
  }
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Project> {
  try {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
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
    score: 45,
  },
];