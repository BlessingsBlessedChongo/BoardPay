import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 glass-card backdrop-blur-lg border-b border-cyan-400/10 bg-gray-900/70"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <RouterLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-bold tracking-tighter">BoardPay</span>
          <span className="text-cyan-400 text-xl">.</span>
        </RouterLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium">
            Features
          </a>
          <a href="#howitworks" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium">
            How it Works
          </a>
          <a href="#security" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium">
            Security
          </a>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleSignIn}
            className="text-gray-400 hover:text-cyan-400 transition-colors font-medium text-sm"
          >
            Sign In
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleGetStarted}
            className="bg-cyan-400 text-black font-semibold px-6 py-2 rounded-full hover:bg-cyan-300 transition-colors text-sm"
          >
            Get Started
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-400 hover:text-cyan-400 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-cyan-400/10 bg-gray-900/95 backdrop-blur-lg"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-4">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block text-gray-400 hover:text-cyan-400 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#howitworks"
              onClick={() => setIsOpen(false)}
              className="block text-gray-400 hover:text-cyan-400 transition-colors font-medium"
            >
              How it Works
            </a>
            <a
              href="#security"
              onClick={() => setIsOpen(false)}
              className="block text-gray-400 hover:text-cyan-400 transition-colors font-medium"
            >
              Security
            </a>
            <div className="border-t border-gray-800 pt-4 space-y-2">
              <button
                onClick={() => {
                  handleSignIn();
                  setIsOpen(false);
                }}
                className="w-full text-left text-gray-400 hover:text-cyan-400 transition-colors font-medium py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  handleGetStarted();
                  setIsOpen(false);
                }}
                className="w-full bg-cyan-400 text-black font-semibold px-6 py-2 rounded-full hover:bg-cyan-300 transition-colors text-sm"
              >
                Get Started
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
