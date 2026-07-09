import React from 'react';
import TopNav from '../components/TopNav';
import AuditTrail from '../components/AuditTrail';

export default function AuditTrailPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <TopNav />
      
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Audit Trail
            </h1>
            <p className="text-slate-400">
              View the complete immutable record of all verified payments secured on-chain
            </p>
          </div>

          {/* Audit Trail Component */}
          <AuditTrail />
        </div>
      </main>
    </div>
  );
}
