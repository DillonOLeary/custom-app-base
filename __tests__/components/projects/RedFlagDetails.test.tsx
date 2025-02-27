import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RedFlagDetails } from '@/components/project-detail/RedFlagDetails';
import { mockProject } from '../../utils/test-utils';
import { CATEGORY_DESCRIPTIONS } from '@/utils/categoryDescriptions';

describe('RedFlagDetails', () => {
  const mockOnClose = jest.fn();
  const completenessCategory = mockProject.analysisResult!.categoryScores.find(
    (c) => c.category === 'completeness',
  )!;
  const contractQualityCategory =
    mockProject.analysisResult!.categoryScores.find(
      (c) => c.category === 'contractQuality',
    )!;

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  test('renders category details and red flags correctly', () => {
    // Using as to ensure TypeScript knows this is a CategoryScore with the right type
    render(
      <RedFlagDetails
        categoryScore={completenessCategory}
        onClose={mockOnClose}
      />,
    );

    // Check category title
    const categoryInfo = CATEGORY_DESCRIPTIONS.completeness;
    expect(
      screen.getByText(`${categoryInfo.title.toUpperCase()} ANALYSIS`),
    ).toBeInTheDocument();

    // Check score display
    expect(
      screen.getByText(
        `${categoryInfo.title} Score: ${completenessCategory.score}/${completenessCategory.maxScore}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(categoryInfo.description)).toBeInTheDocument();

    // Check red flags section title - using a text matcher function to handle spacing
    expect(
      screen.getByText((content) => {
        return (
          content.includes('RED FLAGS') &&
          content.includes(completenessCategory.redFlags.length.toString())
        );
      }),
    ).toBeInTheDocument();

    // Check red flags are displayed
    for (const redFlag of completenessCategory.redFlags) {
      expect(screen.getByText(redFlag.title)).toBeInTheDocument();
      expect(screen.getByText(redFlag.description)).toBeInTheDocument();
      expect(
        screen.getByText(`-${redFlag.pointsDeducted} points`),
      ).toBeInTheDocument();

      // Check impact label
      const impactText = `${redFlag.impact.charAt(0).toUpperCase() + redFlag.impact.slice(1)} Impact`;
      expect(screen.getByText(impactText)).toBeInTheDocument();
    }
  });

  test('calls onClose when back button is clicked', () => {
    render(
      <RedFlagDetails
        categoryScore={completenessCategory}
        onClose={mockOnClose}
      />,
    );

    const backButton = screen.getByTestId('red-flag-back-button');
    fireEvent.click(backButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('displays message when no red flags found', () => {
    render(
      <RedFlagDetails
        categoryScore={contractQualityCategory}
        onClose={mockOnClose}
      />,
    );

    expect(
      screen.getByText('No issues found in this category. Great job!'),
    ).toBeInTheDocument();
  });
});
