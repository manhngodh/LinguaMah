import React from 'react';
import { ProficiencyLevel } from '../types';
import { GraduationCap, Signal, Trophy } from 'lucide-react';

interface LevelSelectionProps {
  onSelect: (level: ProficiencyLevel) => void;
}

const LevelSelection: React.FC<LevelSelectionProps> = ({ onSelect }) => {
  const levels = [
    {
      id: ProficiencyLevel.BEGINNER,
      label: 'Beginner',
      subLabel: 'A1 - A2',
      description: 'Building foundations, basic sentence structures, and essential vocabulary.',
      icon: <Signal size={24} className="text-emerald-500" />,
      color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50'
    },
    {
      id: ProficiencyLevel.INTERMEDIATE,
      label: 'Intermediate',
      subLabel: 'B1 - B2',
      description: 'Connecting ideas, using complex tenses, and conversational fluency.',
      icon: <GraduationCap size={24} className="text-blue-500" />,
      color: 'border-blue-200 hover:border-blue-500 bg-blue-50'
    },
    {
      id: ProficiencyLevel.ADVANCED,
      label: 'Advanced',
      subLabel: 'C1 - C2',
      description: 'Nuanced expression, academic/professional writing, and idiomatic usage.',
      icon: <Trophy size={24} className="text-purple-500" />,
      color: 'border-purple-200 hover:border-purple-500 bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">What is your current level?</h2>
        <p className="text-slate-500">We'll tailor the exercises to match your proficiency.</p>
      </div>
      
      <div className="grid gap-4">
        {levels.map((lvl) => (
          <button
            key={lvl.id}
            onClick={() => onSelect(lvl.id)}
            className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left w-full group ${lvl.color} hover:shadow-md`}
          >
            <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
              {lvl.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg text-slate-800">{lvl.label}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {lvl.subLabel}
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{lvl.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelection;
