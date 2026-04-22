import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalLeads: 0, converted: 0, avgRate: 0, clients: 0 });
  const [leads, setLeads] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, usersRes] = await Promise.all([
          api.get('/leads'),
          api.get('/users')
        ]);
        
        const allLeads = leadsRes.data;
        const total = allLeads.length;
        const converted = allLeads.reduce((acc, l) => acc + (l.leadsConverted || 0), 0);
        const totalRawLeads = allLeads.reduce((acc, l) => acc + (l.totalLeads || 0), 0);
        const avg = totalRawLeads === 0 ? 0 : ((converted / totalRawLeads) * 100).toFixed(1);

        setStats({
          totalLeads: total,
          converted,
          avgRate: avg,
          clients: usersRes.data.length
        });
        setLeads(allLeads);
      } catch (err) {
        console.error('Failed to fetch admin stats');
      }
    };
    fetchData();
  }, []);

  const chartData = leads.slice(0, 10).map(l => ({
    name: l.leadName.split(' ')[0], // short name
    rate: l.conversionRate || 0
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-gray-500">Welcome back. Here's what's happening with your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads Entities" value={stats.totalLeads} icon={Target} color="blue" />
        <StatCard title="Total Converted" value={stats.converted} icon={TrendingUp} color="emerald" />
        <StatCard title="Avg Conversion %" value={`${stats.avgRate}%`} icon={Clock} color="purple" />
        <StatCard title="Active Clients" value={stats.clients} icon={Users} color="orange" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-6">Top Leads Conversion Rate</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
}
