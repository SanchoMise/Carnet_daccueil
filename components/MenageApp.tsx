'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { TaskGroup, allTasks, fillTemplate, formatLongDate } from '@/lib/menage';

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);
    const colors = ['#2D5A4B', '#C8A96E', '#E8F0ED', '#1A1916', '#7FB59F', '#E3C98F'];
    const pieces = Array.from({ length: 170 }, () => ({
      x: Math.random() * w,
      y: -Math.random() * h * 0.6,
      vx: (Math.random() - 0.5) * 3 * dpr,
      vy: (2 + Math.random() * 4) * dpr,
      size: (6 + Math.random() * 7) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    let frame = 0;
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      frame++;
      if (frame < 260) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="fixed inset-0 w-full h-full pointer-events-none z-50" />;
}

export default function MenageApp({
  code,
  person,
  date,
  time,
  duration,
  note,
  groups,
  initialDone,
  thanksTitle,
  thanksMessage,
}: {
  code: string;
  person: string;
  date: string;
  time: string;
  duration: string;
  note: string;
  groups: TaskGroup[];
  initialDone: string[];
  thanksTitle: string;
  thanksMessage: string;
}) {
  const tasks = allTasks(groups);
  const [done, setDone] = useState<Set<string>>(new Set(initialDone));
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);
  const complete = tasks.length > 0 && tasks.every((t) => done.has(t));
  const doneCount = tasks.filter((t) => done.has(t)).length;

  const toggle = async (task: string) => {
    const checked = !done.has(task);
    setDone((prev) => {
      const next = new Set(prev);
      checked ? next.add(task) : next.delete(task);
      return next;
    });
    setError('');
    try {
      const res = await fetch(`/api/menage/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, checked }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setDone((prev) => {
        const next = new Set(prev);
        checked ? next.delete(task) : next.add(task);
        return next;
      });
      setError("Impossible d'enregistrer, vérifiez votre connexion et réessayez.");
    }
  };

  const vars = { prenom: person, date: formatLongDate(date) };
  const showThanks = complete && !showList;

  return (
    <div className="min-h-screen">
      <header className="px-4 sm:px-8 h-14 flex items-center border-b border-border bg-bg/90">
        <span className="font-serif text-lg text-ink">Chez Cyrielle, Mara, Zélie et Bertrand 🌈</span>
      </header>

      <main className="max-w-[640px] mx-auto px-4 sm:px-8 pt-10 pb-24">
        {showThanks ? (
          <>
            <Confetti />
            <div className="bg-surface rounded-2xl border border-border p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="font-serif text-3xl text-ink mb-3">
                {fillTemplate(thanksTitle || 'Merci {prenom} !', vars)}
              </h1>
              <p className="text-ink-2 leading-relaxed whitespace-pre-line">
                {fillTemplate(
                  thanksMessage || 'Tout est coché : merci beaucoup pour votre travail.',
                  vars
                )}
              </p>
              <button
                onClick={() => setShowList(true)}
                className="mt-6 text-sm text-ink-3 underline underline-offset-2"
              >
                Revoir la liste
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-accent mb-3 before:content-[''] before:block before:w-5 before:h-px before:bg-accent">
              Ménage · {formatLongDate(date)}
            </div>
            <h1 className="font-serif text-[clamp(2rem,6vw,2.8rem)] leading-[1.1] tracking-tight text-ink mb-3">
              Bonjour <em className="not-italic italic text-accent">{person}</em>
            </h1>
            {(time || duration) && (
              <p className="text-ink-2 mb-5">
                {time && <>Rendez-vous à {time}</>}
                {time && duration && ' · '}
                {duration && <>environ {duration}</>}
              </p>
            )}
            {note && (
              <div className="bg-accent-light rounded-sm p-4 flex items-start gap-3 mb-6">
                <Icon name="key" className="w-5 h-5 text-accent shrink-0 mt-px" />
                <p className="text-[0.92rem] text-ink leading-relaxed whitespace-pre-line">{note}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between text-xs text-ink-3 mb-1.5">
                <span>
                  {doneCount} / {tasks.length}
                </span>
                {complete && (
                  <button className="underline underline-offset-2" onClick={() => setShowList(false)}>
                    Retour au message
                  </button>
                )}
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex flex-col gap-4">
              {groups.map((g, gi) => (
                <section key={gi} className="bg-surface rounded-2xl border border-border p-5">
                  {g.title && <h2 className="font-serif text-lg text-ink mb-3">{g.title}</h2>}
                  <ul className="flex flex-col gap-2.5">
                    {g.tasks.map((task) => {
                      const isDone = done.has(task);
                      return (
                        <li
                          key={task}
                          onClick={() => toggle(task)}
                          className={`flex items-start gap-3 text-[0.95rem] cursor-pointer select-none transition-colors ${
                            isDone ? 'text-ink-3 line-through' : 'text-ink-2'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-md border-[1.5px] flex items-center justify-center shrink-0 mt-px transition-all ${
                              isDone ? 'bg-accent border-accent' : 'bg-surface border-border'
                            }`}
                          >
                            {isDone && <Icon name="checkmark" className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span>{task}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
