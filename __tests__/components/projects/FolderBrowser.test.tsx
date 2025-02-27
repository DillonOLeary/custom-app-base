import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { FolderBrowser } from '@/components/project-detail/FolderBrowser';
import { Folder, FileUpload, RedFlag } from '@/types/project';

describe('FolderBrowser', () => {
  // Mock data
  const mockRootFiles: FileUpload[] = [
    {
      id: 'file-1',
      fileName: 'root-file.pdf',
      fileSize: 1024 * 1024,
      uploadDate: '2023-01-01T00:00:00Z',
      status: 'completed',
      downloadUrl: 'download-url',
    },
  ];

  const mockFolders: Folder[] = [
    {
      id: 'folder-1',
      name: 'Test Folder',
      path: 'Test Folder',
      files: [
        {
          id: 'file-2',
          fileName: 'test-file.pdf',
          fileSize: 2048 * 1024,
          uploadDate: '2023-01-02T00:00:00Z',
          status: 'completed',
          path: 'Test Folder',
          isHighlighted: true,
          downloadUrl: 'download-url',
        },
      ],
      subfolders: [
        {
          id: 'folder-2',
          name: 'Subfolder',
          path: 'Test Folder/Subfolder',
          files: [
            {
              id: 'file-3',
              fileName: 'nested-file.pdf',
              fileSize: 512 * 1024,
              uploadDate: '2023-01-03T00:00:00Z',
              status: 'completed',
              path: 'Test Folder/Subfolder',
              downloadUrl: 'download-url',
            },
          ],
          subfolders: [],
        },
      ],
    },
  ];

  const mockRedFlags: RedFlag[] = [
    {
      id: 'red-flag-1',
      category: 'completeness',
      title: 'Test issue',
      description: 'This is a test issue',
      impact: 'high',
      pointsDeducted: 5,
      relatedFiles: ['file-2'],
    },
  ];

  const mockDownloadHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state correctly', () => {
    render(<FolderBrowser folders={[]} files={[]} isLoading={false} />);

    expect(screen.getByText('DATA ROOM BROWSER')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No files uploaded yet. Upload files to analyze your project.',
      ),
    ).toBeInTheDocument();
  });

  test('renders loading state correctly', () => {
    render(<FolderBrowser folders={[]} files={[]} isLoading={true} />);

    expect(screen.getByText('DATA ROOM BROWSER')).toBeInTheDocument();
    // Should show loading skeleton
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );
  });

  test('renders folders and files correctly', () => {
    const { container } = render(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Check folders - use testid to avoid ambiguity with folder path text
    const folderElement = screen.getByTestId('folder-Test Folder');
    expect(folderElement).toBeInTheDocument();

    // Root files should be visible
    expect(screen.getByText('root-file.pdf')).toBeInTheDocument();

    // Verify basic folder structure exists
    expect(folderElement).toHaveAttribute('data-testid', 'folder-Test Folder');

    // Find folder name within the folder element to avoid ambiguity
    const folderName = within(folderElement).getByText('Test Folder');
    expect(folderName).toBeInTheDocument();

    // Test passes if we've verified the component renders correctly
  });

  test('maintains expanded state during re-renders', () => {
    const { rerender } = render(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Expand the folder using testid
    fireEvent.click(screen.getByTestId('folder-Test Folder'));

    // Verify folder is expanded
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();

    // Re-render with same props
    rerender(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Folder should still be expanded after re-render
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
  });

  test('preserves expansion state during loading', () => {
    const { rerender } = render(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Expand the folder using testid
    fireEvent.click(screen.getByTestId('folder-Test Folder'));

    // Verify folder is expanded
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();

    // Re-render with loading state
    rerender(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={true}
        onDownload={mockDownloadHandler}
      />,
    );

    // Should show loading state
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    );

    // Re-render with non-loading state
    rerender(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Folder should still be expanded after loading completes
    expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
  });

  test('handles file download', () => {
    render(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Find the specific file and click its download button
    const fileElement = screen.getByTestId('file-item-file-1');
    const downloadButton = within(fileElement).getByText('Download File');
    fireEvent.click(downloadButton);

    // Check that download handler was called
    expect(mockDownloadHandler).toHaveBeenCalledWith(mockRootFiles[0]);
  });

  test('highlights files with issues', () => {
    render(
      <FolderBrowser
        folders={mockFolders}
        files={mockRootFiles}
        allRedFlags={mockRedFlags}
        isLoading={false}
        onDownload={mockDownloadHandler}
      />,
    );

    // Expand the folder to see highlighted file - use the same approach as other tests
    fireEvent.click(screen.getByTestId('folder-Test Folder'));

    // Find the file by testid - using the specific file we know has the highlight applied
    const fileElement = screen.getByTestId('file-item-file-2');
    expect(fileElement).toHaveClass('border-[--color-secondary]');

    // Should show issue information
    expect(
      screen.getByText('Issues detected with this file:'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This file may be incomplete or has formatting issues'),
    ).toBeInTheDocument();
  });
});
