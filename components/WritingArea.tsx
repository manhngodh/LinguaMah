import React, { useState, useRef } from 'react';
import { Exercise } from '../types';
import { Send, Lightbulb, Play, Pause, Volume2, HelpCircle } from 'lucide-react';

interface WritingAreaProps {
  exercise: Exercise;
  onSubmit: (text: string) => void;
}

const WritingArea: React.FC<WritingAreaProps> = ({ exercise, onSubmit }) => {
  const [text, setText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ref to store audio context/source to handle cleanup if needed, though simpler fire-and-forget is often fine for short clips
  const audioContextRef = useRef<AudioContext | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isDictation = !!exercise.audioData;
  const isCloze = !!exercise.clozeSentence;
  const isSentenceChallenge = exercise.title.toLowerCase().includes('sentence');

  const playAudio = async () => {
    if (!exercise.audioData || isPlaying) return;

    try {
      setIsPlaying(true);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;

      // Decode Base64 to ArrayBuffer
      const binaryString = atob(exercise.audioData);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert raw PCM (Int16) to AudioBuffer (Float32)
      // Gemini returns raw PCM 16-bit little endian, usually mono
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
        float32Data[i] = int16Data[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };

      source.start(0);
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  const getMinWords = () => {
    if (isDictation || isSentenceChallenge || isCloze) return 3; // Minimal check for sentence/dictation
    return 10; // More for paragraph
  };

  const getPlaceholder = () => {
    if (isDictation) return "Type what you hear...";
    if (isCloze) return "Type the full sentence with the missing words filled in...";
    return "Start typing your response here...";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
              {exercise.targetFocus}
            </span>
            <h2 className="text-2xl font-bold text-slate-800">{exercise.title}</h2>
          </div>
          <button 
            onClick={() => setShowHint(!showHint)}
            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-full transition-colors"
            title="Show hint"
          >
            <Lightbulb size={24} />
          </button>
        </div>
        
        <p className="text-slate-600 text-lg leading-relaxed mb-6">
          {exercise.description}
        </p>

        {isCloze && (
          <div className="mb-6 bg-teal-50 border border-teal-100 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-teal-700 font-bold uppercase tracking-wider text-xs">
              <HelpCircle size={14} />
              Fill in the blanks
            </div>
            <p className="text-2xl font-medium text-slate-800 leading-normal font-mono">
              {exercise.clozeSentence}
            </p>
          </div>
        )}

        {isDictation && (
          <div className="flex justify-center mb-6">
            <button
              onClick={playAudio}
              disabled={isPlaying}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                isPlaying 
                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Volume2 className="animate-pulse" />
                  Playing...
                </>
              ) : (
                <>
                  <Play fill="currentColor" />
                  Play Audio
                </>
              )}
            </button>
          </div>
        )}

        {showHint && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-4 animate-in slide-in-from-top-2">
            <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
              <Lightbulb size={16} />
              Hint: {exercise.hint}
            </p>
          </div>
        )}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={getPlaceholder()}
          className={`w-full p-6 rounded-2xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-lg text-slate-700 leading-relaxed transition-all shadow-sm ${
            (isDictation || isSentenceChallenge || isCloze) ? 'h-32 resize-none' : 'h-64 resize-none'
          }`}
          autoFocus
        />
        <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-slate-100">
          {wordCount} words
        </div>
      </div>

      <button
        onClick={() => onSubmit(text)}
        disabled={wordCount < getMinWords()}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md
          ${wordCount < getMinWords()
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
      >
        <Send size={20} />
        Submit for Feedback
      </button>
    </div>
  );
};

export default WritingArea;