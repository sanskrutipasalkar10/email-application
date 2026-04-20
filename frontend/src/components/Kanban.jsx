import React from 'react';
import { User, MoreHorizontal, GripVertical } from 'lucide-react';

const Kanban = ({ tasks, setTasks }) => {

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    
    // Update the status of the dragged task in the GLOBAL state
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Column Definitions (Using EXACT dashboard colors)
  const columns = [
    { id: 'critical', title: 'Critical Risk', color: 'border-b-[#ef4444]' }, // Red
    { id: 'review',   title: 'Needs Review',  color: 'border-b-[#eab308]' }, // Yellow
    { id: 'routine',  title: 'Routine / Low', color: 'border-b-[#22c55e]' }, // Green
    { id: 'resolved', title: 'Resolved',      color: 'border-b-slate-300' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 shrink-0">Action Board</h1>
      
      <div className="flex-1 overflow-x-auto pb-2">
        <div className="flex gap-6 h-full min-w-[1200px]">
          
          {columns.map((col) => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className="flex-1 flex flex-col bg-slate-100 rounded-xl border border-slate-200 min-w-[280px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                
                {/* COLUMN HEADER */}
                <div className={`p-4 border-b-4 ${col.color} bg-white rounded-t-xl flex justify-between items-center shadow-sm shrink-0`}>
                  <span className="font-bold text-slate-700">{col.title}</span>
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* DROP ZONE */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 transition-colors duration-200">
                  {colTasks.length === 0 && (
                      <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-lg m-2">
                        Drop items here
                      </div>
                  )}
                  
                  {colTasks.map((task) => (
                    <div 
                      key={task.id} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group relative ${col.id === 'resolved' ? 'opacity-60' : ''}`}
                    >
                      <div className="absolute top-4 right-2 text-slate-300 opacity-0 group-hover:opacity-100">
                        <GripVertical size={16} />
                      </div>

                      <div className="flex justify-between items-start mb-2 pr-4">
                        <span className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-600 rounded uppercase tracking-wider">
                          {task.category}
                        </span>
                        {col.id !== 'resolved' && (
                          <span className={`text-xs font-bold ${task.risk_score>=8 ? 'text-[#ef4444]':'text-slate-400'}`}>
                            Risk: {task.risk_score}
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-sm font-semibold mb-3 leading-tight line-clamp-3 ${col.id === 'resolved' ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800'}`}>
                        {task.summary || task.subject}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto border-t border-slate-50 pt-3">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                           <User size={12} /> {task.assignee || 'Unassigned'}
                        </div>
                        <button className="text-slate-300 hover:text-slate-500"><MoreHorizontal size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Kanban;