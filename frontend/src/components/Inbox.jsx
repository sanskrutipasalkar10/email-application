import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { 
  Loader2, CheckCircle, Zap, User, Mail, X, PenTool, Send, 
  Filter, Minimize2, Paperclip, MoreVertical, FileText 
} from 'lucide-react';
import { CardSkeleton } from './UI/Skeleton';

const Inbox = ({ emails, analyzedData, setAnalyzedData }) => {
  const [loadingIds, setLoadingIds] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [viewMode, setViewMode] = useState('email'); // 'email' or 'attachment'
  
  // FILTERS
  const [filterCat, setFilterCat] = useState('All');
  const [filterAssign, setFilterAssign] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');
  
  // DRAFTING
  const [draftingId, setDraftingId] = useState(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Filter Logic
  const filteredResults = useMemo(() => {
    return analyzedData.filter(item => {
      const matchCat = filterCat === 'All' || (item.category || 'Other') === filterCat;
      const matchAssign = filterAssign === 'All' || (item.assignee || 'Unassigned') === filterAssign;
      let matchRisk = true;
      if (filterRisk === 'High') matchRisk = item.risk_score >= 8;
      if (filterRisk === 'Medium') matchRisk = item.risk_score >= 5 && item.risk_score < 8;
      if (filterRisk === 'Low') matchRisk = item.risk_score > 0 && item.risk_score < 5;
      if (filterRisk === 'Noise') matchRisk = item.risk_score === 0;
      return matchCat && matchAssign && matchRisk;
    });
  }, [analyzedData, filterCat, filterAssign, filterRisk]);

  const uniqueAssignees = ['All', ...new Set(analyzedData.map(d => d.assignee || 'Unassigned'))];


  const scanAll = async () => {
    const toAnalyze = emails.filter(e => !analyzedData.find(d => d.id === e.id));
    if (toAnalyze.length === 0) { alert("All emails already analyzed!"); return; }

    for (const email of toAnalyze) {
      setLoadingIds(prev => [...prev, email.id]);
      
      let success = false;
      let retryCount = 0;
      const maxRetries = 5;

      while (!success && retryCount <= maxRetries) {
        try {
          const res = await axios.post('http://127.0.0.1:5000/api/analyze', { 
              email_body: email.body,
              attachment_text: email.attachment_content || null 
          }, { timeout: 60000 }); // 60 second timeout for AI analysis

          const originalEmail = emails.find(e => e.id === email.id);
          const result = { 
              ...res.data, 
              id: email.id, 
              sender: originalEmail?.sender || "Unknown", 
              subject: originalEmail?.subject || "No Subject",
              body: originalEmail?.body || "",
              attachment_name: originalEmail?.attachment_name || null,
              attachment_content: originalEmail?.attachment_content || null 
          };
          setAnalyzedData(prev => [...prev, result]);
          success = true;
          
          // Delay between successful requests to prevent bursts (Safe for 15 RPM free tier)
          await new Promise(r => setTimeout(r, 12000)); 

        } catch (err) {
          if (err.response?.status === 429 || err.code === 'ECONNABORTED') {
            console.warn(`Rate limit or timeout hit. Retry ${retryCount + 1}/${maxRetries}...`);
            retryCount++;
            if (retryCount <= maxRetries) {
              await new Promise(r => setTimeout(r, 8000 * retryCount)); // Progressive wait
              continue;
            }
          }
          console.error("Scan failed for email:", email.id, err);
          break; // Stop retrying for this email
        }
      }
      setLoadingIds(prev => prev.filter(id => id !== email.id));
    }
  };

  const openDraftComposer = async (e, data) => {
    e.stopPropagation(); 
    setDraftingId(data.id);
    try {
      const res = await axios.post('http://127.0.0.1:5000/api/draft_reply', {
        email_body: data.summary, sender: data.sender, recommended_action: data.recommended_action
      });
      setComposeData({ to: data.sender, subject: `Re: ${data.subject || 'Action Required'}`, body: res.data.draft_body });
      setIsComposeOpen(true);
    } catch (err) { alert("Failed to draft"); }
    finally { setDraftingId(null); }
  };

  const handleSendSimulation = () => {
    setIsSending(true);
    setTimeout(() => { setIsSending(false); setIsComposeOpen(false); setShowToast(true); setTimeout(() => setShowToast(false), 3000); }, 1500);
  };

  // --- HANDLERS FOR VIEWING ---

  // 1. Click Card -> View Original Email Only
  const handleViewFullEmail = (id) => {
      // Look in analyzedData first to get the enriched object
      let email = analyzedData.find(e => e.id === id);
      // Fallback to raw emails if not analyzed yet
      if (!email) email = emails.find(e => e.id === id);
      
      if (email) {
        setSelectedEmail(email);
        setViewMode('email'); // Set mode to EMAIL
      }
  };

  // 2. Click Link -> View Attachment Content Only
  const handleViewAttachment = (e, id) => {
      e.stopPropagation(); // Stop card click
      
      let email = analyzedData.find(e => e.id === id);
      if (!email) email = emails.find(e => e.id === id);

      if (email && email.attachment_content) {
        setSelectedEmail(email);
        setViewMode('attachment'); // Set mode to ATTACHMENT
      } else {
        alert("No attachment content found.");
      }
  };

  return (
    <div className="h-full flex flex-col gap-6 relative animate-fade-in">
      <div className="flex justify-between items-center shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Inbox Feed</h1>
        <button onClick={scanAll} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg active:scale-95 transition-all">
          <Zap size={18} /> Scan All
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* LEFT FEED */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-600 text-xs uppercase">Incoming Stream</div>
          <div className="overflow-y-auto p-2 space-y-2 flex-1">
            {emails.map(email => (
              <div key={email.id} onClick={() => handleViewFullEmail(email.id)} className="p-4 bg-white border border-slate-100 rounded-lg hover:border-blue-400 cursor-pointer group transition-all">
                <div className="font-semibold text-sm text-slate-900 truncate">{email.sender}</div>
                <div className="text-xs text-slate-500 mb-2 truncate group-hover:text-blue-500">{email.subject}</div>
                <div className="flex items-center gap-2">
                  {loadingIds.includes(email.id) ? <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full flex gap-1"><Loader2 size={10} className="animate-spin" /> Analyzing...</span> :
                   analyzedData.find(d => d.id === email.id) ? <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex gap-1"><CheckCircle size={10} /> Done</span> :
                   <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">Pending</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT FEED (RESULTS) */}
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* FILTER BAR */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 items-center overflow-x-auto">
             <Filter size={14} className="text-slate-400 ml-2 mr-2" />
             <select value={filterCat} onChange={(e)=>setFilterCat(e.target.value)} className="text-xs border rounded px-2 py-1 bg-white focus:border-blue-500 outline-none">
               <option value="All">Cat: All</option>
               {[...new Set(analyzedData.map(d => d.category||'Other'))].map(c=><option key={c} value={c}>{c}</option>)}
             </select>
             <select value={filterAssign} onChange={(e)=>setFilterAssign(e.target.value)} className="text-xs border rounded px-2 py-1 bg-white focus:border-blue-500 outline-none">
               <option value="All">Assignee: All</option>
               {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
             </select>
             <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="text-xs border rounded px-2 py-1 bg-white focus:border-blue-500 outline-none">
               <option value="All">Risk: All</option>
               <option value="High">High</option>
               <option value="Medium">Medium</option>
               <option value="Low">Low</option>
             </select>
          </div>

          <div className="overflow-y-auto p-4 space-y-4 bg-slate-50/50 flex-1 relative">
            {loadingIds.length > 0 && <CardSkeleton />}
            {filteredResults.map((data, i) => (
              <div 
                key={i} 
                onClick={() => handleViewFullEmail(data.id)} 
                className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">{data.category}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{data.intent}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${data.risk_score >= 8 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    Risk: {data.risk_score}/10
                  </div>
                </div>
                
                {/* --- ATTACHMENT LINK (CLickable for Attachment View) --- */}
                {data.attachment_name && (
                    <div 
                        onClick={(e) => handleViewAttachment(e, data.id)}
                        className="flex items-center gap-2 mb-3 bg-blue-50 hover:bg-blue-100 border border-blue-100 p-2 rounded text-xs text-blue-700 cursor-pointer transition-colors w-fit"
                    >
                        <Paperclip size={12} />
                        <span>Analyzed Attachment: <strong>{data.attachment_name}</strong></span>
                    </div>
                )}

                <div className="bg-slate-50/50 rounded p-3 mb-3 border border-slate-100">
                    <p className="text-sm text-slate-700 italic leading-relaxed break-words">
                        "{data.summary}"
                    </p>
                </div>
                
                <div className="bg-slate-50 rounded-md p-3 border border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 mr-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Action</div>
                      <div className="text-sm font-medium text-blue-700">{data.recommended_action}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User size={12} className="text-slate-400"/>
                        <span className="font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            {data.assignee || "Unassigned"}
                        </span>
                    </div>

                    <button 
                        onClick={(e) => openDraftComposer(e, data)} 
                        disabled={draftingId === data.id} 
                        className="text-xs flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded border border-blue-100"
                    >
                      {draftingId === data.id ? <Loader2 size={12} className="animate-spin"/> : <PenTool size={12} />}
                      Draft AI Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isComposeOpen && (
        <div className="fixed bottom-0 right-20 w-[600px] bg-white rounded-t-xl shadow-2xl border border-slate-300 z-[100] animate-fade-in flex flex-col overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center rounded-t-xl">
            <span className="font-semibold text-sm">New Message</span>
            <div className="flex gap-2">
              <Minimize2 size={16} className="cursor-pointer hover:text-slate-300" />
              <X size={16} className="cursor-pointer hover:text-red-400" onClick={() => setIsComposeOpen(false)} />
            </div>
          </div>
          <div className="flex flex-col bg-white">
            <div className="flex items-center border-b border-slate-100 px-4 py-2">
              <span className="text-slate-500 text-sm w-12">To</span>
              <input type="text" value={composeData.to} className="flex-1 text-sm outline-none text-slate-700"/>
            </div>
            <div className="flex items-center border-b border-slate-100 px-4 py-2">
              <span className="text-slate-500 text-sm w-12">Subject</span>
              <input type="text" value={composeData.subject} className="flex-1 text-sm outline-none text-slate-700 font-medium"/>
            </div>
            <textarea 
              value={composeData.body} 
              onChange={(e) => setComposeData({...composeData, body: e.target.value})} 
              className="w-full h-80 p-4 text-sm text-slate-800 outline-none resize-none leading-relaxed font-sans"
            />
          </div>
          <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-white">
            <div className="flex gap-2">
              <button onClick={handleSendSimulation} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                {isSending ? <Loader2 size={16} className="animate-spin" /> : "Send"}
              </button>
              <Paperclip size={20} className="text-slate-500 hover:bg-slate-100 p-1 rounded cursor-pointer mt-1" />
            </div>
            <MoreVertical size={20} className="text-slate-500 cursor-pointer" />
          </div>
        </div>
      )}

      {showToast && <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-[200] animate-fade-in"><CheckCircle size={20} className="text-green-400" /><span className="font-medium">Message sent successfully.</span></div>}
      
      {/* --- DYNAMIC MODAL (EMAIL vs ATTACHMENT) --- */}
      {selectedEmail && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedEmail(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            
            {/* 1. ATTACHMENT MODE */}
            {viewMode === 'attachment' ? (
                <>
                    <div className="p-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-blue-700">
                            <FileText size={20} />
                            <span className="font-bold text-sm uppercase tracking-wide">Attachment Analysis View</span>
                        </div>
                        <button onClick={() => setSelectedEmail(null)} className="text-slate-400 hover:bg-blue-100 rounded-full p-1"><X size={20} /></button>
                    </div>
                    <div className="p-8 bg-white h-96 overflow-y-auto">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedEmail.attachment_name}</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 font-mono text-sm text-slate-700 shadow-inner">
                            {selectedEmail.attachment_content || "No text content extractable from this document."}
                        </div>
                        <div className="mt-4 text-xs text-slate-400 text-center">
                            AI extracted text content from document.
                        </div>
                    </div>
                </>
            ) : (
                /* 2. EMAIL MODE (ORIGINAL) */
                <>
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 h-fit"><Mail size={24} /></div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900 mb-1">{selectedEmail.subject}</h2>
                                    <p className="text-sm font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                    From: {selectedEmail.sender}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEmail(null)} className="text-slate-400 hover:bg-slate-200 rounded-full p-1"><X size={20} /></button>
                        </div>
                    </div>
                    
                    <div className="p-8 text-slate-800 leading-relaxed text-sm whitespace-pre-wrap font-sans bg-white h-96 overflow-y-auto flex flex-col justify-between">
                        <div>{selectedEmail.body}</div>
                        
                        {/* Small footer indicating attachment exists, but not showing content */}
                        {selectedEmail.attachment_name && (
                            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                                <Paperclip size={12} />
                                <span>Includes attachment: <strong>{selectedEmail.attachment_name}</strong> (Click blue link in dashboard to analyze)</span>
                            </div>
                        )}
                    </div>
                </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;