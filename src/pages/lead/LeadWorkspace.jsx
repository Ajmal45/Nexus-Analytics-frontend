import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit2, Gauge, Plus, Sparkles, Trash2, UserCircle2 } from 'lucide-react';
import LeadFormFields from '../../components/LeadFormFields';
import { useNavigate } from 'react-router-dom';

const defaultForm = {
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
};

export default function LeadWorkspace() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [editingLead, setEditingLead] = useState(null);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load your lead profiles');
    }
  };

  useEffect(() => {
    fetchLeads();
    api.get('/users/me').then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  const handleInputChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const buildPayload = () => ({
    leadName: formData.leadName.trim(),
    experience: Number(formData.experience),
    leadsConverted: Number(formData.leadsConverted),
    totalLeads: Number(formData.totalLeads),
    timeTakenDays: Number(formData.timeTakenDays),
    leadSource: formData.leadSource,
    status: formData.status,
    description: formData.description.trim(),
    skills: formData.skills,
    notes: formData.notes.trim()
  });

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingLead(null);
  };

  const openEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      leadName: lead.leadName || '',
      experience: lead.experience ?? '',
      leadsConverted: lead.leadsConverted ?? '',
      totalLeads: lead.totalLeads ?? '',
      timeTakenDays: lead.timeTakenDays ?? '',
      leadSource: lead.leadSource || 'Referral',
      status: lead.status || 'Active',
      description: lead.description || '',
      skills: Array.isArray(lead.skills) ? lead.skills.join(', ') : '',
      notes: lead.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload();
      if (payload.leadsConverted > payload.totalLeads) {
        toast.error('Leads converted cannot be greater than total leads');
        return;
      }

      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, payload);
        toast.success('Lead profile updated');
      } else {
        await api.post('/leads', payload);
        toast.success('Lead profile created');
      }

      resetForm();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.details || 'Failed to save lead profile');
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Delete this lead profile?')) return;
    try {
      await api.delete(`/leads/${leadId}`);
      toast.success('Lead profile deleted');
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete lead profile');
    }
  };

  const totalLeadsValue = leads.reduce((sum, lead) => sum + (lead.totalLeads || 0), 0);
  const totalConvertedValue = leads.reduce((sum, lead) => sum + (lead.leadsConverted || 0), 0);
  const averagePerformance = totalLeadsValue > 0 ? ((totalConvertedValue / totalLeadsValue) * 100).toFixed(1) : '0.0';
  const bestLead = leads.reduce((best, lead) => {
    if (!best || (lead.conversionRate || 0) > (best.conversionRate || 0)) return lead;
    return best;
  }, null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-8">
        <div className="mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[var(--brand-soft)] p-4 text-[var(--brand)]">
              <UserCircle2 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{profile?.name ? `${profile.name}'s Lead Page` : 'Lead Workspace'}</h1>
              <p className="mt-2 text-[var(--text-secondary)]">See your own account, review your performance, and add your professional lead data in one place.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            <Plus size={18} />
            Add Your Data
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--brand-soft)] p-3 text-[var(--brand)]">
              <UserCircle2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">My Account</h2>
              <p className="text-sm text-[var(--text-secondary)]">Your lead-role account details.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <InfoRow label="Name" value={profile?.name || 'Not set'} />
            <InfoRow label="Email" value={profile?.email || 'Not set'} />
            <InfoRow label="Phone" value={profile?.phone || 'Not set'} />
            <InfoRow label="Company" value={profile?.company || 'Not set'} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[var(--brand-soft)] p-3 text-[var(--brand)]">
              <Gauge size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">My Performance</h2>
              <p className="text-sm text-[var(--text-secondary)]">A quick summary of the performance data you have entered.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Profiles" value={String(leads.length)} />
            <MetricCard label="Avg Performance" value={`${averagePerformance}%`} />
            <MetricCard label="Best Lead" value={bestLead?.leadName || 'N/A'} />
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{editingLead ? 'Edit Your Data' : 'Add Your Data'}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Combine your lead details, skills, description, and performance metrics in this single form.</p>
          </div>
          {editingLead && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 overflow-hidden">
          <LeadFormFields formData={formData} onChange={handleInputChange} />

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-soft)] pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
              Clear
            </button>
            <button type="submit" className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
              {editingLead ? 'Save Changes' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {leads.map((lead) => (
          <div key={lead._id} className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{lead.leadName}</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{lead.leadSource} | {lead.status}</p>
              </div>
              <div className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Conversion</div>
                <div className="mt-1 text-2xl font-semibold text-[var(--brand)]">{lead.conversionRate?.toFixed(1) || 0}%</div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <MetricCard label="Experience" value={`${lead.experience} yrs`} />
              <MetricCard label="Converted" value={`${lead.leadsConverted}/${lead.totalLeads}`} />
              <MetricCard label="Timeline" value={`${lead.timeTakenDays} days`} />
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Description</p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-primary)]">{lead.description || 'No description added yet.'}</p>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Skills</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lead.skills?.length ? lead.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
                    {skill}
                  </span>
                )) : <span className="text-sm text-[var(--text-secondary)]">No skills added yet.</span>}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => openEdit(lead)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(lead._id)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel)] px-6 py-16 text-center text-[var(--text-secondary)] xl:col-span-2">
            No lead profiles created yet.
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
      <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 text-base font-semibold">{value}</div>
    </div>
  );
}
