import { useState } from 'react';
import { ArrowLeft, Download, Search, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type Result = { id: number; rollNo: string; name: string; batch: string; theory: number; practical: number; total: number; grade: string; status: 'Pass' | 'Fail' };

const RESULTS: Result[] = [
  { id: 1, rollNo: '001', name: 'Aarav Sharma', batch: 'Batch A', theory: 62, practical: 27, total: 89, grade: 'A', status: 'Pass' },
  { id: 2, rollNo: '002', name: 'Diya Patel', batch: 'Batch A', theory: 58, practical: 24, total: 82, grade: 'A', status: 'Pass' },
  { id: 3, rollNo: '003', name: 'Rohan Kumar', batch: 'Batch A', theory: 48, practical: 20, total: 68, grade: 'B', status: 'Pass' },
  { id: 4, rollNo: '004', name: 'Priya Singh', batch: 'Batch A', theory: 65, practical: 28, total: 93, grade: 'A+', status: 'Pass' },
  { id: 5, rollNo: '005', name: 'Arjun Mehta', batch: 'Batch B', theory: 32, practical: 14, total: 46, grade: 'D', status: 'Pass' },
  { id: 6, rollNo: '006', name: 'Ananya Reddy', batch: 'Batch B', theory: 28, practical: 10, total: 38, grade: 'F', status: 'Fail' },
  { id: 7, rollNo: '007', name: 'Karan Nair', batch: 'Batch B', theory: 55, practical: 22, total: 77, grade: 'B', status: 'Pass' },
  { id: 8, rollNo: '008', name: 'Simran Kaur', batch: 'Batch A', theory: 70, practical: 29, total: 99, grade: 'A+', status: 'Pass' },
  { id: 9, rollNo: '009', name: 'Vijay Rao', batch: 'Batch C', theory: 38, practical: 16, total: 54, grade: 'C', status: 'Pass' },
  { id: 10, rollNo: '010', name: 'Meera Joshi', batch: 'Batch C', theory: 60, practical: 25, total: 85, grade: 'A', status: 'Pass' },
];

const GRADE_DIST = [
  { grade: 'A+', count: 2, color: '#10b981' },
  { grade: 'A', count: 3, color: '#0F4C81' },
  { grade: 'B', count: 2, color: '#3b82f6' },
  { grade: 'C', count: 1, color: '#f59e0b' },
  { grade: 'D', count: 1, color: '#f97316' },
  { grade: 'F', count: 1, color: '#ef4444' },
];

function getGradeColor(grade: string) {
  if (grade === 'A+') return 'bg-emerald-100 text-emerald-800';
  if (grade === 'A') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
  if (grade === 'D') return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

type Props = { setCurrentPage: (page: string) => void; branchName?: string };

export function TestResults({ setCurrentPage, branchName = '' }: Props) {
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedTest, setSelectedTest] = useState('1');

  const filtered = RESULTS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.rollNo.includes(search);
    const matchBatch = selectedBatch === 'all' || r.batch === selectedBatch;
    return matchSearch && matchBatch;
  });

  const avg = (RESULTS.reduce((a, r) => a + r.total, 0) / RESULTS.length).toFixed(1);
  const highest = Math.max(...RESULTS.map(r => r.total));
  const passRate = Math.round((RESULTS.filter(r => r.status === 'Pass').length / RESULTS.length) * 100);
  const topper = RESULTS.find(r => r.total === highest);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage('branchTestManagement')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
            <p className="text-sm text-gray-500 mt-0.5">{branchName ? `${branchName} — ` : ''}Detailed student result analysis</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium self-start">
          <Download className="w-4 h-4" /> Export Results
        </button>
      </div>

      {/* Test Selector */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
          <option value="1">Mathematics Mid-term Exam</option>
          <option value="2">Physics Unit Test</option>
          <option value="3">Chemistry Final Exam</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#e0eef5] rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#0F4C81]" />
          </div>
          <div><p className="text-xs text-gray-500">Class Average</p><p className="text-2xl font-bold text-gray-900">{avg}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div><p className="text-xs text-gray-500">Highest Score</p><p className="text-2xl font-bold text-gray-900">{highest}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-blue-600" />
          </div>
          <div><p className="text-xs text-gray-500">Pass Rate</p><p className="text-2xl font-bold text-gray-900">{passRate}%</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div><p className="text-xs text-gray-500">Topper</p><p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{topper?.name.split(' ')[0]}</p></div>
        </div>
      </div>

      {/* Grade Distribution Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Grade Distribution</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={GRADE_DIST} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="grade" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Students">
              {GRADE_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]" />
        </div>
        <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
          <option value="all">All Batches</option>
          {['Batch A', 'Batch B', 'Batch C'].map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Roll No', 'Student Name', 'Batch', 'Theory', 'Practical', 'Total', 'Grade', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-600">{r.rollNo}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.batch}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.theory}/70</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{r.practical}/30</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{r.total}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(r.grade)}`}>{r.grade}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          Showing {filtered.length} of {RESULTS.length} students
        </div>
      </div>
    </div>
  );
}
