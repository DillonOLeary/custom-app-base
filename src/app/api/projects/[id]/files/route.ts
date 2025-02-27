import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In a real implementation, this would use actual environment variables
const DROPBOX_API_KEY = process.env.DROPBOX_API_KEY || 'mock-dropbox-api-key';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // For this mock implementation, we'll just pretend to process the file
  // In a real scenario, we would upload to Dropbox using their SDK
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Create a new file upload record
    const fileId = uuidv4();
    const newFile = {
      id: fileId,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      status: 'processing' as const
    };

    // In a real implementation, we would use the Dropbox API here
    console.log(`[Mock] Uploading file to Dropbox for project ${id} using API key ${DROPBOX_API_KEY}`);
    
    // Return the file upload record
    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // In a real implementation, we would fetch the files from a database or Dropbox
  // For now, we'll just return a mock list of files
  const project = (await import('@/mocks/projectDetails')).getMockProjectDetails(id);
  
  if (!project) {
    return NextResponse.json(
      { error: `Project with ID ${id} not found` },
      { status: 404 }
    );
  }
  
  return NextResponse.json(project.files || []);
}