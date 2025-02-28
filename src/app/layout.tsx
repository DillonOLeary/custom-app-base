import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

import 'copilot-design-system/dist/styles/main.css';

export const metadata: Metadata = {
  title: 'Custom App',
  description: 'Copilot Custom App Example',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={[inter.className].join(' ')}>
        {/* Add global loading styles */}
        <style jsx global>{`
          .skeleton-pulse {
            animation: skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            background-color: var(--color-bg-1);
          }

          @keyframes skeleton-pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
        {children}
      </body>
    </html>
  );
}
