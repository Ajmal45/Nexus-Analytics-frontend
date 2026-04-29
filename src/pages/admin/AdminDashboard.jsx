import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHero from '../../components/PageHero';

const adminImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';

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
      <PageHero
        eyebrow="Admin Control"
        title="Platform overview for lead allocation, performance, and client activity."
        description="Track active lead entities, conversion momentum, and client growth from one cleaner control room."
        image={adminImage}
        stats={[
          { label: 'lead entities', value: String(stats.totalLeads) },
          { label: 'clients', value: String(stats.clients) },
          { label: 'avg conversion', value: `${stats.avgRate}%` }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Leads Entities" value={stats.totalLeads} icon={Target} color="blue" />
        <StatCard title="Total Converted" value={stats.converted} icon={TrendingUp} color="emerald" />
        <StatCard title="Avg Conversion %" value={`${stats.avgRate}%`} icon={Clock} color="purple" />
        <StatCard title="Active Clients" value={stats.clients} icon={Users} color="orange" />
      </div>

      <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Top Leads Conversion Rate</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.22)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(148,163,184,0.14)', boxShadow: '0 20px 45px -24px rgba(15, 23, 42, 0.28)', background: 'rgba(255,255,255,0.96)' }}
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
    <div className="rounded-[1.75rem] border border-[var(--border-strong)] bg-[var(--panel)] p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
}
