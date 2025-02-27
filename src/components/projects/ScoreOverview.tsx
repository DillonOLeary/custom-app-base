'use client';

import React from 'react';
import { AnalysisResult, CategoryScore } from '@/types/project';
import { CATEGORY_DESCRIPTIONS } from '@/utils/categoryDescriptions';
import { formatDate } from '@/utils/formatters';

interface ScoreOverviewProps {
  analysisResult: AnalysisResult;
  onCategoryClick: (category: string) => void;
}

export function ScoreOverview({ analysisResult, onCategoryClick }: ScoreOverviewProps) {
  const { totalScore, categoryScores, lastUpdated, redFlagCount } = analysisResult;
  
  // Get color based on score
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    
    if (percentage >= 70) {
      return 'bg-[--color-tertiary-2]';
    } else if (percentage >= 40) {
      return 'bg-[--color-tertiary-3]';
    } else {
      return 'bg-[--color-secondary]';
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h2 className="heading-primary heading-2 text-[--color-text-dark]">ANALYSIS RESULTS</h2>
        <div className="text-[--color-bg-3] text-3">
          Last updated: {formatDate(lastUpdated)}
        </div>
      </div>
      
      <div className="bg-white border border-[--color-bg-1] p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center mb-6">
          <div className="relative w-32 h-32 mb-4 md:mb-0 md:mr-8 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-32 h-32">
              <path
                className="stroke-[--color-bg-1]"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`stroke-current ${getScoreColor(totalScore, 100)}`}
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${totalScore}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="heading-primary heading-1 text-[--color-primary]">{totalScore}</span>
              <span className="heading-secondary text-3 text-[--color-bg-3]">CEARTscore</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <p className="heading-secondary text-1 text-[--color-text-dark] mb-1">
                Your project analysis identified <span className="text-[--color-secondary] font-bold">{redFlagCount} issues</span> across 5 categories.
              </p>
              <p className="text-3 text-[--color-bg-3]">
                Click on any category below to see detailed red flags and recommendations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {categoryScores.map((category) => (
                <button
                  key={category.category}
                  onClick={() => onCategoryClick(category.category)}
                  className="bg-white border border-[--color-bg-1] p-3 rounded-lg hover:border-[--color-primary] hover:shadow-md transition-all"
                  data-testid={`category-${category.category}`}
                >
                  <div className="flex items-center mb-1">
                    <span className="mr-2">{CATEGORY_DESCRIPTIONS[category.category].icon}</span>
                    <h3 className="heading-secondary text-3 text-[--color-text-dark]">
                      {CATEGORY_DESCRIPTIONS[category.category].title}
                    </h3>
                  </div>
                  <div className="w-full bg-[--color-bg-1] rounded-full h-1.5 mb-1">
                    <div
                      className={`h-1.5 rounded-full ${getScoreColor(
                        category.score,
                        category.maxScore
                      )}`}
                      style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-3">
                    <span className="text-[--color-text-dark] font-bold">
                      {category.score}/{category.maxScore}
                    </span>
                    <span className="text-[--color-secondary]">
                      {category.redFlags.length} {category.redFlags.length === 1 ? 'issue' : 'issues'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}