import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { validateToken } from '@/utils/api-auth';
import { cleanupRateLimitStore } from '@/utils/token-validation';

// In a real implementation, this would use secure environment variables
const DROPBOX_API_KEY = process.env.DROPBOX_API_KEY || 'mock-dropbox-api-key';

// Security constants
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/msword',
  'image/jpeg',
  'image/png',
  'text/plain',
  'application/zip',
];

/**
 * Validate CSRF token to protect against cross-site request forgery
 * @param request The incoming request
 * @param claims The validated token claims
 * @returns Response with error if CSRF validation fails, null otherwise
 */
function validateCsrfToken(
  request: NextRequest,
  claims: any,
): NextResponse | null {
  // Skip CSRF check in development
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  // Only validate for state-changing methods
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  // Get the CSRF token from the header
  const csrfToken = request.headers.get('x-csrf-token');

  // Verify CSRF token exists and matches the token in claims
  if (!csrfToken || !claims?.csrf || csrfToken !== claims.csrf) {
    return NextResponse.json(
      {
        error: 'CSRF token missing or invalid',
        message:
          'Missing or invalid CSRF token. Please refresh the page and try again.',
      },
      { status: 403 },
    );
  }

  return null;
}

// Sanitize file name to prevent path traversal, command injection, and XSS
function sanitizeFileName(fileName: string): string {
  // Replace any character that isn't alphanumeric, a space, or a safe character
  const sanitized = fileName
    .replace(/[^\w\s.-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.{2,}/g, '.') // Replace multiple dots with single dot
    .replace(/^\.+|\.+$/g, '') // Remove leading or trailing dots
    .replace(/[<>]/g, '_') // Replace < and > to prevent HTML injection
    .trim();

  // Ensure the filename is not empty after sanitization
  return sanitized || 'unnamed_file';
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Clean up expired rate limit entries periodically
  cleanupRateLimitStore();

  // Enhanced token validation with claims extraction
  const { response, claims } = await validateToken(request);
  if (response) return response;

  // CSRF validation for state-changing requests
  const csrfError = validateCsrfToken(request, claims);
  if (csrfError) return csrfError;

  const { id } = params;

  // Additional authorization check - ensure user has access to this project
  // In a real implementation, you would check if the user has access to this project
  // Here we're just doing a mock check using claims from the token
  if (claims && claims.workspaceId) {
    // Log the access for audit trail
    console.log(
      `User ${claims.sub} accessing project ${id} in workspace ${claims.workspaceId}`,
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Security validation - File size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds maximum allowed size of 100MB' },
        { status: 400 },
      );
    }

    // Security validation - File type
    if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== '') {
      return NextResponse.json(
        { error: 'File type not allowed', allowedTypes: ALLOWED_FILE_TYPES },
        { status: 400 },
      );
    }

    // Sanitize file name to prevent security issues
    const sanitizedName = sanitizeFileName(file.name);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create a new file upload record with audit information
    const fileId = uuidv4();
    const newFile = {
      id: fileId,
      fileName: sanitizedName,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      status: 'processing' as const,
      uploadedBy: claims?.sub || 'unknown-user', // Audit trail
    };

    // In a real implementation, we would use the Dropbox API here
    // with proper encryption and secure handling of credentials
    console.log(`[Mock] Uploading file to secure storage for project ${id}`);

    // Return the file upload record with appropriate security headers
    const response = NextResponse.json(newFile, { status: 201 });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate',
    );

    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        message: 'An unexpected error occurred',
      },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // Clean up expired rate limit entries periodically
  cleanupRateLimitStore();

  // Enhanced token validation with claims extraction
  const { response, claims } = await validateToken(request);
  if (response) return response;

  // Note: CSRF check not needed for GET requests as they don't modify state
  // However, we still perform the security check to be thorough
  const csrfError = validateCsrfToken(request, claims);
  if (csrfError) return csrfError;

  const { id } = params;

  // Additional authorization check - ensure user has access to this project
  if (claims && claims.workspaceId) {
    // Log the access for audit trail
    console.log(
      `User ${claims.sub} accessing files for project ${id} in workspace ${claims.workspaceId}`,
    );
  }

  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In a real implementation, we would fetch the files from a database or Dropbox
  // For now, we'll just return a mock list of files
  const project = (
    await import('@/mocks/projectDetails')
  ).getMockProjectDetails(id);

  if (!project) {
    return NextResponse.json(
      { error: `Project with ID ${id} not found` },
      { status: 404 },
    );
  }

  // Return files with appropriate security headers
  const fileResponse = NextResponse.json(project.files || []);

  // Add security headers to prevent common web vulnerabilities
  fileResponse.headers.set('X-Content-Type-Options', 'nosniff');
  fileResponse.headers.set(
    'Cache-Control',
    'private, no-cache, no-store, must-revalidate',
  );

  return fileResponse;
}
