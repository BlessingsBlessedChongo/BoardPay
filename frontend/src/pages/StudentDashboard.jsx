import React, { useState, useEffect, useRef } from 'react';
import { Upload, Mic, Send, MessageCircle, X, CheckCircle, AlertCircle, Zap, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import TopNav from '../components/TopNav';
import DashboardSkeleton from '../components/DashboardSkeleton';
import WelcomeHero from '../components/WelcomeHero';
import UploadPanel from '../components/UploadPanel';
import BillingTimeline from '../components/BillingTimeline';
import GroqChatWidget from '../components/GroqChatWidget';

export default function StudentDashboard() {
  const [role, setRole] = useState('Student');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAI, setShowAI] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/student/dashboard/');
        setDashboardData(response.data);
      } catch (err) {
        setError(
          err?.response?.data?.error || 
          'Failed to load dashboard. Please try again.'
        );
        console.error('[StudentDashboard] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <TopNav role={role} setRole={setRole} />
        <main className="flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-cyan-500 text-black font-semibold rounded-lg hover:brightness-110 transition-all"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <TopNav role={role} setRole={setRole} />

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Hero */}
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <WelcomeHero data={dashboardData} />
              
              {/* Async Upload & Preview */}
              <UploadPanel onDataUpdate={() => {
                // Optionally refresh dashboard after upload
                window.location.reload();
              }} />
              
              {/* Billing Timeline & Maintenance */}
              <BillingTimeline data={dashboardData} />
            </>
          )}
        </div>
      </main>

      {/* Chat Widget */}
      <GroqChatWidget isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Chat Launcher Button */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 z-40 relative w-14 h-14 bg-cyan-500/20 border border-cyan-500/50 rounded-full flex items-center justify-center 
                     hover:bg-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group"
        >
          <MessageCircle className="w-6 h-6 text-cyan-400" />
          <span className="absolute inset-0 rounded-full animate-pulse bg-cyan-500/10" />
        </button>
      )}
    </div>
  );
}
