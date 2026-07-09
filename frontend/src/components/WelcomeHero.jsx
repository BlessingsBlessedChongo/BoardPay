import React from 'react';
import { Home, Flame, Calendar } from 'lucide-react';

export default function WelcomeHero({ data }) {
  if (!data) return null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md
                    shadow-2xl hover:shadow-cyan-500/5 transition-all duration-300 p-8">
      
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
            Welcome back, <span className="text-cyan-400">{data.student_name}</span>
          </h1>
          <div className="flex items-center gap-2 text-slate-400">
            <Home className="w-5 h-5 text-cyan-500" />
            <span className="text-base">{data.room_display}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Payment Streak - Premium Gamified Badge */}
          <div className="group/card p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent 
                          border border-white/10 hover:border-cyan-500/30 transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Flame className="w-6 h-6 text-orange-400" />
                <div className="absolute inset-0 animate-pulse rounded-full bg-orange-400/20" />
              </div>
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                Payment Streak
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-cyan-400">{data.payment_streak}</span>
              <span className="text-slate-500 text-lg">months</span>
            </div>
            <p className="text-slate-500 text-xs mt-3">Keep it up for exclusive rewards!</p>
          </div>

          {/* Days Remaining */}
          <div className="group/card p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent 
                          border border-white/10 hover:border-cyan-500/30 transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Calendar className="w-6 h-6 text-cyan-400" />
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/20" />
              </div>
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                Next Due Date
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-bold text-cyan-400">{data.days_remaining}</span>
              <span className="text-slate-500 text-lg">days remaining</span>
            </div>
            <p className="text-slate-500 text-xs">
              Due: <span className="text-cyan-300 font-semibold">{data.next_due_date}</span>
            </p>
          </div>

        </div>

        {/* Motivational footer */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            {data.payment_streak >= 3 
              ? "🎉 You're a payment pro! Keep the streak alive." 
              : "Complete your next payment to build your streak."}
          </p>
          <div className="flex gap-1">
            {[...Array(Math.min(data.payment_streak, 5))].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                   style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
