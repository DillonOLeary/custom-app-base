import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUpload } from '@/components/projects/FileUpload';
import * as projectDetailApi from '@/services/projectDetailApi';

// Mock the projectDetailApi
jest.mock('@/services/projectDetailApi', () => ({
  uploadFile: jest.fn(),
}));

describe('FileUpload', () => {
  const mockProjectId = 'test-project-id';
  const mockOnUploadComplete = jest.fn();
  const mockFile = new File(['test file content'], 'test-file.pdf', {
    type: 'application/pdf',
  });
  const mockUploadedFile = {
    id: 'file-id',
    fileName: 'test-file.pdf',
    fileSize: 1000,
    uploadDate: '2023-01-01T00:00:00Z',
    status: 'processing' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (projectDetailApi.uploadFile as jest.Mock).mockResolvedValue(
      mockUploadedFile,
    );
  });

  test('renders the component correctly', () => {
    render(
      <FileUpload
        projectId={mockProjectId}
        onUploadComplete={mockOnUploadComplete}
      />,
    );

    // Check component title
    expect(screen.getByText('UPLOAD PROJECT FILES')).toBeInTheDocument();

    // Check drop area text
    expect(
      screen.getByText(
        'Drag and drop your files here, or click to select files',
      ),
    ).toBeInTheDocument();

    // Check button
    expect(screen.getByTestId('select-files-button')).toBeInTheDocument();
  });

  test('uploads file when selected via button', async () => {
    render(
      <FileUpload
        projectId={mockProjectId}
        onUploadComplete={mockOnUploadComplete}
      />,
    );

    // Get the hidden file input
    const fileInput = screen.getByTestId('file-input');

    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Verify API was called
    await waitFor(() => {
      expect(projectDetailApi.uploadFile).toHaveBeenCalledWith(
        mockProjectId,
        mockFile,
      );
    });

    // Verify callback was called
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(mockUploadedFile);
    });
  });

  test('shows uploading state during file upload', async () => {
    // Mock delay in upload
    (projectDetailApi.uploadFile as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockUploadedFile), 100);
      });
    });

    render(
      <FileUpload
        projectId={mockProjectId}
        onUploadComplete={mockOnUploadComplete}
      />,
    );

    // Get the hidden file input
    const fileInput = screen.getByTestId('file-input');

    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Check for loading state
    expect(screen.getByText('Uploading...')).toBeInTheDocument();

    // Wait for upload to complete
    await waitFor(() => {
      expect(mockOnUploadComplete).toHaveBeenCalledWith(mockUploadedFile);
    });
  });

  test('shows error message on upload failure', async () => {
    // Mock upload error
    const mockError = new Error('Upload failed');
    (projectDetailApi.uploadFile as jest.Mock).mockRejectedValue(mockError);

    render(
      <FileUpload
        projectId={mockProjectId}
        onUploadComplete={mockOnUploadComplete}
      />,
    );

    // Get the hidden file input
    const fileInput = screen.getByTestId('file-input');

    // Trigger file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText('Failed to upload file. Please try again.'),
      ).toBeInTheDocument();
    });

    // Verify callback was not called
    expect(mockOnUploadComplete).not.toHaveBeenCalled();
  });
});
