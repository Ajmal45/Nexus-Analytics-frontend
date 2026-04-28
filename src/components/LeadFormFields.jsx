import React from 'react';

export default function LeadFormFields({ formData, onChange }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Lead Name" name="leadName" value={formData.leadName} onChange={onChange} required />
        <FormField label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={onChange} required />
        <FormField label="Total Leads" name="totalLeads" type="number" value={formData.totalLeads} onChange={onChange} required />
        <FormField label="Leads Converted" name="leadsConverted" type="number" value={formData.leadsConverted} onChange={onChange} required />
        <FormField label="Time Taken (Days)" name="timeTakenDays" type="number" value={formData.timeTakenDays} onChange={onChange} required />
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary,#374151)]">Source</label>
          <select
            name="leadSource"
            value={formData.leadSource}
            onChange={onChange}
            className="w-full rounded-xl border border-[var(--border-strong,#d1d5db)] bg-[var(--surface,#f9fafb)] px-4 py-3 text-[var(--text-primary,#111827)] focus:border-[var(--brand,#2563eb)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft,#bfdbfe)]"
          >
            {['Referral', 'Cold Call', 'Online', 'Walk-in', 'Other'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary,#374151)]">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className="w-full rounded-xl border border-[var(--border-strong,#d1d5db)] bg-[var(--surface,#f9fafb)] px-4 py-3 text-[var(--text-primary,#111827)] focus:border-[var(--brand,#2563eb)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft,#bfdbfe)]"
          >
            {['Active', 'Pending', 'Closed', 'Blocked'].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
      </div>

      <TextAreaField label="Notes" name="notes" value={formData.notes || ''} onChange={onChange} rows={4} />
      <TextAreaField label="Lead Description" name="description" value={formData.description || ''} onChange={onChange} rows={4} />
      <FormField label="Skills" name="skills" value={formData.skills || ''} onChange={onChange} placeholder="React, Analytics, Sales" />
    </>
  );
}

function FormField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary,#374151)]">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl border border-[var(--border-strong,#d1d5db)] bg-[var(--surface,#f9fafb)] px-4 py-3 text-[var(--text-primary,#111827)] focus:border-[var(--brand,#2563eb)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft,#bfdbfe)]"
      />
    </div>
  );
}

function TextAreaField({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary,#374151)]">{label}</label>
      <textarea
        {...props}
        className="w-full rounded-xl border border-[var(--border-strong,#d1d5db)] bg-[var(--surface,#f9fafb)] px-4 py-3 text-[var(--text-primary,#111827)] focus:border-[var(--brand,#2563eb)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft,#bfdbfe)]"
      />
    </div>
  );
}
