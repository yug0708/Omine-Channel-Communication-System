import React, { useMemo, useState } from 'react';
import { useData } from '../hooks/useData';

function sameDay(iso: string, day: Date) {
  const d = new Date(iso);
  return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
}

const CalendarPage: React.FC = () => {
  const { tickets, contacts } = useData();
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = useMemo(() => {
    const list: Array<Date | null> = Array.from({ length: firstWeekday }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) list.push(new Date(year, month, day));
    return list;
  }, [firstWeekday, daysInMonth, year, month]);

  const eventsFor = (day: Date) => {
    const ticketEvents = tickets.filter((t) => sameDay(t.createdAt, day)).map((t) => ({ id: t.id, label: t.subject, kind: 'Ticket' }));
    const contactEvents = contacts.filter((c) => sameDay(c.createdAt, day)).map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}`, kind: 'Contact' }));
    return [...ticketEvents, ...contactEvents];
  };

  const selectedEvents = selected ? eventsFor(selected) : [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-slate-500">Tickets and contacts created on each day.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm" onClick={() => setCursor(new Date(year, month - 1, 1))}>Prev</button>
          <span className="min-w-36 text-center text-sm font-semibold">{cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</span>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm" onClick={() => setCursor(new Date(year, month + 1, 1))}>Next</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const count = eventsFor(day).length;
              const active = !!selected && selected.getFullYear() === day.getFullYear() && selected.getMonth() === day.getMonth() && selected.getDate() === day.getDate();
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={`h-16 rounded-lg text-left px-2 py-1 text-sm ${active ? 'bg-[#00A76F] text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  <span className="font-semibold">{day.getDate()}</span>
                  {count > 0 && <span className={`mt-1 block text-[10px] ${active ? 'text-white' : 'text-[#00A76F]'}`}>{count} item{count > 1 ? 's' : ''}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[10px] border border-slate-200 dark:border-white/10 bg-white dark:bg-dark-card p-4">
          <h2 className="text-base font-semibold mb-3">{selected ? selected.toLocaleDateString() : 'Select a day'}</h2>
          {selected && selectedEvents.length === 0 && <p className="text-sm text-slate-500">Nothing created on this day.</p>}
          <ul className="space-y-2">
            {selectedEvents.map((event) => (
              <li key={event.id} className="rounded-lg bg-slate-100 dark:bg-white/5 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{event.kind}</p>
                <p className="text-sm font-medium">{event.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
