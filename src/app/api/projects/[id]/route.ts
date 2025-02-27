import { NextRequest, NextResponse } from 'next/server';
import { getMockProjectDetails } from '@/mocks/projectDetails';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Simulate a short delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500));

  const project = getMockProjectDetails(id);
  
  if (!project) {
    return NextResponse.json(
      { error: `Project with ID ${id} not found` },
      { status: 404 }
    );
  }

  return NextResponse.json(project);
}