import {
  AnalysisResult,
  CategoryScore,
  FileUpload,
  Project,
  RedFlag,
  ScoreCategory,
} from '@/types/project';
import { getMockProjects } from '@/services/api';

// Generate a consistent set of red flags for a project
const generateRedFlags = (
  projectId: string,
  category: ScoreCategory,
): RedFlag[] => {
  const redFlagTemplates: Record<ScoreCategory, RedFlag[]> = {
    completeness: [
      {
        id: `${projectId}-c1`,
        category: 'completeness',
        title: 'Missing environmental impact assessment',
        description:
          'No evidence of a completed environmental impact assessment was found in the data room.',
        impact: 'high',
        pointsDeducted: 5,
      },
      {
        id: `${projectId}-c2`,
        category: 'completeness',
        title: 'Incomplete land survey documentation',
        description:
          'Land survey documentation is present but missing key boundary definitions and easement details.',
        impact: 'medium',
        pointsDeducted: 3,
      },
    ],
    financialClaims: [
      {
        id: `${projectId}-f1`,
        category: 'financialClaims',
        title: 'Unrealistic revenue projections',
        description:
          'Revenue projections exceed industry benchmarks by more than 25% without sufficient justification.',
        impact: 'high',
        pointsDeducted: 4,
      },
      {
        id: `${projectId}-f2`,
        category: 'financialClaims',
        title: 'Missing sensitivity analysis',
        description:
          'Financial models lack proper sensitivity analysis for key variables like resource availability and price fluctuations.',
        impact: 'medium',
        pointsDeducted: 3,
      },
      {
        id: `${projectId}-f3`,
        category: 'financialClaims',
        title: 'Outdated financial statements',
        description:
          'Most recent financial statements are more than 18 months old.',
        impact: 'low',
        pointsDeducted: 2,
      },
    ],
    contractCoverage: [
      {
        id: `${projectId}-cc1`,
        category: 'contractCoverage',
        title: 'Missing interconnection agreement',
        description:
          'No formal grid interconnection agreement was found in the data room.',
        impact: 'high',
        pointsDeducted: 5,
      },
      {
        id: `${projectId}-cc2`,
        category: 'contractCoverage',
        title: 'Incomplete O&M contract',
        description:
          'Operation & Maintenance contract lacks specific performance guarantees and remediation clauses.',
        impact: 'medium',
        pointsDeducted: 3,
      },
    ],
    contractQuality: [
      {
        id: `${projectId}-cq1`,
        category: 'contractQuality',
        title: 'Unclear termination clauses',
        description:
          'PPA contains ambiguous termination clauses that could lead to disputes.',
        impact: 'medium',
        pointsDeducted: 3,
      },
      {
        id: `${projectId}-cq2`,
        category: 'contractQuality',
        title: 'Missing force majeure details',
        description:
          'Force majeure provisions lack specificity about covered events and remediation processes.',
        impact: 'medium',
        pointsDeducted: 3,
      },
      {
        id: `${projectId}-cq3`,
        category: 'contractQuality',
        title: 'Weak performance guarantees',
        description:
          'Equipment performance guarantees contain significant exclusions that limit warranty coverage.',
        impact: 'high',
        pointsDeducted: 4,
      },
    ],
    reputationScreening: [
      {
        id: `${projectId}-r1`,
        category: 'reputationScreening',
        title: 'EPC contractor past performance issues',
        description:
          'Selected EPC contractor has documented history of project delays exceeding 6 months on similar projects.',
        impact: 'high',
        pointsDeducted: 5,
      },
      {
        id: `${projectId}-r2`,
        category: 'reputationScreening',
        title: 'Developer lacks track record',
        description:
          'Project developer has limited track record with projects of this scale and complexity.',
        impact: 'medium',
        pointsDeducted: 3,
      },
    ],
  };

  return redFlagTemplates[category];
};

// Generate a score for each category based on red flags
const generateCategoryScore = (
  projectId: string,
  category: ScoreCategory,
): CategoryScore => {
  const redFlags = generateRedFlags(projectId, category);
  const pointsDeducted = redFlags.reduce(
    (sum, flag) => sum + flag.pointsDeducted,
    0,
  );
  const maxScore = 20;
  const score = Math.max(0, maxScore - pointsDeducted);

  return {
    category,
    score,
    maxScore,
    redFlags,
  };
};

// Generate an analysis result for a project
const generateAnalysisResult = (projectId: string): AnalysisResult => {
  const categories: ScoreCategory[] = [
    'completeness',
    'financialClaims',
    'contractCoverage',
    'contractQuality',
    'reputationScreening',
  ];

  const categoryScores = categories.map((category) =>
    generateCategoryScore(projectId, category),
  );

  const totalScore = categoryScores.reduce((sum, cat) => sum + cat.score, 0);
  const redFlagCount = categoryScores.reduce(
    (sum, cat) => sum + cat.redFlags.length,
    0,
  );

  return {
    totalScore,
    categoryScores,
    lastUpdated: new Date().toISOString(),
    redFlagCount,
  };
};

// Generate mock files for a project with folder structure
const generateMockFiles = (projectId: string): FileUpload[] => {
  return [
    // Financial folder
    {
      id: `${projectId}-file1`,
      fileName: 'Financial_Projections_2023.xlsx',
      fileSize: 2_450_000,
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      path: 'Financial/Models',
      fileType: 'financial',
      downloadUrl: `${projectId}/files/financial-projections`,
    },
    {
      id: `${projectId}-file2`,
      fileName: 'Tax_Equity_Model.xlsx',
      fileSize: 1_850_000,
      uploadDate: new Date(
        Date.now() - 6.5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'completed',
      path: 'Financial/Tax Equity',
      fileType: 'financial',
      downloadUrl: `${projectId}/files/tax-equity`,
    },

    // Environmental folder
    {
      id: `${projectId}-file3`,
      fileName: 'Environmental_Impact_Assessment.pdf',
      fileSize: 8_750_000,
      uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      path: 'Environmental/Reports',
      fileType: 'environmental',
      isHighlighted: true, // Example of highlighted file with issues
      downloadUrl: `${projectId}/files/environmental-assessment`,
    },
    {
      id: `${projectId}-file4`,
      fileName: 'Wetlands_Delineation.pdf',
      fileSize: 5_100_000,
      uploadDate: new Date(
        Date.now() - 5.5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'completed',
      path: 'Environmental/Wetlands',
      fileType: 'environmental',
      downloadUrl: `${projectId}/files/wetlands`,
    },

    // Site Control folder
    {
      id: `${projectId}-file5`,
      fileName: 'Land_Lease_Agreement.pdf',
      fileSize: 4_100_000,
      uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      path: 'Site Control/Leases',
      fileType: 'legal',
      downloadUrl: `${projectId}/files/lease`,
    },
    {
      id: `${projectId}-file6`,
      fileName: 'Title_Report.pdf',
      fileSize: 3_200_000,
      uploadDate: new Date(
        Date.now() - 3.5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'completed',
      path: 'Site Control/Title',
      fileType: 'legal',
      downloadUrl: `${projectId}/files/title`,
    },

    // Design folder
    {
      id: `${projectId}-file7`,
      fileName: 'PVSyst_Report.pdf',
      fileSize: 7_600_000,
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      path: 'Design/PVSyst',
      fileType: 'design',
      downloadUrl: `${projectId}/files/pvsyst`,
    },
    {
      id: `${projectId}-file8`,
      fileName: 'Site_Layout.dwg',
      fileSize: 9_800_000,
      uploadDate: new Date(
        Date.now() - 4.5 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'completed',
      path: 'Design/Layout',
      fileType: 'design',
      downloadUrl: `${projectId}/files/layout`,
    },
    {
      id: `${projectId}-file9`,
      fileName: 'Equipment_Specifications.pdf',
      fileSize: 12_300_000,
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      path: 'Design/Equipment',
      fileType: 'design',
      downloadUrl: `${projectId}/files/equipment`,
    },

    // Interconnection folder
    {
      id: `${projectId}-file10`,
      fileName: 'Interconnection_Agreement.pdf',
      fileSize: 3_500_000,
      uploadDate: new Date(
        Date.now() - 4.7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'completed',
      path: 'Interconnection/Agreements',
      fileType: 'interconnection',
      downloadUrl: `${projectId}/files/interconnection`,
    },

    // File with no path (root level)
    {
      id: `${projectId}-file11`,
      fileName: 'Power_Purchase_Agreement.pdf',
      fileSize: 3_200_000,
      uploadDate: new Date(
        Date.now() - 5.2 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      status: 'completed',
      fileType: 'legal',
      downloadUrl: `${projectId}/files/ppa`,
    },

    // File that's still processing
    {
      id: `${projectId}-file12`,
      fileName: 'Geotechnical_Report.pdf',
      fileSize: 14_500_000,
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'processing',
      path: 'Reports/Geotechnical',
      fileType: 'report',
    },
  ];
};

// Extend base projects with detailed analysis data
// Update red flags to include missing files and related files
const enhanceRedFlagsWithFileInfo = (
  redFlags: RedFlag[],
  projectId: string,
): RedFlag[] => {
  return redFlags.map((flag) => {
    switch (flag.id) {
      case `${projectId}-c1`:
        // Missing environmental assessment
        return {
          ...flag,
          missingFiles: ['Environmental/Permits/Air Quality Permit.pdf'],
          recommendedAction:
            'Complete and upload environmental impact assessment with air quality permit',
        };
      case `${projectId}-c2`:
        // Incomplete land survey documentation
        return {
          ...flag,
          relatedFiles: [`${projectId}-file5`], // Land Lease Agreement has issues
          recommendedAction:
            'Update land survey with complete boundary definitions',
        };
      case `${projectId}-f1`:
        // Unrealistic revenue projections
        return {
          ...flag,
          relatedFiles: [`${projectId}-file1`], // Financial projections file has issues
          recommendedAction:
            'Revise financial model with more conservative assumptions',
        };
      case `${projectId}-cc1`:
        // Missing interconnection agreement
        return {
          ...flag,
          missingFiles: ['Interconnection/Studies/Feasibility Study.pdf'],
          recommendedAction:
            'Obtain and upload the grid interconnection feasibility study',
        };
      default:
        return flag;
    }
  });
};

export const getMockProjectDetails = (
  projectId: string,
): Project | undefined => {
  const baseProjects = getMockProjects();
  const project = baseProjects.find((p) => p.id === projectId);

  if (!project) {
    return undefined;
  }

  // Based on project status, return appropriate data
  switch (project.status) {
    case 'completed': {
      // Completed projects have full analysis and files
      const files = generateMockFiles(project.id);
      const analysisResult = generateAnalysisResult(project.id);

      // Enhance red flags with file information
      analysisResult.categoryScores.forEach((category) => {
        category.redFlags = enhanceRedFlagsWithFileInfo(
          category.redFlags,
          project.id,
        );
      });

      // Import file utils
      const { processFilesForProject } = require('../utils/fileUtils');

      // Process files to get folder structure
      const { folders, rootFiles } = processFilesForProject(
        files,
        analysisResult.categoryScores.flatMap((cat) => cat.redFlags),
      );

      // Make sure the project's score matches the analysisResult's totalScore
      return {
        ...project,
        score: analysisResult.totalScore, // Ensure consistency
        analysisResult,
        files,
        folders,
        rootFiles,
      };
    }

    case 'analyzing': {
      // Analyzing projects have files but analysis is in progress
      const files = generateMockFiles(project.id);

      // Import file utils
      const { processFilesForProject } = require('../utils/fileUtils');

      // Process files to get folder structure without red flags
      const { folders, rootFiles } = processFilesForProject(files);

      return {
        ...project,
        files,
        folders,
        rootFiles,
      };
    }

    case 'pending': {
      // Pending projects have files uploaded but no analysis started yet
      const files = generateMockFiles(project.id);

      // Import file utils
      const { processFilesForProject } = require('../utils/fileUtils');

      // Process files to get folder structure without red flags
      const { folders, rootFiles } = processFilesForProject(files);

      return {
        ...project,
        files,
        folders,
        rootFiles,
      };
    }

    case 'failed': {
      // Failed projects have files but analysis failed
      const files = generateMockFiles(project.id);

      // Import file utils
      const { processFilesForProject } = require('../utils/fileUtils');

      // Process files to get folder structure without red flags
      const { folders, rootFiles } = processFilesForProject(files);

      return {
        ...project,
        files,
        folders,
        rootFiles,
        analysisError:
          'Analysis failed due to incomplete financial documentation and missing permit information',
      };
    }

    default: {
      // New projects with no uploads yet
      return {
        ...project,
        files: [],
      };
    }
  }
};
