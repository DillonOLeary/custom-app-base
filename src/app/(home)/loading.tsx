'use client';

import React from 'react';

/**
 * Loading skeleton for the home page
 * This component is automatically used by Next.js when the page is loading
 */
export default function Loading() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Fixed position header skeleton */}
      <div
        className="fixed top-0 left-0 right-0 bg-white z-10 border-b-2 border-[--color-bg-1]"
        style={{ height: '120px' }}
      >
        <div className="h-full flex flex-col md:flex-row md:justify-between md:items-center px-5 md:px-9 pt-6">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-[--color-primary] rounded mr-2"></div>
            <div className="h-8 bg-[--color-bg-1] rounded-full w-40 animate-pulse"></div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0">
            <div className="h-10 bg-[--color-bg-1] rounded-full w-64 animate-pulse"></div>
            <div className="h-10 bg-[--color-bg-1] rounded-full w-40 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton with padding top to account for fixed header */}
      <div className="w-full pt-[150px] px-5 md:px-9">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-h-[300px]">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="p-6 border-2 border-[--color-bg-1] rounded-lg animate-pulse bg-white"
              style={{ height: '200px' }}
            >
              <div className="h-4 bg-[--color-bg-1] rounded-full w-3/4 mb-3"></div>
              <div className="h-3 bg-[--color-bg-1] rounded-full w-1/2 mb-6"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-[--color-bg-1] rounded-full w-1/3"></div>
                <div className="h-3 bg-[--color-bg-1] rounded-full w-1/4"></div>
              </div>
              <div className="mt-auto pt-8">
                <div className="h-3 bg-[--color-bg-1] rounded-full w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
