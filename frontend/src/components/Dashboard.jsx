import React from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const Dashboard = ({ analyzedData, totalEmails }) => {
  // --- DATA CALCULATION ---
  const criticalCount = analyzedData.filter(d => d.risk_score >= 8).length;
  const noiseCount = analyzedData.filter(d => d.risk_score === 0).length;
  const pendingCount = Math.max(0, totalEmails - analyzedData.length);

  // 1. RISK CHART (Vibrant Traffic Light Colors)
  const riskData = [
    { name: 'Low', count: analyzedData.filter(d => d.risk_score > 0 && d.risk_score <= 4).length, fill: '#22c55e' }, // Bright Green
    { name: 'Med', count: analyzedData.filter(d => d.risk_score >= 5 && d.risk_score <= 7).length, fill: '#eab308' }, // Bright Yellow/Orange
    { name: 'Crit', count: analyzedData.filter(d => d.risk_score >= 8).length, fill: '#ef4444' }, // Bright Red
  ];

  // 2. SIGNAL CHART
  const signalCount = analyzedData.length - noiseCount;
  const noiseSignalData = [
    { name: 'Actionable', value: signalCount, color: '#3b82f6' }, // Bright Blue
    { name: 'Noise', value: noiseCount, color: '#94a3b8' }      // Muted Slate
  ];

  // 3. CATEGORY CHART (Vibrant Mix)
  const categoryCounts = {};
  analyzedData.forEach(d => {
    if (d.risk_score === 0) return;
    const cat = d.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  // Vibrant Palette: Blue, Purple, Green, Orange, Pink
  const vibrantColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#06b6d4'];
  
  const domainData = Object.keys(categoryCounts).map((key, index) => ({
    name: key,
    value: categoryCounts[key],
    color: vibrantColors[index % vibrantColors.length]
  }));

  const highPriorityRows = analyzedData
    .filter(d => d.risk_score > 6)
    .sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="space-y-6 h-full flex flex-col animate-fade-in pb-10 overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-800 shrink-0">Executive Overview</h1>
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-3 gap-6 shrink-0">
        <KpiCard title="Critical Risks" value={criticalCount} color="border-red-500" />
        <KpiCard title="Noise Blocked" value={noiseCount} color="border-slate-400" />
        <KpiCard title="Pending Actions" value={pendingCount} color="border-blue-500" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-3 gap-6 h-72 shrink-0">
        <ChartCard title="Signal Efficiency">
            <PieChart>
              <Pie data={noiseSignalData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                {noiseSignalData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
            </PieChart>
        </ChartCard>

        <ChartCard title="Risk Distribution">
            <BarChart data={riskData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={45} />
            </BarChart>
        </ChartCard>

        <ChartCard title="Category Breakdown">
            <PieChart>
              <Pie data={domainData} innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                {domainData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
            </PieChart>
        </ChartCard>
      </div>

      {/* HIGH PRIORITY ACTION BOARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-sm uppercase tracking-wide">
          High Priority Action Board
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="p-4 font-bold w-1/4">Sender</th> {/* Widened Column */}
                <th className="p-4 font-bold w-1/6">Category</th>
                <th className="p-4 font-bold w-1/3">Recommended Action</th>
                <th className="p-4 font-bold text-center w-24">Risk</th>
                <th className="p-4 font-bold text-right">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highPriorityRows.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No high priority items.</td></tr>
              ) : (
                highPriorityRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors text-sm">
                    {/* FIXED: Removed truncate, added break-all to see full email */}
                    <td className="p-4 font-medium text-slate-900 break-all text-xs" title={row.sender}>
                      {row.sender}
                    </td>
                    <td className="p-4"><span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">{row.category}</span></td>
                    <td className="p-4 text-slate-600 leading-relaxed">{row.recommended_action}</td>
                    <td className="p-4 text-center"><span className={`font-bold ${row.risk_score >= 8 ? 'text-red-600' : 'text-amber-500'}`}>{row.risk_score}</span></td>
                    <td className="p-4 text-right text-slate-500 font-medium">{row.assignee}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${color}`}>
    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
    <div className="text-3xl font-bold text-slate-800 mt-2">{value}</div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
    <div className="flex-1 w-full min-h-0">
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  </div>
);

export default Dashboard;