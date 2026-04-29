import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle2, Clock3, UserCheck } from 'lucide-react';
import PageHero from '../../components/PageHero';

const clientImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';

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
      <PageHero
        eyebrow="Client Workspace"
        title="Review live leads, send approval requests, and share project expectations clearly."
        description="Choose opportunities by performance, tell the admin what your project needs, and track every request from one polished workspace."
        image={clientImage}
        stats={[
          { label: 'current leads', value: String(leads.length) },
          { label: 'available', value: String(availableLeads.length) },
          { label: 'pending', value: String(pendingLeadRequests.length) }
        ]}
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm text-white/85">
          <Briefcase size={16} />
          Lead matching guided by conversion performance
        </div>
      </PageHero>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        ))}
      </div>

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 p-6">
          <h2 className="text-lg font-semibold">Lead Requests</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">When you click `Select To Work`, the admin will see it here and decide whether to approve it.</p>
        </div>
        <div className="space-y-4 p-6">
          {leadRequests.map((request) => (
            <div key={request._id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold">{request.leadName}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Source: {request.leadSource}</p>
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
                <p className="mt-3 text-sm text-[var(--text-primary)]"><span className="font-medium">Admin note:</span> {request.adminNote}</p>
              ) : null}
              <p className="mt-3 text-xs text-[var(--text-muted)]">Requested on {new Date(request.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {leadRequests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No lead requests sent yet.</div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 p-6">
          <h2 className="text-lg font-semibold">Share Requirements And Tasks</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Tell the admin what you need so leads can be assigned based on your request.</p>
        </div>
        <form onSubmit={handleSubmitRequest} className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Requirement Title</label>
              <input
                required
                name="title"
                value={requestForm.title}
                onChange={handleRequestInputChange}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Preferred Lead Source</label>
              <select
                name="preferredLeadSource"
                value={requestForm.preferredLeadSource}
                onChange={handleRequestInputChange}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
              >
                {['Any', 'Referral', 'Cold Call', 'Online', 'Walk-in', 'Other'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Requirements</label>
            <textarea
              required
              rows="3"
              name="requirement"
              value={requestForm.requirement}
              onChange={handleRequestInputChange}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Task Details</label>
            <textarea
              required
              rows="4"
              name="taskDetails"
              value={requestForm.taskDetails}
              onChange={handleRequestInputChange}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Priority</label>
              <select
                name="priority"
                value={requestForm.priority}
                onChange={handleRequestInputChange}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
              >
                {['Low', 'Medium', 'High'].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={savingRequest}
              className="rounded-xl bg-[var(--brand)] px-5 py-2.5 font-medium text-white transition-colors hover:brightness-110 disabled:opacity-60"
            >
              {savingRequest ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 p-6">
          <h2 className="text-lg font-semibold">My Requests</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Track the requirements and tasks you have already shared with the admin.</p>
        </div>
        <div className="space-y-4 p-6">
          {requests.map((request) => (
            <div key={request._id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold">{request.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">Preferred source: {request.preferredLeadSource} | Priority: {request.priority}</p>
                </div>
                <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{request.status}</span>
              </div>
              <p className="mt-3 text-sm text-[var(--text-primary)]"><span className="font-medium">Requirement:</span> {request.requirement}</p>
              <p className="mt-2 text-sm text-[var(--text-primary)]"><span className="font-medium">Task details:</span> {request.taskDetails}</p>
              <p className="mt-3 text-xs text-[var(--text-muted)]">Submitted on {new Date(request.createdAt).toLocaleString()}</p>
            </div>
          ))}
          {requests.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No requests submitted yet.</div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 p-6">
          <h2 className="text-lg font-semibold">Current Leads</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Pick a lead and send it to the admin for approval.</p>
        </div>
        <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] bg-[var(--panel)] p-6 md:flex-row md:items-end">
          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              <option value="best-performance">Best Performance</option>
              <option value="highest-volume">Highest Volume</option>
              <option value="most-experienced">Most Experienced</option>
              <option value="fastest-timeline">Fastest Timeline</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>

          <div className="min-w-[200px]">
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source === 'all' ? 'All Sources' : source}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
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
              <tr className="border-b border-[var(--border-soft)] bg-[var(--panel)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
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
                  <tr key={lead._id} className="transition-colors hover:bg-[var(--brand-soft)]/40">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{lead.leadName}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{lead.leadSource}</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{lead.experience} Yrs</td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <div className="font-medium">{lead.totalLeads} total leads</div>
                      <div className="text-xs text-[var(--text-muted)]">{lead.timeTakenDays} days timeline</div>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                      <div className="font-semibold">{lead.conversionRate?.toFixed(1) || 0}%</div>
                      <div className="text-xs text-[var(--text-muted)]">{lead.leadsConverted} converted</div>
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
                          className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110 disabled:opacity-60"
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
    <div className={`rounded-[1.75rem] border bg-[var(--panel)] p-6 shadow-sm ${color ? colors[color] : 'border-[var(--border-strong)]'}`}>
      <div className="flex items-center gap-4">
        <div className={`rounded-xl p-3 ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
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
