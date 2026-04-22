import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle2, Clock3, UserCheck } from 'lucide-react';

export default function ClientDashboard() {
  const [leads, setLeads] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [savingRequest, setSavingRequest] = useState(false);
  const [sortBy, setSortBy] = useState('best-performance');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [requestForm, setRequestForm] = useState({
    title: '',
    requirement: '',
    taskDetails: '',
    preferredLeadSource: 'Any',
    priority: 'Medium'
  });

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load current leads');
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/requests');
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load your requests');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchRequests();

    const intervalId = window.setInterval(() => {
      fetchLeads();
      fetchRequests();
    }, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const selectedLeads = leads.filter((lead) => lead.assignedTo && String(lead.assignedTo) === currentUser?.id);
  const availableLeads = leads.filter((lead) => !lead.assignedTo);
  const sourceOptions = ['all', ...new Set(leads.map((lead) => lead.leadSource).filter(Boolean))];

  const handleSelectLead = async (leadId) => {
    try {
      setLoadingId(leadId);
      await api.post(`/leads/${leadId}/select`);
      toast.success('Lead selected successfully');
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to select lead');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRequestInputChange = (e) => {
    setRequestForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      setSavingRequest(true);
      await api.post('/requests', {
        title: requestForm.title,
        requirement: requestForm.requirement,
        taskDetails: requestForm.taskDetails,
        preferredLeadSource: requestForm.preferredLeadSource,
        priority: requestForm.priority
      });
      toast.success('Requirement submitted successfully');
      setRequestForm({
        title: '',
        requirement: '',
        taskDetails: '',
        preferredLeadSource: 'Any',
        priority: 'Medium'
      });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit requirement');
    } finally {
      setSavingRequest(false);
    }
  };

  const stats = [
    { title: 'Current Leads', value: leads.length, icon: Briefcase, color: 'blue' },
    { title: 'Available To Pick', value: availableLeads.length, icon: Clock3, color: 'orange' },
    { title: 'My Selected Leads', value: selectedLeads.length, icon: UserCheck, color: 'emerald' },
  ];

  const displayedLeads = [...leads]
    .filter((lead) => {
      if (sourceFilter !== 'all' && lead.leadSource !== sourceFilter) {
        return false;
      }

      if (availabilityFilter === 'available' && lead.assignedTo) {
        return false;
      }

      if (availabilityFilter === 'selected-by-me' && String(lead.assignedTo) !== currentUser?.id) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'best-performance') {
        return (b.conversionRate || 0) - (a.conversionRate || 0);
      }

      if (sortBy === 'highest-volume') {
        return (b.totalLeads || 0) - (a.totalLeads || 0);
      }

      if (sortBy === 'most-experienced') {
        return (b.experience || 0) - (a.experience || 0);
      }

      if (sortBy === 'fastest-timeline') {
        return (a.timeTakenDays || 0) - (b.timeTakenDays || 0);
      }

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
        <div className="relative z-10 flex gap-4 items-center">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Briefcase size={32} className="text-blue-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Client Section</h1>
            <p className="text-blue-200 mt-1">See the current leads and select the ones you want to work with.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Share Requirements And Tasks</h2>
          <p className="text-sm text-gray-500 mt-1">Tell the admin what you need so leads can be assigned based on your request.</p>
        </div>
        <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirement Title</label>
              <input
                required
                name="title"
                value={requestForm.title}
                onChange={handleRequestInputChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Lead Source</label>
              <select
                name="preferredLeadSource"
                value={requestForm.preferredLeadSource}
                onChange={handleRequestInputChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {['Any', 'Referral', 'Cold Call', 'Online', 'Walk-in', 'Other'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
            <textarea
              required
              rows="3"
              name="requirement"
              value={requestForm.requirement}
              onChange={handleRequestInputChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Details</label>
            <textarea
              required
              rows="4"
              name="taskDetails"
              value={requestForm.taskDetails}
              onChange={handleRequestInputChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={requestForm.priority}
                onChange={handleRequestInputChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {['Low', 'Medium', 'High'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={savingRequest}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
            >
              {savingRequest ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">My Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Track the requests you have already shared with the admin.</p>
        </div>
        <div className="p-6 space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="border border-gray-200 rounded-2xl p-4 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Preferred source: {request.preferredLeadSource} | Priority: {request.priority}</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700 w-fit">{request.status}</span>
              </div>
              <p className="text-sm text-gray-700 mt-3"><span className="font-medium">Requirement:</span> {request.requirement}</p>
              <p className="text-sm text-gray-700 mt-2"><span className="font-medium">Task details:</span> {request.taskDetails}</p>
              <p className="text-xs text-gray-500 mt-3">Submitted on {new Date(request.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="text-center text-gray-500 py-8">No requests submitted yet.</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Current Leads</h2>
          <p className="text-sm text-gray-500 mt-1">Pick a lead to start working on it.</p>
        </div>
        <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row gap-4 md:items-end">
          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="best-performance">Best Performance</option>
              <option value="highest-volume">Highest Volume</option>
              <option value="most-experienced">Most Experienced</option>
              <option value="fastest-timeline">Fastest Timeline</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>

          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Current Leads</option>
              <option value="available">Available To Pick</option>
              <option value="selected-by-me">Selected By Me</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Client / Source</th>
                <th className="py-4 px-6">Experience</th>
                <th className="py-4 px-6">Work Volume</th>
                <th className="py-4 px-6">Performance</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {displayedLeads.map(l => (
                <tr key={l._id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{l.leadName}</div>
                    <div className="text-xs text-gray-500">{l.leadSource}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{l.experience} Yrs</td>
                  <td className="py-4 px-6 text-gray-600">
                    <div className="font-medium">{l.totalLeads} total leads</div>
                    <div className="text-xs text-gray-500">{l.timeTakenDays} days timeline</div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <div className="font-semibold text-gray-900">{l.conversionRate?.toFixed(1) || 0}%</div>
                    <div className="text-xs text-gray-500">{l.leadsConverted} converted</div>
                  </td>
                  <td className="py-4 px-6">
                    {String(l.assignedTo) === currentUser?.id ? (
                      <span className="px-3 py-1 text-xs rounded-full font-semibold bg-emerald-100 text-emerald-700">Selected By You</span>
                    ) : (
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${l.status==='Active' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {String(l.assignedTo) === currentUser?.id ? (
                      <div className="inline-flex items-center gap-2 text-emerald-700 font-medium">
                        <CheckCircle2 size={16} />
                        Working
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectLead(l._id)}
                        disabled={loadingId === l._id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {loadingId === l._id ? 'Selecting...' : 'Select To Work'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {displayedLeads.length === 0 && (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No current leads match this filter right now.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${color ? colors[color] : 'border-gray-100'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
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
