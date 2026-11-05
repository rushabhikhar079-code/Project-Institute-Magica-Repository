import { useState } from 'react';
import { ArrowLeft, Download, Save, Eye } from 'lucide-react';

type Student = {
  id: number;
  rollNo: string;
  name: string;
  theory: number;
  practical: number;
};

const INITIAL_STUDENTS: Student[] = [
  { id: 1, rollNo: '001', name: 'Aarav Sharma', theory: 62, practical: 27 },
  { id: 2, rollNo: '002', name: 'Diya Patel', theory: 58, practical: 24 },
  { id: 3, rollNo: '003', name: 'Rohan Kumar', theory: 48, practical: 20 },
  { id: 4, rollNo: '004', name: 'Priya Singh', theory: 65, practical: 28 },
  { id: 5, rollNo: '005', name: 'Arjun Mehta', theory: 32, practical: 14 },
  { id: 6, rollNo: '006', name: 'Ananya Reddy', theory: 28, practical: 10 },
  { id: 7, rollNo: '007', name: 'Karan Nair', theory: 55, practical: 22 },
  { id: 8, rollNo: '008', name: 'Simran Kaur', theory: 70, practical: 29 },
];

function getGrade(total: number) {
  if (total >= 90) return { label: 'A+', cls: 'bg-green-100 text-green-800' };
  if (total >= 80) return { label: 'A', cls: 'bg-green-100 text-green-700' };
  if (total >= 70) return { label: 'B', cls: 'bg-blue-100 text-blue-800' };
  if (total >= 60) return { label: 'C', cls: 'bg-yellow-100 text-yellow-800' };
  if (total >= 40) return { label: 'D', cls: 'bg-orange-100 text-orange-800' };
  return { label: 'F', cls: 'bg-red-100 text-red-800' };
}

type Props = { setCurrentPage: (page: string) => void; branchName?: string };

export function TestMarksSheet({ setCurrentPage, branchName = '' }: Props) {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [selectedTest, setSelectedTest] = useState('1');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [saved, setSaved] = useState(false);

  const updateMarks = (id: number, field: 'theory' | 'practical', val: number) => {
    setSaved(false);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: Math.max(0, val) } : s));
  };

  const totals = students.map(s => s.theory + s.practical);
  const avg = (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1);
  const passCount = totals.filter(t => t >= 40).length;

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage('branchTestManagement')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marks Sheet</h1>
            <p className="text-sm text-gray-500 mt-0.5">{branchName ? `${branchName} — ` : ''}Subject-wise marks entry & performance tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-[#0F4C81] text-white hover:bg-[#0c3d6a]'}`}>
            <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Test</label>
          <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81] min-w-[260px]">
            <option value="1">Mathematics Mid-term Exam — Batch A</option>
            <option value="2">Physics Unit Test — Batch B</option>
            <option value="3">Chemistry Final Exam — Batch C</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
            {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Roll No', 'Student Name', 'Theory (70)', 'Practical (30)', 'Total (100)', 'Grade', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => {
                const total = s.theory + s.practical;
                const grade = getGrade(total);
                const pass = total >= 40;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">{s.rollNo}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number" min="0" max="70" value={s.theory}
                        onChange={e => updateMarks(s.id, 'theory', Number(e.target.value))}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" min="0" max="30" value={s.practical}
                        onChange={e => updateMarks(s.id, 'practical', Number(e.target.value))}
                        className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0F4C81]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{total}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${grade.cls}`}>{grade.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {pass ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#0F4C81]" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Students', value: students.length },
          { label: 'Average Marks', value: avg },
          { label: 'Highest', value: Math.max(...totals) },
          { label: 'Lowest', value: Math.min(...totals) },
          { label: 'Pass Rate', value: `${Math.round((passCount / students.length) * 100)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-[#0F4C81]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
