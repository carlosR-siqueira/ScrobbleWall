// components/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  error: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  return (
    <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded-md text-sm">
      {error}
    </div>
  );
};

export default ErrorMessage;
