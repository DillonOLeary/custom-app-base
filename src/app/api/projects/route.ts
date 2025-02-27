import { getMockProjects } from '@/services/projectApi';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simulate a short delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return NextResponse.json(getMockProjects());
}

export async function POST(request: NextRequest) {
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