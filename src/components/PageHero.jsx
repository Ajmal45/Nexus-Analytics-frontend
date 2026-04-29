import React from 'react';

export default function PageHero({ eyebrow, title, description, image, stats = [], accent = 'from-[#0f4c81] via-[#1f6f9b] to-[#2ea38f]', children }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[var(--border-strong)] bg-[var(--panel)] p-5 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.35)] sm:p-8">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-[0.97]`} />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,20,32,0.72),rgba(5,20,32,0.34)_46%,rgba(255,255,255,0.08)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_22%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="text-white">
          {eyebrow ? (
            <div className="inline-flex rounded-full border border-white/25 bg-black/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-white/90 backdrop-blur">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/84 sm:text-base">{description}</p>
          {children ? <div className="mt-6">{children}</div> : null}
          {stats.length > 0 ? (
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/18 bg-black/15 p-4 backdrop-blur">
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className="mt-2 text-xs uppercase tracking-[0.24em] text-white/78">{stat.label}</div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <div className="absolute inset-x-8 top-8 h-20 rounded-full bg-white/25 blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/18 bg-black/15 p-3 backdrop-blur">
            <img src={image} alt={title} className="h-[260px] w-full rounded-[1.25rem] object-cover shadow-xl shadow-slate-950/20 sm:h-[320px]" />
          </div>
        </div>
      </div>
    </section>
  );
}
