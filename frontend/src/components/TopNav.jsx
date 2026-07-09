import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter">
            Board<span className="text-cyan-400 glow-text">Pay</span>
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="relative p-2.5 rounded-lg text-slate-400 hover:text-cyan-400 transition-all duration-200 group"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
          {/* Hover background glow */}
          <div className="absolute inset-0 rounded-lg bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all duration-200" />
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded bg-cyan-400 text-black text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Sign out
          </div>
        </button>
      </div>

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 20px rgba(0, 240, 255, 0.5),
                      0 0 40px rgba(0, 240, 255, 0.3);
        }
      `}</style>
    </nav>
  );
}
