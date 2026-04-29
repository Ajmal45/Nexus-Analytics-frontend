import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, UserPlus, Trash2, Ban, CheckCircle2, X } from 'lucide-react';
import LeadFormFields from '../../components/LeadFormFields';
import PageHero from '../../components/PageHero';

const adminLeadImage = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectionRequests, setSelectionRequests] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [formData, setFormData] = useState({
    leadName: '',
    experience: '',
    leadsConverted: '',
    totalLeads: '',
    timeTakenDays: '',
    leadSource: 'Referral',
    status: 'Active',
    description: '',
    skills: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchSelectionRequests = async () => {
    try {
      const { data } = await api.get('/leads/selection-requests/all');
      setSelectionRequests(data);
    } catch (error) {
      toast.error('Failed to fetch lead requests');
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchSelectionRequests();
  }, []);

  const handleInputChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const buildLeadPayload = () => ({
    leadName: formData.leadName.trim(),
    experience: Number(formData.experience),
    leadsConverted: Number(formData.leadsConverted),
    totalLeads: Number(formData.totalLeads),
    timeTakenDays: Number(formData.timeTakenDays),
    leadSource: formData.leadSource,
    status: formData.status,
    description: formData.description?.trim() || '',
    skills: formData.skills,
    notes: formData.notes?.trim() || ''
  });

  const resetForm = () => {
    setFormData({
      leadName: '',
      experience: '',
      leadsConverted: '',
      totalLeads: '',
      timeTakenDays: '',
      leadSource: 'Referral',
      status: 'Active',
      description: '',
      skills: '',
      notes: ''
    });
    setIsEditing(false);
    setCurrentLead(null);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    try {
      const payload = buildLeadPayload();

      if (payload.leadsConverted > payload.totalLeads) {
        toast.error('Leads converted cannot be greater than total leads');
        return;
      }

      if (isEditing && currentLead) {
        await api.put(`/leads/${currentLead._id}`, payload);
        toast.success('Lead updated!');
      } else {
        await api.post('/leads', payload);
        toast.success('Lead added!');
      }

      setShowAddModal(false);
      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.details || 'Operation failed');
    }
  };

  const openEdit = (lead) => {
    setFormData({
      leadName: lead.leadName || '',
      experience: lead.experience ?? '',
      leadsConverted: lead.leadsConverted ?? '',
      totalLeads: lead.totalLeads ?? '',
      timeTakenDays: lead.timeTakenDays ?? '',
      leadSource: lead.leadSource || 'Referral',
      status: lead.status || 'Active',
      description: lead.description || '',
      skills: Array.isArray(lead.skills) ? lead.skills.join(', ') : (lead.skills || ''),
      notes: lead.notes || ''
    });
    setIsEditing(true);
    setCurrentLead(lead);
    setShowAddModal(true);
  };

  const toggleBlock = async (lead) => {
    try {
      await api.put(`/leads/${lead._id}`, {
        isBlocked: !lead.isBlocked,
        status: !lead.isBlocked ? 'Blocked' : 'Active'
      });
      toast.success(`Lead ${lead.isBlocked ? 'unblocked' : 'blocked'}`);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update block status');
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
      fetchSelectionRequests();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const openAssign = (lead) => {
    setCurrentLead(lead);
    setShowAssignModal(true);
  };

  const handleAssign = async (userId, userName) => {
    try {
      await api.post(`/leads/${currentLead._id}/assign`, { assignedTo: userId, assignedToName: userName });
      toast.success('Lead assigned successfully');
      setShowAssignModal(false);
      fetchLeads();
      fetchSelectionRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.details || 'Assignment failed');
    }
  };

  const handleSelectionDecision = async (requestId, status) => {
    try {
      await api.patch(`/leads/selection-requests/${requestId}/status`, { status });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchSelectionRequests();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.details || 'Failed to update request');
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Lead Management"
        title="Create, refine, and assign high-value leads with a better admin workflow."
        description="This control area combines lead creation, assignment, and approval handling so you can keep client delivery moving without losing visibility."
        image={adminLeadImage}
        stats={[
          { label: 'leads', value: String(leads.length) },
          { label: 'clients', value: String(users.filter((user) => user.role === 'user').length) },
          { label: 'requests', value: String(selectionRequests.length) }
        ]}
      >
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
        >
          <Plus size={18} /> Add Lead
        </button>
      </PageHero>

      <div className="overflow-x-auto rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <table className="w-full border-collapse whitespace-nowrap text-left">
          <thead>
            <tr className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-4 pl-6 pr-4">Lead / Source</th>
              <th className="px-4 py-4">Conv. Rate</th>
              <th className="px-4 py-4">Stats</th>
              <th className="px-4 py-4">Status / Assigned</th>
              <th className="py-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {leads.map((lead) => (
              <tr key={lead._id} className="transition-colors hover:bg-[var(--brand-soft)]/40">
                <td className="py-4 pl-6 pr-4">
                  <div className="font-semibold">{lead.leadName}</div>
                  <div className="text-xs text-[var(--text-secondary)]">{lead.leadSource}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${lead.conversionRate || 0}%` }} />
                    </div>
                    <span className="font-medium text-[var(--text-secondary)]">{lead.conversionRate?.toFixed(1) || 0}%</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-[var(--text-primary)]">{lead.leadsConverted} / {lead.totalLeads} cols</div>
                  <div className="text-xs text-[var(--text-secondary)]">{lead.timeTakenDays} days, {lead.experience}y exp</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1">
                    {lead.isBlocked ? (
                      <span className="flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        <Ban size={12} /> Blocked
                      </span>
                    ) : (
                      <span className={`rounded-lg border px-2 py-1 text-xs font-semibold ${
                        lead.status === 'Active'
                          ? 'border-blue-200 bg-blue-50 text-blue-700'
                          : lead.status === 'Closed'
                            ? 'border-gray-200 bg-gray-100 text-gray-700'
                            : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                      }`}>
                        {lead.status}
                      </span>
                    )}
                    {lead.assignedToName ? (
                      <span className="mt-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">Assigned to: {lead.assignedToName}</span>
                    ) : (
                      <span className="mt-1 rounded-md border border-[var(--border-soft)] bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">Unassigned</span>
                    )}
                  </div>
                </td>
                <td className="space-x-2 py-4 pr-6 text-right">
                  <button onClick={() => openEdit(lead)} className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"><Edit2 size={16} /></button>
                  <button onClick={() => openAssign(lead)} className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"><UserPlus size={16} /></button>
                  <button
                    onClick={() => toggleBlock(lead)}
                    className={`rounded-lg p-2 transition-colors ${lead.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}
                  >
                    {lead.isBlocked ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                  </button>
                  <button onClick={() => deleteLead(lead._id)} className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 p-6">
          <h2 className="text-xl font-semibold">Lead Selection Requests</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Approve or reject the requests that clients send from the user section.</p>
        </div>
        <div className="divide-y divide-[var(--border-soft)]">
          {selectionRequests.map((request) => (
            <div key={request._id} className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{request.leadName}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{request.clientName} | {request.clientEmail}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Lead source: {request.leadSource}</p>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    request.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : request.status === 'Rejected'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}>
                    {request.status}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Requested {new Date(request.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {request.adminNote ? (
                <div className="mt-4 rounded-xl bg-[var(--surface)] p-4 text-sm text-[var(--text-primary)]">
                  <span className="font-medium">Admin note:</span> {request.adminNote}
                </div>
              ) : null}

              {request.status === 'Pending' ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => handleSelectionDecision(request._id, 'Approved')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleSelectionDecision(request._id, 'Rejected')}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-700"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))}
          {selectionRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No lead selection requests yet.</div>
          ) : null}
        </div>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--panel)] p-4 shadow-2xl duration-200 animate-in zoom-in-95 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  Back
                </button>
                <h2 className="text-2xl font-bold">{isEditing ? 'Edit Lead' : 'Add New Lead'}</h2>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="self-end rounded-full bg-[var(--surface)] p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] sm:self-auto"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveLead} className="space-y-4">
              <LeadFormFields formData={formData} onChange={handleInputChange} />
              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-soft)] pt-4 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl px-5 py-2 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface)]">Cancel</button>
                <button type="submit" className="rounded-xl bg-[var(--brand)] px-5 py-2 font-medium text-white transition-colors hover:brightness-110">
                  {isEditing ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showAssignModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--panel)] p-4 shadow-2xl duration-200 animate-in zoom-in-95 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowAssignModal(false)} className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)]">
                  Back
                </button>
                <h2 className="text-xl font-bold">Assign to Client</h2>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="self-end rounded-full bg-[var(--surface)] p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] sm:self-auto"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              <p className="mb-4 border-b border-[var(--border-soft)] pb-2 text-sm text-[var(--text-secondary)]">
                Choose a client below to take ownership of <span className="font-semibold text-[var(--brand)]">{currentLead?.leadName}</span>.
              </p>
              {users.filter((user) => user.role === 'user').map((user) => (
                <div key={user._id} className="flex items-center justify-between rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--brand)]">
                  <div>
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{user.email}</div>
                  </div>
                  <button onClick={() => handleAssign(user._id, user.name)} className="rounded-lg bg-[var(--brand-soft)] px-4 py-1.5 text-sm font-medium text-[var(--brand)] transition-colors hover:brightness-95">
                    Assign
                  </button>
                </div>
              ))}
              {users.filter((user) => user.role === 'user').length === 0 ? (
                <div className="py-4 text-center text-gray-500">No clients found.</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
