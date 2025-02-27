'use client';

import React, { useState } from 'react';
import { FileUpload, Folder, RedFlag } from '@/types/project';
import { formatFileSize, timeAgo } from '@/utils/formatters';

interface FolderBrowserProps {
  folders: Folder[];
  files: FileUpload[]; // Files at root level (no folder)
  allRedFlags?: RedFlag[]; // All red flags to show related ones
  isLoading: boolean;
  onDownload?: (file: FileUpload) => void;
}

export function FolderBrowser({ folders, files, allRedFlags, isLoading, onDownload }: FolderBrowserProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  
  // Helper function to toggle folder expansion
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };
  
  // Helper function to get the file icon based on file name
  const getFileIcon = (fileName: string) => {
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
      case 'zip':
      case 'rar':
        return '🗜️';
      case 'txt':
        return '📋';
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
  
  // Check if file has related red flags
  const getRelatedRedFlags = (file: FileUpload) => {
    if (!allRedFlags || !file.relatedRedFlags?.length) return [];
    return allRedFlags.filter(rf => file.relatedRedFlags?.includes(rf.id));
  };
  
  // Render a single file
  const renderFile = (file: FileUpload) => {
    const relatedRedFlags = getRelatedRedFlags(file);
    const hasIssues = relatedRedFlags.length > 0 || file.isHighlighted;
    
    return (
      <div
        key={file.id}
        className={`bg-white border ${hasIssues ? 'border-[--color-secondary]' : 'border-[--color-bg-1]'} 
                  p-4 rounded-lg flex items-start ${hasIssues ? 'shadow-md' : ''}`}
        data-testid={`file-item-${file.id}`}
      >
        <div className="text-2xl mr-4 mt-1">{getFileIcon(file.fileName)}</div>
        
        <div className="flex-1">
          <div className="flex flex-wrap justify-between">
            <h3 className="heading-secondary text-2 text-[--color-text-dark] mb-1">
              {file.fileName}
            </h3>
            <span className={`ceart-score-badge ${getStatusColor(file.status)}`}>
              {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
            </span>
          </div>
          
          <div className="flex text-[--color-bg-3] text-3 flex-wrap">
            <span>{formatFileSize(file.fileSize)}</span>
            <span className="mx-2">•</span>
            <span>{timeAgo(file.uploadDate)}</span>
            {file.path && (
              <>
                <span className="mx-2">•</span>
                <span className="text-[--color-bg-3]">{file.path}</span>
              </>
            )}
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
          
          {hasIssues && (
            <div className="mt-2 p-2 bg-[--color-secondary]/10 rounded-md">
              <p className="heading-secondary text-3 text-[--color-secondary]">
                Issues detected with this file:
              </p>
              <ul className="mt-1 list-disc list-inside text-3 text-[--color-text-dark]">
                {relatedRedFlags.map(rf => (
                  <li key={rf.id}>{rf.title}</li>
                ))}
                {file.isHighlighted && !relatedRedFlags.length && (
                  <li>This file may be incomplete or has formatting issues</li>
                )}
              </ul>
            </div>
          )}
          
          {file.downloadUrl && (
            <div className="mt-3">
              <button 
                onClick={() => onDownload?.(file)}
                className="ceart-button ceart-button-outline text-3 py-1 px-3"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render a folder and its contents recursively
  const renderFolder = (folder: Folder, level = 0) => {
    const isExpanded = expandedFolders[folder.id];
    const indent = level * 16; // 16px indentation per level
    
    // Check if this folder has missing recommended files
    const hasMissingFiles = folder.missingRecommendedFiles?.length;
    
    return (
      <div key={folder.id} className="mb-1">
        <div 
          className={`flex items-center py-2 px-3 rounded cursor-pointer
                    hover:bg-[--color-bg-1]/50 ${hasMissingFiles ? 'bg-[--color-secondary]/10' : ''}`}
          style={{ paddingLeft: `${indent + 12}px` }}
          onClick={() => toggleFolder(folder.id)}
          data-testid={`folder-${folder.id}`}
        >
          <span className="mr-2">{isExpanded ? '📂' : '📁'}</span>
          <span className="heading-secondary text-2 text-[--color-text-dark]">{folder.name}</span>
          
          {hasMissingFiles && (
            <span className="ml-2 text-[--color-secondary] text-3">
              {folder.missingRecommendedFiles?.length} recommended {
                folder.missingRecommendedFiles?.length === 1 ? 'file' : 'files'
              } missing
            </span>
          )}
          
          <svg 
            className={`w-4 h-4 ml-auto transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* Always render the content div but conditionally show content to prevent layout shift */}
        <div 
          className={`ml-4 pl-2 border-l-2 border-[--color-bg-1] overflow-hidden transition-all duration-200
                      ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {/* Render subfolders first */}
          {folder.subfolders.map(subfolder => renderFolder(subfolder, level + 1))}
          
          {/* Then render files */}
          {folder.files.length > 0 && (
            <div className="space-y-3 mt-2">
              {folder.files.map(file => renderFile(file))}
            </div>
          )}
          
          {/* Show missing recommended files section if applicable */}
          {hasMissingFiles && (
            <div className="my-3 p-3 border border-dashed border-[--color-secondary] rounded-md bg-[--color-secondary]/5">
              <p className="heading-secondary text-3 text-[--color-secondary] mb-2">
                Missing Recommended Files:
              </p>
              <ul className="list-disc list-inside text-3 text-[--color-text-dark]">
                {folder.missingRecommendedFiles?.map((fileName, index) => (
                  <li key={index}>{fileName}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Empty folder state */}
          {folder.files.length === 0 && folder.subfolders.length === 0 && !hasMissingFiles && (
            <p className="text-3 text-[--color-bg-3] py-2">
              This folder is empty
            </p>
          )}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">DATA ROOM BROWSER</h2>
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
  
  // Check if there are no files and no folders
  const isEmpty = folders.length === 0 && files.length === 0;

  return (
    <div className="mb-8">
      <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">DATA ROOM BROWSER</h2>
      
      {isEmpty ? (
        <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg text-center">
          <p className="heading-secondary text-2 text-[--color-text-dark]">
            No files uploaded yet. Upload files to analyze your project.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[--color-bg-1] rounded-lg p-4">
          {/* Folder tree structure - fixed height to prevent resizing */}
          <div className="mb-4 min-h-[200px]">
            {folders.map(folder => renderFolder(folder))}
          </div>
          
          {/* Files at root level */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="heading-secondary text-2 text-[--color-text-dark] mb-2">Files</h3>
              {files.map(file => renderFile(file))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}