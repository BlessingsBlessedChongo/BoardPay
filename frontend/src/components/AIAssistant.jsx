import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Loader } from 'lucide-react';

export default function AIAssistant({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hello! I\'m BoardPay AI Assistant. How can I help you with your payments and housing today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      text: inputValue,
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Simulate POST to /api/ai/chat/
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock AI response based on user input
      let reply = 'Your June rent is in Caretaker Review. I\'m tracking the status for you.';
      
      if (inputValue.toLowerCase().includes('payment')) {
        reply = 'You have a payment pending for July. Your next due date is July 25, 2026. Need help submitting it?';
      } else if (inputValue.toLowerCase().includes('maintenance')) {
        reply = 'There\'s an active maintenance request for a leaking tap in your bathroom (reported 2 days ago). The caretaker has it in progress.';
      } else if (inputValue.toLowerCase().includes('streak')) {
        reply = 'Awesome! You\'re on a 4-month payment streak. Keep it up to unlock rewards!';
      } else if (inputValue.toLowerCase().includes('help')) {
        reply = 'I can help you with payment status, maintenance issues, billing information, and account details. What would you like to know?';
      }

      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant',
        text: reply,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[v0] AI chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/20 
                    bg-[#0a0a0f]/95 backdrop-blur-md shadow-2xl shadow-cyan-500/20 overflow-hidden z-50 
                    flex flex-col h-96 md:h-96 sm:h-96 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r 
                      from-cyan-500/10 to-transparent">
        <div>
          <h3 className="font-bold text-white">AI Assistant</h3>
          <p className="text-xs text-slate-400">Available 24/7</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-500 text-black font-medium'
                  : 'bg-white/10 border border-white/20 text-slate-300'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 border border-white/20 px-4 py-2.5 rounded-lg flex items-center gap-2">
              <Loader className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-white/10 p-4 bg-white/5 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isLoading}
          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm 
                     text-white placeholder-slate-500 focus:outline-none focus:ring-2 
                     focus:ring-cyan-500/50 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2.5 bg-cyan-500 text-black rounded-lg hover:brightness-110 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
