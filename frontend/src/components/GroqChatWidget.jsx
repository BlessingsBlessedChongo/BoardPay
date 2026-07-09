import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

// Simulated API function for chat
async function mockChatAPI(message) {
  // This function can be easily swapped for a real API call:
  // return fetch('/api/ai/chat/', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message })
  // }).then(r => r.json())

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple keyword matching for demo responses
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('rent') || lowerMessage.includes('june')) {
    return {
      reply: 'Your June rent of ZMW 2,500 is currently in Caretaker Review. Once verified, it will be secured on the ledger within 24-48 hours.'
    };
  }
  
  if (lowerMessage.includes('maintenance') || lowerMessage.includes('broken') || lowerMessage.includes('fix')) {
    return {
      reply: 'To request maintenance, please use the Maintenance Request feature in your dashboard. Your request will be assigned to the caretaker for immediate attention.'
    };
  }
  
  if (lowerMessage.includes('lease') || lowerMessage.includes('contract')) {
    return {
      reply: 'Your lease is valid through December 31, 2024. You can view or download a copy from your dashboard under "Documents".'
    };
  }
  
  // Fallback response
  return {
    reply: 'Thank you for your question! I\'m here to help with questions about your rent, lease, or maintenance requests. Feel free to ask!'
  };
}

export default function GroqChatWidget({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Hi Chanda! Ask me anything about your rent, lease, or maintenance requests.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Show typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: typingId,
      sender: 'assistant',
      text: 'typing'
    }]);

    try {
      // Call mock API
      const response = await mockChatAPI(inputValue);

      // Remove typing indicator and add response
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(m => m.id !== typingId));
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      onClick={onClose}
      style={{
        animation: isOpen ? 'fadeIn 0.2s ease-out' : 'fadeOut 0.2s ease-out forwards'
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .typing-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(0, 240, 255, 0.6);
          margin: 0 2px;
          animation: pulse 1.4s infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
      `}</style>

      {/* Chat panel */}
      <div
        className="pointer-events-auto fixed bottom-4 right-4 w-full max-w-sm md:w-96 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[520px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: isOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out forwards',
          marginRight: '1rem',
          marginBottom: '1rem',
          width: 'calc(100vw - 2rem)',
          maxWidth: '380px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-white">BoardPay Assistant</h3>
            <p className="text-xs text-gray-500 mt-0.5">Powered by Llama 3 (Groq)</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 flex flex-col">
          {messages.map((message) => {
            const isUser = message.sender === 'user';
            const isTyping = message.text === 'typing';

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-xl ${
                    isUser
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-100'
                  }`}
                >
                  {isTyping ? (
                    <div className="flex items-center gap-1 py-0.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3 shrink-0 bg-white/2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              disabled={isLoading}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-cyan-500 text-black p-2.5 rounded-lg hover:bg-cyan-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
