import React, { useState } from 'react';
import { KundaliForm } from '../components/kundali/KundaliForm';
import { KundaliDisplay } from '../components/kundali/KundaliDisplay';
import { kundaliService } from '../../services/kundaliService';
import type { KundaliResponse } from '../../types/types';
import { NEPALI_LABELS } from '../constants/constants';

interface KundaliPageProps {
  onBack: () => void;
}

export const KundaliPage: React.FC<KundaliPageProps> = ({ onBack }) => {
  const [kundaliData, setKundaliData] = useState<KundaliResponse | null>(null);
  const [isKundaliLoading, setIsKundaliLoading] = useState(false);
  const [kundaliError, setKundaliError] = useState<string | null>(null);

  return (
    <main className="flex-1 flex flex-col overflow-hidden px-2 md:px-3 max-w-7xl mx-auto w-full 
                     bg-slate-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100 transition-colors">
      <div className="min-h-max sm:p-6 md:p-6 lg:p-8">
        {/* Back button */}
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 
                       text-blue-600 hover:text-blue-800 
                       dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {NEPALI_LABELS.returnTomain}
          </button>
        </div>

        {/* Conditional rendering */}
        {!kundaliData ? (
          isKundaliLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <svg
                className="animate-spin h-10 w-10 text-amber-800 dark:text-amber-400 mb-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <div className="text-lg font-semibold text-amber-800 dark:text-amber-400">
                {NEPALI_LABELS.calculating}
              </div>
            </div>
          ) : (
            <KundaliForm
              onCalculate={async (data) => {
                setIsKundaliLoading(true);
                setKundaliError(null);
                try {
                  const response = await kundaliService.getKundali(data);
                  if ('error' in response) {
                    setKundaliError(response.error);
                  } else {
                    setKundaliData(response);
                  }
                } catch (err) {
                  setKundaliError(
                    err instanceof Error
                      ? err.message
                      : 'An unexpected error occurred'
                  );
                } finally {
                  setIsKundaliLoading(false);
                }
              }}
              isLoading={isKundaliLoading}
            />
          )
        ) : (
          <div className="space-y-6 relative">
            <KundaliDisplay
              data={kundaliData}
              onReturnToForm={() => {
                setKundaliData(null);
                setKundaliError(null);
              }}
            />
          </div>
        )}

        {/* Error state */}
        {kundaliError && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center p-4">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-16 h-16 text-red-500 dark:text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="mt-4 text-xl text-red-700 dark:text-red-400">
                {kundaliError === 'An unexpected error occurred'
                  ? NEPALI_LABELS.unexpectedError
                  : kundaliError}
              </p>
              <button
                className="mt-4 text-blue-600 dark:text-blue-400 underline"
                onClick={() => {
                  setKundaliData(null);
                  setKundaliError(null);
                }}
              >
                {NEPALI_LABELS.returnToForm}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default KundaliPage;
