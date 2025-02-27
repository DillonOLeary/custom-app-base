import React from 'react';
import Link from 'next/link';
import { Project } from '@/types/project';
import { formatDate } from '@/utils/formatters';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@/components/common/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TypeIcon } from '@/components/common/TypeIcon';
import { ScoreIndicator } from '@/components/common/ScoreIndicator';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block h-full"
      data-testid={`project-card-${project.id}`}
    >
      <Card className="h-full flex flex-col" hover shadow border>
        <CardHeader>
          <div className="flex justify-between items-start w-full">
            <div>
              <div className="flex items-center gap-2">
                <TypeIcon type={project.type} size="sm" />
                <h3 className="heading-primary heading-2 text-[--color-text-dark] line-clamp-1">
                  {project.name}
                </h3>
              </div>
              <p className="heading-secondary text-3 text-[--color-text-dark] mt-1 line-clamp-1">
                {project.location}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="heading-secondary text-3 text-[--color-primary] font-bold">
                {project.capacity} MW
              </span>
              <StatusBadge status={project.status} size="sm" className="mt-1" />
            </div>
          </div>
        </CardHeader>

        <CardFooter className="mt-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-col">
              <span className="text-3 text-[--color-bg-3]">
                Created: {formatDate(project.createdAt)}
              </span>
              {project.description && (
                <span className="text-3 text-[--color-bg-3] line-clamp-1 max-w-[220px]">
                  {project.description}
                </span>
              )}
            </div>

            {project.score !== undefined && (
              <div className="flex items-center">
                <span className="heading-secondary text-3 important-text text-[--color-text-dark] mr-2">
                  CEARTscore:
                </span>
                <ScoreIndicator
                  score={project.score}
                  showLabel={false}
                  size="sm"
                  className="flex-row items-center gap-2"
                />
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
