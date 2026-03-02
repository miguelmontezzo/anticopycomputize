import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  padding?: boolean;
  [key: string]: any;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
