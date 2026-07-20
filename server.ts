/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory databases
let localQuestions = [
  // General Trivia
  {
    id: 'g1',
    question: 'Which of these is the largest ocean on Earth?',
    type: 'mcq',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
    correctAnswer: 'Pacific Ocean',
    explanation: 'The Pacific Ocean is the largest and deepest of Earth\'s oceanic divisions, covering about 46% of Earth\'s water surface.',
    hint: 'It is named after the Latin word for "peaceful".',
    difficulty: 'easy',
    category: 'general',
    points: 100
  },
  {
    id: 'g2',
    question: 'The Great Wall of China is fully visible from outer space with the naked eye.',
    type: 'boolean',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'Despite the popular myth, the Great Wall of China is typically not visible to the naked eye from low Earth orbit without aid, as it is narrow and blends with the environment.',
    hint: 'Human eye resolution is not high enough to see a 10m wide wall from 400km away.',
    difficulty: 'easy',
    category: 'general',
    points: 100
  },
  // Science & Tech
  {
    id: 't1',
    question: 'What is the speed of light in a vacuum?',
    type: 'mcq',
    options: ['~150,000 km/s', '~300,000 km/s', '~500,000 km/s', '~1,000,000 km/s'],
    correctAnswer: '~300,000 km/s',
    explanation: 'The speed of light in vacuum is exactly 299,792 kilometers per second, which is roughly 300,000 km/s.',
    hint: 'Light takes about 8 minutes to travel from the Sun to the Earth.',
    difficulty: 'medium',
    category: 'tech',
    points: 150
  },
  {
    id: 't2',
    question: 'Which element has the chemical symbol "Au"?',
    type: 'mcq',
    options: ['Silver', 'Gold', 'Copper', 'Aluminium'],
    correctAnswer: 'Gold',
    explanation: 'The symbol "Au" is derived from the Latin word "aurum", which means "shining dawn".',
    hint: 'It is a highly valued precious metal known for its luster and luxury.',
    difficulty: 'easy',
    category: 'tech',
    points: 100
  },
  // Brands & Logos
  {
    id: 'b1',
    question: 'Which corporate tech giant originally featured Isaac Newton sitting under an apple tree in its logo?',
    type: 'logo',
    options: ['Microsoft', 'Apple', 'Intel', 'HP'],
    correctAnswer: 'Apple',
    explanation: 'Apple\'s very first logo, designed by Ronald Wayne in 1976, showed Isaac Newton sitting under an apple tree, with a poem in the border.',
    hint: 'Founded by Steve Jobs, Steve Wozniak, and Ronald Wayne.',
    difficulty: 'medium',
    category: 'brands',
    points: 150,
    imageUrl: '🍎'
  },
  {
    id: 'b2',
    question: 'What premium luxury car brand has a logo featuring a charging bull?',
    type: 'logo',
    options: ['Ferrari', 'Porsche', 'Lamborghini', 'Maserati'],
    correctAnswer: 'Lamborghini',
    explanation: 'Lamborghini\'s logo features a golden charging bull on a black shield, representing the founder Ferruccio Lamborghini\'s zodiac sign (Taurus).',
    hint: 'Famous for hypercars like the Aventador and Huracán.',
    difficulty: 'medium',
    category: 'brands',
    points: 150,
    imageUrl: '🐂'
  },
  // Emoji Puzzles
  {
    id: 'e1',
    question: 'Guess the movie from these emojis:',
    type: 'emoji',
    emojiSymbol: '🦁👑👑',
    options: ['The Lion King', 'Madagascar', 'Gladiator', 'Black Panther'],
    correctAnswer: 'The Lion King',
    explanation: 'The combination of the Lion and Crown emojis refers to Disney\'s legendary film "The Lion King".',
    hint: 'Hakuna Matata!',
    difficulty: 'easy',
    category: 'emoji',
    points: 100
  },
  {
    id: 'e2',
    question: 'Guess the famous sci-fi movie from these emojis:',
    type: 'emoji',
    emojiSymbol: '🪐🚀🕶️🔴🔵',
    options: ['Interstellar', 'The Matrix', 'Star Wars', 'Avatar'],
    correctAnswer: 'The Matrix',
    explanation: 'The sunglasses, pills (red pill, blue pill), and spaceship/simulation elements point to the reality-bending sci-fi hit "The Matrix".',
    hint: 'Choose between the red pill or the blue pill.',
    difficulty: 'medium',
    category: 'emoji',
    points: 150
  },
  // Flags of the World
  {
    id: 'f1',
    question: 'Which country\'s flag is a red circle on a solid white background?',
    type: 'flag',
    options: ['South Korea', 'Japan', 'Palau', 'Bangladesh'],
    correctAnswer: 'Japan',
    explanation: 'The national flag of Japan is a white rectangular flag with a crimson circle at its center, representing the rising sun.',
    hint: 'This nation is known as the "Land of the Rising Sun".',
    difficulty: 'easy',
    category: 'flags',
    points: 100,
    imageUrl: '🇯🇵'
  },
  {
    id: 'f2',
    question: 'Which country has a flag featuring a stylized red maple leaf at the center?',
    type: 'flag',
    options: ['Canada', 'Switzerland', 'Austria', 'Denmark'],
    correctAnswer: 'Canada',
    explanation: 'The National Flag of Canada, often simply referred to as the Canadian Flag or the Maple Leaf, features a central 11-pointed maple leaf.',
    hint: 'Its capital is Ottawa.',
    difficulty: 'easy',
    category: 'flags',
    points: 100,
    imageUrl: '🇨🇦'
  },
  // Monuments & Travel
  {
    id: 'm1',
    question: 'In which city would you find the world-famous Colosseum?',
    type: 'image',
    options: ['Athens', 'Rome', 'Paris', 'Istanbul'],
    correctAnswer: 'Rome',
    explanation: 'The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy, built under the Flavian dynasty.',
    hint: 'It is the capital city of Italy.',
    difficulty: 'easy',
    category: 'monuments',
    points: 100,
    imageUrl: '🏛️'
  },
  {
    id: 'm2',
    question: 'Where is the iconic Taj Mahal located?',
    type: 'image',
    options: ['Agra, India', 'New Delhi, India', 'Cairo, Egypt', 'Lahore, Pakistan'],
    correctAnswer: 'Agra, India',
    explanation: 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in the Indian city of Agra, built by the Mughal emperor Shah Jahan.',
    hint: 'It was built as a symbol of eternal love for Mumtaz Mahal.',
    difficulty: 'medium',
    category: 'monuments',
    points: 150,
    imageUrl: '🕌'
  },
  // Puzzles
  {
    id: 'p1',
    question: 'What has keys but can\'t open single locks, has space but no room, and you can enter but can\'t go outside?',
    type: 'puzzle',
    puzzleClue: '🎹',
    options: ['A Piano', 'A Book', 'A Keyboard', 'A Map'],
    correctAnswer: 'A Keyboard',
    explanation: 'A computer keyboard has letter keys, a space bar, and an Enter key!',
    hint: 'You are using one right now to type or navigate.',
    difficulty: 'hard',
    category: 'general',
    points: 200
  }
];

let localLeaderboard = [
  {
    id: 'l1',
    name: 'ShortsKing_99',
    score: 1850,
    accuracy: 95,
    timeTaken: 120,
    date: '2026-07-19',
    avatar: '👑',
    mode: 'classic'
  },
  {
    id: 'l2',
    name: 'TriviaToni',
    score: 1620,
    accuracy: 90,
    timeTaken: 140,
    date: '2026-07-18',
    avatar: '⚡',
    mode: 'time_attack'
  },
  {
    id: 'l3',
    name: 'QuizVlogger',
    score: 1450,
    accuracy: 85,
    timeTaken: 110,
    date: '2026-07-19',
    avatar: '🎥',
    mode: 'classic'
  },
  {
    id: 'l4',
    name: 'MindPalace',
    score: 1200,
    accuracy: 80,
    timeTaken: 160,
    date: '2026-07-17',
    avatar: '🧠',
    mode: 'survival'
  },
  {
    id: 'l5',
    name: 'CreatorBeast',
    score: 950,
    accuracy: 75,
    timeTaken: 90,
    date: '2026-07-19',
    avatar: '🦁',
    mode: 'rapid_fire'
  }
];

// Lazy Gemini API Client Initializer
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY environment variable is not configured yet. Please configure it via the Secrets Panel.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST API Routes

// Get questions
app.get('/api/questions', (req, res) => {
  res.json(localQuestions);
});

// Import or add custom question
app.post('/api/questions', (req, res) => {
  const newQuestion = req.body;
  if (!newQuestion.id) {
    newQuestion.id = 'q_' + Math.random().toString(36).substr(2, 9);
  }
  if (!newQuestion.points) {
    newQuestion.points = newQuestion.difficulty === 'hard' ? 200 : newQuestion.difficulty === 'medium' ? 150 : 100;
  }
  localQuestions.unshift(newQuestion);
  res.status(201).json(newQuestion);
});

// Reset questions
app.post('/api/questions/reset', (req, res) => {
  // Retain built-in questions, remove imports
  localQuestions = localQuestions.filter(q => q.id.startsWith('g') || q.id.startsWith('t') || q.id.startsWith('b') || q.id.startsWith('e') || q.id.startsWith('f') || q.id.startsWith('m') || q.id.startsWith('p'));
  res.json({ status: 'ok', count: localQuestions.length });
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  res.json(localLeaderboard);
});

// Post score to leaderboard
app.post('/api/leaderboard', (req, res) => {
  const newEntry = req.body;
  if (!newEntry.id) {
    newEntry.id = 'l_' + Math.random().toString(36).substr(2, 9);
  }
  if (!newEntry.date) {
    newEntry.date = new Date().toISOString().split('T')[0];
  }
  localLeaderboard.push(newEntry);
  // Sort by score descending
  localLeaderboard.sort((a, b) => b.score - a.score);
  res.status(201).json(newEntry);
});

// AI Question Generator using gemini-3.5-flash with custom schema
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { topic, difficulty, count = 5, category = 'general' } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate exactly ${count} highly creative, engaging, and premium television game-show style quiz questions on the topic "${topic}" with difficulty level "${difficulty}". The output MUST follow the schema. Be witty and make the explanation read like a professional TV presenter talking to standard gameplay recording creators. Use a mix of MCQ, True/False (boolean), emoji representation puzzles, and standard riddles.`,
      config: {
        systemInstruction: `You are an elite, TV quiz game show producer with legendary wit and futuristic charisma. You craft highly premium, engaging, and polished trivia questions with gorgeous cues.
For "boolean" types, provide exactly ['True', 'False'] options.
For "emoji" types, provide an emojiSymbol containing the secret code (like "🦁👑" for The Lion King) and standard multiple choice options.
For "puzzle" types, provide a short text riddle or clue in the puzzleClue field and MCQ options.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The quiz question string. Keep it dramatic." },
              type: { type: Type.STRING, description: "Type of the question. Must be one of: mcq, boolean, emoji, puzzle" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of exactly 4 creative options (exactly 2 for boolean: ['True', 'False'])"
              },
              correctAnswer: { type: Type.STRING, description: "Exactly matches the correct option string from the options array." },
              explanation: { type: Type.STRING, description: "A witty, professional, and satisfying game-show host commentary on why this answer is correct." },
              hint: { type: Type.STRING, description: "A subtle, cheeky hint that guides the player without giving it away." },
              emojiSymbol: { type: Type.STRING, description: "Optional. Emojis representing the secret concept, strictly required if type is 'emoji'." },
              puzzleClue: { type: Type.STRING, description: "Optional. Key word or clue symbol, strictly required if type is 'puzzle'." }
            },
            required: ['question', 'type', 'options', 'correctAnswer', 'explanation', 'hint']
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('AI returned an empty response.');
    }

    const questionsRaw = JSON.parse(text.trim());
    const generatedQuestions = questionsRaw.map((q: any) => {
      const qId = 'ai_' + Math.random().toString(36).substr(2, 9);
      return {
        id: qId,
        question: q.question,
        type: q.type || 'mcq',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'An elegant solution!',
        hint: q.hint || 'Follow your instincts.',
        difficulty: difficulty || 'medium',
        category: category || 'general',
        points: difficulty === 'hard' ? 200 : difficulty === 'medium' ? 150 : 100,
        emojiSymbol: q.emojiSymbol,
        puzzleClue: q.puzzleClue
      };
    });

    // Automatically append to in-memory list so the user can play it instantly!
    localQuestions.push(...generatedQuestions);

    res.json({
      success: true,
      questions: generatedQuestions
    });

  } catch (error: any) {
    console.error('Gemini generateContent error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to communicate with the Gemini AI service.'
    });
  }
});

// AI Hint Generator
app.post('/api/ai/hint', async (req, res) => {
  try {
    const { question, options, category } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a cheeky, elegant, and clever hint for the question: "${question}". Options are: ${options?.join(', ')}. Keep it under 25 words. Do not reveal the exact answer, but nudge the player creatively.`,
    });

    res.json({
      success: true,
      hint: response.text?.trim() || 'Look closely at the details.'
    });
  } catch (error: any) {
    res.json({
      success: false,
      hint: 'A tiny whisper says: follow your intuition!'
    });
  }
});

// AI Explanation Generator
app.post('/api/ai/explain', async (req, res) => {
  const { question, correctAnswer, explanation } = req.body;
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Explain why "${correctAnswer}" is the correct answer to the question: "${question}". Create a funny, dramatic, and fascinating game-show host monologue explaining the history or concept behind it. Write exactly 2-3 sentences.`,
    });

    res.json({
      success: true,
      explanation: response.text?.trim() || explanation
    });
  } catch (error: any) {
    res.json({
      success: false,
      explanation: explanation || 'That is the absolute truth!'
    });
  }
});

// AI Distractor generator for Creator Mode questions
app.post('/api/ai/suggest-distractors', async (req, res) => {
  try {
    const { question, correctAnswer } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `For the trivia question: "${question}", the correct answer is "${correctAnswer}". Suggest exactly 3 highly plausible, smart, and convincing incorrect options (distractors). Output them as a JSON array of 3 strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    res.json({
      success: true,
      distractors: parsed.length === 3 ? parsed : ['Option A', 'Option B', 'Option C']
    });
  } catch (error: any) {
    res.json({
      success: false,
      distractors: ['Misleading Choice Alpha', 'Intriguing Alternative Beta', 'Convincing Trick Gamma']
    });
  }
});

// Start server
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Export app for serverless environments (like Vercel)
export default app;

if (!process.env.VERCEL) {
  startServer();
}
