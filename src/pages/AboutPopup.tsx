import React from 'react';
import { XIcon, GithubIcon, UsersIcon, LightbulbIcon } from '../data/icons';

const version = __APP_VERSION__;


type AboutPopupProps = {
  setIsAboutOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AboutPopup: React.FC<AboutPopupProps> = ({ setIsAboutOpen }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-200 dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-sm w-full text-center relative border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsAboutOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">About Bikram Calendar</h2>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          A modern Nepali Bikram Sambat and Gregorian calendar app built using React and PWA technology.
        </p>
         <span>App Version: </span>
          <span className="font-mono">{version}</span>

        <div className="space-y-3 my-6">
          <a href="https://github.com/khumnath/nepdate/tree/page" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition-colors">
            <GithubIcon className="w-5 h-5" />
            <span>Source Code</span>
          </a>
          <a href="https://github.com/khumnath/nepdate/graphs/contributors" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition-colors">
            <UsersIcon className="w-5 h-5" />
            <span>Contributors</span>
          </a>
          <a href="https://github.com/khumnath/nepdate/issues/new" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition-colors">
            <LightbulbIcon className="w-5 h-5" />
            <span>Suggestions and issues</span>
          </a>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
         <p className="mt-1">© 2024–{new Date().getFullYear()} khumnath cg</p>
          <p className="mt-1">All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPopup;
