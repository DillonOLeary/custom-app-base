'use client';

import React from 'react';
import { CategoryScore, RedFlag, ScoreCategory } from '@/types/project';
import { CATEGORY_DESCRIPTIONS } from '@/utils/categoryDescriptions';

interface RedFlagDetailsProps {
  categoryScore: CategoryScore;
  onClose: () => void;
}

export function RedFlagDetails({
  categoryScore,
  onClose,
}: RedFlagDetailsProps) {
  const { category, score, maxScore, redFlags } = categoryScore;
  const categoryInfo = CATEGORY_DESCRIPTIONS[category as ScoreCategory];

  // Get impact badge color
  const getImpactColor = (impact: RedFlag['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-[--color-secondary] text-[--color-text-light]';
      case 'medium':
        return 'bg-[--color-tertiary-3] text-[--color-neutral-5]';
      case 'low':
        return 'bg-[--color-tertiary-1] text-[--color-neutral-3]';
      default:
        return 'bg-[--color-bg-2] text-[--color-text-light]';
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <button
          onClick={onClose}
          className="text-[--color-primary] hover:text-[--color-secondary] flex items-center mr-3"
          data-testid="red-flag-back-button"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="heading-secondary text-3">Back to Overview</span>
        </button>
      </div>

      <div className="flex items-center mb-4">
        <span className="text-3xl mr-3">{categoryInfo.icon}</span>
        <h2 className="heading-primary heading-2 text-[--color-text-dark]">
          {categoryInfo.title.toUpperCase()} ANALYSIS
        </h2>
      </div>

      <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg shadow-sm mb-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h3 className="heading-secondary text-1 text-[--color-text-dark] mb-1">
              {categoryInfo.title} Score: {score}/{maxScore}
            </h3>
            <p className="text-3 text-[--color-bg-3]">
              {categoryInfo.description}
            </p>
          </div>

          <div className="mt-4 md:mt-0">
            <div
              className="w-32 bg-[--color-bg-1] rounded-full h-4"
              style={{
                background: `linear-gradient(90deg, var(--color-secondary) 0%, var(--color-tertiary-3) 50%, var(--color-tertiary-2) 100%)`,
              }}
            >
              <div
                className="bg-white h-4 rounded-full border-2"
                style={{
                  marginLeft: `${(score / maxScore) * 100}%`,
                  width: '12px',
                  transform: 'translateX(-50%)',
                }}
              ></div>
            </div>
            <div className="flex justify-between text-3 mt-1">
              <span>0</span>
              <span>{maxScore / 2}</span>
              <span>{maxScore}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="heading-primary heading-3 text-[--color-text-dark] mb-4">
        RED FLAGS ({redFlags.length})
      </h3>

      <div className="space-y-4">
        {redFlags.map((redFlag) => (
          <div
            key={redFlag.id}
            className="bg-white border border-[--color-bg-1] p-4 rounded-lg shadow-sm red-flag-item"
            data-testid={`red-flag-${redFlag.id}`}
          >
            <div className="flex flex-wrap justify-between items-start mb-2">
              <h4 className="heading-secondary text-2 text-[--color-text-dark] mr-2">
                {redFlag.title}
              </h4>
              <div className="flex items-center">
                <span
                  className={`ceart-score-badge mr-2 ${getImpactColor(redFlag.impact)}`}
                >
                  {redFlag.impact.charAt(0).toUpperCase() +
                    redFlag.impact.slice(1)}{' '}
                  Impact
                </span>
                <span className="text-[--color-secondary] heading-secondary text-3">
                  -{redFlag.pointsDeducted} points
                </span>
              </div>
            </div>
            <p className="text-[--color-text-dark] text-3">
              {redFlag.description}
            </p>
          </div>
        ))}
      </div>

      {redFlags.length === 0 && (
        <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg text-center">
          <p className="heading-secondary text-2 text-[--color-text-dark]">
            No issues found in this category. Great job!
          </p>
        </div>
      )}
    </div>
  );
}
