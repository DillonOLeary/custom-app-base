'use client';

import React from 'react';
import { Project } from '@/types/project';
import { formatDate } from '@/utils/formatters';
import { TypeIcon } from '@/components/common/TypeIcon';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ScoreIndicator } from '@/components/common/ScoreIndicator';
import { BackButton } from '@/components/common/BackButton';

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
        <BackButton href="/" className="mr-3" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex items-center">
          <TypeIcon type={project.type || 'other'} size="lg" className="mr-3" />
          <h1 className="heading-primary heading-1 text-[--color-text-dark]">
            {(project.name || '').toUpperCase()}
          </h1>
        </div>

        <div className="flex items-center mt-3 md:mt-0">
          <StatusBadge
            status={project.status || 'pending'}
            size="md"
            className="mr-3"
          />

          {project.score !== undefined && (
            <div className="flex items-center bg-[--color-bg-1] px-3 py-1 rounded-full">
              <span className="heading-secondary text-3 important-text text-[--color-text-dark] mr-2">
                CEARTscore:
              </span>
              <ScoreIndicator
                score={project.score}
                showLabel={false}
                size="md"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="text-[--color-bg-3] text-3 mr-1">Location:</span>
          <span className="heading-secondary text-3 text-[--color-text-dark]">
            {project.location || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-[--color-bg-3] text-3 mr-1">Capacity:</span>
          <span className="heading-secondary text-3 text-[--color-text-dark]">
            {project.capacity || 0} MW
          </span>
        </div>

        <div className="flex items-center">
          <span className="text-[--color-bg-3] text-3 mr-1">Created:</span>
          <span className="heading-secondary text-3 text-[--color-text-dark]">
            {formatDate(project.createdAt || new Date().toISOString())}
          </span>
        </div>
      </div>
    </div>
  );
}
