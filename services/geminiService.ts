import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { ProficiencyLevel, StudyMode, Exercise, AssessmentResult } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-types' });

// Schema for generating exercises
const exerciseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy title for the writing exercise" },
    description: { type: Type.STRING, description: "Clear instructions on what the user should write" },
    hint: { type: Type.STRING, description: "A helpful tip or starting words" },
    targetFocus: { type: Type.STRING, description: "The specific grammar rule, vocabulary theme, or listening skill being practiced" },
    // For dictation/cloze, we'll ask the model to put the sentence in 'hiddenText' inside the JSON first
    hiddenText: { type: Type.STRING, description: "For dictation/cloze: the exact complete sentence. For others: empty string." },
    clozeSentence: { type: Type.STRING, description: "For Fill-in-Blanks: The sentence with key words replaced by '_______'. Empty otherwise." }
  },
  required: ["title", "description", "hint", "targetFocus"]
};

// Schema for assessment feedback
const feedbackSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "A score from 0 to 100 based on the proficiency level" },
    correctedVersion: { type: Type.STRING, description: "The user's text rewritten perfectly" },
    generalComment: { type: Type.STRING, description: "Encouraging overall feedback" },
    improvedVocabulary: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of 3-5 sophisticated words that could replace simple words used in the text"
    },
    feedbackItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING, description: "The segment of text with an issue" },
          correction: { type: Type.STRING, description: "The corrected version of that segment" },
          explanation: { type: Type.STRING, description: "Why this change was made" },
          type: { type: Type.STRING, enum: ["grammar", "vocabulary", "style"] }
        },
        required: ["original", "correction", "explanation", "type"]
      }
    }
  },
  required: ["score", "correctedVersion", "generalComment", "feedbackItems", "improvedVocabulary"]
};

export const generateExercise = async (level: ProficiencyLevel, mode: StudyMode): Promise<Exercise> => {
  try {
    let specificInstruction = "";
    let systemInstruction = "You are an expert English teacher. Create engaging, level-appropriate writing prompts.";

    if (mode === StudyMode.DICTATION) {
      // For dictation, we do a two-step process: 1. Generate text, 2. Generate Audio
      const dictationPrompt = `Create a Dictation exercise for a student at ${level} level.
      Generate a single, interesting sentence that challenges their listening skills (e.g. using homophones, specific tenses, or minimal pairs).
      Return a JSON object with:
      - title: "Dictation Challenge"
      - description: "Listen to the audio carefully and type exactly what you hear."
      - hint: A context clue about the sentence (e.g. "It's about the weather").
      - targetFocus: What is being tested (e.g. "Past Perfect Tense").
      - hiddenText: The exact sentence you generated.`;

      const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: dictationPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: exerciseSchema,
          systemInstruction: systemInstruction
        }
      });

      if (!textResponse.text) throw new Error("No text response for dictation");
      const exerciseData = JSON.parse(textResponse.text) as Exercise;

      // Generate Audio for the hiddenText
      const audioResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: { parts: [{ text: exerciseData.hiddenText || "Hello" }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' }
            }
          }
        }
      });

      const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      return {
        ...exerciseData,
        audioData: audioData
      };

    } else if (mode === StudyMode.FILL_IN_BLANKS) {
       specificInstruction = `Create a Fill-in-the-Blanks exercise for ${level}.
       1. Generate a sentence (10-20 words) with clear grammar or vocabulary usage.
       2. Select 1-3 consecutive or separate key words to remove (e.g., prepositions, verb tenses, specific vocabulary).
       3. Create a 'clozeSentence' where these words are replaced by '_______'.
       4. Store the FULL, original sentence in 'hiddenText'.
       5. Description should be: "Complete the sentence by filling in the missing words. Rewrite the full sentence."`;

    } else if (mode === StudyMode.SENTENCE_CHALLENGE) {
      specificInstruction = `Create a Sentence Writing Challenge. 
      Give the user a specific constraint (e.g., "Use the word 'However'", "Write a sentence in Future Perfect Continuous", "Describe an apple without using the word red").
      The description should explicitly tell them what to write in one sentence.`;
    } else {
      // Default paragraphs
      specificInstruction = `Create a short English writing exercise. The focus is: ${mode}.
      Keep the topic interesting and relevant.
      The instruction should ask for a paragraph of about 3-5 sentences.`;
    }

    // Standard generation for non-dictation modes
    const prompt = `Create an English exercise for a student at ${level} level.
    ${specificInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: exerciseSchema,
        systemInstruction: systemInstruction
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as Exercise;

  } catch (error) {
    console.error("Error generating exercise:", error);
    return {
      title: "Daily Journal",
      description: "Write 3 sentences about what you did today.",
      hint: "Start with 'Today, I...'",
      targetFocus: "Past Tense Verbs"
    };
  }
};

export const assessWriting = async (text: string, exercise: Exercise, level: ProficiencyLevel): Promise<AssessmentResult> => {
  try {
    let contextInfo = "";
    if (exercise.hiddenText) {
      contextInfo = `Type of Exercise: Dictation or Fill-in-the-Blanks (Exact Match Required).
      Target Text (Correct Answer): "${exercise.hiddenText}"
      User Input: "${text}"
      Task: Compare the user input to the target text. 
      - If it is a perfect match (ignoring capitalization/minor punctuation), score 100.
      - If words are missing or wrong, mark them as specific errors.
      - Focus strictly on the differences between user input and target text.`;
    } else {
      contextInfo = `Student Level: ${level}
      Exercise Topic: ${exercise.title} - ${exercise.description}
      Student Text: "${text}"
      Task: Provide constructive feedback focusing on grammar, vocabulary choice, and natural flow.`;
    }

    const prompt = `Analyze the following student writing submission.
    ${contextInfo}
    
    Be encouraging but precise.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: feedbackSchema,
        systemInstruction: "You are a supportive English tutor. specific, actionable feedback."
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text) as AssessmentResult;
  } catch (error) {
    console.error("Error assessing writing:", error);
    throw error;
  }
};