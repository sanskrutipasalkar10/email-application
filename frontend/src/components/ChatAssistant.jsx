import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2, Sparkles, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      content: "**Hello! I'm your Inbox Copilot.** \n\nI have read all your emails. You can ask me things like:\n* *What are the top 3 critical risks?*\n* *Summarize the issue with Maersk.*\n* *Draft a summary for the CEO.*" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/api/chat', { query: input });
      const aiMsg = { role: 'ai', content: res.data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error connecting to the AI." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 rounded-2xl overflow-hidden animate-fade-in relative">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-slate-200 p-5 flex justify-between items-center shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">Inbox Copilot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-xs text-slate-500 font-medium">Online & Context Aware</p>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all" title="Reset Chat">
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group animate-fade-in`}>
            
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white 
              ${msg.role === 'ai' 
                ? 'bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600' 
                : 'bg-white text-slate-600'}`}>
              {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-100' 
                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'}`}>
              
              {msg.role === 'ai' ? (
                // This 'prose' class is where the typography plugin works its magic
                <div className="prose prose-sm max-w-none text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-ul:my-2 prose-li:my-0.5">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-white shadow-sm">
              <Bot size={20} />
            </div>
            <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
              </div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Analyzing Inbox...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-6 bg-white/80 backdrop-blur-md border-t border-slate-200">
        <div className="relative flex items-center max-w-4xl mx-auto shadow-sm rounded-xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything about your supply chain risks..."
            className="w-full pl-5 pr-14 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-700 placeholder:text-slate-400 transition-all shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-3 text-[10px] text-slate-400">
          AI can make mistakes. Please verify critical info.
        </div>
      </div>

    </div>
  );
};

export default ChatAssistant;