import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../api/axios';

function LandlordDashboard() {
  const [stats, setStats] = useState({ monthlyRevenue: [], occupancy: [], pending: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // You'll need to create API endpoints to serve aggregated data.
    // For now, simulate with hardcoded structure.
    const revenueData = [
      { month: 'Jan', revenue: 4000 },
      { month: 'Feb', revenue: 3000 },
      // ... fetch from backend
    ];
    const occupancyData = [
      { name: 'Occupied', value: 85 },
      { name: 'Vacant', value: 15 },
    ];
    setStats({ monthlyRevenue: revenueData, occupancy: occupancyData, pending: 5 });
  };

  const COLORS = ['#00C49F', '#FFBB28'];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Landlord Dashboard</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h3>Monthly Revenue</h3>
          <BarChart width={400} height={300} data={stats.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Occupancy Rate</h3>
          <PieChart width={400} height={300}>
            <Pie data={stats.occupancy} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
              {stats.occupancy.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      <div>
        <p>Pending Verifications: {stats.pending}</p>
      </div>
    </div>
  );
}
export default LandlordDashboard;