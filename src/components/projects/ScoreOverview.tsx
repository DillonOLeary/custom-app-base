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

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>([]);
  
  // Toggle category expansion
  const toggleCategory = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
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
                Click on any category to expand and see detailed red flags and recommendations.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {categoryScores.map((category) => {
            const isExpanded = expandedCategories.includes(category.category);
            return (
              <div 
                key={category.category}
                className="border border-[--color-bg-1] rounded-lg overflow-hidden"
              >
                {/* Category header - always visible */}
                <div 
                  onClick={(e) => toggleCategory(category.category, e)}
                  className={`p-3 cursor-pointer ${isExpanded ? 'bg-[--color-bg-1]/10' : 'bg-white'} hover:bg-[--color-bg-1]/10`}
                  data-testid={`category-${category.category}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{CATEGORY_DESCRIPTIONS[category.category].icon}</span>
                      <h3 className="heading-secondary text-2 text-[--color-text-dark]">
                        {CATEGORY_DESCRIPTIONS[category.category].title}
                      </h3>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <span className="text-[--color-text-dark] font-bold mr-1 text-2">
                          {category.score}/{category.maxScore}
                        </span>
                        <div className="w-16 bg-[--color-bg-1] rounded-full h-1.5 ml-2">
                          <div
                            className={`h-1.5 rounded-full ${getScoreColor(
                              category.score,
                              category.maxScore
                            )}`}
                            style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-[--color-secondary] text-2">
                        {category.redFlags.length} {category.redFlags.length === 1 ? 'issue' : 'issues'}
                      </span>
                      <svg 
                        className={`w-5 h-5 ml-2 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-[--color-bg-1] p-4">
                    <p className="text-[--color-text-dark] mb-4 text-3">
                      {CATEGORY_DESCRIPTIONS[category.category].description}
                    </p>
                    
                    {category.redFlags.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="heading-primary heading-3 text-[--color-text-dark] mb-2">IDENTIFIED ISSUES</h4>
                        {category.redFlags.map((redFlag) => (
                          <div 
                            key={redFlag.id} 
                            className="bg-[--color-bg-1]/10 p-3 rounded-lg"
                          >
                            <div className="flex flex-wrap justify-between items-start mb-1">
                              <h5 className="heading-secondary text-2 text-[--color-text-dark] mr-2">
                                {redFlag.title}
                              </h5>
                              <div className="flex items-center">
                                <span className={`ceart-score-badge mr-2 ${
                                  redFlag.impact === 'high' 
                                    ? 'bg-[--color-secondary] text-[--color-text-light]' 
                                    : redFlag.impact === 'medium'
                                    ? 'bg-[--color-tertiary-3] text-[--color-neutral-5]'
                                    : 'bg-[--color-tertiary-1] text-[--color-neutral-3]'
                                }`}>
                                  {redFlag.impact.charAt(0).toUpperCase() + redFlag.impact.slice(1)} Impact
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
                    ) : (
                      <div className="bg-[--color-tertiary-2]/10 p-3 rounded-lg">
                        <p className="heading-secondary text-2 text-[--color-tertiary-2]">
                          No issues found in this category. Great job!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}