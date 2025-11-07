import React from 'react';

export const ExitToast: React.FC<{ message: string; visible: boolean }> = ({
  message,
  visible,
}) => (
  <div
    className={`fixed bottom-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow z-50 text-sm text-white bg-black transition-opacity duration-500 ${
      visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}
  >
    {message}
  </div>
);