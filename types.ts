export enum ProficiencyLevel {
  BEGINNER = 'Beginner (A1-A2)',
  INTERMEDIATE = 'Intermediate (B1-B2)',
  ADVANCED = 'Advanced (C1-C2)'
}

export enum StudyMode {
  GRAMMAR = 'Grammar Focus',
  VOCABULARY = 'Vocabulary Expansion',
  FREE_WRITE = 'Free Writing',
  DICTATION = 'Dictation Practice',
  SENTENCE_CHALLENGE = 'Sentence Challenge',
  FILL_IN_BLANKS = 'Fill in the Blanks'
}

export interface Exercise {
  title: string;
  description: string;
  hint: string;
  targetFocus: string;
  audioData?: string; // Base64 encoded PCM audio data for dictation
  hiddenText?: string; // The correct text for dictation or cloze exercises
  clozeSentence?: string; // The sentence with blanks (for Fill in the Blanks)
}

export interface FeedbackItem {
  original: string;
  correction: string;
  explanation: string;
  type: 'grammar' | 'vocabulary' | 'style';
}

export interface AssessmentResult {
  score: number; // 0-100
  correctedVersion: string;
  feedbackItems: FeedbackItem[];
  generalComment: string;
  improvedVocabulary: string[];
}

export type AppState = 
  | 'SELECTION_LEVEL'
  | 'SELECTION_MODE'
  | 'GENERATING_EXERCISE'
  | 'WRITING'
  | 'ANALYZING'
  | 'FEEDBACK';