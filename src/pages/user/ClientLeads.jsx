import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Briefcase, CheckCircle2, PencilLine, Sparkles, Star, TimerReset } from 'lucide-react';

const defaultForm = {
  description: '',
  skills: ''
};

export default function ClientLeads() {
  const [leads, setLeads] = useState([]);
  const [sortBy, setSortBy] = useState('best-performance');
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [detailForm, setDetailForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (error) {
      toast.error('Failed to load leads');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const assignedLeads = leads.filter((lead) => String(lead.assignedTo) === currentUser?.id);

  const displayedLeads = [...assignedLeads].sort((a, b) => {
    if (sortBy === 'best-performance') return (b.conversionRate || 0) - (a.conversionRate || 0);
    if (sortBy === 'highest-volume') return (b.totalLeads || 0) - (a.totalLeads || 0);
    if (sortBy === 'fastest-timeline') return (a.timeTakenDays || 0) - (b.timeTakenDays || 0);
    return (b.experience || 0) - (a.experience || 0);
  });

  const openEditor = (lead) => {
    setEditingLeadId(lead._id);
    setDetailForm({
      description: lead.description || '',
      skills: Array.isArray(lead.skills) ? lead.skills.join(', ') : ''
    });
  };

  const handleSaveDetails = async (leadId) => {
    try {
      setSaving(true);
      await api.patch(`/leads/${leadId}/client-details`, {
        description: detailForm.description,
        skills: detailForm.skills
      });
      toast.success('Lead details updated');
      setEditingLeadId(null);
      setDetailForm(defaultForm);
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update lead details');
    } finally {
      setSaving(false);
    }
  };

  const summaryCards = [
    { title: 'Assigned Leads', value: assignedLeads.length, icon: Briefcase, accent: 'text-blue-600 bg-blue-100' },
    { title: 'Top Performance', value: `${Math.max(...assignedLeads.map((lead) => lead.conversionRate || 0), 0).toFixed(1)}%`, icon: Star, accent: 'text-amber-600 bg-amber-100' },
    { title: 'Fastest Timeline', value: `${assignedLeads.length ? Math.min(...assignedLeads.map((lead) => lead.timeTakenDays || 0)) : 0} days`, icon: TimerReset, accent: 'text-emerald-600 bg-emerald-100' }
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-[var(--brand-soft)] p-4 text-[var(--brand)]">
            <Sparkles size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">My Leads Workspace</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Review assigned leads, compare performance, and add descriptions and skills for your work.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--panel)] p-6 shadow-sm">
              <div className={`inline-flex rounded-2xl p-3 ${card.accent}`}>
                <Icon size={20} />
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">{card.title}</p>
              <h2 className="mt-1 text-3xl font-semibold">{card.value}</h2>
            </div>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Lead Performance</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Sort your assigned leads and maintain their description and skills.</p>
          </div>
          <div className="min-w-[240px]">
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Sort Leads By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2 text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
            >
              <option value="best-performance">Best Performance</option>
              <option value="highest-volume">Highest Volume</option>
              <option value="fastest-timeline">Fastest Timeline</option>
              <option value="most-experienced">Most Experienced</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {displayedLeads.map((lead) => (
            <div key={lead._id} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{lead.leadName}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{lead.leadSource} | {lead.status}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <PerformancePill label="Conversion" value={`${lead.conversionRate?.toFixed(1) || 0}%`} />
                  <PerformancePill label="Experience" value={`${lead.experience} yrs`} />
                  <PerformancePill label="Timeline" value={`${lead.timeTakenDays} days`} />
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Description</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-primary)]">{lead.description || 'No description added yet.'}</p>
                </div>
                <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--panel)] p-4">
                  <p className="text-sm font-medium text-[var(--text-secondary)]">Skills</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lead.skills?.length ? lead.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
                        {skill}
                      </span>
                    )) : <span className="text-sm text-[var(--text-secondary)]">No skills added yet.</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => openEditor(lead)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <PencilLine size={16} />
                  Edit Description & Skills
                </button>
              </div>

              {editingLeadId === lead._id && (
                <div className="mt-5 rounded-[1.5rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5">
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Lead Description</label>
                      <textarea
                        rows="4"
                        value={detailForm.description}
                        onChange={(e) => setDetailForm((current) => ({ ...current, description: e.target.value }))}
                        className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">Skills</label>
                      <input
                        value={detailForm.skills}
                        onChange={(e) => setDetailForm((current) => ({ ...current, skills: e.target.value }))}
                        placeholder="React, Analytics, PDF export"
                        className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLeadId(null);
                          setDetailForm(defaultForm);
                        }}
                        className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleSaveDetails(lead._id)}
                        className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : 'Save Details'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {displayedLeads.length === 0 && (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-12 text-center text-[var(--text-secondary)]">
              No leads are assigned to you yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PerformancePill({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-center">
      <div className="text-xs uppercase tracking-[0.24em] text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 text-base font-semibold">{value}</div>
    </div>
  );
}
