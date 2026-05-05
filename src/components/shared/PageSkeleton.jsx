import React from 'react';
import Skeleton from './Skeleton';

const PageSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-white border-r border-slate-200 p-6 hidden md:block">
        <Skeleton className="h-10 w-32 mb-10" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>

      <div className="flex-1">
        {/* Header Skeleton */}
        <header className="h-16 bg-white border-bottom border-slate-200 flex items-center justify-between px-8">
          <Skeleton className="h-6 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="p-8 max-w-7xl mx-auto">
          {/* Hero/Title area */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          {/* Large Content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-96">
                <Skeleton className="h-6 w-48 mb-6" />
                <Skeleton className="h-full w-full opacity-50" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-64">
                <Skeleton className="h-6 w-32 mb-6" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageSkeleton;
