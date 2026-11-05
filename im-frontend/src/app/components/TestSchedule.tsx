import { useState } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Calendar, Clock, Users } from 'lucide-react';

type Schedule = {
  id: number;
  title: string;
  subject: string;
  batch: string;
  date: string;
  time: string;
  duration: number;
  venue: string;
  status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
};

const INITIAL_SCHEDULES: Schedule[] = [
  { id: 1, title: 'Mathematics Mid-term Exam', subject: 'Mathematics', batch: 'Batch A', date: '2026-07-12', time: '10:00', duration: 90, venue: 'Hall 1', status: 'Scheduled' },
  { id: 2, title: 'Physics Unit Test', subject: 'Physics', batch: 'Batch B', date: '2026-07-08', time: '14:00', duration: 60, venue: 'Lab 2', status: 'Ongoing' },
  { id: 3, title: 'Chemistry Final Exam', subject: 'Chemistry', batch: 'Batch C', date: '2026-07-20', time: '11:00', duration: 120, venue: 'Hall 3', status: 'Scheduled' },
  { id: 4, title: 'Biology Quiz', subject: 'Biology', batch: 'Batch A', date: '2026-07-05', time: '10:00', duration: 45, venue: 'Room 4', status: 'Completed' },
  { id: 5, title: 'English Grammar Test', subject: 'English', batch: 'Batch B', date: '2026-07-18', time: '09:00', duration: 60, venue: 'Hall 1', status: 'Scheduled' },
];

const STATUS_COLORS: Record<Schedule['status'], string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Ongoing: 'bg-green-100 text-green-700',
  Completed: 'bg-gray-100 text-gray-600',
  Cancelled: 'bg-red-100 text-red-700',
};

const EMPTY: Omit<Schedule, 'id'> = { title: '', subject: 'Mathematics', batch: 'Batch A', date: '', time: '10:00', duration: 60, venue: '', status: 'Scheduled' };

type Props = { setCurrentPage: (page: string) => void; branchName?: string };

export function TestSchedule({ setCurrentPage, branchName = '' }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES);
  const [filter, setFilter] = useState<'all' | Schedule['status']>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [form, setForm] = useState<Omit<Schedule, 'id'>>(EMPTY);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (s: Schedule) => { setEditing(s); setForm({ ...s }); setShowModal(true); };

  const save = () => {
    if (!form.title || !form.date) return;
    if (editing) {
      setSchedules(prev => prev.map(s => s.id === editing.id ? { ...form, id: editing.id } : s));
    } else {
      setSchedules(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const remove = (id: number) => setSchedules(prev => prev.filter(s => s.id !== id));

  const filtered = filter === 'all' ? schedules : schedules.filter(s => s.status === filter);

  const grouped = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'].reduce((acc, st) => {
    acc[st] = schedules.filter(s => s.status === st).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage('branchTestManagement')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Schedule</h1>
            <p className="text-sm text-gray-500 mt-0.5">{branchName ? `${branchName} — ` : ''}Manage all exam schedules</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] text-sm font-medium self-start">
          <Plus className="w-4 h-4" /> Schedule Test
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(['Scheduled', 'Ongoing', 'Completed', 'Cancelled'] as const).map(st => (
          <div key={st} className={`bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${filter === st ? 'border-[#0F4C81] ring-2 ring-[#0F4C81]' : ''}`}
            onClick={() => setFilter(filter === st ? 'all' : st)}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{st}</p>
                <p className="text-2xl font-bold text-gray-900">{grouped[st] || 0}</p>
              </div>
              <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[st].split(' ')[0]}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-[#0F4C81] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
            No schedules found.
          </div>
        )}
        {filtered.map(s => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>{s.status}</span>
                  <span className="text-xs text-gray-400">{s.subject}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">{s.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0F4C81]" />
                    {new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0F4C81]" />
                    {s.time} • {s.duration} min
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#0F4C81]" />
                    {s.batch}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    📍 {s.venue}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 rounded-lg border border-gray-200 text-[#0F4C81] hover:bg-[#e0eef5] transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => remove(s.id)} className="p-2 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Schedule' : 'Schedule New Test'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100 text-gray-500 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Mathematics Mid-term Exam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
                    {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select value={form.batch} onChange={e => setForm(p => ({ ...p, batch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
                    {['Batch A', 'Batch B', 'Batch C', 'All Batches'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={form.duration} min="15" step="15" onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input type="text" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g. Hall 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Schedule['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
                  {['Scheduled', 'Ongoing', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={save} className="px-4 py-2 bg-[#0F4C81] text-white rounded-lg hover:bg-[#0c3d6a] text-sm font-medium">{editing ? 'Save Changes' : 'Schedule'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
