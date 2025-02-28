'use client';

import React from 'react';
import { FileUpload } from '@/types/project';
import { formatFileSize, timeAgo } from '@/utils/formatters';

interface FileListProps {
  files: FileUpload[];
  isLoading: boolean;
}

export function FileList({ files, isLoading }: FileListProps) {
  // Helper function to get the file icon based on file name
  const getFileIcon = (fileName: string = '') => {
    if (!fileName) return '📁';

    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'ppt':
      case 'pptx':
        return '📑';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📁';
    }
  };

  // Get status colors
  const getStatusColor = (status: FileUpload['status']) => {
    switch (status) {
      case 'uploaded':
        return 'bg-[--color-bg-2] text-[--color-text-light]';
      case 'processing':
        return 'bg-[--color-tertiary-3] text-[--color-neutral-5]';
      case 'completed':
        return 'bg-[--color-tertiary-2] text-[--color-neutral-4]';
      case 'failed':
        return 'bg-[--color-secondary] text-[--color-text-light]';
      default:
        return 'bg-[--color-bg-2] text-[--color-text-light]';
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
          PROJECT FILES
        </h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white border border-[--color-bg-1] p-4 rounded-lg animate-pulse"
            >
              <div className="h-5 bg-[--color-bg-1] rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-[--color-bg-1] rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
        PROJECT FILES
      </h2>

      {files.length === 0 ? (
        <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg text-center">
          <p className="heading-secondary text-2 text-[--color-text-dark]">
            No files uploaded yet. Upload files to analyze your project.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white border border-[--color-bg-1] p-4 rounded-lg flex items-center"
              data-testid={`file-item-${file.id}`}
            >
              <div className="text-2xl mr-4">{getFileIcon(file.fileName)}</div>

              <div className="flex-1">
                <div className="flex flex-wrap justify-between">
                  <h3 className="heading-secondary text-2 text-[--color-text-dark] mb-1">
                    {file.fileName}
                  </h3>
                  <span
                    className={`ceart-score-badge ${getStatusColor(file.status || 'pending')}`}
                  >
                    {file.status
                      ? file.status.charAt(0).toUpperCase() +
                        file.status.slice(1)
                      : 'Pending'}
                  </span>
                </div>

                <div className="flex text-[--color-bg-3] text-3">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span className="mx-2">•</span>
                  <span>{timeAgo(file.uploadDate)}</span>
                </div>

                {file.status === 'processing' && (
                  <div className="mt-2 w-full bg-[--color-bg-1] rounded-full h-1.5">
                    <div className="bg-[--color-primary] h-1.5 rounded-full animate-pulse w-3/4"></div>
                  </div>
                )}

                {file.status === 'failed' && file.errorMessage && (
                  <div className="mt-2 text-[--color-secondary] text-3">
                    Error: {file.errorMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
