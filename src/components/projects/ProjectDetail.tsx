'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryScore, Project, ScoreCategory } from '@/types/project';
import {
  getProjectDetails,
  getProjectFiles,
  uploadFile,
  runAnalysis,
} from '@/services/projectDetailApi';
import { ProjectHeader } from './ProjectHeader';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { FolderBrowser } from './FolderBrowser';
import { ScoreOverview } from './ScoreOverview';
import { RedFlagDetails } from './RedFlagDetails';
import { FileUpload as FileUploadType, Folder } from '@/types/project';
import { processFilesForProject } from '@/utils/fileUtils';

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [files, setFiles] = useState<FileUploadType[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [rootFiles, setRootFiles] = useState<FileUploadType[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  const fetchProjectDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const projectData = await getProjectDetails(projectId);
      setProject(projectData);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const fetchProjectFiles = useCallback(async () => {
    // Don't set loading if we already have files to prevent flickering
    if (files.length === 0) {
      setIsLoadingFiles(true);
    }

    try {
      const filesData = await getProjectFiles(projectId);

      // First set the files array to avoid flickering
      setFiles(filesData);

      // Process files to get folder structure
      if (project?.analysisResult) {
        // If we have analysis results, include red flags
        const redFlags = project.analysisResult.categoryScores.flatMap(
          (cat) => cat.redFlags,
        );

        // Use try/catch to prevent processing errors from crashing the app
        try {
          const { folders: processedFolders, rootFiles: processedRootFiles } =
            processFilesForProject(filesData, redFlags);

          // Set folder data in a single update to prevent re-renders
          setFolders(processedFolders);
          setRootFiles(processedRootFiles);
        } catch (processingErr) {
          console.error('Error processing file structure:', processingErr);
          // If processing fails, just show flat file list
          setFolders([]);
          setRootFiles(filesData);
        }
      } else {
        // Just organize files without red flags
        try {
          const { folders: processedFolders, rootFiles: processedRootFiles } =
            processFilesForProject(filesData);

          setFolders(processedFolders);
          setRootFiles(processedRootFiles);
        } catch (processingErr) {
          console.error('Error processing file structure:', processingErr);
          setFolders([]);
          setRootFiles(filesData);
        }
      }
    } catch (err) {
      console.error('Error fetching project files:', err);
      // Not setting an error state here to keep the UI clean
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectId, project?.analysisResult, files.length]);

  // Use separate useEffects to avoid flickering - first load project, then files
  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    if (project) {
      fetchProjectFiles();
    }
  }, [project, fetchProjectFiles]);

  const handleUploadComplete = useCallback(
    (file: FileUploadType) => {
      setFiles((prevFiles) => [file, ...prevFiles]);

      // Re-process folder structure with the new file
      const updatedFiles = [file, ...files];

      if (project?.analysisResult) {
        // Include red flags if available
        const redFlags = project.analysisResult.categoryScores.flatMap(
          (cat) => cat.redFlags,
        );
        const { folders: processedFolders, rootFiles: processedRootFiles } =
          processFilesForProject(updatedFiles, redFlags);

        setFolders(processedFolders);
        setRootFiles(processedRootFiles);
      } else {
        // Just organize files
        const { folders: processedFolders, rootFiles: processedRootFiles } =
          processFilesForProject(updatedFiles);

        setFolders(processedFolders);
        setRootFiles(processedRootFiles);
      }
    },
    [files, project?.analysisResult],
  );

  // Handle file download
  const handleFileDownload = useCallback((file: FileUploadType) => {
    if (file.downloadUrl) {
      // In a real app, this would trigger a download
      // For the mock, just show an alert
      alert(`Downloading file: ${file.fileName}`);

      // In production, this would be:
      // window.open(file.downloadUrl, '_blank');
    }
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleBackToOverview = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  if (isLoading) {
    return (
      <div className="py-4" aria-label="Loading project data">
        <div className="animate-pulse">
          <div className="h-8 bg-[--color-bg-1] rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-[--color-bg-1] rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-[--color-bg-1] rounded w-1/3"></div>
          <div className="mt-8">
            <div className="h-6 bg-[--color-bg-1] rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-[--color-bg-1] rounded mb-8"></div>
            <div className="h-6 bg-[--color-bg-1] rounded w-1/4 mb-4"></div>
            <div className="h-24 bg-[--color-bg-1] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-4">
        <div className="bg-[#FFF0EE] border-2 border-[--color-secondary] p-6 rounded-lg">
          <h2 className="heading-primary heading-2 text-[--color-secondary] mb-2">
            ERROR LOADING PROJECT
          </h2>
          <p className="heading-secondary text-2 text-[--color-text-dark]">
            {error || 'Project not found. Please check the URL and try again.'}
          </p>
          <button
            onClick={() => fetchProjectDetails()}
            className="ceart-button ceart-button-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getSelectedCategoryScore = (): CategoryScore | null => {
    if (!selectedCategory || !project.analysisResult) {
      return null;
    }

    return (
      project.analysisResult.categoryScores.find(
        (cat) => cat.category === selectedCategory,
      ) || null
    );
  };

  const selectedCategoryScore = getSelectedCategoryScore();

  return (
    <div className="py-4">
      <ProjectHeader project={project} />

      <div className="relative">
        {/* Show Score Overview or Red Flag Details first when analysis is available */}
        {project.analysisResult && (
          <div
            className="relative"
            style={{ height: '800px', overflowY: 'auto' }}
          >
            {selectedCategoryScore ? (
              <RedFlagDetails
                categoryScore={selectedCategoryScore}
                onClose={handleBackToOverview}
              />
            ) : (
              <ScoreOverview
                analysisResult={project.analysisResult}
                onCategoryClick={handleCategoryClick}
              />
            )}
          </div>
        )}

        {/* Show a message if no analysis results are available yet */}
        {!project.analysisResult && (
          <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg mb-8">
            {project.status === 'analyzing' ? (
              <>
                <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
                  ANALYSIS IN PROGRESS
                </h2>
                <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
                  We&apos;re analyzing your project files to generate a
                  CEARTscore.
                </p>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[--color-primary] mr-2"></div>
                  <span className="heading-secondary text-3">
                    Analysis in progress...
                  </span>
                </div>
              </>
            ) : project.status === 'failed' ? (
              <>
                <h2 className="heading-primary heading-2 text-[--color-secondary] mb-3">
                  ANALYSIS FAILED
                </h2>
                <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
                  {(project as any).analysisError ||
                    'Analysis failed due to incomplete documentation.'}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        await runAnalysis(projectId);
                        await fetchProjectDetails();
                      } catch (err) {
                        console.error('Error running analysis:', err);
                        setError('Failed to run analysis. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="ceart-button ceart-button-primary"
                    disabled={isLoading}
                    data-testid="retry-analysis-button"
                    // This special ID attribute helps in synchronizing tests
                    id="retry-analysis-btn-for-testing"
                  >
                    {isLoading ? 'Processing...' : 'Retry Analysis'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
                  ANALYSIS PENDING
                </h2>
                <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
                  {files.length > 0
                    ? 'Your files are ready for analysis. Run CEARTscore analysis to evaluate your project.'
                    : 'Upload files to analyze your project and generate a CEARTscore.'}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        if (files.length === 0) {
                          alert('Please upload files before running analysis');
                          return;
                        }

                        setIsLoading(true);
                        await runAnalysis(projectId);
                        await fetchProjectDetails();
                      } catch (err) {
                        console.error('Error running analysis:', err);
                        setError('Failed to run analysis. Please try again.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="ceart-button ceart-button-primary"
                    disabled={isLoading || files.length === 0}
                    data-testid="run-analysis-button"
                    // This special ID attribute helps in synchronizing tests
                    id="run-analysis-btn-for-testing"
                  >
                    {isLoading ? 'Processing...' : 'Run CEARTscore Analysis'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* File Upload always comes next (either after analysis results or pending message) */}
        <FileUpload
          projectId={projectId}
          onUploadComplete={handleUploadComplete}
        />

        {/* Enhanced folder browser with nested folder structure - use key to force proper re-renders */}
        <FolderBrowser
          key={`folder-browser-${projectId}-${isLoadingFiles ? 'loading' : 'loaded'}`}
          folders={folders}
          files={rootFiles}
          allRedFlags={project.analysisResult?.categoryScores.flatMap(
            (cat) => cat.redFlags,
          )}
          isLoading={isLoadingFiles}
          onDownload={handleFileDownload}
        />
      </div>
    </div>
  );
}
