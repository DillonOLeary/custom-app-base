import { AnalysisResult, CategoryScore, FileUpload, Project, RedFlag, ScoreCategory } from '@/types/project';
import { getMockProjects } from '@/services/projectApi';

// Generate a consistent set of red flags for a project
const generateRedFlags = (projectId: string, category: ScoreCategory): RedFlag[] => {
  const redFlagTemplates: Record<ScoreCategory, RedFlag[]> = {
    completeness: [
      {
        id: `${projectId}-c1`,
        category: 'completeness',
        title: 'Missing environmental impact assessment',
        description: 'No evidence of a completed environmental impact assessment was found in the data room.',
        impact: 'high',
        pointsDeducted: 5
      },
      {
        id: `${projectId}-c2`,
        category: 'completeness',
        title: 'Incomplete land survey documentation',
        description: 'Land survey documentation is present but missing key boundary definitions and easement details.',
        impact: 'medium',
        pointsDeducted: 3
      }
    ],
    financialClaims: [
      {
        id: `${projectId}-f1`,
        category: 'financialClaims',
        title: 'Unrealistic revenue projections',
        description: 'Revenue projections exceed industry benchmarks by more than 25% without sufficient justification.',
        impact: 'high',
        pointsDeducted: 4
      },
      {
        id: `${projectId}-f2`,
        category: 'financialClaims',
        title: 'Missing sensitivity analysis',
        description: 'Financial models lack proper sensitivity analysis for key variables like resource availability and price fluctuations.',
        impact: 'medium',
        pointsDeducted: 3
      },
      {
        id: `${projectId}-f3`,
        category: 'financialClaims',
        title: 'Outdated financial statements',
        description: 'Most recent financial statements are more than 18 months old.',
        impact: 'low',
        pointsDeducted: 2
      }
    ],
    contractCoverage: [
      {
        id: `${projectId}-cc1`,
        category: 'contractCoverage',
        title: 'Missing interconnection agreement',
        description: 'No formal grid interconnection agreement was found in the data room.',
        impact: 'high',
        pointsDeducted: 5
      },
      {
        id: `${projectId}-cc2`,
        category: 'contractCoverage',
        title: 'Incomplete O&M contract',
        description: 'Operation & Maintenance contract lacks specific performance guarantees and remediation clauses.',
        impact: 'medium',
        pointsDeducted: 3
      }
    ],
    contractQuality: [
      {
        id: `${projectId}-cq1`,
        category: 'contractQuality',
        title: 'Unclear termination clauses',
        description: 'PPA contains ambiguous termination clauses that could lead to disputes.',
        impact: 'medium',
        pointsDeducted: 3
      },
      {
        id: `${projectId}-cq2`,
        category: 'contractQuality',
        title: 'Missing force majeure details',
        description: 'Force majeure provisions lack specificity about covered events and remediation processes.',
        impact: 'medium',
        pointsDeducted: 3
      },
      {
        id: `${projectId}-cq3`,
        category: 'contractQuality',
        title: 'Weak performance guarantees',
        description: 'Equipment performance guarantees contain significant exclusions that limit warranty coverage.',
        impact: 'high',
        pointsDeducted: 4
      }
    ],
    reputationScreening: [
      {
        id: `${projectId}-r1`,
        category: 'reputationScreening',
        title: 'EPC contractor past performance issues',
        description: 'Selected EPC contractor has documented history of project delays exceeding 6 months on similar projects.',
        impact: 'high',
        pointsDeducted: 5
      },
      {
        id: `${projectId}-r2`,
        category: 'reputationScreening',
        title: 'Developer lacks track record',
        description: 'Project developer has limited track record with projects of this scale and complexity.',
        impact: 'medium',
        pointsDeducted: 3
      }
    ]
  };

  return redFlagTemplates[category];
};

// Generate a score for each category based on red flags
const generateCategoryScore = (projectId: string, category: ScoreCategory): CategoryScore => {
  const redFlags = generateRedFlags(projectId, category);
  const pointsDeducted = redFlags.reduce((sum, flag) => sum + flag.pointsDeducted, 0);
  const maxScore = 20;
  const score = Math.max(0, maxScore - pointsDeducted);

  return {
    category,
    score,
    maxScore,
    redFlags
  };
};

// Generate an analysis result for a project
const generateAnalysisResult = (projectId: string): AnalysisResult => {
  const categories: ScoreCategory[] = [
    'completeness',
    'financialClaims',
    'contractCoverage',
    'contractQuality',
    'reputationScreening'
  ];

  const categoryScores = categories.map(category => 
    generateCategoryScore(projectId, category)
  );

  const totalScore = categoryScores.reduce((sum, cat) => sum + cat.score, 0);
  const redFlagCount = categoryScores.reduce(
    (sum, cat) => sum + cat.redFlags.length, 0
  );

  return {
    totalScore,
    categoryScores,
    lastUpdated: new Date().toISOString(),
    redFlagCount
  };
};

// Generate mock files for a project
const generateMockFiles = (projectId: string): FileUpload[] => {
  return [
    {
      id: `${projectId}-file1`,
      fileName: 'Financial_Projections_2023.xlsx',
      fileSize: 2_450_000,
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: `${projectId}-file2`,
      fileName: 'Environmental_Impact_Assessment.pdf',
      fileSize: 8_750_000,
      uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: `${projectId}-file3`,
      fileName: 'Power_Purchase_Agreement.pdf',
      fileSize: 3_200_000,
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: `${projectId}-file4`,
      fileName: 'Land_Lease_Agreement.pdf',
      fileSize: 4_100_000,
      uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: `${projectId}-file5`,
      fileName: 'Equipment_Specifications.pdf',
      fileSize: 12_300_000,
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];
};

// Extend base projects with detailed analysis data
export const getMockProjectDetails = (projectId: string): Project | undefined => {
  const baseProjects = getMockProjects();
  const project = baseProjects.find(p => p.id === projectId);

  if (!project) {
    return undefined;
  }

  // Only generate analysis results for completed projects
  if (project.status === 'completed') {
    return {
      ...project,
      analysisResult: generateAnalysisResult(project.id),
      files: generateMockFiles(project.id)
    };
  }

  // For projects not yet completed, just add empty files array
  return {
    ...project,
    files: []
  };
};