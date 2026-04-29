import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../../components/PageHero';

const userTaskImage = 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80';

export default function TaskPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get('/tasks')
      .then((response) => setTasks(response.data))
      .catch(() => toast.error('Failed to load tasks'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHero
        eyebrow="Assigned Tasks"
        title="Track the work your lead assigned to you in one clean read-only task view."
        description="Users can review instructions, priorities, statuses, and due dates here without being able to edit anyone’s tasks."
        image={userTaskImage}
        stats={[
          { label: 'tasks', value: String(tasks.length) },
          { label: 'access', value: 'Read-only' },
          { label: 'owner', value: 'Lead assigned' }
        ]}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </PageHero>

      <div className="grid gap-6 xl:grid-cols-2">
        {tasks.map((task) => (
          <div key={task._id} className="rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{task.title}</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Created by {task.leadOwnerName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-medium text-[var(--brand)]">{task.priority}</span>
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">{task.status}</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <p className="text-sm leading-7 text-[var(--text-primary)]">{task.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
            </div>
          </div>
        ))}

        {tasks.length === 0 ? (
          <div className="xl:col-span-2 rounded-[2rem] border border-dashed border-[var(--border-strong)] bg-[var(--panel)] px-6 py-16 text-center text-[var(--text-secondary)]">
            No tasks assigned to you yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
