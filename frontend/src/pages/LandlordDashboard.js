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
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  // Transform occupancy data for pie chart
  const occupancyData = [
    { name: 'Occupied', value: stats.occupancy?.occupied || 0 },
    { name: 'Vacant', value: stats.occupancy?.vacant || 0 }
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
            {stats.monthly_revenue && stats.monthly_revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stats.monthly_revenue}>
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
              <p className="text-6xl font-bold text-cyan-400 mb-2">{stats.pending_count}</p>
              <p className="text-gray-400 text-sm">payments awaiting verification</p>
            </div>
          </div>

          {/* Occupancy Rate Pie Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Occupancy Rate</h2>
            {occupancyData[0].value + occupancyData[1].value > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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
              <p className="text-3xl font-bold text-cyan-400">{stats.occupancy?.occupied || 0}</p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Vacant Units</h3>
              <p className="text-3xl font-bold text-red-400">{stats.occupancy?.vacant || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandlordDashboard;
