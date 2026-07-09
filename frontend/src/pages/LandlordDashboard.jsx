import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios.js';

const CYAN = '#00f0ff';
const GRAY = '#374151';

function StatCard({ title, children, loading }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

function EmptyState({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-600 text-sm gap-2">
      <span className="text-3xl">📭</span>
      {msg || 'No data yet'}
    </div>
  );
}

export default function LandlordDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/analytics/landlord-stats/');
        setStats(res.data);
      } catch (err) {
        setError(err?.response?.data?.detail || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const revenueData = stats?.monthly_revenue ?? [];
  const occupancy = stats?.occupancy ?? null;
  const pendingCount = stats?.pending_count ?? 0;

  const pieData = occupancy
    ? [
        { name: 'Occupied', value: occupancy.occupied },
        { name: 'Vacant', value: occupancy.vacant },
      ]
    : [];

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <span className="text-brand-accent font-bold text-xl tracking-tighter">BoardPay</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Landlord Portal</span>
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">Landlord Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">Property & payment analytics overview.</p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Revenue — spans 2 cols */}
          <div className="lg:col-span-2">
            <StatCard title="Monthly Revenue (ZMW)" loading={loading}>
              {revenueData.length === 0 ? (
                <EmptyState msg="No revenue data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={55}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #1f2937',
                        borderRadius: '8px',
                        color: '#f9fafb',
                        fontSize: 12,
                      }}
                      formatter={(v) => [`ZMW ${Number(v).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill={CYAN} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </StatCard>
          </div>

          {/* Pending verifications */}
          <div>
            <StatCard title="Pending Verifications" loading={loading}>
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <span className={`text-6xl font-bold ${pendingCount > 0 ? 'text-brand-accent' : 'text-gray-600'}`}>
                  {pendingCount}
                </span>
                <p className="text-gray-400 text-sm">
                  {pendingCount === 0
                    ? 'All caught up!'
                    : `payment${pendingCount !== 1 ? 's' : ''} awaiting review`}
                </p>
              </div>
            </StatCard>
          </div>

          {/* Occupancy pie */}
          <div className="lg:col-span-1">
            <StatCard title="Occupancy Rate" loading={loading}>
              {pieData.length === 0 || (pieData[0].value === 0 && pieData[1].value === 0) ? (
                <EmptyState msg="No occupancy data yet" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      <Cell fill={CYAN} />
                      <Cell fill={GRAY} />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #1f2937',
                        borderRadius: '8px',
                        color: '#f9fafb',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </StatCard>
          </div>

          {/* Summary stats row */}
          {stats && (
            <>
              {stats.total_units != null && (
                <div>
                  <StatCard title="Total Units" loading={false}>
                    <div className="flex items-center justify-center h-24">
                      <span className="text-5xl font-bold text-white">{stats.total_units}</span>
                    </div>
                  </StatCard>
                </div>
              )}
              {stats.total_collected != null && (
                <div>
                  <StatCard title="Total Collected (ZMW)" loading={false}>
                    <div className="flex items-center justify-center h-24">
                      <span className="text-3xl font-bold text-brand-accent">
                        {Number(stats.total_collected).toLocaleString()}
                      </span>
                    </div>
                  </StatCard>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
