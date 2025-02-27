import { getMockProjects } from '@/services/api';
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/utils/api-auth';

export async function GET(request: NextRequest) {
  // Validate the token
  const { response } = await validateToken(request);
  if (response) return response;

  // Simulate a short delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json(getMockProjects());
}

export async function POST(request: NextRequest) {
  // Validate the token
  const { response } = await validateToken(request);
  if (response) return response;

  const projectData = await request.json();

  // Simulate a short delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate a fake project response with an ID and timestamps
  const newProject = {
    ...projectData,
    id: Math.random().toString(36).substring(2, 11),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newProject, { status: 201 });
}
