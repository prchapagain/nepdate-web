import React, { useState, useEffect } from 'react';
import type { SavedKundaliEntry } from '../../types/types';
import { NEPALI_LABELS } from '../../constants/constants';
import { XIcon } from '../../data/icons';

interface SavedKundalisModalProps {
  onClose: () => void;
  onEdit: (entry: SavedKundaliEntry) => void;
  onView: (entry: SavedKundaliEntry) => void;
}

export const SavedKundalisModal: React.FC<SavedKundalisModalProps> = ({ onClose, onEdit, onView }) => {
  const [savedEntries, setSavedEntries] = useState<SavedKundaliEntry[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedKundalis');
      if (stored) {
        setSavedEntries(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved kundalis:", e);
    }
  }, []);

  const handleDelete = (id: number) => {
    if (window.confirm(NEPALI_LABELS.deleteConfirm)) {
      const updatedEntries = savedEntries.filter(entry => entry.id !== id);
      setSavedEntries(updatedEntries);
      localStorage.setItem('savedKundalis', JSON.stringify(updatedEntries));
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ne-NP-u-nu-deva', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
  };

  return (
    <div className="fixed inset-0 flex flex-wrap items-center justify-center bg-black/60 z-50 p-4 transition-opacity" onClick={onClose}>
      <div className="bg-slate-200 dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-wrap flex-col p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-500 dark:text-blue-400">{NEPALI_LABELS.savedKundalis}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {savedEntries.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">{NEPALI_LABELS.noSavedKundalis}</p>
          ) : (
            <ul className="space-y-3">
              {savedEntries.map(entry => (
                <li key={entry.id} className="bg-slate-50 dark:bg-gray-700 p-3 rounded-md shadow-sm">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <p className="font-semibold text-blue-600 dark:text-blue-300">
                        {entry.type === 'individual' ? entry.name : `${entry.groomName} र ${entry.brideName}`}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${entry.type === 'individual' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
                            {entry.type === 'individual' ? NEPALI_LABELS.individual : NEPALI_LABELS.comparison}
                        </span>
                        <span className="ml-2">{NEPALI_LABELS.savedOn} {formatDate(entry.timestamp)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => onView(entry)} className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
                        {NEPALI_LABELS.view}
                      </button>
                       <button onClick={() => onEdit(entry)} className="px-3 py-1 text-sm text-gray-700 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-500 dark:text-gray-100 dark:hover:bg-gray-400">
                        {NEPALI_LABELS.edit}
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600">
                        {NEPALI_LABELS.delete}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
