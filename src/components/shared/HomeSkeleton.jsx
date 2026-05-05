import React from 'react';
import Skeleton from './Skeleton';

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden relative">
      {/* Navbar Skeleton */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
            <Skeleton className="h-10 w-24 rounded-2xl" />
          </div>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <main className="relative z-10 pt-36 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-64 rounded-full" />
            <Skeleton className="h-16 w-full max-w-md" />
            <Skeleton className="h-16 w-3/4 max-w-sm" />
            <div className="space-y-3 mt-6">
              <Skeleton className="h-5 w-full max-w-lg" />
              <Skeleton className="h-5 w-5/6 max-w-lg" />
            </div>
            <div className="flex gap-4 mt-10">
              <Skeleton className="h-14 w-40 rounded-2xl" />
              <Skeleton className="h-14 w-40 rounded-2xl" />
            </div>
          </div>
          {/* Right Column */}
          <div className="relative aspect-[4/3] w-full">
            <Skeleton className="w-full h-full rounded-[2.5rem]" />
          </div>
        </div>

        {/* Feature Highlights Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <Skeleton className="w-14 h-14 rounded-2xl mb-6" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomeSkeleton;
