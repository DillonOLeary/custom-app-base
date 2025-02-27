'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryScore, Project, ScoreCategory } from '@/types/project';
import { 
  getProjectDetails, 
  getProjectFiles, 
  uploadFile 
} from '@/services/projectDetailApi';
import { ProjectHeader } from './ProjectHeader';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { ScoreOverview } from './ScoreOverview';
import { RedFlagDetails } from './RedFlagDetails';
import { FileUpload as FileUploadType } from '@/types/project';

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [files, setFiles] = useState<FileUploadType[]>([]);
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
    setIsLoadingFiles(true);
    
    try {
      const filesData = await getProjectFiles(projectId);
      setFiles(filesData);
    } catch (err) {
      console.error('Error fetching project files:', err);
      // Not setting an error state here to keep the UI clean
    } finally {
      setIsLoadingFiles(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectFiles();
  }, [fetchProjectDetails, fetchProjectFiles]);

  const handleUploadComplete = useCallback((file: FileUploadType) => {
    setFiles((prevFiles) => [file, ...prevFiles]);
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleBackToOverview = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  if (isLoading) {
    return (
      <div className="py-4">
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
          <h2 className="heading-primary heading-2 text-[--color-secondary] mb-2">ERROR LOADING PROJECT</h2>
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
    
    return project.analysisResult.categoryScores.find(
      (cat) => cat.category === selectedCategory
    ) || null;
  };

  const selectedCategoryScore = getSelectedCategoryScore();

  return (
    <div className="py-4">
      <ProjectHeader project={project} />
      
      <div className="relative">
        <FileUpload projectId={projectId} onUploadComplete={handleUploadComplete} />
        <FileList files={files} isLoading={isLoadingFiles} />
        
        {project.analysisResult && !selectedCategoryScore && (
          <ScoreOverview 
            analysisResult={project.analysisResult} 
            onCategoryClick={handleCategoryClick}
          />
        )}
        
        {selectedCategoryScore && (
          <RedFlagDetails 
            categoryScore={selectedCategoryScore} 
            onClose={handleBackToOverview}
          />
        )}
        
        {/* Show a message if no analysis results are available yet */}
        {!project.analysisResult && (
          <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg mb-8">
            <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">ANALYSIS PENDING</h2>
            <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
              Upload files to analyze your project and generate a CEARTscore.
            </p>
            {project.status === 'analyzing' && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[--color-primary] mr-2"></div>
                <span className="heading-secondary text-3">Analysis in progress...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}