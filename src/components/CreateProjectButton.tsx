import React, { useState } from 'react';
import { Project } from '@/types/project';

interface CreateProjectButtonProps {
  onProjectCreate: (
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  ) => Promise<void>;
}

export function CreateProjectButton({
  onProjectCreate,
}: CreateProjectButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'solar' as Project['type'],
    capacity: 1,
  });
  const [error, setError] = useState('');

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (
      !formData.name.trim() ||
      !formData.location.trim() ||
      formData.capacity <= 0
    ) {
      setError('Please fill all fields correctly.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onProjectCreate(formData);
      setFormData({
        name: '',
        location: '',
        type: 'solar',
        capacity: 1,
      });
      closeModal();
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Create project error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="ceart-button ceart-button-primary h-12 px-6 whitespace-nowrap"
        data-testid="create-project-button"
      >
        Create New Project
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          data-testid="create-project-modal"
        >
          <div className="ceart-card p-6 w-full max-w-md">
            <h2 className="heading-primary heading-1 text-center mb-4 text-[--color-text-dark]">
              CREATE NEW PROJECT
            </h2>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block heading-secondary heading-3 text-[--color-text-dark] mb-1"
                >
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  data-testid="project-name-input"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="location"
                  className="block heading-secondary heading-3 text-[--color-text-dark] mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  data-testid="project-location-input"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="type"
                  className="block heading-secondary heading-3 text-[--color-text-dark] mb-1"
                >
                  Energy Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  data-testid="project-type-select"
                >
                  <option value="solar">Solar</option>
                  <option value="wind">Wind</option>
                  <option value="hydro">Hydro</option>
                  <option value="geothermal">Geothermal</option>
                  <option value="biomass">Biomass</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="capacity"
                  className="block heading-secondary heading-3 text-[--color-text-dark] mb-1"
                >
                  Capacity (MW)
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  data-testid="project-capacity-input"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="ceart-button ceart-button-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ceart-button ceart-button-primary disabled:opacity-50"
                  disabled={isSubmitting}
                  data-testid="submit-project-button"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
