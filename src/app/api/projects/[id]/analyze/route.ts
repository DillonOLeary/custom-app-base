import { NextRequest, NextResponse } from 'next/server';
import { getMockProjectDetails } from '@/mocks/projectDetails';
import { validateToken } from '@/utils/api-auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Validate the token
  const { response } = await validateToken(request);
  if (response) return response;

  const { id } = params;

  // Simulate a short delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real app, this would actually run analysis on the project files
  // For the mock, we'll simply return a canned analysis result
  const project = getMockProjectDetails(id);

  if (!project) {
    return NextResponse.json(
      { error: `Project with ID ${id} not found` },
      { status: 404 },
    );
  }

  // Use the mock analysis if the project already has it, otherwise generate a simple one
  const analysisResult = project.analysisResult || {
    totalScore: 75,
    lastUpdated: new Date().toISOString(),
    redFlagCount: 3,
    categoryScores: [
      {
        category: 'completeness',
        score: 15,
        maxScore: 20,
        redFlags: [
          {
            id: 'auto-cf1',
            category: 'completeness',
            title: 'Missing permit documentation',
            description:
              'Required permit documentation is incomplete or missing.',
            impact: 'medium',
            pointsDeducted: 5,
          },
        ],
      },
      {
        category: 'financialClaims',
        score: 18,
        maxScore: 20,
        redFlags: [],
      },
      {
        category: 'contractCoverage',
        score: 14,
        maxScore: 20,
        redFlags: [
          {
            id: 'auto-cc1',
            category: 'contractCoverage',
            title: 'Missing interconnection agreement',
            description: 'No formal grid interconnection agreement was found.',
            impact: 'high',
            pointsDeducted: 6,
          },
        ],
      },
      {
        category: 'contractQuality',
        score: 15,
        maxScore: 20,
        redFlags: [
          {
            id: 'auto-cq1',
            category: 'contractQuality',
            title: 'Contract terms anomaly',
            description: 'Unusual terms detected in power purchase agreement.',
            impact: 'medium',
            pointsDeducted: 5,
          },
        ],
      },
      {
        category: 'reputationScreening',
        score: 13,
        maxScore: 20,
        redFlags: [],
      },
    ],
  };

  return NextResponse.json(analysisResult);
}
