export type ScoreCategory = 
  | 'completeness'
  | 'financialClaims'
  | 'contractCoverage'
  | 'contractQuality'
  | 'reputationScreening';

export interface RedFlag {
  id: string;
  category: ScoreCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  pointsDeducted: number;
}

export interface CategoryScore {
  category: ScoreCategory;
  score: number; // 0-20 score
  maxScore: number; // 20 per category
  redFlags: RedFlag[];
}

export interface AnalysisResult {
  totalScore: number; // 0-100 score
  categoryScores: CategoryScore[];
  lastUpdated: string;
  redFlagCount: number;
}

export interface FileUpload {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

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
  analysisResult?: AnalysisResult;
  files?: FileUpload[];
}