import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  className?: string; // Allow requesting print:hidden or other overrides if needed, though default is print:hidden
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 z-10 sticky top-0 print:hidden ${className}`}>
      <button
        onClick={onBack}
        className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        {title}
      </h1>
    </div>
  );
};
