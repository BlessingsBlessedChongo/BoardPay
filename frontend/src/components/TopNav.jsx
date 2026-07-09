import React, { useState } from 'react';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav({ role, setRole }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const roles = ['Student', 'Caretaker', 'Landlord'];

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setShowRoleMenu(false);
    setMobileDrawerOpen(false);
  };

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

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-6">
          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-slate-300 text-sm font-medium
                       bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 
                       transition-all duration-200 group"
            >
              <span>{role}</span>
              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#0a0a0f]/95 border border-white/10 
                            backdrop-blur-md shadow-xl overflow-hidden z-50">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors
                      ${role === r 
                        ? 'bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-500' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-cyan-300'
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button - Icon Only */}
          <button
            onClick={handleLogout}
            className="relative p-2 rounded-lg text-slate-400 hover:text-cyan-400 transition-all duration-200 group"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
            {/* Glowing hover state */}
            <div className="absolute inset-0 rounded-lg bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all duration-200" />
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-cyan-400 text-black text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Sign out
            </div>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileDrawerOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden bg-white/5 border-t border-white/10 backdrop-blur-md px-4 py-4 space-y-4">
          {/* Role Switcher - Mobile */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block px-2">
              Switch Role
            </label>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`w-full px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-all
                  ${role === r 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' 
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-cyan-300'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Logout Button - Mobile */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-sm font-medium hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-500/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .glow-text {
          text-shadow: 0 0 20px rgba(0, 240, 255, 0.5),
                      0 0 40px rgba(0, 240, 255, 0.3);
        }
      `}</style>
    </nav>
  );
}
