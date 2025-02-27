'use client';

import React, { useState, useRef, useCallback } from 'react';
import { uploadFile } from '@/services/api';
import { FileUpload as FileUploadType } from '@/types/project';

interface FileUploadProps {
  projectId: string;
  token?: string;
  onUploadComplete: (file: FileUploadType) => void;
}

export function FileUpload({
  projectId,
  token,
  onUploadComplete,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFiles = useCallback(
    async (files: FileList) => {
      setIsUploading(true);
      setError(null);

      try {
        // For simplicity, we'll just upload one file at a time
        const file = files[0];

        const uploadedFile = await uploadFile(projectId, file, token);
        onUploadComplete(uploadedFile);
      } catch (err) {
        setError('Failed to upload file. Please try again.');
        // Error is already handled via the UI
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, token, onUploadComplete],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;

      if (files.length > 0) {
        await uploadFiles(files);
      }
    },
    [uploadFiles],
  );

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (files && files.length > 0) {
        await uploadFiles(files);
        // Reset the file input
        e.target.value = '';
      }
    },
    [uploadFiles],
  );

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-8">
      <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
        UPLOAD PROJECT FILES
      </h2>

      <div
        className={`border-2 border-dashed p-8 rounded-lg text-center ${
          isDragging
            ? 'border-[--color-primary] bg-[--color-primary]/5'
            : 'border-[--color-bg-2]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          data-testid="file-input"
        />

        <div className="flex flex-col items-center">
          <svg
            className={`w-12 h-12 mb-4 ${isDragging ? 'text-[--color-primary]' : 'text-[--color-bg-3]'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12"
            />
          </svg>

          <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
            {isDragging
              ? 'Drop your files here'
              : 'Drag and drop your files here, or click to select files'}
          </p>

          {!isUploading && (
            <button
              onClick={handleButtonClick}
              className="ceart-button ceart-button-primary"
              data-testid="select-files-button"
            >
              Select Files
            </button>
          )}

          {isUploading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[--color-primary] mr-2"></div>
              <span className="heading-secondary text-3">Uploading...</span>
            </div>
          )}

          {error && (
            <p className="mt-4 text-[--color-secondary] heading-secondary text-3">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
