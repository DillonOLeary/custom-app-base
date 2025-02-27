import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar', () => {
  test('should render with default placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(
      screen.getByPlaceholderText('Search projects...'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  test('should render with custom placeholder', () => {
    const mockOnSearch = jest.fn();
    render(
      <SearchBar onSearch={mockOnSearch} placeholder="Custom placeholder" />,
    );

    expect(
      screen.getByPlaceholderText('Custom placeholder'),
    ).toBeInTheDocument();
  });

  test('should call onSearch when form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByTestId('search-input');
    const searchButton = screen.getByTestId('search-button');

    fireEvent.change(input, { target: { value: 'solar' } });
    fireEvent.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith('solar');
  });
});
