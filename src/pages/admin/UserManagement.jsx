import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Mail, Clock, ShieldCheck } from 'lucide-react';
import PageHero from '../../components/PageHero';

const usersImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    api.get('/requests').then(res => setRequests(res.data)).catch(console.error);
  }, []);

  const updateRequestStatus = async (requestId, status) => {
    try {
      const { data } = await api.patch(`/requests/${requestId}/status`, { status });
      setRequests((current) => current.map((request) => request._id === requestId ? data : request));
      toast.success('Request status updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update request status');
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Users and Clients"
        title="Review platform members, client requests, and delivery expectations in one place."
        description="See who joined the system, what each client needs, and update requirement statuses before the next lead assignment happens."
        image={usersImage}
        stats={[
          { label: 'users', value: String(users.length) },
          { label: 'requests', value: String(requests.length) },
          { label: 'view', value: 'Admin only' }
        ]}
      />

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 text-sm font-medium text-[var(--text-muted)]">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)] text-sm font-medium text-[var(--text-primary)]">
            {users.map(u => (
              <tr key={u._id} className="transition-colors hover:bg-[var(--brand-soft)]/35">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Mail size={16} />
                    {u.email}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Clock size={16} />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-[1.9rem] border border-[var(--border-strong)] bg-[var(--panel)] shadow-sm">
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)]/80 p-6">
          <h2 className="text-xl font-semibold">Client Requirements & Tasks</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Review what each client needs before assigning the right lead.</p>
        </div>
        <div className="divide-y divide-[var(--border-soft)]">
          {requests.map((request) => (
            <div key={request._id} className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{request.clientName} | {request.clientEmail}</p>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <span className="px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700 w-fit">{request.priority} Priority</span>
                  <select
                    value={request.status}
                    onChange={(e) => updateRequestStatus(request._id, e.target.value)}
                    className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)]"
                  >
                    {['New', 'Reviewed', 'Assigned', 'Completed'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl bg-[var(--surface)] p-4">
                  <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Requirement</p>
                  <p className="text-sm text-[var(--text-primary)]">{request.requirement}</p>
                </div>
                <div className="rounded-xl bg-[var(--surface)] p-4">
                  <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">Task Details</p>
                  <p className="text-sm text-[var(--text-primary)]">{request.taskDetails}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 text-sm text-[var(--text-secondary)] md:flex-row">
                <span>Preferred source: {request.preferredLeadSource}</span>
                <span>Submitted: {new Date(request.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="p-8 text-center text-gray-500">No client requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
