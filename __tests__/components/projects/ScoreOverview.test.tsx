import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreOverview } from '@/components/projects/ScoreOverview';
import { mockProject } from '../../support/testUtils';
import { CATEGORY_DESCRIPTIONS } from '@/utils/categoryDescriptions';

describe('ScoreOverview', () => {
  const mockOnCategoryClick = jest.fn();

  beforeEach(() => {
    mockOnCategoryClick.mockClear();
  });

  test('renders analysis results correctly', () => {
    render(
      <ScoreOverview 
        analysisResult={mockProject.analysisResult!} 
        onCategoryClick={mockOnCategoryClick} 
      />
    );
    
    // Check heading
    expect(screen.getByText('ANALYSIS RESULTS')).toBeInTheDocument();
    
    // Check total score
    expect(screen.getByText(mockProject.analysisResult!.totalScore.toString())).toBeInTheDocument();
    expect(screen.getByText('CEARTscore')).toBeInTheDocument();
    
    // Check red flag count
    expect(screen.getByText(`${mockProject.analysisResult!.redFlagCount} issues`)).toBeInTheDocument();
    
    // Check category scores are displayed - use more specific queries to handle duplicate text
    for (const category of mockProject.analysisResult!.categoryScores) {
      const categoryInfo = CATEGORY_DESCRIPTIONS[category.category];
      expect(screen.getByText(categoryInfo.title)).toBeInTheDocument();
      
      // Use getByTestId to find the specific category button, then check its content
      const categoryButton = screen.getByTestId(`category-${category.category}`);
      expect(categoryButton).toHaveTextContent(`${category.score}/${category.maxScore}`);
    }
  });

  test('calls onCategoryClick when a category is clicked', () => {
    render(
      <ScoreOverview 
        analysisResult={mockProject.analysisResult!} 
        onCategoryClick={mockOnCategoryClick} 
      />
    );
    
    // Check that clicking a category calls the callback
    const categoryButton = screen.getByTestId('category-completeness');
    fireEvent.click(categoryButton);
    
    expect(mockOnCategoryClick).toHaveBeenCalledWith('completeness');
  });
});