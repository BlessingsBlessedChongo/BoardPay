import React, { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNav({ role, setRole }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();

  const roles = ['Student', 'Caretaker', 'Landlord'];

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setShowRoleMenu(false);
    // Could navigate to different dashboard routes here
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter">
            Board<span className="text-cyan-400 glow-text">Pay</span>
          </span>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
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

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-slate-400 text-sm font-medium
                     hover:text-red-400 hover:bg-red-500/5 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
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
