'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import { getProjects, searchProjects, createProject } from '@/services/projectApi';
import { SearchBar } from './SearchBar';
import { ProjectList } from './ProjectList';
import { CreateProjectButton } from './CreateProjectButton';

export function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Update filtered projects when search query or projects change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Use local API endpoint that returns the mock data
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorMessage = `Failed to fetch projects: ${response.status} ${response.statusText || ''}`;
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }
      
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      // Handle any unexpected errors
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching projects:', errorMessage);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // If the query is empty, just filter the existing projects without making API call
    if (query.trim() === '') {
      setFilteredProjects(projects);
      return;
    }
    
    // Only search API for non-empty queries
    setIsLoading(true);
    setError(null);
    
    try {
      // Search for matching projects
      const response = await fetch(`/api/projects/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorMessage = `Search failed: ${response.status} ${response.statusText || ''}`;
        console.error(errorMessage);
        setError(errorMessage);
        return;
      }
      
      const data = await response.json();
      setFilteredProjects(data);
    } catch (err) {
      // Handle any unexpected errors
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Search error:', errorMessage);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        const errorMessage = `Failed to create project: ${response.status} ${response.statusText || ''}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const newProject = await response.json();
      
      // Update the list with the new project
      setProjects(prev => [newProject, ...prev]);
      
      // Clear the search to show all projects including the new one
      setSearchQuery('');
    } catch (err) {
      // We still throw the error so the CreateProjectButton component can handle it
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Create project error:', errorMessage);
      throw err;
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Fixed position header with z-index to ensure it stays on top */}
      <div 
        className="fixed top-0 left-0 right-0 bg-white z-10 border-b-2 border-[--color-bg-1]"
        style={{ height: '120px' }}
      >
        <div className="h-full flex flex-col md:flex-row md:justify-between md:items-center px-5 md:px-9 pt-6">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-[--color-primary] rounded mr-2"></div>
            <h2 className="heading-primary heading-2 text-[--color-text-dark]">YOUR PROJECTS</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <SearchBar onSearch={handleSearch} />
            <CreateProjectButton onProjectCreate={handleCreateProject} />
          </div>
        </div>
      </div>
      
      {/* Content section with padding top to account for fixed header */}
      <div className="w-full pt-[150px] px-5 md:px-9">
        <ProjectList
          projects={filteredProjects}
          isLoading={isLoading}
          error={error || undefined}
        />
      </div>
    </div>
  );
}