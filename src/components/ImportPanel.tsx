/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Database, Code, Upload, Plus, Trash2, ArrowRight, Sparkles, Check, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Question, Difficulty, QuestionType } from '../types';
import { DEFAULT_CATEGORIES } from '../data';
import { audioService } from '../services/audioService';

interface ImportPanelProps {
  onImportComplete: (importedQuestions: Question[]) => void;
  onBack: () => void;
}

export const ImportPanel: React.FC<ImportPanelProps> = ({ onImportComplete, onBack }) => {
  const [inputText, setInputText] = useState('');
  const [importType, setImportType] = useState<'text' | 'json' | 'csv'>('text');
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const [targetCategoryMode, setTargetCategoryMode] = useState<'detect' | 'preset' | 'custom'>('detect');
  const [selectedPresetCategory, setSelectedPresetCategory] = useState('general');
  const [customCategoryName, setCustomCategoryName] = useState('');

  const getSelectedCategoryId = (detectedCategory?: string): string => {
    if (targetCategoryMode === 'preset') {
      return selectedPresetCategory;
    }
    if (targetCategoryMode === 'custom') {
      return customCategoryName.trim().toLowerCase() || 'custom';
    }
    return detectedCategory || 'imported';
  };

  const handleUpdatePreviewCategory = (index: number, newCat: string) => {
    const updated = [...previewQuestions];
    updated[index].category = newCat.trim().toLowerCase();
    setPreviewQuestions(updated);
  };

  const handleParseText = () => {
    setParsingError(null);
    audioService.playClick();

    if (!inputText.trim()) {
      setParsingError('Please paste some text content to parse.');
      return;
    }

    try {
      if (importType === 'json') {
        const parsed = JSON.parse(inputText);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const loaded: Question[] = list.map((item, idx) => ({
          id: 'imp_' + Math.random().toString(36).substr(2, 9),
          question: item.question || `Custom Question ${idx + 1}`,
          type: (item.type as QuestionType) || 'mcq',
          options: Array.isArray(item.options) ? item.options : ['A', 'B', 'C', 'D'],
          correctAnswer: item.correctAnswer || item.answer || '',
          explanation: item.explanation || 'Created via JSON import.',
          hint: item.hint || 'No hint provided.',
          difficulty: (item.difficulty as Difficulty) || 'medium',
          category: getSelectedCategoryId(item.category),
          points: item.difficulty === 'hard' ? 200 : item.difficulty === 'medium' ? 150 : 100,
        }));
        setPreviewQuestions(loaded);
        return;
      }

      if (importType === 'csv') {
        const lines = inputText.split('\n').map((line) => line.trim()).filter(Boolean);
        const loaded: Question[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          // Rudimentary CSV parse, split by comma, ignoring quotes
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
          if (cols.length >= 6) {
            const question = cols[0];
            const opt1 = cols[1];
            const opt2 = cols[2];
            const opt3 = cols[3];
            const opt4 = cols[4];
            const correctAns = cols[5];
            const explanation = cols[6] || 'Imported via CSV.';
            
            loaded.push({
              id: 'imp_' + Math.random().toString(36).substr(2, 9),
              question,
              type: 'mcq',
              options: [opt1, opt2, opt3, opt4],
              correctAnswer: correctAns,
              explanation,
              hint: 'Identify the correct statement.',
              difficulty: 'medium',
              category: getSelectedCategoryId(cols[7]),
              points: 150,
            });
          }
        }
        if (loaded.length === 0) {
          throw new Error('Could not extract any rows. Make sure the CSV format is: Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation');
        }
        setPreviewQuestions(loaded);
        return;
      }

      // Plain text parser for AI outputs (NotebookLM, ChatGPT, Gemini)
      // Matches:
      // Q: ... or Question: ... or 1. ...
      // Options: A) ..., B) ... or A. ..., B. ...
      // Correct Answer: ... or Answer: ...
      // Explanation: ...
      const lines = inputText.split('\n').map(l => l.trim());
      const loaded: Question[] = [];
      let currentQ: Partial<Question> | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        // Start of question
        const qMatch = line.match(/^(?:(?:Question|Q|q)\s*(?:\d+)?:?|(?:\d+)\.)\s*(.*)/i);
        if (qMatch) {
          if (currentQ && currentQ.question && currentQ.options && currentQ.options.length > 0) {
            finalizeAndPush(currentQ, loaded);
          }
          currentQ = {
            question: qMatch[1].trim(),
            options: [],
            type: 'mcq',
            difficulty: 'medium',
            category: 'imported',
            explanation: 'Pasted text import.',
            hint: 'Review options carefully.'
          };
          continue;
        }

        // Option item match (e.g., A) Option, A. Option, - Option)
        const optMatch = line.match(/^(?:[A-D]\)|[A-D]\.|[1-4]\)|-\s+)(.*)/i);
        if (optMatch && currentQ) {
          currentQ.options?.push(optMatch[1].trim());
          continue;
        }

        // Correct Answer
        const ansMatch = line.match(/^(?:Correct\s+)?(?:Answer|Ans):?\s*(.*)/i);
        if (ansMatch && currentQ) {
          currentQ.correctAnswer = ansMatch[1].trim().replace(/^[A-D][\)\.\s-]*/i, ''); // Strip A) prefix if left
          continue;
        }

        // Explanation
        const expMatch = line.match(/^(?:Explanation|Expl|Reason):?\s*(.*)/i);
        if (expMatch && currentQ) {
          currentQ.explanation = expMatch[1].trim();
          continue;
        }

        // Catch general metadata
        const diffMatch = line.match(/^(?:Difficulty):?\s*(.*)/i);
        if (diffMatch && currentQ) {
          currentQ.difficulty = diffMatch[1].toLowerCase().includes('hard') ? 'hard' : diffMatch[1].toLowerCase().includes('easy') ? 'easy' : 'medium';
          continue;
        }

        const catMatch = line.match(/^(?:Category):?\s*(.*)/i);
        if (catMatch && currentQ) {
          currentQ.category = catMatch[1].trim();
          continue;
        }

        // If no prefix is matched but options are empty, and we have a active question, it might be a multiline option or standard question append
        if (currentQ && !currentQ.correctAnswer) {
          // If option looks plain, add it
          if (line.match(/^[A-Za-z0-9]/) && currentQ.options && currentQ.options.length < 4) {
            // Strip option letters if exist
            const cleanOpt = line.replace(/^[A-D][\)\.\s-]*/i, '');
            currentQ.options.push(cleanOpt);
          }
        }
      }

      // Flush final
      if (currentQ && currentQ.question && currentQ.options && currentQ.options.length > 0) {
        finalizeAndPush(currentQ, loaded);
      }

      if (loaded.length === 0) {
        throw new Error('We could not identify any valid questions. Please ensure your questions have a text prompt, options (A, B, C, D), and an answer marker.');
      }

      setPreviewQuestions(loaded);
    } catch (err: any) {
      setParsingError(err.message || 'Parsing failure. Check format.');
    }
  };

  const finalizeAndPush = (q: Partial<Question>, list: Question[]) => {
    // Fill up options if less than 4
    const opts = q.options || [];
    while (opts.length < 4) {
      opts.push(`Alternative ${opts.length + 1}`);
    }
    // Set correct answer fallback
    let correct = q.correctAnswer || opts[0];
    // If correct answer specifies a letter (like "A" or "B"), convert it to the text option
    if (correct.length === 1 && ['A', 'B', 'C', 'D'].includes(correct.toUpperCase())) {
      const idx = ['A', 'B', 'C', 'D'].indexOf(correct.toUpperCase());
      correct = opts[idx] || correct;
    }

    list.push({
      id: 'imp_' + Math.random().toString(36).substr(2, 9),
      question: q.question || 'Pasted Question',
      type: (q.type as QuestionType) || 'mcq',
      options: opts.slice(0, 4),
      correctAnswer: correct,
      explanation: q.explanation || 'Imported plain text.',
      hint: q.hint || 'No hint provided.',
      difficulty: q.difficulty || 'medium',
      category: getSelectedCategoryId(q.category),
      points: q.difficulty === 'hard' ? 200 : q.difficulty === 'medium' ? 150 : 100,
    });
  };

  const handleCommitImports = () => {
    if (previewQuestions.length === 0) return;
    audioService.playVictory();
    onImportComplete(previewQuestions);
  };

  const handleDeletePreviewItem = (index: number) => {
    audioService.playClick();
    setPreviewQuestions(previewQuestions.filter((_, idx) => idx !== index));
  };

  return (
    <div id="import-panel" className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-pink-400" />
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-pink-500">
              QUESTION INGESTION
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Import custom questions from Gemini, ChatGPT, NotebookLM outputs, or spreadsheets.</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Form (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl">
            <h3 className="text-xs font-mono tracking-wider uppercase mb-4 text-pink-400 flex items-center gap-2 font-bold">
              <Upload className="w-4 h-4 text-pink-400" />
              Source Format
            </h3>

            {/* Ingestion types toggle buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { type: 'text', icon: FileText, label: 'Plain Text' },
                { type: 'json', icon: Code, label: 'JSON Logs' },
                { type: 'csv', icon: FileSpreadsheet, label: 'CSV Sheet' },
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      setImportType(item.type as any);
                      audioService.playClick();
                    }}
                    className={`py-2.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                      importType === item.type
                        ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                        : 'border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[10px] font-bold font-sans">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Template format hint */}
            <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/5 text-[10px] text-slate-400 leading-relaxed font-mono mb-4">
              {importType === 'text' && (
                <>
                  <span className="text-pink-400 font-bold block mb-1 uppercase">Sample text format:</span>
                  1. Which planet is closest to the Sun?<br />
                  A) Venus<br />
                  B) Mercury<br />
                  C) Mars<br />
                  D) Earth<br />
                  Correct Answer: Mercury<br />
                  Explanation: Mercury is the innermost planet of our Solar system.<br />
                  Difficulty: Easy
                </>
              )}
              {importType === 'json' && (
                <>
                  <span className="text-pink-400 font-bold block mb-1 uppercase">Sample JSON structure:</span>
                  [{"{"}<br />
                  &nbsp;&nbsp;"question": "How many elements?",<br />
                  &nbsp;&nbsp;"options": ["118", "92", "104", "126"],<br />
                  &nbsp;&nbsp;"correctAnswer": "118",<br />
                  &nbsp;&nbsp;"explanation": "There are 118 verified elements."<br />
                  {"}"}]
                </>
              )}
              {importType === 'csv' && (
                <>
                  <span className="text-pink-400 font-bold block mb-1 uppercase">Sample CSV format:</span>
                  Question,OptA,OptB,OptC,OptD,CorrectAnswer,Explanation<br />
                  Who wrote Hamlet?,Shakespeare,Goethe,Dante,Homer,Shakespeare,William Shakespeare in 1599.
                </>
              )}
            </div>

            {/* Target Category Classification Control */}
            <div className="mb-4 space-y-2 border border-pink-500/10 p-3.5 rounded-2xl bg-slate-950/50">
              <label className="text-[10px] font-mono text-pink-400 block uppercase tracking-wider font-bold">
                Target Category Classification
              </label>
              
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-white/5">
                {[
                  { mode: 'detect', label: 'Auto-Detect' },
                  { mode: 'preset', label: 'Built-in Preset' },
                  { mode: 'custom', label: 'New Custom' }
                ].map((option) => (
                  <button
                    key={option.mode}
                    type="button"
                    onClick={() => { setTargetCategoryMode(option.mode as any); audioService.playClick(); }}
                    className={`py-1.5 text-[9px] font-mono font-bold uppercase rounded-lg transition-all cursor-pointer ${
                      targetCategoryMode === option.mode
                        ? 'bg-pink-500 text-white font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {targetCategoryMode === 'preset' && (
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Select Built-in Destination</label>
                  <select
                    value={selectedPresetCategory}
                    onChange={(e) => { setSelectedPresetCategory(e.target.value); audioService.playClick(); }}
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-pink-500/50"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetCategoryMode === 'custom' && (
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-mono text-slate-500 block uppercase">Type Custom Category Name</label>
                  <input
                    type="text"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="e.g. World History, Pop Culture, Gaming"
                    className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 font-sans focus:outline-none focus:border-pink-500/50 placeholder-slate-600"
                  />
                </div>
              )}

              {targetCategoryMode === 'detect' && (
                <p className="text-[9px] text-slate-500 font-sans italic leading-relaxed">
                  The parser will read from the imported metadata / source tags or assign to "imported" by default.
                </p>
              )}
            </div>

            {/* Input area */}
            <textarea
              id="import-source-area"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste your pasted AI or spreadsheet raw data here...`}
              className="w-full h-64 p-3 bg-slate-950 border border-white/5 rounded-2xl text-xs text-slate-200 font-mono focus:outline-none focus:border-pink-500/50 resize-none"
            />

            {parsingError && (
              <div className="flex items-start gap-2 p-3 border border-red-500/20 bg-red-950/10 rounded-2xl text-[11px] text-red-400 mt-3 font-sans">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{parsingError}</span>
              </div>
            )}

            <button
              onClick={handleParseText}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-mono font-bold rounded-2xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:opacity-90 cursor-pointer mt-4 flex items-center justify-center gap-2 transition-all"
            >
              Parse Data Sources
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Preview Panel (3 Columns) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-5 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl flex flex-col h-full max-h-[720px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-mono tracking-wider uppercase text-amber-400 flex items-center gap-2 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Staged Questions Preview ({previewQuestions.length})
              </h3>
              {previewQuestions.length > 0 && (
                <button
                  onClick={handleCommitImports}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Commit to Memory
                </button>
              )}
            </div>

            {previewQuestions.length > 0 ? (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {previewQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex items-start justify-between gap-4 relative group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center border border-white/5">
                          {index + 1}
                        </span>
                        <div className="flex items-center gap-1 bg-slate-900/60 border border-white/5 px-2 py-0.5 rounded">
                          <span className="text-[9px] text-slate-500 font-mono uppercase">Category:</span>
                          <input
                            type="text"
                            value={q.category}
                            onChange={(e) => handleUpdatePreviewCategory(index, e.target.value)}
                            placeholder="category"
                            className="bg-transparent text-pink-400 text-[9px] font-mono font-bold w-24 focus:outline-none uppercase"
                          />
                        </div>
                        <span className="bg-slate-900 border border-white/5 text-slate-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-100 font-sans">{q.question}</h4>
                      
                      {/* Option labels */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl text-xs border font-sans ${
                              opt === q.correctAnswer
                                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300 font-extrabold'
                                : 'border-white/5 bg-slate-900/40 text-slate-400'
                            }`}
                          >
                            <span className="font-mono text-[10px] text-slate-500 mr-1.5">
                              {['A', 'B', 'C', 'D'][oIdx]})
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-400 leading-normal italic font-sans mt-2 block pl-2 border-l-2 border-white/10">
                        Host Voice: "{q.explanation}"
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePreviewItem(index)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 border border-dashed border-white/5 rounded-3xl font-mono">
                <Database className="w-12 h-12 mb-4 text-slate-600 animate-bounce" />
                <span>NO QUESTIONS REGISTERED IN STAGING.</span>
                <span className="text-[10px] text-slate-600 mt-2">PASTE YOUR RAW SOURCES IN THE LEFT FORM AND PRESS 'PARSE DATA SOURCES'.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ImportPanel;
