import React from 'react';
import { LayoutDashboard, Inbox, Bot, Trello, MessageSquare } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col p-6 shadow-xl shrink-0 z-10 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-10 text-blue-400">
        <Bot size={32} />
        <h1 className="text-xl font-bold tracking-wide">InboxIQ</h1>
      </div>

      <nav className="flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
            ${activeTab === 'dashboard' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium text-sm">Analytics Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
            ${activeTab === 'inbox' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Inbox size={20} />
          <span className="font-medium text-sm">Inbox Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
            ${activeTab === 'kanban' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <Trello size={20} />
          <span className="font-medium text-sm">Action Board</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 
            ${activeTab === 'chat' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <MessageSquare size={20} />
          <span className="font-medium text-sm">Chat with Inbox</span>
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
        v1.0.0 • Product Level
      </div>
    </div>
  );
};

export default Sidebar;