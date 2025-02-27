import React from 'react';
import { Project } from '@/types/project';
import { ProjectCard } from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  isLoading?: boolean;
  error?: string;
}

export function ProjectList({
  projects,
  isLoading = false,
  error,
}: ProjectListProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[300px]"
        data-testid="project-list-loading"
      >
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="p-6 border-2 border-[--color-bg-1] rounded-lg animate-pulse bg-white"
            style={{ height: '200px' }}
          >
            <div className="h-4 bg-[--color-bg-1] rounded-full w-3/4 mb-3"></div>
            <div className="h-3 bg-[--color-bg-1] rounded-full w-1/2 mb-6"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-[--color-bg-1] rounded-full w-1/3"></div>
              <div className="h-3 bg-[--color-bg-1] rounded-full w-1/4"></div>
            </div>
            <div className="mt-auto pt-8">
              <div className="h-3 bg-[--color-bg-1] rounded-full w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 border-2 border-[--color-secondary] bg-[#FFF0EE] rounded-lg text-[--color-secondary] min-h-[300px] flex items-center justify-center"
        data-testid="project-list-error"
      >
        <p className="heading-secondary text-2">
          Error loading projects: {error}
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div
        className="p-6 border-2 border-[--color-neutral-1] rounded-lg bg-white text-center min-h-[300px] flex flex-col items-center justify-center"
        data-testid="project-list-empty"
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[--color-bg-1] flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <p className="heading-secondary text-2 text-[--color-text-dark]">
          No projects found. Create a new project to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[300px]"
      data-testid="project-list"
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
