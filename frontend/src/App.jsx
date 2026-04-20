import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inbox from './components/Inbox';
import Kanban from './components/Kanban';
import ChatAssistant from './components/ChatAssistant';
import axios from 'axios';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [emails, setEmails] = useState([]);
  
  // MAIN DATA STATE
  const [analyzedData, setAnalyzedData] = useState([]);

  // KANBAN STATE
  const [kanbanTasks, setKanbanTasks] = useState([]);
  const [isKanbanInitialized, setIsKanbanInitialized] = useState(false);

  // FETCH EMAILS
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/emails');
        setEmails(res.data);
      } catch (error) { console.error("Backend offline"); }
    };
    fetchEmails();
  }, []);

  // SYNC KANBAN WITH ANALYSIS
  useEffect(() => {
    if (analyzedData.length > 0) {
      setKanbanTasks(prevTasks => {
        const newTasks = [...prevTasks];
        analyzedData.forEach(item => {
          if (!newTasks.find(t => t.id === item.id)) {
            let status = 'routine';
            if (item.risk_score >= 8) status = 'critical';
            else if (item.risk_score >= 5) status = 'review';
            newTasks.push({ ...item, status });
          }
        });
        return newTasks;
      });
      setIsKanbanInitialized(true);
    }
  }, [analyzedData]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div className="h-full w-full p-8 overflow-y-auto">
          
          {activeTab === 'dashboard' && (
            <Dashboard analyzedData={analyzedData} totalEmails={emails.length} />
          )}
          
          {activeTab === 'inbox' && (
            <Inbox 
              emails={emails} 
              analyzedData={analyzedData} 
              setAnalyzedData={setAnalyzedData} 
            />
          )}
          
          {activeTab === 'kanban' && (
            <Kanban 
              tasks={kanbanTasks} 
              setTasks={setKanbanTasks} 
            />
          )}

          {activeTab === 'chat' && (
            <div className="h-full max-w-4xl mx-auto">
               <ChatAssistant />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;