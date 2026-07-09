import React, { useState } from 'react';
import { Shield, Download, Filter, Search, ChevronRight } from 'lucide-react';

export default function AuditTrail() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Sample audit trail data - will be replaced with API calls
  const auditEntries = [
    {
      id: 1,
      date: '09/Jul/2025',
      tenant: 'Leticia M.',
      room: '101',
      amount: '2500 ZMW',
      reference: 'bn8f_3d4c0d00570',
      status: 'verified',
      onChainHash: '0x8d2f...7a42',
      timestamp: '14:32 UTC'
    },
    {
      id: 2,
      date: '08/Jul/2025',
      tenant: 'Leticia M.',
      room: '101',
      amount: '2500 ZMW',
      reference: 'bn8f_3d4c0d00570',
      status: 'verified',
      onChainHash: '0x3cf1...92b8',
      timestamp: '09:15 UTC'
    },
    {
      id: 3,
      date: '07/Jul/2025',
      tenant: 'Leticia M.',
      room: '101',
      amount: '2360 ZMW',
      reference: 'bn8f_3d4c0d00570',
      status: 'verified',
      onChainHash: '0x5e7a...c1d9',
      timestamp: '16:48 UTC'
    },
    {
      id: 4,
      date: '01/Jul/2025',
      tenant: 'Leticia M.',
      room: '101',
      amount: '2360 ZMW',
      reference: 'bn8f_3d4c0d00570',
      status: 'verified',
      onChainHash: '0x2f9b...e6a3',
      timestamp: '11:22 UTC'
    },
    {
      id: 5,
      date: '28/Jun/2025',
      tenant: 'Leticia M.',
      room: '101',
      amount: '2360 ZMW',
      reference: 'bn8f_3d4c0d00570',
      status: 'verified',
      onChainHash: '0x7c4d...9f52',
      timestamp: '13:45 UTC'
    },
    {
      id: 6,
      date: '27/Jun/2025',
      tenant: 'Leticia M.',
      room: '101',
      amount: '2360 ZMW',
      reference: 'bn8f_3d4c0d00570',
      status: 'verified',
      onChainHash: '0x1a8e...4b71',
      timestamp: '10:09 UTC'
    }
  ];

  const filteredEntries = auditEntries.filter(entry => {
    const matchesSearch = 
      entry.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.room.includes(searchTerm) ||
      entry.reference.includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Immutable Audit Trail
          </h2>
          <p className="text-sm text-slate-400 mt-1">Permanent on-chain records of all verified payments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-lg text-sm text-slate-300 transition-all">
          <Download className="w-4 h-4" />
          Export Log
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records</p>
          <p className="text-2xl font-bold text-cyan-400 mt-2">{auditEntries.length}</p>
          <p className="text-xs text-slate-500 mt-1">All verified & immutable</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value</p>
          <p className="text-2xl font-bold text-green-400 mt-2">14,800 ZMW</p>
          <p className="text-xs text-slate-500 mt-1">Recorded on-chain</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
          <p className="text-2xl font-bold text-green-400 mt-2">Dispute-Free</p>
          <p className="text-xs text-slate-500 mt-1">Zero disputes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by tenant, room, or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:border-cyan-500/50 focus:outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Chain Hash</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <div className="font-medium">{entry.date}</div>
                    <div className="text-xs text-slate-500">{entry.timestamp}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{entry.tenant}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">Rm {entry.room}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-cyan-400">{entry.amount}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">{entry.reference}</td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-white/5 px-2.5 py-1 rounded border border-white/10 text-slate-300 font-mono">
                      {entry.onChainHash}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <span className="text-sm text-green-400 font-semibold">Verified</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400">No audit records found</p>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-cyan-300">Immutable & Permanent</p>
          <p className="text-sm text-slate-300 mt-1">Every verified payment is hashed and permanently recorded on-chain. All records are cryptographically signed and cannot be altered, ensuring complete transparency and dispute resolution.</p>
        </div>
      </div>
    </div>
  );
}
