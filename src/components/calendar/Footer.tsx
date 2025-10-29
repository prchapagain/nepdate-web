import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex flex-wrap justify-center items-center">
      <span className="mr-1">
        © {new Date().getFullYear()}{' '}
        <a
          href="https://github.com/khumnath/nepdate"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-800 dark:hover:text-gray-200"
        >
          Nepdate Calendar Project
        </a>.
      </span>
      <span>
        All rights reserved. Licensed under{' '}
        <a
          href="https://www.gnu.org/licenses/gpl-3.0.en.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-800 dark:hover:text-gray-200"
        >
          GPLv3
        </a>
        .
      </span>
    </footer>
  );
};

export default Footer;

