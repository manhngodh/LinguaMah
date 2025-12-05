import React, { useState } from 'react';
import { AssessmentResult } from '../types';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Star, BookOpen, Quote } from 'lucide-react';

interface FeedbackDisplayProps {
  result: AssessmentResult;
  onRetry: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ result, onRetry }) => {
  const [activeTab, setActiveTab] = useState<'corrections' | 'vocabulary'>('corrections');

  // Determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
          <div className={`relative flex items-center justify-center w-24 h-24 rounded-full ${getScoreColor(result.score)}`}>
            <svg className="w-full h-full transform -rotate-90 absolute">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="text-3xl font-bold">{result.score}</span>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {result.score >= 80 ? 'Excellent work!' : result.score >= 60 ? 'Good effort!' : 'Keep practicing!'}
            </h2>
            <p className="text-slate-600 leading-relaxed">{result.generalComment}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-slate-100">
          <button
            onClick={() => setActiveTab('corrections')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'corrections' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Corrections & Improvements
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'vocabulary' 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            Vocabulary Boost
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'corrections' ? (
        <div className="space-y-4">
          {/* Corrected Text Block */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Better Version</h3>
            <div className="text-lg text-slate-800 leading-relaxed font-serif italic">
              <Quote className="inline-block w-4 h-4 text-slate-300 mr-2 mb-2 transform rotate-180" />
              {result.correctedVersion}
              <Quote className="inline-block w-4 h-4 text-slate-300 ml-2 mb-2" />
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mt-6 px-1">Specific Feedback</h3>
          <div className="grid gap-4">
            {result.feedbackItems.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex gap-4">
                <div className={`mt-1 shrink-0 ${
                  item.type === 'grammar' ? 'text-rose-500' : 
                  item.type === 'vocabulary' ? 'text-indigo-500' : 'text-amber-500'
                }`}>
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="line-through text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-sm decoration-2 decoration-rose-300">
                      {item.original}
                    </span>
                    <ArrowRight size={16} className="text-slate-300 hidden sm:block" />
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-sm border border-emerald-100">
                      {item.correction}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm">{item.explanation}</p>
                </div>
              </div>
            ))}
            {result.feedbackItems.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-3" />
                <p>No major errors found. Great job!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {result.improvedVocabulary.map((word, index) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Star size={20} fill="currentColor" className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{word}</h4>
                  <p className="text-xs text-slate-500">Suggested power word</p>
                </div>
              </div>
            ))}
          </div>
           <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 mt-4">
            <div className="flex gap-3">
                <BookOpen className="text-indigo-600 shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-indigo-900 mb-1">Vocabulary Tip</h4>
                    <p className="text-indigo-800 text-sm leading-relaxed">
                        Try incorporating these new words into your next practice session. 
                        Using more precise vocabulary helps convey your ideas more effectively and demonstrates higher proficiency.
                    </p>
                </div>
            </div>
           </div>
        </div>
      )}

      <button
        onClick={onRetry}
        className="w-full py-4 mt-8 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center justify-center gap-2"
      >
        <RefreshCw size={20} />
        Start New Session
      </button>
    </div>
  );
};

export default FeedbackDisplay;
