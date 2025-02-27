'use client';

import React from 'react';
import { Project } from '@/types/project';

interface AnalysisStatusPanelProps {
  projectStatus: Project['status'];
  analysisError?: string;
  isLoading: boolean;
  filesCount: number;
  projectId: string;
  onRunAnalysis: () => Promise<void>;
}

export function AnalysisStatusPanel({
  projectStatus,
  analysisError,
  isLoading,
  filesCount,
  projectId,
  onRunAnalysis,
}: AnalysisStatusPanelProps) {
  return (
    <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg mb-8">
      {projectStatus === 'analyzing' ? (
        // Analyzing status view
        <>
          <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
            ANALYSIS IN PROGRESS
          </h2>
          <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
            We&apos;re analyzing your project files to generate a CEARTscore.
          </p>
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[--color-primary] mr-2"></div>
            <span className="heading-secondary text-3">
              Analysis in progress...
            </span>
          </div>
        </>
      ) : projectStatus === 'failed' ? (
        // Failed status view
        <>
          <h2 className="heading-primary heading-2 text-[--color-secondary] mb-3">
            ANALYSIS FAILED
          </h2>
          <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
            {analysisError ||
              'Analysis failed due to incomplete documentation.'}
          </p>
          <div className="flex justify-center">
            <button
              onClick={onRunAnalysis}
              className="ceart-button ceart-button-primary"
              disabled={isLoading}
              data-testid="retry-analysis-button"
              id="retry-analysis-btn-for-testing"
            >
              {isLoading ? 'Processing...' : 'Retry Analysis'}
            </button>
          </div>
        </>
      ) : (
        // New or pending status view
        <>
          <h2 className="heading-primary heading-2 text-[--color-text-dark] mb-3">
            ANALYSIS PENDING
          </h2>
          <p className="heading-secondary text-2 text-[--color-text-dark] mb-4">
            {filesCount > 0
              ? 'Your files are ready for analysis. Run CEARTscore analysis to evaluate your project.'
              : 'Upload files to analyze your project and generate a CEARTscore.'}
          </p>
          <div className="flex justify-center">
            <button
              onClick={onRunAnalysis}
              className="ceart-button ceart-button-primary"
              disabled={isLoading || filesCount === 0}
              data-testid="run-analysis-button"
              id="run-analysis-btn-for-testing"
            >
              {isLoading ? 'Processing...' : 'Run CEARTscore Analysis'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
