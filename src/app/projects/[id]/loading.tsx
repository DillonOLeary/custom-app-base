'use client';

import React from 'react';
import { Container } from '@/components/common/Container';

/**
 * Loading skeleton for project detail page
 * This component is automatically used by Next.js when the page is loading
 */
export default function Loading() {
  return (
    <Container>
      <div className="w-full max-w-6xl mx-auto pt-6 pb-12">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full skeleton-pulse"></div>
            <div className="h-8 w-64 rounded-full skeleton-pulse"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-32 h-10 rounded-md skeleton-pulse"></div>
            <div className="w-32 h-10 rounded-md skeleton-pulse"></div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 mb-6 border border-[--color-bg-1]">
              <div className="h-7 w-40 mb-4 skeleton-pulse rounded-md"></div>
              <div className="space-y-3">
                <div className="h-4 w-full skeleton-pulse rounded-md"></div>
                <div className="h-4 w-3/4 skeleton-pulse rounded-md"></div>
                <div className="h-4 w-5/6 skeleton-pulse rounded-md"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[--color-bg-1]">
              <div className="h-7 w-40 mb-4 skeleton-pulse rounded-md"></div>
              <div className="h-64 w-full skeleton-pulse rounded-md"></div>
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 mb-6 border border-[--color-bg-1]">
              <div className="h-7 w-40 mb-4 skeleton-pulse rounded-md"></div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-20 skeleton-pulse rounded-md"></div>
                  <div className="h-4 w-24 skeleton-pulse rounded-md"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-24 skeleton-pulse rounded-md"></div>
                  <div className="h-4 w-20 skeleton-pulse rounded-md"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-28 skeleton-pulse rounded-md"></div>
                  <div className="h-4 w-16 skeleton-pulse rounded-md"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-[--color-bg-1]">
              <div className="h-7 w-40 mb-4 skeleton-pulse rounded-md"></div>
              <div className="h-36 w-full skeleton-pulse rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
