import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search projects...',
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // Debounce search execution so it doesn't happen on every keystroke
    if (newValue.trim() === '') {
      // Clear immediately
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex items-center border-2 border-[--color-primary] rounded-full overflow-hidden h-12">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-grow h-full px-4 focus:outline-none text-[--color-text-dark] heading-secondary text-2"
          data-testid="search-input"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-700 pr-2"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="ceart-button ceart-button-primary rounded-l-none h-full px-6"
          data-testid="search-button"
        >
          Search
        </button>
      </div>
    </form>
  );
}
