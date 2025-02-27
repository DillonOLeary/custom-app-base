import { getMockProjects } from '@/services/api/projectsApi';
import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/utils/api-auth';

// This prevents this route from being pre-rendered during build time
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Validate the token
  const { response } = await validateToken(request);
  if (response) return response;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';

  // Simulate a short delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Simple search implementation - filter mock projects by name or location
  const projects = getMockProjects();
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.location.toLowerCase().includes(query.toLowerCase()) ||
      project.type.toLowerCase().includes(query.toLowerCase()),
  );

  return NextResponse.json(filteredProjects);
}
