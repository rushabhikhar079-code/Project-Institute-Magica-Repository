import { FileText } from 'lucide-react';

export function PlaceholderPage({ pageName }: { pageName: string }) {
  const readable = pageName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/&/g, ' & ')
    .trim();

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-[#e0eef5] rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-[#0F4C81]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{readable}</h1>
        <p className="text-gray-500 mb-6">This page is under development and will be available soon.</p>
        <div className="text-sm text-gray-400">
          Page ID: <span className="font-mono">{pageName}</span>
        </div>
      </div>
    </div>
  );
}
