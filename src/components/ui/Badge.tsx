import React from 'react';

type BadgeVariant = 'default' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  active: 'bg-blue-50 text-blue-700 border border-blue-200',
  inactive: 'bg-gray-100 text-gray-500 border border-gray-200',
  warning: 'bg-orange-50 text-orange-700 border border-orange-200',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
