import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Plus, Edit2, UserPlus, Trash2, Ban, CheckCircle2, X } from 'lucide-react';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    leadName: '', experience: '', leadsConverted: '', totalLeads: '',
    timeTakenDays: '', leadSource: 'Referral', status: 'Active', notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/leads');
      setLeads(data);
    } catch (e) { toast.error('Failed to fetch leads'); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (e) { }
  };

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildLeadPayload = () => ({
    leadName: formData.leadName.trim(),
    experience: Number(formData.experience),
    leadsConverted: Number(formData.leadsConverted),
    totalLeads: Number(formData.totalLeads),
    timeTakenDays: Number(formData.timeTakenDays),
    leadSource: formData.leadSource,
    status: formData.status,
    notes: formData.notes?.trim() || '',
  });

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
    } catch (e) {
      toast.error(e.response?.data?.error || e.response?.data?.details || 'Operation failed');
    }
  };

  const resetForm = () => {
    setFormData({ leadName: '', experience: '', leadsConverted: '', totalLeads: '', timeTakenDays: '', leadSource: 'Referral', status: 'Active', notes: '' });
    setIsEditing(false);
    setCurrentLead(null);
  };

  const openEdit = (lead) => {
    setFormData({ ...lead });
    setIsEditing(true);
    setCurrentLead(lead);
    setShowAddModal(true);
  };

  const toggleBlock = async (lead) => {
    try {
      await api.put(`/leads/${lead._id}`, { isBlocked: !lead.isBlocked });
      toast.success(`Lead ${lead.isBlocked ? 'Unblocked' : 'Blocked'}`);
      fetchLeads();
    } catch (e) { toast.error('Failed to update block status'); }
  };

  const deleteLead = async (id) => {
    if(!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deleted');
      fetchLeads();
    } catch (e) { toast.error('Failed to delete'); }
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
    } catch (e) { toast.error(e.response?.data?.error || e.response?.data?.details || 'Assignment failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500">Add, configure, and assign leads to clients</p>
        </div>
        <button onClick={() => {resetForm(); setShowAddModal(true);}} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Plus size={18} /> Add Lead
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-4 pl-6">Lead / Source</th>
              <th className="py-4 px-4">Conv. Rate</th>
              <th className="py-4 px-4">Stats</th>
              <th className="py-4 px-4">Status / Assigned</th>
              <th className="py-4 px-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {leads.map(l => (
              <tr key={l._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-4 pl-6">
                  <div className="font-semibold text-gray-900">{l.leadName}</div>
                  <div className="text-xs text-gray-500">{l.leadSource}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{width: `${l.conversionRate}%`}} />
                    </div>
                    <span className="font-medium text-gray-700">{l.conversionRate?.toFixed(1) || 0}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 relative group">
                  <div className="text-gray-700">{l.leadsConverted} / {l.totalLeads} cols</div>
                  <div className="text-xs text-gray-500">{l.timeTakenDays} days, {l.experience}y exp</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1 items-start">
                    {l.isBlocked ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-semibold flex items-center gap-1"><Ban size={12}/> Blocked</span>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-lg font-semibold border ${l.status==='Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : l.status==='Closed' ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{l.status}</span>
                    )}
                    {l.assignedToName ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">Assigned to: {l.assignedToName}</span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md mt-1 border border-gray-100">Unassigned</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 pr-6 text-right space-x-2">
                  <button onClick={() => openEdit(l)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => openAssign(l)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><UserPlus size={16}/></button>
                  <button onClick={() => toggleBlock(l)} className={`p-2 rounded-lg transition-colors ${l.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-orange-600 hover:bg-orange-50'}`}>{l.isBlocked ? <CheckCircle2 size={16}/> : <Ban size={16}/>}</button>
                  <button onClick={() => deleteLead(l._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveLead} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Name</label>
                  <input required name="leadName" value={formData.leadName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                  <input required type="number" name="experience" value={formData.experience} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Leads</label>
                  <input required type="number" name="totalLeads" value={formData.totalLeads} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leads Converted</label>
                  <input required type="number" name="leadsConverted" value={formData.leadsConverted} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Taken (Days)</label>
                  <input required type="number" name="timeTakenDays" value={formData.timeTakenDays} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select name="leadSource" value={formData.leadSource} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {['Referral', 'Cold Call', 'Online', 'Walk-in', 'Other'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {['Active', 'Pending', 'Closed', 'Blocked'].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows="3" name="notes" value={formData.notes || ''} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors">{isEditing ? 'Save Changes' : 'Create Lead'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Assign to Client</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>
            <div className="space-y-2">
              <p className="text-sm border-b border-gray-100 pb-2 mb-4">Choose a client below to take ownership of <span className="font-semibold text-blue-600">{currentLead?.leadName}</span>.</p>
              {users.filter(u => u.role === 'user').map(u => (
                <div key={u._id} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl p-3 hover:border-blue-300 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </div>
                  <button onClick={() => handleAssign(u._id, u.name)} className="px-4 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium text-sm rounded-lg transition-colors">
                    Assign
                  </button>
                </div>
              ))}
              {users.length === 0 && <div className="text-center text-gray-500 py-4">No clients found.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
