import { useState, useRef } from 'react';
import { ArrowLeft, Upload, X, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

type UploadedFile = { id: number; name: string; size: string; status: 'processing' | 'done' | 'error'; studentName?: string; rollNo?: string; score?: number };

const MOCK_RESULTS: Omit<UploadedFile, 'id' | 'name' | 'size' | 'status'>[] = [
  { studentName: 'Aarav Sharma', rollNo: '001', score: 89 },
  { studentName: 'Diya Patel', rollNo: '002', score: 76 },
  { studentName: 'Rohan Kumar', rollNo: '003', score: 62 },
];

type Props = { setCurrentPage: (page: string) => void; branchName?: string };

export function TestOmrUpload({ setCurrentPage, branchName = '' }: Props) {
  const [selectedTest, setSelectedTest] = useState('1');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processed, setProcessed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const toAdd: UploadedFile[] = Array.from(newFiles).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      status: 'processing',
    }));
    setFiles(prev => [...prev, ...toAdd]);
    setProcessed(false);

    // Simulate processing
    setTimeout(() => {
      setFiles(prev => prev.map((f, idx) => ({
        ...f,
        status: 'done',
        ...(MOCK_RESULTS[idx % MOCK_RESULTS.length] ?? {}),
      })));
    }, 1500);
  };

  const removeFile = (id: number) => setFiles(prev => prev.filter(f => f.id !== id));

  const processAll = () => {
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));
    setTimeout(() => {
      setFiles(prev => prev.map((f, idx) => ({
        ...f,
        status: 'done',
        ...(MOCK_RESULTS[idx % MOCK_RESULTS.length] ?? {}),
      })));
      setProcessed(true);
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentPage('branchTestManagement')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">OMR Sheet Upload</h1>
            <p className="text-sm text-gray-500 mt-0.5">{branchName ? `${branchName} — ` : ''}Upload and process scanned OMR answer sheets</p>
          </div>
        </div>
      </div>

      {/* Test Select */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Test</label>
        <select value={selectedTest} onChange={e => setSelectedTest(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C81]">
          <option value="1">Mathematics Mid-term Exam — Batch A</option>
          <option value="2">Physics Unit Test — Batch B</option>
          <option value="3">Chemistry Final Exam — Batch C</option>
        </select>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors mb-4 ${
          isDragging ? 'border-[#0F4C81] bg-blue-50' : 'border-gray-300 bg-white hover:border-[#0F4C81] hover:bg-blue-50'
        }`}
      >
        <input ref={fileRef} type="file" multiple accept="image/*,.pdf" className="hidden" onChange={e => addFiles(e.target.files)} />
        <div className="w-16 h-16 bg-[#e0eef5] rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-[#0F4C81]" />
        </div>
        <p className="text-lg font-semibold text-gray-900 mb-1">Drop OMR sheets here</p>
        <p className="text-sm text-gray-500">or click to browse • Supports PDF, JPG, PNG</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Uploaded Files ({files.length})</h3>
            {files.some(f => f.status === 'done') && !processed && (
              <button onClick={processAll} className="flex items-center gap-2 px-4 py-2 bg-[#0F4C81] text-white rounded-lg text-sm font-medium hover:bg-[#0c3d6a]">
                <RefreshCw className="w-4 h-4" /> Process All
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {files.map(f => (
              <div key={f.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-500">{f.size}</span>
                    {f.status === 'done' && f.studentName && (
                      <span className="text-xs text-gray-600">{f.studentName} • Roll {f.rollNo} • Score: <strong>{f.score}</strong></span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {f.status === 'processing' && (
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                  )}
                  {f.status === 'done' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {f.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  <button onClick={() => removeFile(f.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results summary */}
      {processed && files.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-green-900">Processing Complete</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Processed', value: files.length },
              { label: 'Successful', value: files.filter(f => f.status === 'done').length },
              { label: 'Failed', value: files.filter(f => f.status === 'error').length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-4 text-center border border-green-100">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {files.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Upload Instructions</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'Scan OMR sheets at 300 DPI or higher for best accuracy',
              'Ensure the sheet is flat and not crumpled before scanning',
              'Supported formats: PDF, JPG, PNG',
              'Multiple files can be uploaded simultaneously',
              'System will auto-detect student roll numbers from the OMR',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#0F4C81] mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
