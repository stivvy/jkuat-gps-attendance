import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, CheckCircle, XCircle, Calendar, BookOpen } from 'lucide-react';
import moment from 'moment';

const TOTAL_WEEKS = 14;
const UNITS = [
  { code: "HPS 2413", name: "Entrepreneurship Skills" },
  { code: "HPS 2409", name: "Principles of Logistics Management" },
  { code: "HPS 2410", name: "E-Procurement Management" },
  { code: "HPS 2411", name: "Management Accounting" },
  { code: "HPS 2408", name: "Employee & Industrial Relations" },
  { code: "HPS 2412", name: "Supply Chain Performance Management" },
];

export default function Reports() {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('summary'); // summary | history

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const allLogs = u.role === 'admin'
        ? await base44.entities.AttendanceLog.filter({ status: 'present' }, '-signed_at', 200)
        : await base44.entities.AttendanceLog.filter({ student_email: u.email, status: 'present' }, '-signed_at', 200);
      setLogs(allLogs);
      setLoading(false);
    });
  }, []);

  const unitStats = UNITS.map(u => {
    const attended = logs.filter(l => l.unit_code === u.code).length;
    const required = Math.ceil(TOTAL_WEEKS * (2 / 3));
    const pct = Math.min(Math.round((attended / TOTAL_WEEKS) * 100), 100);
    return { ...u, attended, required, pct, safe: attended >= required };
  });

  const overallAttended = logs.length;
  const overallPct = Math.round((overallAttended / (TOTAL_WEEKS * UNITS.length)) * 100);

  const chartData = unitStats.map(u => ({
    name: u.code.replace('HPS ', ''),
    attended: u.attended,
    required: u.required,
  }));

  const recentLogs = [...logs].sort((a, b) => new Date(b.signed_at) - new Date(a.signed_at)).slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp size={24} /> Attendance Reports</h1>
          <p className="text-blue-200 text-sm mt-1">BPCM 4.2 — Feb to May 2026</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : (
          <>
            {/* Overall card */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-5 shadow-md mb-6">
              <p className="text-green-200 text-sm">Overall Attendance Rate</p>
              <p className="text-5xl font-black mt-1">{overallPct}%</p>
              <div className="mt-3 bg-white/20 rounded-full h-2.5">
                <div className="bg-white rounded-full h-2.5 transition-all" style={{ width: `${overallPct}%` }} />
              </div>
              <p className="text-green-200 text-xs mt-2">{overallAttended} classes attended — minimum 2/3 required per unit</p>
            </div>

            {/* Tab toggle */}
            <div className="flex bg-gray-200 rounded-xl p-1 mb-6">
              <button onClick={() => setView('summary')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'summary' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Unit Summary</button>
              <button onClick={() => setView('history')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${view === 'history' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>History</button>
            </div>

            {view === 'summary' ? (
              <>
                {/* Bar Chart */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">Classes Attended per Unit</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} barGap={4}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="attended" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.attended >= entry.required ? '#16a34a' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Unit cards */}
                <div className="space-y-3">
                  {unitStats.map((u, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-sm text-gray-800">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.code}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${u.safe ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {u.safe ? '✓ On track' : '⚠ At risk'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${u.safe ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${u.pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{u.attended}/{TOTAL_WEEKS}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {recentLogs.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
                    <p>No attendance records yet</p>
                  </div>
                ) : (
                  recentLogs.map((log, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${log.status === 'present' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {log.status === 'present' ? <CheckCircle size={20} className="text-green-600" /> : <XCircle size={20} className="text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{log.unit_name}</p>
                        <p className="text-xs text-gray-500">{log.unit_code}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />{moment(log.date).format('ddd, MMM D YYYY')} • {moment(log.signed_at).format('HH:mm')}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${log.status === 'present' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {log.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}