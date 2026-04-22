import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Mail, Clock, ShieldCheck } from 'lucide-react';

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users & Clients</h1>
        <p className="text-gray-500">Manage all registered entities on the platform</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Email</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm text-gray-700 font-medium">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold">
                      {u.name.charAt(0)}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-gray-500">
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
                  <div className="flex items-center gap-2 text-gray-500">
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Client Requirements & Tasks</h2>
          <p className="text-gray-500 text-sm mt-1">Review what each client needs before assigning the right lead.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {requests.map((request) => (
            <div key={request._id} className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{request.clientName} | {request.clientEmail}</p>
                </div>
                <div className="flex flex-col md:items-end gap-2">
                  <span className="px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700 w-fit">{request.priority} Priority</span>
                  <select
                    value={request.status}
                    onChange={(e) => updateRequestStatus(request._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  >
                    {['New', 'Reviewed', 'Assigned', 'Completed'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Requirement</p>
                  <p className="text-sm text-gray-600">{request.requirement}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Task Details</p>
                  <p className="text-sm text-gray-600">{request.taskDetails}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-4 text-sm text-gray-500">
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
