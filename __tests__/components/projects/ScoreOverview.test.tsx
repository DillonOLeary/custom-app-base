import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScoreOverview } from '@/components/projects/ScoreOverview';
import { mockProject } from '../../support/testUtils';
import { CATEGORY_DESCRIPTIONS } from '@/utils/categoryDescriptions';
import { ScoreCategory } from '@/types/project';

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
      />,
    );

    // Check heading
    expect(screen.getByText('ANALYSIS RESULTS')).toBeInTheDocument();

    // Check total score
    expect(
      screen.getByText(mockProject.analysisResult!.totalScore.toString()),
    ).toBeInTheDocument();
    expect(screen.getByText('CEARTscore')).toBeInTheDocument();

    // Check red flag count
    expect(
      screen.getByText(`${mockProject.analysisResult!.redFlagCount} issues`),
    ).toBeInTheDocument();

    // Check category scores are displayed - use more specific queries to handle duplicate text
    for (const category of mockProject.analysisResult!.categoryScores) {
      const categoryInfo =
        CATEGORY_DESCRIPTIONS[category.category as ScoreCategory];
      expect(screen.getByText(categoryInfo.title)).toBeInTheDocument();

      // Use getByTestId to find the specific category button, then check its content
      const categoryButton = screen.getByTestId(
        `category-${category.category}`,
      );
      expect(categoryButton).toHaveTextContent(
        `${category.score}/${category.maxScore}`,
      );
    }
  });

  test('expands category when clicked', () => {
    render(
      <ScoreOverview
        analysisResult={mockProject.analysisResult!}
        onCategoryClick={mockOnCategoryClick}
      />,
    );

    // Before clicking, no expanded content should be visible
    const categoryInfo = CATEGORY_DESCRIPTIONS['completeness' as ScoreCategory];
    expect(
      screen.queryByText(categoryInfo.description),
    ).not.toBeInTheDocument();

    // Click to expand
    const categoryButton = screen.getByTestId('category-completeness');
    fireEvent.click(categoryButton);

    // After clicking, description should be visible
    expect(screen.getByText(categoryInfo.description)).toBeInTheDocument();

    // Red flags from this category should be visible
    const redFlags = mockProject.analysisResult!.categoryScores.find(
      (c) => c.category === 'completeness',
    )!.redFlags;

    expect(screen.getByText('IDENTIFIED ISSUES')).toBeInTheDocument();
    expect(screen.getByText(redFlags[0].title)).toBeInTheDocument();
    expect(screen.getByText(redFlags[0].description)).toBeInTheDocument();

    // Click again to collapse
    fireEvent.click(categoryButton);

    // Category content should no longer be visible
    expect(
      screen.queryByText(categoryInfo.description),
    ).not.toBeInTheDocument();
  });

  test('shows "No issues" message for categories with no red flags', () => {
    render(
      <ScoreOverview
        analysisResult={mockProject.analysisResult!}
        onCategoryClick={mockOnCategoryClick}
      />,
    );

    // Find the category with no red flags
    const perfectCategory = mockProject.analysisResult!.categoryScores.find(
      (c) => c.redFlags.length === 0,
    )!;

    // Click to expand
    const categoryButton = screen.getByTestId(
      `category-${perfectCategory.category}`,
    );
    fireEvent.click(categoryButton);

    // Should show "no issues" message
    expect(
      screen.getByText('No issues found in this category. Great job!'),
    ).toBeInTheDocument();
  });
});
