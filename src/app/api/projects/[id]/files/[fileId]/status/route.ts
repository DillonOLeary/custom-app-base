import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, fileId: string } }
) {
  const { id, fileId } = params;
  
  try {
    const body = await request.json();
    const { status } = body;
    
    if (!status || !['uploaded', 'processing', 'completed', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status provided' },
        { status: 400 }
      );
    }
    
    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // In a real implementation, we would update the file status in the database
    return NextResponse.json({
      id: fileId,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating file status:', error);
    return NextResponse.json(
      { error: 'Failed to update file status' },
      { status: 500 }
    );
  }
}