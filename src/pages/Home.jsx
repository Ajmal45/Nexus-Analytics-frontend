import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, ChartColumnIncreasing, UsersRound } from 'lucide-react';
import heroImage from '../assets/hero.png';
import ThemeToggle from '../components/ThemeToggle';

const collaborationImage = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80';

const highlights = [
  {
    icon: BriefcaseBusiness,
    title: 'Lead Allocation',
    description: 'Admins create, prioritize, and assign qualified opportunities to the right clients.'
  },
  {
    icon: UsersRound,
    title: 'Client Collaboration',
    description: 'Clients share requirements, submit task details, and select the best current opportunities.'
  },
  {
    icon: ChartColumnIncreasing,
    title: 'Performance Visibility',
    description: 'Conversion-based lead insights help teams choose higher-value work with more confidence.'
  }
];

const metrics = [
  { label: 'Client-ready flow', value: 'End-to-end' },
  { label: 'Lead visibility', value: 'Live updates' },
  { label: 'Selection support', value: 'Performance filters' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-[24rem] w-[24rem] rounded-full bg-[var(--brand-soft)] blur-[120px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[28rem] w-[28rem] rounded-full bg-[var(--accent-soft)] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%)] dark:opacity-100" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-muted)]">Nexus Analytics</p>
          <h1 className="mt-2 text-xl font-semibold">Lead distribution for modern client teams</h1>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_var(--brand-shadow)] transition hover:opacity-95"
          >
            Login
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-14 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-20 lg:pt-10">
        <section className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--panel)] px-4 py-2 text-sm text-[var(--text-secondary)] shadow-sm">
            <BadgeCheck size={16} className="text-[var(--brand)]" />
            Better lead routing for admin and clients
          </div>

          <h2 className="mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em]">
            Assign the right leads, capture client needs, and move work faster.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
            Nexus Analytics helps teams manage lead pipelines with a cleaner workflow. Admins can add and assign leads,
            clients can share detailed requirements, and both sides can work from a more structured, professional dashboard.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-18px_var(--brand-shadow)] transition hover:opacity-95"
            >
              Continue To Login
              <ArrowRight size={16} />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center rounded-full border border-[var(--border-strong)] bg-[var(--panel)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--brand)]"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-[var(--border-soft)] bg-[var(--panel)] p-5 shadow-sm">
                <div className="text-2xl font-semibold">{metric.value}</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">{metric.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative">
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-[0_30px_80px_-32px_rgba(15,23,42,0.45)]">
            <div className="absolute inset-x-8 top-6 h-24 rounded-full bg-[var(--brand-soft)] blur-3xl" />
            <div className="relative grid gap-4 rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface)] p-4">
              <img
                src={heroImage}
                alt="Nexus Analytics dashboard preview"
                className="w-full rounded-[1.2rem] border border-[var(--border-soft)] object-cover shadow-sm"
              />
              <img
                src={collaborationImage}
                alt="Client and lead collaboration"
                className="h-40 w-full rounded-[1.2rem] border border-[var(--border-soft)] object-cover shadow-sm"
              />
            </div>
            <div className="relative mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Admin control</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Create, sort, and assign leads while reviewing live client requirements in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Client workspace</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Clients can filter high-performing leads and share project expectations before work begins.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section id="features" className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-3 lg:px-10">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-[1.75rem] border border-[var(--border-soft)] bg-[var(--panel)] p-7 shadow-sm">
              <div className="inline-flex rounded-2xl bg-[var(--surface)] p-3 text-[var(--brand)]">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{item.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
