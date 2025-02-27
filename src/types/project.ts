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
  missingFiles?: string[]; // Descriptions of missing files or folders
  relatedFiles?: string[]; // IDs of files that have issues
  recommendedAction?: string; // Suggested action to resolve the issue
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
  path?: string; // File path within the data room structure (e.g., "Site Control/Leases/")
  fileType?: string; // Document type (e.g., "lease", "permit", "design")
  relatedRedFlags?: string[]; // IDs of related red flags
  isHighlighted?: boolean; // Flag for missing or problematic files
  downloadUrl?: string; // URL to download the file
}

export interface Folder {
  id: string;
  name: string;
  path: string; // Full path to this folder, e.g., "Site Control/Leases/"
  files: FileUpload[];
  subfolders: Folder[];
  isExpanded?: boolean; // UI state for folder expansion
  missingRecommendedFiles?: string[]; // List of recommended files that are missing
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass' | 'other';
  capacity: number; // in MW
  status: 'new' | 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  score?: number; // 0-100 score representing data room quality
  analysisResult?: AnalysisResult;
  files?: FileUpload[]; // Flat list of all files
  folders?: Folder[]; // Root folders in the data room
  rootFiles?: FileUpload[]; // Files at the root level (not in any folder)
  description?: string;
  analysisError?: string; // Error message when analysis fails
}
