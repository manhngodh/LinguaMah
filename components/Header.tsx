import React from 'react';
import { BookOpen, PenTool } from 'lucide-react';

interface HeaderProps {
  resetApp: () => void;
}

const Header: React.FC<HeaderProps> = ({ resetApp }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={resetApp}
        >
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookOpen size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Lingua<span className="text-indigo-600">Flow</span>
          </h1>
        </div>
        <button 
          onClick={resetApp}
          className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          New Session
        </button>
      </div>
    </header>
  );
};

export default Header;
