import React from 'react';
import Converter from '../components/calendar/Converter';

interface ConverterPageProps {
  onBack: () => void;
}

const ConverterPage: React.FC<ConverterPageProps> = ({ onBack }) => {
  return (
    <main className="flex-1 flex flex-col overflow-hidden px-2 sm:px-4 md:px-6 lg:px-40 max-w-7xl mx-auto w-full">
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <Converter onBack={onBack} />
      </div>
    </main>
  );
};

export default ConverterPage;