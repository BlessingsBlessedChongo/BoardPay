import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      
      {/* Welcome Hero Skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
        <div className="mb-8">
          <div className="h-12 bg-white/10 rounded-lg w-3/4 mb-4 animate-pulse" />
          <div className="h-5 bg-white/10 rounded-lg w-1/3 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-3 animate-pulse" />
            <div className="h-12 bg-white/10 rounded w-2/3 mb-3 animate-pulse" />
            <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-3 animate-pulse" />
            <div className="h-12 bg-white/10 rounded w-2/3 mb-3 animate-pulse" />
            <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Upload Panel Skeleton */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
        <div className="h-8 bg-white/10 rounded w-1/2 mb-4 animate-pulse" />
        <div className="h-4 bg-white/10 rounded w-2/3 mb-6 animate-pulse" />

        <div className="rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-12">
          <div className="h-12 bg-white/10 rounded w-20 mx-auto mb-3 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-1/2 mx-auto mb-2 animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-1/3 mx-auto animate-pulse" />
        </div>

        <div className="flex gap-3 mt-6">
          <div className="flex-1 h-12 bg-white/10 rounded-lg animate-pulse" />
          <div className="flex-1 h-12 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Timeline & Maintenance Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
          <div className="h-8 bg-white/10 rounded w-1/2 mb-8 animate-pulse" />

          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 animate-pulse" />
                <div className="flex-1 pt-2 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
            <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse" />
          </div>
        </div>

        {/* Maintenance */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8">
          <div className="h-8 bg-white/10 rounded w-1/2 mb-2 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-2/3 mb-6 animate-pulse" />

          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="h-4 bg-white/10 rounded w-2/3 mb-2 animate-pulse" />
                <div className="h-3 bg-white/10 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
