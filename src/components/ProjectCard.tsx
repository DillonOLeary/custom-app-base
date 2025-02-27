import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Status indicator colors using CEART brand colors
  const statusColors = {
    pending: 'bg-[--color-tertiary-3] text-[--color-neutral-5]',
    analyzing: 'bg-[--color-tertiary-1] text-[--color-neutral-3]',
    completed: 'bg-[--color-tertiary-2] text-[--color-neutral-4]',
    failed: 'bg-[--color-secondary] text-[--color-text-light]',
  };

  // Energy type icons (simplified as text for now)
  const typeIcons = {
    solar: '☀️',
    wind: '🌬️',
    hydro: '💧',
    geothermal: '🔥',
    biomass: '🌱',
    other: '⚡',
  };

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      href={`/projects/${project.id}`}
      className="flex flex-col h-full ceart-card p-6 hover:shadow-lg transition-shadow border-2 border-[--color-bg-1]"
      data-testid={`project-card-${project.id}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{typeIcons[project.type]}</span>
            <h3 className="heading-primary heading-2 text-[--color-text-dark] line-clamp-1">{project.name}</h3>
          </div>
          <p className="heading-secondary text-3 text-[--color-text-dark] mt-1 line-clamp-1">{project.location}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="heading-secondary text-3 text-[--color-primary] font-bold">{project.capacity} MW</span>
          <span className={`ceart-score-badge mt-1 ${statusColors[project.status]}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="text-3 text-[--color-bg-3]">Created: {formatDate(project.createdAt)}</span>
        
        {project.score !== undefined && (
          <div className="flex items-center">
            <span className="heading-secondary text-3 important-text text-[--color-text-dark] mr-2">CEARTscore:</span>
            <div className="h-2.5 w-16 bg-[--color-bg-1] rounded-full">
              <div
                className={`h-2.5 rounded-full ${
                  project.score >= 70
                    ? 'bg-[--color-tertiary-2]'
                    : project.score >= 40
                    ? 'bg-[--color-tertiary-3]'
                    : 'bg-[--color-secondary]'
                }`}
                style={{ width: `${project.score}%` }}
              ></div>
            </div>
            <span className="ml-2 heading-primary heading-3 text-[--color-primary]">{project.score}</span>
          </div>
        )}
      </div>
    </Link>
  );
}