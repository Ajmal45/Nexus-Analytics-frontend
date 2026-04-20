import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, LogOut } from 'lucide-react';

const salesData = [
  { name: 'Jan', sales: 4000, profit: 2400 },
  { name: 'Feb', sales: 3000, profit: 1398 },
  { name: 'Mar', sales: 2000, profit: 9800 },
  { name: 'Apr', sales: 2780, profit: 3908 },
  { name: 'May', sales: 1890, profit: 4800 },
  { name: 'Jun', sales: 2390, profit: 3800 },
  { name: 'Jul', sales: 3490, profit: 4300 },
];

const productData = [
  { name: 'Product A', units: 400 },
  { name: 'Product B', units: 300 },
  { name: 'Product C', units: 300 },
  { name: 'Product D', units: 200 },
];

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', paddingRight: '1rem', paddingLeft: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, textAlign: 'left', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>Sales Analytics Overview</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontSize: '0.9rem' }}>Track your product performance and daily revenue</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/users" className="btn" style={{ margin: 0, padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Manage Users
          </Link>
          <button className="btn btn-secondary" style={{ margin: 0, padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { title: 'Total Revenue', value: '$84,234', change: '+12.5%', icon: <DollarSign size={24} color="#10b981" /> },
          { title: 'Active Users', value: '1,234', change: '+5.2%', icon: <Users size={24} color="#3b82f6" /> },
          { title: 'Sales Growth', value: '+24.5%', change: '+2.4%', icon: <TrendingUp size={24} color="#8b5cf6" /> },
          { title: 'Active Sessions', value: '432', change: '-1.5%', icon: <Activity size={24} color="#f59e0b" /> },
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.5rem', width: '100%', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{kpi.title}</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 600 }}>{kpi.value}</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                {kpi.icon}
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: kpi.change.startsWith('+') ? '#10b981' : '#ef4444' }}>
              {kpi.change} <span style={{ color: '#64748b' }}>from last month</span>
            </p>
          </div>
        ))}
      </div>

      {/* Charts Container */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ width: '100%', margin: 0, padding: 'clamp(1rem, 3vw, 2rem)', flex: 2, overflowX: 'hidden' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>Revenue & Profit Over Time</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ width: '100%', margin: 0, padding: 'clamp(1rem, 3vw, 2rem)', flex: 1, overflowX: 'hidden' }}>
          <h3 style={{ marginBottom: '1.5rem', fontWeight: 600, fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>Top Selling Products</h3>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={75} tick={{fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="units" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
