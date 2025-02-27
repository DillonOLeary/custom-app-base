'use client';

// Directly apply the linkify logic without using the react-linkify component
// This avoids the TypeScript issues with the third-party library
import React from 'react';

// Simple regex to match URLs
const urlRegex = /(https?:\/\/[^\s]+)/g;

// Function to linkify text
const linkifyText = (text: string) => {
  if (!text) return null;

  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} target="_blank" rel="noopener noreferrer" href={part}>
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center p-24">
      <div className="flex flex-col max-w-84 p-8 border-red-600 border">
        <p className="mb-2 [&>a:hover]:underline [&>a]:block">
          {linkifyText(error.message)}
        </p>

        <button
          className="border border-stone-300 rounded py-[4.5px] px-[13px] self-start shadow"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
