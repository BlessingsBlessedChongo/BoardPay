import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const STEP_LABELS = {
  RECEIPT_UPLOADED: 'Receipt Uploaded',
  CARETAKER_REVIEW: 'Caretaker Review',
  SECURED_ON_LEDGER: 'Secured on Ledger',
};

const MAINTENANCE_STATUS_COLORS = {
  PENDING: { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-300', tag: 'bg-slate-500/30 text-slate-200' },
  IN_PROGRESS: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-300', tag: 'bg-orange-500/30 text-orange-200' },
  COMPLETED: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', tag: 'bg-green-500/30 text-green-200' },
};

export default function BillingTimeline({ data }) {
  if (!data) return null;

  const { current_month_status, active_maintenance } = data;
  const steps = [STEP_LABELS.RECEIPT_UPLOADED, STEP_LABELS.CARETAKER_REVIEW, STEP_LABELS.SECURED_ON_LEDGER];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Billing Cycle Timeline */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
                      shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 p-8">
        
        <h2 className="text-2xl font-bold text-white mb-8">Billing Cycle Status</h2>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = current_month_status.steps_completed.includes(step);
            const isCurrent = current_month_status.current_step === step;
            const isPending = current_month_status.steps_pending.includes(step);

            return (
              <div key={step} className="relative flex gap-4">
                
                {/* Timeline line (not on last item) */}
                {index < steps.length - 1 && (
                  <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                    isCompleted ? 'bg-cyan-500' : 'bg-slate-700'
                  }`} />
                )}

                {/* Step indicator circle */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                    ${isCompleted 
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' 
                      : isCurrent
                      ? 'bg-transparent border-2 border-orange-500 text-orange-300 animate-pulse shadow-lg shadow-orange-500/20'
                      : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isCurrent ? (
                      <Clock className="w-6 h-6" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Step content */}
                <div className={`flex-1 pt-2 ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-50'
                }`}>
                  <div className={`p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : isCurrent
                      ? 'bg-orange-500/10 border-orange-500/50'
                      : 'bg-slate-700/20 border-slate-700/30'
                  }`}>
                    <h3 className={`font-semibold ${
                      isCompleted ? 'text-cyan-300' : isCurrent ? 'text-orange-300' : 'text-slate-400'
                    }`}>
                      {step}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {isCompleted 
                        ? '✓ Completed' 
                        : isCurrent 
                        ? 'In progress - awaiting review' 
                        : 'Waiting'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Current Amount</p>
              <p className="text-3xl font-bold text-cyan-400">
                {current_month_status.extracted_amount.toLocaleString()} ZMW
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs uppercase tracking-wider">Status</p>
              <div className="inline-block mt-2 px-3 py-1.5 rounded-lg 
                            bg-orange-500/20 border border-orange-500/30 
                            text-orange-300 font-medium text-sm">
                Pending
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Maintenance Tracker */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
                      shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 p-8">
        
        <h2 className="text-2xl font-bold text-white mb-2">Maintenance Issues</h2>
        <p className="text-slate-400 text-sm mb-6">Active requests in your building</p>

        <div className="space-y-3">
          {active_maintenance.length > 0 ? (
            active_maintenance.map((issue) => {
              const colors = MAINTENANCE_STATUS_COLORS[issue.status] || MAINTENANCE_STATUS_COLORS.PENDING;
              
              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border transition-all group cursor-pointer
                    hover:shadow-lg hover:shadow-cyan-500/10 ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${colors.text}`}>
                          {issue.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400">
                        {issue.created_at_relative}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors.tag}`}>
                      {issue.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 rounded-lg bg-green-500/5 border border-green-500/30 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-medium">All good!</p>
              <p className="text-green-200/60 text-xs mt-1">No active maintenance issues</p>
            </div>
          )}
        </div>

        {/* Info footer */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-slate-500 text-xs">
            📋 Maintenance issues are tracked by your caretaker. Contact them directly for urgent concerns.
          </p>
        </div>
      </div>

    </div>
  );
}
