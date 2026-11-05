import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Printer, ArrowLeft, Calendar } from 'lucide-react';

type ExamEvent = {
  id: number;
  day: number;
  title: string;
  subject: 'math' | 'physics' | 'chemistry' | 'biology' | 'english';
  batch: string;
  time: string;
  duration: string;
};

const SUBJECT_COLORS: Record<string, string> = {
  math: 'bg-blue-100 text-blue-800 border-blue-200',
  physics: 'bg-purple-100 text-purple-800 border-purple-200',
  chemistry: 'bg-green-100 text-green-800 border-green-200',
  biology: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  english: 'bg-orange-100 text-orange-800 border-orange-200',
};

const INITIAL_EVENTS: ExamEvent[] = [
  { id: 1, day: 5, title: 'Biology Quiz', subject: 'biology', batch: 'Batch A', time: '10:00 AM', duration: '45 min' },
  { id: 2, day: 8, title: 'Physics Test', subject: 'physics', batch: 'Batch B', time: '2:00 PM', duration: '60 min' },
  { id: 3, day: 12, title: 'Math Mid-term', subject: 'math', batch: 'Batch A', time: '10:00 AM', duration: '90 min' },
  { id: 4, day: 15, title: 'Chemistry Lab', subject: 'chemistry', batch: 'Batch C', time: '11:00 AM', duration: '120 min' },
  { id: 5, day: 18, title: 'English Test', subject: 'english', batch: 'Batch A', time: '9:00 AM', duration: '60 min' },
  { id: 6, day: 20, title: 'Chemistry Final', subject: 'chemistry', batch: 'Batch C', time: '10:00 AM', duration: '90 min' },
  { id: 7, day: 24, title: 'Math Practice', subject: 'math', batch: 'Batch B', time: '3:00 PM', duration: '45 min' },
  { id: 8, day: 27, title: 'Biology Final', subject: 'biology', batch: 'Batch A', time: '11:00 AM', duration: '90 min' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = { setCurrentPage: (page: string) => void; branchName?: string };

export function TestCalendar({ setCurrentPage, branchName = '' }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<ExamEvent[]>(INITIAL_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', subject: 'math' as ExamEvent['subject'], batch: 'Batch A', time: '10:00', duration: '60' });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getEventsForDay = (day: number) => events.filter(e => e.day === day);

  const addEvent = () => {
    if (!newEvent.title || !selectedDay) return;
    setEvents(prev => [...prev, {
      id: Date.now(),
      day: selectedDay,
      title: newEvent.title,
      subject: newEvent.subject,
      batch: newEvent.batch,
      time: newEvent.time,
      duration: newEvent.duration + ' min',
    }]);
    setShowAddModal(false);
    setNewEvent({ title: '', subject: 'math', batch: 'Batch A', time: '10:00', duration: '60' });
    setSelectedDay(null);
  };

  const upcoming = events.filter(e => e.day >= today.getDate()).sort((a, b) => a.day - b.day).slice(0, 5);

  const cells: { day: number; isCurrentMonth: boolean }[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, isCurrentMonth: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, isCurrentMonth: false });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage('branchTestManagement')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Calendar</h1>
            <p className="text-sm text-gray-500 mt-0.5">{branchName ? `${branchName} — ` : ''}Monthly & weekly exam schedule</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 min-w-[160px] text-center">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['month', 'week'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm font-medium capitalize ${view === v ? 'bg-[#0F4C81] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayEvents = cell.isCurrentMonth ? getEventsForDay(cell.day) : [];
            return (
              <div
                key={idx}
                onClick={() => { if (cell.isCurrentMonth) { setSelectedDay(cell.day); setShowAddModal(true); } }}
                className={`min-h-[90px] p-2 border-b border-r border-gray-100 cursor-pointer transition-colors ${
                  !cell.isCurrentMonth ? 'bg-gray-50' : 'hover:bg-blue-50'
                } ${isToday(cell.day) && cell.isCurrentMonth ? 'bg-blue-50' : ''}`}
              >
                <span className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full ${
                  isToday(cell.day) && cell.isCurrentMonth
                    ? 'bg-[#0F4C81] text-white'
                    : cell.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
                }`}>
                  {cell.day}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayEvents.slice(0, 2).map(ev => (
                    <div key={ev.id} className={`text-xs px-1.5 py-0.5 rounded border truncate ${SUBJECT_COLORS[ev.subject]}`}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tests */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0F4C81]" /> Upcoming Tests
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming tests this month.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(ev => (
              <div key={ev.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-[#e0eef5] rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-[#0F4C81] leading-none">{ev.day}</span>
                  <span className="text-[10px] text-[#0F4C81] font-medium">{MONTHS[month].slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{ev.title}</p>
                  <p className="text-xs text-gray-500">{ev.batch} • {ev.time} • {ev.duration}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${SUBJECT_COLORS[ev.subject]} capitalize`}>
                  {ev.subject}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Exam Event {selectedDay ? `— Day ${selectedDay}` : ''}</h2>
              <button onClick={() => { setShowAddModal(false); setSelectedDay(null); }} className="p-1 rounded hover:bg-gray-100">
                <span className="text-xl leading-none text-gray-500">×</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                <input type="text" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Mathematics Mid-term"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={newEvent.subject} onChange={e => setNewEvent(p => ({ ...p, subject: e.target.value as ExamEvent['subject'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] text-sm">
                    {['math', 'physics', 'chemistry', 'biology', 'english'].map(s => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select value={newEvent.batch} onChange={e => setNewEvent(p => ({ ...p, batch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] text-sm">
                    {['Batch A', 'Batch B', 'Batch C', 'All Batches'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={newEvent.duration} onChange={e => setNewEvent(p => ({ ...p, duration: e.target.value }))}
                    min="15" step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4C81] text-sm" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowAddModal(false); setSelectedDay(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={addEvent} className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] text-sm font-medium">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
