import React from 'react';
import { StudyMode } from '../types';
import { PenTool, BookA, Sparkles, Headphones, Pencil, TextCursorInput } from 'lucide-react';

interface TopicSelectionProps {
  onSelect: (mode: StudyMode) => void;
  onBack: () => void;
}

const TopicSelection: React.FC<TopicSelectionProps> = ({ onSelect, onBack }) => {
  const modes = [
    {
      id: StudyMode.GRAMMAR,
      label: 'Grammar Focus',
      description: 'Practice specific rules like past tense, prepositions, or conditionals.',
      icon: <PenTool size={24} className="text-orange-500" />,
      style: "border-orange-200 hover:border-orange-500 bg-orange-50"
    },
    {
      id: StudyMode.VOCABULARY,
      label: 'Vocabulary Booster',
      description: 'Learn new synonyms and descriptive words to enrich your writing.',
      icon: <BookA size={24} className="text-indigo-500" />,
      style: "border-indigo-200 hover:border-indigo-500 bg-indigo-50"
    },
    {
      id: StudyMode.FILL_IN_BLANKS,
      label: 'Fill in the Blanks',
      description: 'Complete the sentence by finding the missing missing words.',
      icon: <TextCursorInput size={24} className="text-teal-500" />,
      style: "border-teal-200 hover:border-teal-500 bg-teal-50"
    },
    {
      id: StudyMode.SENTENCE_CHALLENGE,
      label: 'Sentence Challenge',
      description: 'Write a perfect sentence based on a specific hint or word.',
      icon: <Pencil size={24} className="text-emerald-500" />,
      style: "border-emerald-200 hover:border-emerald-500 bg-emerald-50"
    },
    {
      id: StudyMode.DICTATION,
      label: 'Dictation Practice',
      description: 'Listen to a sentence and type exactly what you hear to improve listening.',
      icon: <Headphones size={24} className="text-cyan-500" />,
      style: "border-cyan-200 hover:border-cyan-500 bg-cyan-50"
    },
    {
      id: StudyMode.FREE_WRITE,
      label: 'Creative Free Write',
      description: 'Write about a random topic and get comprehensive feedback on everything.',
      icon: <Sparkles size={24} className="text-pink-500" />,
      style: "border-pink-200 hover:border-pink-500 bg-pink-50"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
       <button 
        onClick={onBack}
        className="text-sm text-slate-400 hover:text-slate-600 font-medium mb-2 flex items-center gap-1"
      >
        ← Back to levels
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">What do you want to improve?</h2>
        <p className="text-slate-500">Choose a focus area for today's session.</p>
      </div>

      <div className="grid gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all duration-200 w-full text-left group ${mode.style} hover:shadow-md`}
          >
            <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
              {mode.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-1">{mode.label}</h3>
              <p className="text-slate-600 text-sm">{mode.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelection;