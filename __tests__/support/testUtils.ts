import { render, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

// Helper function to render components in tests
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

import { Project, FileUpload, CategoryScore, ScoreCategory } from '@/types/project';

// Mock project data for testing
export const mockProject: Project = {
  id: 'test-id',
  name: 'Test Project',
  location: 'Test Location',
  type: 'solar',
  capacity: 100,
  status: 'completed',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-10T00:00:00Z',
  score: 72,
  analysisResult: {
    totalScore: 72,
    lastUpdated: '2023-01-10T00:00:00Z',
    redFlagCount: 7,
    categoryScores: [
      {
        category: 'completeness' as ScoreCategory,
        score: 12,
        maxScore: 20,
        redFlags: [
          {
            id: 'test-c1',
            category: 'completeness' as ScoreCategory,
            title: 'Missing environmental impact assessment',
            description: 'No evidence of a completed environmental impact assessment was found in the data room.',
            impact: 'high',
            pointsDeducted: 5
          },
          {
            id: 'test-c2',
            category: 'completeness' as ScoreCategory,
            title: 'Incomplete land survey documentation',
            description: 'Land survey documentation is present but missing key boundary definitions and easement details.',
            impact: 'medium',
            pointsDeducted: 3
          }
        ]
      },
      {
        category: 'financialClaims' as ScoreCategory,
        score: 15,
        maxScore: 20,
        redFlags: [
          {
            id: 'test-f1',
            category: 'financialClaims' as ScoreCategory,
            title: 'Unrealistic revenue projections',
            description: 'Revenue projections exceed industry benchmarks by more than 25% without sufficient justification.',
            impact: 'high',
            pointsDeducted: 4
          },
          {
            id: 'test-f2',
            category: 'financialClaims' as ScoreCategory,
            title: 'Missing sensitivity analysis',
            description: 'Financial models lack proper sensitivity analysis for key variables like resource availability and price fluctuations.',
            impact: 'medium',
            pointsDeducted: 1
          }
        ]
      },
      {
        category: 'contractCoverage' as ScoreCategory,
        score: 15,
        maxScore: 20,
        redFlags: [
          {
            id: 'test-cc1',
            category: 'contractCoverage' as ScoreCategory,
            title: 'Missing interconnection agreement',
            description: 'No formal grid interconnection agreement was found in the data room.',
            impact: 'high',
            pointsDeducted: 5
          }
        ]
      },
      {
        category: 'contractQuality' as ScoreCategory,
        score: 20,
        maxScore: 20,
        redFlags: []
      },
      {
        category: 'reputationScreening' as ScoreCategory,
        score: 10,
        maxScore: 20,
        redFlags: [
          {
            id: 'test-r1',
            category: 'reputationScreening' as ScoreCategory,
            title: 'EPC contractor past performance issues',
            description: 'Selected EPC contractor has documented history of project delays exceeding 6 months on similar projects.',
            impact: 'high',
            pointsDeducted: 5
          },
          {
            id: 'test-r2',
            category: 'reputationScreening' as ScoreCategory,
            title: 'Developer lacks track record',
            description: 'Project developer has limited track record with projects of this scale and complexity.',
            impact: 'medium',
            pointsDeducted: 5
          }
        ]
      }
    ]
  },
  files: [
    {
      id: 'file-1',
      fileName: 'Financial_Projections_2023.xlsx',
      fileSize: 2450000,
      uploadDate: '2023-01-05T10:30:00Z',
      status: 'completed'
    },
    {
      id: 'file-2',
      fileName: 'Environmental_Impact_Assessment.pdf',
      fileSize: 8750000,
      uploadDate: '2023-01-06T14:45:00Z',
      status: 'completed'
    },
    {
      id: 'file-3',
      fileName: 'Land_Lease_Agreement.pdf',
      fileSize: 4100000,
      uploadDate: '2023-01-07T09:15:00Z',
      status: 'processing'
    }
  ] as FileUpload[]
};