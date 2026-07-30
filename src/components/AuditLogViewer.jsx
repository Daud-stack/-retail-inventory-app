import React, { useState, useMemo, useEffect } from 'react';
import { Shield, Search, Download, Trash2, Filter, Activity, Users, Clock, Hash } from 'lucide-react';
import { getAuditLogs, AUDIT_ACTIONS, exportAuditLogsCSV, exportAuditLogsJSON, clearAuditLogs } from '../services/auditLogger';

const AuditLogViewer = ({ currentUser }) => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL_TIME');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    // In a real app, this might be an async call
    setLogs(getAuditLogs() || []);
  }, []);

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('ADD')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (action.includes('LOGIN') || action.includes('SECURITY')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = search === '' || 
        Object.values(log).some(val => 
          String(val).toLowerCase().includes(search.toLowerCase())
        );
      
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      
      let matchesDate = true;
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (dateFilter === 'TODAY') {
        matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'LAST_7_DAYS') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        matchesDate = logDate >= sevenDaysAgo;
      } else if (dateFilter === 'LAST_30_DAYS') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        matchesDate = logDate >= thirtyDaysAgo;
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, search, actionFilter, dateFilter]);

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      clearAuditLogs();
      setLogs([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col space-y-6 text-slate-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Shield className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">System Audit Trail</h1>
            <p className="text-sm text-slate-400">Track and monitor all system activities and security events</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Hash size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Events</p>
            <p className="text-xl font-bold text-slate-100">{logs.length}</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-slate-800 rounded-lg text-emerald-400"><Activity size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Events Today</p>
            <p className="text-xl font-bold text-slate-100">
              {logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><Users size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Most Active User</p>
            <p className="text-sm font-bold text-slate-100 truncate">Admin</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-2 bg-slate-800 rounded-lg text-amber-400"><Clock size={20} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Monitoring Since</p>
            <p className="text-sm font-bold text-slate-100">
              {logs.length > 0 ? new Date(logs[logs.length-1].timestamp).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-200 rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="ALL">All Actions</option>
              {Object.keys(AUDIT_ACTIONS || {}).map(key => (
                <option key={key} value={AUDIT_ACTIONS[key]}>{key.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-950 rounded-xl border border-slate-800 p-1">
            {['ALL_TIME', 'TODAY', 'LAST_7_DAYS', 'LAST_30_DAYS'].map(range => (
              <button
                key={range}
                onClick={() => setDateFilter(range)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${dateFilter === range ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {range.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
          <button 
            onClick={exportAuditLogsCSV}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-xl transition-colors"
          >
            <Download size={16} /> CSV
          </button>
          <button 
            onClick={exportAuditLogsJSON}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-xl transition-colors"
          >
            <Download size={16} /> JSON
          </button>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <button 
              onClick={handleClearLogs}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-sm rounded-xl transition-colors border border-red-500/20"
            >
              <Trash2 size={16} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium w-full">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3 text-slate-400 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-200">{log.user}</td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 rounded-md">
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-300 font-medium">{log.target}</td>
                    <td className="px-6 py-3 text-slate-400 text-xs truncate max-w-xs xl:max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Shield size={32} className="opacity-20" />
                      <p>No audit logs found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
