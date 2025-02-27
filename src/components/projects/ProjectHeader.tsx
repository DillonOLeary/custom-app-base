'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { formatDate } from '@/utils/formatters';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  // Energy type icons
  const typeIcons: Record<string, string> = {
    solar: '☀️',
    wind: '🌬️',
    hydro: '💧',
    geothermal: '🔥',
    biomass: '🌱',
    other: '⚡',
  };

  // Status colors using CEART brand colors
  const statusColors: Record<string, string> = {
    pending: 'bg-[--color-tertiary-3] text-[--color-neutral-5]',
    analyzing: 'bg-[--color-tertiary-1] text-[--color-neutral-3]',
    completed: 'bg-[--color-tertiary-2] text-[--color-neutral-4]',
    failed: 'bg-[--color-secondary] text-[--color-text-light]',
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <Link 
          href="/" 
          className="text-[--color-primary] hover:text-[--color-secondary] flex items-center mr-3"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="heading-secondary text-3">Back to Projects</span>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <span className="text-3xl mr-3">{typeIcons[project.type] || '⚡'}</span>
          <h1 className="heading-primary heading-1 text-[--color-text-dark]">
            {project.name.toUpperCase()}
          </h1>
        </div>
        
        <div className="flex items-center mt-3 md:mt-0">
          <span className={`ceart-score-badge mr-3 ${statusColors[project.status]}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          
          {project.score !== undefined && (
            <div className="flex items-center bg-[--color-bg-1] px-3 py-1 rounded-full">
              <span className="heading-secondary text-3 important-text text-[--color-primary] mr-2">
                CEARTscore:
              </span>
              <span className="heading-primary heading-2 text-[--color-primary]">
                {project.score}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="text-[--color-bg-3] text-3 mr-1">Location:</span>
          <span className="heading-secondary text-3 text-[--color-text-dark]">{project.location}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-[--color-bg-3] text-3 mr-1">Capacity:</span>
          <span className="heading-secondary text-3 text-[--color-text-dark]">{project.capacity} MW</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-[--color-bg-3] text-3 mr-1">Created:</span>
          <span className="heading-secondary text-3 text-[--color-text-dark]">{formatDate(project.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}