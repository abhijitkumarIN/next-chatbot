'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TooltipIconButtonProps {
  tooltip: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}

export const TooltipIconButton: React.FC<TooltipIconButtonProps> = ({
  tooltip,
  onClick,
  className,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        className
      )}
      title={tooltip}
    >
      {children}
    </button>
  );
};