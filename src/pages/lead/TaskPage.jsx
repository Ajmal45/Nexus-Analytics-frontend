import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, ClipboardList, Edit2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../../components/PageHero';

const taskImage = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80';

const defaultForm = {
  title: '',
  description: '',
  assignedUserId: '',
  priority: 'Medium',
  status: 'Open',
  dueDate: ''
};

export default function TaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const { data } = await api.get('/tasks/assignable-users');
      setAssignableUsers(data);
      setFormData((current) => ({
        ...current,
        assignedUserId: current.assignedUserId || data[0]?._id || ''
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load assignable users');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAssignableUsers();
  }, []);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      ...defaultForm,
      assignedUserId: assignableUsers[0]?._id || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        dueDate: formData.dueDate || null
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
        toast.success('Task updated');
      } else {
        await api.post('/tasks', payload);
        toast.success('Task created');
      }

      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.details || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedUserId: task.assignedUserId || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Open',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      if (editingTask?._id === taskId) {
        resetForm();
      }
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHero
        eyebrow="Lead Tasks"
        title="Create focused delivery tasks for the users connected to your own leads."
        description="This task board keeps lead ownership clear. You can create, edit, and assign work only inside your own lead network."
        image={taskImage}
        stats={[
          { label: 'tasks', value: String(tasks.length) },
          { label: 'assignable users', value: String(assignableUsers.length) },
          { label: 'mode', value: editingTask ? 'Editing' : 'Creating' }
        ]}
      >
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
          >
            <Plus size={18} />
            New Task
          </button>
        </div>
      </PageHero>

      <div className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Users can view these tasks, but they cannot edit them.</p>
          </div>
          {editingTask ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        {assignableUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-10 text-center text-sm text-[var(--text-secondary)]">
            No connected users found yet. A user must be assigned to one of your leads before you can create tasks for them.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Task Title">
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3"
                />
              </Field>
              <Field label="Assign To">
                <select
                  required
                  name="assignedUserId"
                  value={formData.assignedUserId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3"
                >
                  {assignableUsers.map((user) => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3"
                >
                  {['Low', 'Medium', 'High'].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3"
                >
                  {['Open', 'In Progress', 'Completed'].map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </Field>
              <Field label="Due Date">
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                required
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3"
              />
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-soft)] pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
                Clear
              </button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving...' : editingTask ? 'Save Task' : 'Create Task'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {tasks.map((task) => (
          <div key={task._id} className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{task.title}</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Assigned to {task.assignedUserName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{task.priority}</Badge>
                <Badge tone="muted">{task.status}</Badge>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-sm leading-7 text-[var(--text-primary)]">{task.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => openEdit(task)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(task._id)}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}

        {tasks.length === 0 ? (
          <div className="xl:col-span-2 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel)] px-6 py-16 text-center text-[var(--text-secondary)]">
            No tasks created yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      {children}
    </div>
  );
}

function Badge({ children, tone = 'brand' }) {
  const className = tone === 'muted'
    ? 'bg-[var(--surface)] text-[var(--text-secondary)]'
    : 'bg-[var(--brand-soft)] text-[var(--brand)]';

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{children}</span>;
}
