import React from 'react';
import { render, screen } from '@testing-library/react';
import { FileList } from '@/components/project-detail/FileList';
import { mockProject } from '../../support/testUtils';
import { formatFileSize } from '@/utils/formatters';
import { FileUpload } from '@/types/project';

describe('FileList', () => {
  test('renders files correctly', () => {
    // Make sure files is defined and not undefined
    const files = mockProject.files as FileUpload[];
    render(<FileList files={files} isLoading={false} />);

    // Check the component title
    expect(screen.getByText('PROJECT FILES')).toBeInTheDocument();

    // Check that all files are displayed
    expect(screen.getByTestId(`file-item-${files[0].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`file-item-${files[1].id}`)).toBeInTheDocument();
    expect(screen.getByTestId(`file-item-${files[2].id}`)).toBeInTheDocument();

    // Check specific file details
    expect(screen.getByText(files[0].fileName)).toBeInTheDocument();
    expect(
      screen.getByText(formatFileSize(files[0].fileSize)),
    ).toBeInTheDocument();

    // Check status indicators using more specific queries
    const file1 = screen.getByTestId(`file-item-${files[0].id}`);
    const file3 = screen.getByTestId(`file-item-${files[2].id}`);

    expect(file1).toHaveTextContent('Completed');
    expect(file3).toHaveTextContent('Processing');
  });

  test('renders loading state', () => {
    render(<FileList files={[]} isLoading={true} />);

    // Check for loading placeholders
    expect(screen.getByText('PROJECT FILES')).toBeInTheDocument();

    const loadingElements = screen
      .getAllByRole('generic')
      .filter((el) => el.className.includes('animate-pulse'));
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  test('renders empty state', () => {
    render(<FileList files={[]} isLoading={false} />);

    // Check for empty state message
    expect(screen.getByText('PROJECT FILES')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No files uploaded yet. Upload files to analyze your project.',
      ),
    ).toBeInTheDocument();
  });
});
