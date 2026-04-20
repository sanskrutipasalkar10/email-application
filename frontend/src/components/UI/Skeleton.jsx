import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

export const CardSkeleton = () => (
  <div className="p-5 border border-slate-100 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
    <div className="flex justify-between mb-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-5/6 mb-4" />
    <Skeleton className="h-12 w-full rounded-md" />
  </div>
);