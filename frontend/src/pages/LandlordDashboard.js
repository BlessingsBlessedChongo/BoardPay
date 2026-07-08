import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

function LandlordDashboard() {
  const [stats, setStats] = useState({
    monthly_revenue: [],
    occupancy: { occupied: 0, vacant: 0 },
    pending_count: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/landlord-stats/');
      const data = res?.data ?? {};
      
      // Validate and normalize stats
      const normalizedStats = {
        monthly_revenue: Array.isArray(data?.monthly_revenue) ? data.monthly_revenue : [],
        occupancy: {
          occupied: typeof data?.occupancy?.occupied === 'number' ? data.occupancy.occupied : 0,
          vacant: typeof data?.occupancy?.vacant === 'number' ? data.occupancy.vacant : 0
        },
        pending_count: typeof data?.pending_count === 'number' ? data.pending_count : 0
      };
      
      setStats(normalizedStats);
    } catch (error) {
      console.error('[LandlordDashboard] Failed to fetch stats:', error);
      setStats({
        monthly_revenue: [],
        occupancy: { occupied: 0, vacant: 0 },
        pending_count: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage?.removeItem?.('access_token');
      localStorage?.removeItem?.('refresh_token');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('[LandlordDashboard] Logout error:', err);
      navigate('/login', { replace: true });
    }
  };

  // Transform occupancy data for pie chart with defensive defaults
  const occupancyData = [
    { name: 'Occupied', value: Math.max(0, stats?.occupancy?.occupied ?? 0) },
    { name: 'Vacant', value: Math.max(0, stats?.occupancy?.vacant ?? 0) }
  ];

  const COLORS = ['#00f0ff', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Landlord Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-cyan-500 text-sm font-medium transition-colors"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400 text-lg">Loading dashboard...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Monthly Revenue</h2>
            {(stats?.monthly_revenue?.length ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.monthly_revenue ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #00f0ff',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f0f0f0' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#00f0ff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-400">No revenue data available</p>
              </div>
            )}
          </div>

          {/* Pending Verifications Card */}
          <div className="glass-card p-6 flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-white mb-4">Pending Verifications</h2>
            <div className="text-center">
              <p className="text-6xl font-bold text-cyan-400 mb-2">{stats?.pending_count ?? 0}</p>
              <p className="text-gray-400 text-sm">payments awaiting verification</p>
            </div>
          </div>

          {/* Occupancy Rate Pie Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Occupancy Rate</h2>
            {(occupancyData?.[0]?.value ?? 0) + (occupancyData?.[1]?.value ?? 0) > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={occupancyData ?? []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name ?? 'N/A'}: ${value ?? 0}`}
                  >
                    {occupancyData?.map?.((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS?.[index % (COLORS?.length ?? 1)] ?? '#00f0ff'} />
                    )) ?? null}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #00f0ff',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#f0f0f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-400">No occupancy data available</p>
              </div>
            )}
          </div>

          {/* Occupancy Stats Cards */}
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Occupied Units</h3>
              <p className="text-3xl font-bold text-cyan-400">{stats?.occupancy?.occupied ?? 0}</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Vacant Units</h3>
              <p className="text-3xl font-bold text-red-400">{stats?.occupancy?.vacant ?? 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandlordDashboard;
