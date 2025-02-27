import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = 'Search projects...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center border-2 border-[--color-primary] rounded-full overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-grow px-4 py-2 focus:outline-none text-[--color-text-dark] heading-secondary text-2"
          data-testid="search-input"
        />
        <button
          type="submit"
          className="ceart-button ceart-button-primary rounded-l-none py-2"
          data-testid="search-button"
        >
          Search
        </button>
      </div>
    </form>
  );
}