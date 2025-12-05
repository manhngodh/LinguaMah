import React, { useState } from 'react';
import { AppState, ProficiencyLevel, StudyMode, Exercise, AssessmentResult } from './types';
import { generateExercise, assessWriting } from './services/geminiService';
import Header from './components/Header';
import LevelSelection from './components/LevelSelection';
import TopicSelection from './components/TopicSelection';
import WritingArea from './components/WritingArea';
import FeedbackDisplay from './components/FeedbackDisplay';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('SELECTION_LEVEL');
  const [level, setLevel] = useState<ProficiencyLevel | null>(null);
  const [mode, setMode] = useState<StudyMode | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLevelSelect = (selectedLevel: ProficiencyLevel) => {
    setLevel(selectedLevel);
    setAppState('SELECTION_MODE');
  };

  const handleModeSelect = async (selectedMode: StudyMode) => {
    setMode(selectedMode);
    setAppState('GENERATING_EXERCISE');
    setError(null);
    
    try {
      if (!level) throw new Error("Level not selected");
      const generatedExercise = await generateExercise(level, selectedMode);
      setExercise(generatedExercise);
      setAppState('WRITING');
    } catch (err) {
      setError("Failed to generate exercise. Please try again.");
      setAppState('SELECTION_MODE');
    }
  };

  const handleSubmitWriting = async (text: string) => {
    setAppState('ANALYZING');
    setError(null);

    try {
      if (!exercise || !level) throw new Error("Missing exercise data");
      const assessment = await assessWriting(text, exercise, level);
      setResult(assessment);
      setAppState('FEEDBACK');
    } catch (err) {
      setError("Failed to analyze writing. Please try again.");
      setAppState('WRITING');
    }
  };

  const resetApp = () => {
    setAppState('SELECTION_LEVEL');
    setLevel(null);
    setMode(null);
    setExercise(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header resetApp={resetApp} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {appState === 'SELECTION_LEVEL' && (
          <LevelSelection onSelect={handleLevelSelect} />
        )}

        {appState === 'SELECTION_MODE' && (
          <TopicSelection onSelect={handleModeSelect} onBack={() => setAppState('SELECTION_LEVEL')} />
        )}

        {appState === 'GENERATING_EXERCISE' && (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-500 font-medium animate-pulse">Crafting your custom exercise...</p>
          </div>
        )}

        {appState === 'WRITING' && exercise && (
          <WritingArea exercise={exercise} onSubmit={handleSubmitWriting} />
        )}

        {appState === 'ANALYZING' && (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-800">Reviewing your work</h3>
              <p className="text-slate-500">Checking grammar, vocabulary, and style...</p>
            </div>
          </div>
        )}

        {appState === 'FEEDBACK' && result && (
          <FeedbackDisplay result={result} onRetry={resetApp} />
        )}
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} LinguaFlow AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
