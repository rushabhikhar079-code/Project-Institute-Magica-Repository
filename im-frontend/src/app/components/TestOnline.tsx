import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, AlertCircle } from 'lucide-react';

type Option = { id: string; text: string };
type Question = { id: number; text: string; options: Option[]; correct: string; subject: string };

const QUESTIONS: Question[] = [
  { id: 1, subject: 'Mathematics', text: 'What is the value of π (pi) to two decimal places?', options: [{ id: 'a', text: '3.14' }, { id: 'b', text: '3.16' }, { id: 'c', text: '3.12' }, { id: 'd', text: '3.18' }], correct: 'a' },
  { id: 2, subject: 'Mathematics', text: 'If f(x) = 2x + 3, what is f(5)?', options: [{ id: 'a', text: '10' }, { id: 'b', text: '13' }, { id: 'c', text: '15' }, { id: 'd', text: '8' }], correct: 'b' },
  { id: 3, subject: 'Physics', text: "Newton's second law states F = ?", options: [{ id: 'a', text: 'mv' }, { id: 'b', text: 'ma' }, { id: 'c', text: 'mg' }, { id: 'd', text: 'mgh' }], correct: 'b' },
  { id: 4, subject: 'Physics', text: 'What is the SI unit of force?', options: [{ id: 'a', text: 'Joule' }, { id: 'b', text: 'Watt' }, { id: 'c', text: 'Newton' }, { id: 'd', text: 'Pascal' }], correct: 'c' },
  { id: 5, subject: 'Chemistry', text: 'What is the atomic number of Carbon?', options: [{ id: 'a', text: '4' }, { id: 'b', text: '6' }, { id: 'c', text: '8' }, { id: 'd', text: '12' }], correct: 'b' },
  { id: 6, subject: 'Chemistry', text: 'Which gas is most abundant in Earth\'s atmosphere?', options: [{ id: 'a', text: 'Oxygen' }, { id: 'b', text: 'Carbon Dioxide' }, { id: 'c', text: 'Nitrogen' }, { id: 'd', text: 'Argon' }], correct: 'c' },
  { id: 7, subject: 'Biology', text: 'What is the powerhouse of the cell?', options: [{ id: 'a', text: 'Nucleus' }, { id: 'b', text: 'Ribosome' }, { id: 'c', text: 'Mitochondria' }, { id: 'd', text: 'Golgi apparatus' }], correct: 'c' },
  { id: 8, subject: 'Biology', text: 'DNA stands for?', options: [{ id: 'a', text: 'Deoxyribonucleic Acid' }, { id: 'b', text: 'Diribonucleic Acid' }, { id: 'c', text: 'Deoxyribose Nucleic Acid' }, { id: 'd', text: 'Dynamic Nuclear Acid' }], correct: 'a' },
  { id: 9, subject: 'English', text: 'Which of the following is a synonym for "eloquent"?', options: [{ id: 'a', text: 'Silent' }, { id: 'b', text: 'Articulate' }, { id: 'c', text: 'Confused' }, { id: 'd', text: 'Loud' }], correct: 'b' },
  { id: 10, subject: 'English', text: 'The passive voice of "She writes a letter" is:', options: [{ id: 'a', text: 'A letter was written by her' }, { id: 'b', text: 'A letter is being written by her' }, { id: 'c', text: 'A letter is written by her' }, { id: 'd', text: 'A letter has been written by her' }], correct: 'c' },
];

const DURATION_SECONDS = 30 * 60; // 30 minutes

type Props = { setCurrentPage: (page: string) => void; branchName?: string };

export function TestOnline({ setCurrentPage, branchName = '' }: Props) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!started || submitted) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); setSubmitted(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, submitted]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const toggleFlag = (idx: number) => setFlagged(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });

  const submitTest = () => setSubmitted(true);

  const score = QUESTIONS.filter(q => answers[q.id] === q.correct).length;

  if (!started) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCurrentPage('branchTestManagement')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Online Test</h1>
            <p className="text-sm text-gray-500 mt-0.5">{branchName ? `${branchName} — ` : ''}Secure online examination interface</p>
          </div>
        </div>
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-[#e0eef5] rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-[#0F4C81]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mathematics Mid-term Exam</h2>
          <p className="text-sm text-gray-500 mb-6">Batch A • 10 Questions • 30 Minutes</p>
          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            {[
              ['Total Questions', '10'],
              ['Duration', '30 Minutes'],
              ['Marks per Question', '10'],
              ['Negative Marking', 'None'],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Instructions</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Do not refresh or navigate away during the test</li>
                  <li>Once submitted, answers cannot be changed</li>
                  <li>Timer will auto-submit when time runs out</li>
                </ul>
              </div>
            </div>
          </div>
          <button onClick={() => setStarted(true)} className="w-full py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0c3d6a] transition-colors">
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${pct >= 50 ? 'bg-green-100' : 'bg-red-100'}`}>
            {pct >= 50 ? <CheckCircle className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Test Submitted!</h2>
          <p className="text-gray-500 mb-6">Your responses have been recorded.</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Score</p>
              <p className="text-2xl font-bold text-[#0F4C81]">{score}/{QUESTIONS.length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-[#0F4C81]">{pct}%</p>
            </div>
            <div className={`rounded-xl p-4 ${pct >= 50 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-xs text-gray-500 mb-1">Result</p>
              <p className={`text-2xl font-bold ${pct >= 50 ? 'text-green-600' : 'text-red-600'}`}>{pct >= 50 ? 'Pass' : 'Fail'}</p>
            </div>
          </div>
          <button onClick={() => setCurrentPage('branchTestManagement')} className="w-full py-3 bg-[#0F4C81] text-white rounded-xl font-semibold hover:bg-[#0c3d6a] transition-colors">
            Back to Test Management
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[current];
  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Timer bar */}
      <div className={`flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-6 py-3 mb-4 ${timeLeft < 300 ? 'border-red-300 bg-red-50' : ''}`}>
        <span className="text-sm font-medium text-gray-700">Mathematics Mid-term Exam</span>
        <div className={`flex items-center gap-2 font-bold text-lg ${timeLeft < 300 ? 'text-red-600' : 'text-[#0F4C81]'}`}>
          <Clock className="w-5 h-5" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Question panel */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#0F4C81] uppercase tracking-wider bg-[#e0eef5] px-3 py-1 rounded-full">{q.subject}</span>
            <button onClick={() => toggleFlag(current)} className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full transition-colors ${flagged.has(current) ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-600'}`}>
              <Flag className="w-4 h-4" /> {flagged.has(current) ? 'Flagged' : 'Flag'}
            </button>
          </div>
          <p className="text-base font-medium text-gray-900 mb-6">
            <span className="text-gray-400 mr-2">Q{current + 1}.</span>{q.text}
          </p>
          <div className="space-y-3">
            {q.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  answers[q.id] === opt.id
                    ? 'border-[#0F4C81] bg-[#e0eef5] text-[#0F4C81]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0 ${answers[q.id] === opt.id ? 'border-[#0F4C81] bg-[#0F4C81] text-white' : 'border-gray-300 text-gray-500'}`}>
                  {opt.id.toUpperCase()}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {current < QUESTIONS.length - 1 ? (
              <button onClick={() => setCurrent(c => c + 1)} className="flex items-center gap-1 px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-sm font-medium hover:bg-[#0c3d6a]">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submitTest} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                Submit Test
              </button>
            )}
          </div>
        </div>

        {/* Navigation panel */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Questions</div>
          <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5 mb-4">
            {QUESTIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`aspect-square rounded-lg text-xs font-semibold transition-colors ${
                  i === current ? 'bg-[#0F4C81] text-white' :
                  flagged.has(i) ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                  answers[QUESTIONS[i].id] ? 'bg-green-100 text-green-700 border border-green-300' :
                  'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 text-xs">
            {[
              { color: 'bg-[#0F4C81]', label: 'Current' },
              { color: 'bg-green-200 border border-green-300', label: `Answered (${answered})` },
              { color: 'bg-amber-100 border border-amber-300', label: `Flagged (${flagged.size})` },
              { color: 'bg-gray-100', label: `Not Answered (${QUESTIONS.length - answered})` },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-gray-600">{label}</span>
              </div>
            ))}
          </div>
          <button onClick={submitTest} className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700">
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
