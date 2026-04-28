import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle2, Clock3, UserCheck } from 'lucide-react';

export default function ClientDashboard() {
  const [leads, setLeads] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leadRequests, setLeadRequests] = useState([]);
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

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchLeads = async (showError = true) => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (error) {
      if (showError) toast.error('Failed to load current leads');
    }
  };

  const fetchRequests = async (showError = true) => {
    try {
      const { data } = await api.get('/requests');
      setRequests(data);
    } catch (error) {
      if (showError) toast.error('Failed to load your requests');
    }
  };

  const fetchLeadRequests = async (showError = true) => {
    try {
      const { data } = await api.get('/leads/selection-requests/all');
      setLeadRequests(data);
    } catch (error) {
      if (showError) toast.error('Failed to load your lead requests');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchRequests();
    fetchLeadRequests();

    const intervalId = window.setInterval(() => {
      fetchLeads(false);
      fetchRequests(false);
      fetchLeadRequests(false);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  const requestByLeadId = leadRequests.reduce((lookup, request) => {
    const key = String(request.leadId);
    if (!lookup[key]) {
      lookup[key] = request;
    }
    return lookup;
  }, {});

  const selectedLeads = leads.filter((lead) => lead.assignedTo && String(lead.assignedTo) === currentUser?.id);
  const availableLeads = leads.filter((lead) => !lead.assignedTo);
  const pendingLeadRequests = leadRequests.filter((request) => request.status === 'Pending');
  const sourceOptions = ['all', ...new Set(leads.map((lead) => lead.leadSource).filter(Boolean))];

  const handleSelectLead = async (leadId) => {
    try {
      setLoadingId(leadId);
      await api.post(`/leads/${leadId}/select`);
      toast.success('Lead request sent to admin');
      fetchLeadRequests(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send lead request');
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
      fetchRequests(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit requirement');
    } finally {
      setSavingRequest(false);
    }
  };

  const stats = [
    { title: 'Current Leads', value: leads.length, icon: Briefcase, color: 'blue' },
    { title: 'Available To Pick', value: availableLeads.length, icon: Clock3, color: 'orange' },
    { title: 'Pending Approval', value: pendingLeadRequests.length, icon: UserCheck, color: 'emerald' },
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

      if (availabilityFilter === 'pending-request' && requestByLeadId[String(lead._id)]?.status !== 'Pending') {
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-[80px]" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md">
            <Briefcase size={32} className="text-blue-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Client Section</h1>
            <p className="mt-1 text-blue-200">See the current leads, request the best ones, and wait for admin approval.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Lead Requests</h2>
          <p className="mt-1 text-sm text-gray-500">When you click `Select To Work`, the admin will see it here and decide whether to approve it.</p>
        </div>
        <div className="space-y-4 p-6">
          {leadRequests.map((request) => (
            <div key={request._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{request.leadName}</h3>
                  <p className="mt-1 text-sm text-gray-500">Source: {request.leadSource}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  request.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : request.status === 'Rejected'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                }`}>
                  {request.status}
                </span>
              </div>
              {request.adminNote ? (
                <p className="mt-3 text-sm text-gray-700"><span className="font-medium">Admin note:</span> {request.adminNote}</p>
              ) : null}
              <p className="mt-3 text-xs text-gray-500">Requested on {new Date(request.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {leadRequests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No lead requests sent yet.</div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Share Requirements And Tasks</h2>
          <p className="mt-1 text-sm text-gray-500">Tell the admin what you need so leads can be assigned based on your request.</p>
        </div>
        <form onSubmit={handleSubmitRequest} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Requirement Title</label>
              <input
                required
                name="title"
                value={requestForm.title}
                onChange={handleRequestInputChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Preferred Lead Source</label>
              <select
                name="preferredLeadSource"
                value={requestForm.preferredLeadSource}
                onChange={handleRequestInputChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Any', 'Referral', 'Cold Call', 'Online', 'Walk-in', 'Other'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Requirements</label>
            <textarea
              required
              rows="3"
              name="requirement"
              value={requestForm.requirement}
              onChange={handleRequestInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Task Details</label>
            <textarea
              required
              rows="4"
              name="taskDetails"
              value={requestForm.taskDetails}
              onChange={handleRequestInputChange}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={requestForm.priority}
                onChange={handleRequestInputChange}
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Low', 'Medium', 'High'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={savingRequest}
              className="rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {savingRequest ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">My Requests</h2>
          <p className="mt-1 text-sm text-gray-500">Track the requirements and tasks you have already shared with the admin.</p>
        </div>
        <div className="space-y-4 p-6">
          {requests.map((request) => (
            <div key={request._id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{request.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">Preferred source: {request.preferredLeadSource} | Priority: {request.priority}</p>
                </div>
                <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{request.status}</span>
              </div>
              <p className="mt-3 text-sm text-gray-700"><span className="font-medium">Requirement:</span> {request.requirement}</p>
              <p className="mt-2 text-sm text-gray-700"><span className="font-medium">Task details:</span> {request.taskDetails}</p>
              <p className="mt-3 text-xs text-gray-500">Submitted on {new Date(request.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {requests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No requests submitted yet.</div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Leads</h2>
          <p className="mt-1 text-sm text-gray-500">Pick a lead and send it to the admin for approval.</p>
        </div>
        <div className="flex flex-col gap-4 border-b border-gray-100 bg-white p-6 md:flex-row md:items-end">
          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="best-performance">Best Performance</option>
              <option value="highest-volume">Highest Volume</option>
              <option value="most-experienced">Most Experienced</option>
              <option value="fastest-timeline">Fastest Timeline</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>

          <div className="min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium text-gray-700">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Current Leads</option>
              <option value="available">Available To Pick</option>
              <option value="selected-by-me">Selected By Me</option>
              <option value="pending-request">Pending Approval</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-white text-xs font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4">Client / Source</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Work Volume</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {displayedLeads.map((lead) => {
                const leadRequest = requestByLeadId[String(lead._id)];
                const isAssignedToCurrentUser = String(lead.assignedTo) === currentUser?.id;

                return (
                  <tr key={lead._id} className="transition-colors hover:bg-blue-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{lead.leadName}</div>
                      <div className="text-xs text-gray-500">{lead.leadSource}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{lead.experience} Yrs</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium">{lead.totalLeads} total leads</div>
                      <div className="text-xs text-gray-500">{lead.timeTakenDays} days timeline</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-semibold text-gray-900">{lead.conversionRate?.toFixed(1) || 0}%</div>
                      <div className="text-xs text-gray-500">{lead.leadsConverted} converted</div>
                    </td>
                    <td className="px-6 py-4">
                      {isAssignedToCurrentUser ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Approved For You</span>
                      ) : leadRequest?.status === 'Pending' ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending Admin Approval</span>
                      ) : leadRequest?.status === 'Rejected' ? (
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Request Rejected</span>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          lead.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {lead.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isAssignedToCurrentUser ? (
                        <div className="inline-flex items-center gap-2 font-medium text-emerald-700">
                          <CheckCircle2 size={16} />
                          Working
                        </div>
                      ) : leadRequest?.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-2 font-medium text-amber-700">
                          <Clock3 size={16} />
                          Awaiting Approval
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectLead(lead._id)}
                          disabled={loadingId === lead._id}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                        >
                          {loadingId === lead._id ? 'Sending...' : 'Select To Work'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {displayedLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">No current leads match this filter right now.</td>
                </tr>
              ) : null}
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
    <div className={`rounded-2xl border bg-white p-6 shadow-sm ${color ? colors[color] : 'border-gray-100'}`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
}
