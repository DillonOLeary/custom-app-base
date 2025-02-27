export interface Project {
  id: string;
  name: string;
  location: string;
  type: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass' | 'other';
  capacity: number; // in MW
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  score?: number; // 0-100 score representing data room quality
}