import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Code2,
  GitBranch,
  Terminal,
  Bookmark,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Download,
  Sun,
  Moon,
  Search,
  Key,
  FolderTree,
  FileText,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  BarChart2,
  RefreshCw
} from 'lucide-react';

// Pre-populated demo topics for fallback / quick exploration
const SAMPLE_TOPICS = [
  { id: 'stem-1', name: 'Queue Data Structure', category: 'STEM', depth: 'Full Study Notes', level: 'Intermediate' },
  { id: 'stem-2', name: 'Photosynthesis & Electron Transport', category: 'STEM', depth: 'Full Study Notes', level: 'Beginner' },
  { id: 'hum-1', name: 'Causes of World War II', category: 'Humanities', depth: 'Full Study Notes', level: 'Intermediate' },
  { id: 'lang-1', name: 'French Subjunctive Mood Rules', category: 'Language', depth: 'Exam Prep Cheat Sheet', level: 'Advanced' },
];

// Fallback note template generator if API is unavailable or offline mode is chosen
const getFallbackNote = (topic, category, level, depth) => ({
  topic,
  category,
  level,
  depth,
  summary: `${topic} is a foundational concept in ${category}. Understanding this topic provides critical insight into core mechanics, practical applications, and academic evaluation standards at the ${level} level.`,
  breakdown: [
    { title: 'Core Definition & Context', content: `At its core, ${topic} describes a system or principle governed by defined rules and behaviors. In academic and real-world settings, it serves as a building block for higher-order reasoning.` },
    { title: 'Mechanisms & Key Dynamics', content: `Operation relies on specific sequential steps or foundational properties. Understanding how data or components flow through this system is essential for mastery.` },
    { title: 'Practical Applicability', content: `Widely implemented in modern engineering, research, analytical reasoning, and practical problem-solving across modern industries.` }
  ],
  analogy: {
    title: 'Real-World Ticket Counter Analogy',
    description: `Imagine people waiting in a single-file line at a theater box office. The first person to enter the line is the first to get served and leave (First-In, First-Out). Late arrivals join at the back, preventing any line-jumping.`
  },
  formulas: category === 'STEM' ? [
    { label: 'Time Complexity (Enqueue/Dequeue)', formula: 'O(1) - Constant Time' },
    { label: 'Space Complexity', formula: 'O(n) - Linear Space' }
  ] : [
    { label: 'Key Paradigm / Principle', formula: 'Cause -> Catalyst -> Major Event -> Structural Impact' }
  ],
  codeOrTimeline: category === 'STEM' 
    ? `// JavaScript Queue Implementation\nclass Queue {\n  constructor() {\n    this.items = [];\n  }\n  enqueue(element) { this.items.push(element); }\n  dequeue() { return this.items.shift(); }\n  front() { return this.items[0]; }\n}`
    : `1939: Catalyst Event Begins\n1941: Expansion & Strategic Shift\n1943: Turning Point Operations\n1945: Structural Resolution & Aftermath`,
  misconceptions: [
    'Assuming operations are arbitrary rather than strictly ordered.',
    'Confusing entry/exit priority with random access memory models.',
    'Overlooking edge cases such as empty state processing or overflow errors.'
  ],
  quiz: [
    {
      question: `What is the primary governing principle of ${topic}?`,
      options: ['First-In, First-Out (FIFO)', 'Last-In, First-Out (LIFO)', 'Random Access', 'Priority Override'],
      correct: 0,
      explanation: 'First-In, First-Out ensures items or events are processed in the exact order they arrive.'
    },
    {
      question: 'Which common pitfall should be avoided when applying this concept?',
      options: ['Ignoring boundary conditions', 'Using it for sorting algorithms', 'Expecting O(N^2) complexity', 'Enforcing strict linear order'],
      correct: 0,
      explanation: 'Boundary conditions (such as empty or full states) are critical failure points if left unchecked.'
    }
  ]
});

export default function App() {
  // Theme & Navigation State
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('explainer'); // 'explainer', 'saved', 'flashcards', 'git-hub', 'settings'

  // Gemini API Configuration
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('edugenie_gemini_key') || '');
  const [useDemoMode, setUseDemoMode] = useState(false);

  // Topic Explainer Inputs
  const [selectedCategory, setSelectedCategory] = useState('STEM');
  const [topicInput, setTopicInput] = useState('Queue Data Structure');
  const [level, setLevel] = useState('Intermediate'); // 'Beginner', 'Intermediate', 'Advanced'
  const [depth, setDepth] = useState('Full Study Notes'); // 'Quick Summary', 'Full Study Notes', 'Exam Prep Cheat Sheet'

  // Active Generated Note & Loading State
  const [currentNote, setCurrentNote] = useState(() => getFallbackNote('Queue Data Structure', 'STEM', 'Intermediate', 'Full Study Notes'));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Interactive Tools State
  const [savedNotes, setSavedNotes] = useState(() => {
    const saved = localStorage.getItem('edugenie_saved_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // System Logs & Terminal State
  const [logs, setLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), type: 'info', text: 'EduGenie system initialized.' },
    { id: 2, time: new Date().toLocaleTimeString(), type: 'success', text: 'Git repository mounted at /edugenie-core.' }
  ]);

  // Terminal log auto-scroll ref
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Sync saved notes to localStorage
  useEffect(() => {
    localStorage.setItem('edugenie_saved_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  // Sync API Key to localStorage
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('edugenie_gemini_key', key);
    addLog('info', `Gemini API key updated in local configuration.`);
  };

  const addLog = (type, text) => {
    setLogs((prev) => [
      ...prev,
      { id: Date.now(), time: new Date().toLocaleTimeString(), type, text }
    ]);
  };

  const generateNoteWithGemini = async () => {
    if (!topicInput.trim()) {
      setErrorMsg('Please enter a topic name.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setQuizAnswers({});
    setQuizSubmitted(false);

    addLog('info', `Initiating note generation for: "${topicInput}" (${selectedCategory}, ${level}, ${depth})`);

    // If Demo Mode or No API Key provided, fallback immediately with rich template
    if (useDemoMode || !apiKey) {
      setTimeout(() => {
        const note = getFallbackNote(topicInput, selectedCategory, level, depth);
        setCurrentNote(note);
        setIsLoading(false);
        addLog('warning', 'API key missing or Demo Mode active. Used EduGenie local fallback generator.');
      }, 1000);
      return;
    }

    const systemPrompt = `You are EduGenie, an expert AI academic tutor. Generate a comprehensive, structured study note on the given topic formatted as JSON.
Follow this JSON structure strictly without adding markdown codeblock wrappers around the JSON:
{
  "summary": "Concise 2-sentence executive summary.",
  "breakdown": [
    { "title": "Subtopic Title", "content": "Detailed explanatory paragraph." },
    { "title": "Mechanism / Process", "content": "Detailed explanation." }
  ],
  "analogy": {
    "title": "Creative Real-World Analogy Title",
    "description": "Engaging analogy explaining the topic simply."
  },
  "formulas": [
    { "label": "Key Concept / Formula", "formula": "LaTeX math or expression" }
  ],
  "codeOrTimeline": "Sample code snippet or historical/process timeline string.",
  "misconceptions": [
    "Common misconception 1 with correction.",
    "Common misconception 2 with correction."
  ],
  "quiz": [
    {
      "question": "Multiple choice question testing concept comprehension?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why Option A is correct."
    },
    {
      "question": "Second multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1,
      "explanation": "Why Option B is correct."
    }
  ]
}`;

    const userPrompt = `Subject Category: ${selectedCategory}
Topic: ${topicInput}
Cognitive Level: ${level}
Depth Mode: ${depth}`;

    try {
      addLog('info', `Posting payload to Gemini 2.5 Flash API...`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Received empty response payload from Gemini API.');
      }

      const parsedJson = JSON.parse(rawText);

      const completeNote = {
        topic: topicInput,
        category: selectedCategory,
        level,
        depth,
        ...parsedJson
      };

      setCurrentNote(completeNote);
      addLog('success', `Successfully generated notes for "${topicInput}" via Gemini API.`);
    } catch (err) {
      console.error(err);
      addLog('error', `Generation failed: ${err.message}. Falling back to template.`);
      setErrorMsg(`API error: ${err.message}. Showing structured offline template.`);
      setCurrentNote(getFallbackNote(topicInput, selectedCategory, level, depth));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveNote = (note) => {
    const exists = savedNotes.some((n) => n.topic === note.topic && n.category === note.category);
    if (exists) {
      setSavedNotes(savedNotes.filter((n) => !(n.topic === note.topic && n.category === note.category)));
      addLog('info', `Removed "${note.topic}" from saved notes.`);
    } else {
      setSavedNotes([...savedNotes, { ...note, id: Date.now() }]);
      addLog('success', `Saved "${note.topic}" to local study bookmarks.`);
    }
  };

  const isCurrentSaved = savedNotes.some((n) => n.topic === currentNote.topic && n.category === currentNote.category);

  const InteractiveQueueVisualizer = () => {
    const [queue, setQueue] = useState(['Task A', 'Task B', 'Task C']);
    const [newItem, setNewItem] = useState('');

    const enqueue = () => {
      if (!newItem.trim()) return;
      setQueue([...queue, newItem.trim()]);
      setNewItem('');
    };

    const dequeue = () => {
      if (queue.length === 0) return;
      setQueue(queue.slice(1));
    };

    return (
      <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-50 border-slate-200'} my-4`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> Interactive Queue Simulation (FIFO)
          </span>
          <span className="text-xs text-slate-400">Length: {queue.length} items</span>
        </div>

        {/* Visual Queue Elements */}
        <div className="flex items-center gap-2 overflow-x-auto p-3 bg-slate-950/40 rounded-lg min-h-[64px] border border-slate-800">
          <span className="text-xs font-mono text-emerald-400 px-2 py-1 bg-emerald-950/50 rounded border border-emerald-800/40">
            FRONT (Out)
          </span>
          {queue.length === 0 ? (
            <span className="text-xs text-slate-500 italic mx-auto">Queue is currently empty</span>
          ) : (
            queue.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/40 px-3 py-1.5 rounded-md text-sm font-mono text-indigo-200 animate-fadeIn"
              >
                <span>{item}</span>
                <span className="text-[10px] opacity-50 bg-indigo-950 px-1 rounded">#{idx}</span>
              </div>
            ))
          )}
          <span className="text-xs font-mono text-indigo-400 px-2 py-1 bg-indigo-950/50 rounded border border-indigo-800/40 ml-auto">
            REAR (In)
          </span>
        </div>

        {/* Queue Operations Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <input
            type="text"
            placeholder="New item name..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className={`px-3 py-1.5 text-sm rounded-lg border outline-none ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-300'
            }`}
          />
          <button
            onClick={enqueue}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
          >
            Enqueue (Push)
          </button>
          <button
            onClick={dequeue}
            disabled={queue.length === 0}
            className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-medium rounded-lg transition disabled:opacity-40"
          >
            Dequeue (Pop Front)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      {/* Top Main Navigation Bar */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explainer')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                EduGenie
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight">Gemini AI Learning Assistant</p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-slate-800/80">
            {[
              { id: 'explainer', label: 'Topic Explainer', icon: BookOpen },
              { id: 'saved', label: 'Saved Notes', icon: Bookmark, badge: savedNotes.length },
              { id: 'flashcards', label: 'Flashcards', icon: Layers },
              { id: 'git-hub', label: 'Git & Dev Hub', icon: GitBranch }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 bg-indigo-900 text-indigo-200 text-[10px] rounded-full font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseDemoMode(!useDemoMode)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition ${
                useDemoMode
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-700'
              }`}
            >
              {useDemoMode ? 'Offline Demo Mode' : 'Live Gemini Mode'}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition ${
                darkMode ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: TOPIC EXPLAINER ENGINE */}
        {activeTab === 'explainer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Control Column: Input Controls & Parameters */}
            <div className="lg:col-span-4 space-y-5">
              {/* Category Selector Card */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" /> Subject Domain
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'STEM', color: 'indigo' },
                    { id: 'Humanities', color: 'purple' },
                    { id: 'Language', color: 'pink' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium transition border ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {cat.id}
                    </button>
                  ))}
                </div>

                {/* Topic Input Field */}
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Topic Name or Concept</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                      placeholder="e.g. Queue Data Structure, World War II..."
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border outline-none transition ${
                        darkMode ? 'bg-slate-950 border-slate-800 focus:border-indigo-500 text-slate-100' : 'bg-slate-50 border-slate-300 focus:border-indigo-600'
                      }`}
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Sample Quick Pick Buttons */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-500 self-center mr-1">Quick Picks:</span>
                  {SAMPLE_TOPICS.filter((t) => t.category === selectedCategory).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        setTopicInput(st.name);
                        setLevel(st.level);
                        setDepth(st.depth);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-indigo-300 transition"
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Toggles & Depth Control Card */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Cognitive Level & Depth
                </h2>

                {/* Explanation Level */}
                <div className="mb-4">
                  <label className="block text-xs text-slate-400 mb-1.5">Complexity Level</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLevel(lvl)}
                        className={`py-1.5 text-xs rounded-lg border font-medium transition ${
                          level === lvl
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : darkMode ? 'bg-slate-800/40 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Depth Selector */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Output Format</label>
                  <div className="space-y-1.5">
                    {['Quick Summary', 'Full Study Notes', 'Exam Prep Cheat Sheet'].map((dp) => (
                      <button
                        key={dp}
                        onClick={() => setDepth(dp)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition ${
                          depth === dp
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : darkMode ? 'bg-slate-800/30 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{dp}</span>
                        {depth === dp && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateNoteWithGemini}
                  disabled={isLoading}
                  className="w-full mt-5 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Notes...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate Structured Notes
                    </>
                  )}
                </button>

                {errorMsg && (
                  <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Gemini Key Config Drawer */}
              <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" /> API Configuration
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${apiKey ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                    {apiKey ? 'API Key Configured' : 'No Key (Demo Mode)'}
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="Paste Gemini API Key..."
                  value={apiKey}
                  onChange={(e) => handleSaveApiKey(e.target.value)}
                  className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Right Display Column: Generated Academic Notes */}
            {}
            <div className="lg:col-span-8">
              {currentNote && (
                <div className={`p-6 sm:p-8 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-md'}`}>
                  {/* Note Header & Bookmarking */}
                  <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                          {currentNote.category}
                        </span>
                        <span className="text-xs text-slate-400">• {currentNote.level}</span>
                        <span className="text-xs text-slate-400">• {currentNote.depth}</span>
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-indigo-200">{currentNote.topic}</h2>
                    </div>

                    <button
                      onClick={() => toggleSaveNote(currentNote)}
                      className={`p-2 rounded-xl border transition ${
                        isCurrentSaved
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                      title={isCurrentSaved ? 'Remove from saved notes' : 'Bookmark note'}
                    >
                      <Bookmark className={`w-5 h-5 ${isCurrentSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Executive Summary */}
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" /> Executive Summary
                    </h3>
                    <p className={`text-sm sm:text-base leading-relaxed p-4 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                      {currentNote.summary}
                    </p>
                  </div>

                  {/* Core Mechanics & Breakdown */}
                  {currentNote.breakdown && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Core Principles & Breakdown
                      </h3>
                      <div className="space-y-3">
                        {currentNote.breakdown.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
                          >
                            <h4 className="font-semibold text-sm text-indigo-300 mb-1">{item.title}</h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Queue Visualizer Integration if STEM Queue */}
                  {currentNote.topic.toLowerCase().includes('queue') && <InteractiveQueueVisualizer />}

                  {/* Real-World Metaphor / Analogy */}
                  {currentNote.analogy && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" /> Conceptual Analogy
                      </h3>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                        <h4 className="font-semibold text-sm text-amber-300 mb-1">{currentNote.analogy.title}</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">{currentNote.analogy.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Key Formulas / Data Table */}
                  {currentNote.formulas && currentNote.formulas.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Key Formulas & Mathematical Models
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentNote.formulas.map((f, i) => (
                          <div key={i} className={`p-3 rounded-xl border font-mono text-xs ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                            <span className="text-slate-400 block mb-1">{f.label}:</span>
                            <span className="text-emerald-400 font-semibold">{f.formula}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Snippet or Timeline Block */}
                  {currentNote.codeOrTimeline && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" /> Implementation / Timeline Reference
                      </h3>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto">
                        <code>{currentNote.codeOrTimeline}</code>
                      </pre>
                    </div>
                  )}

                  {/* Common Misconceptions */}
                  {currentNote.misconceptions && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Exam Pitfalls & Misconceptions
                      </h3>
                      <ul className="space-y-2">
                        {currentNote.misconceptions.map((m, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300 bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interactive Quiz Check */}
                  {}
                  {currentNote.quiz && currentNote.quiz.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-indigo-400" /> Interactive Knowledge Check
                        </h3>
                        {quizSubmitted && (
                          <button
                            onClick={() => {
                              setQuizAnswers({});
                              setQuizSubmitted(false);
                            }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset Quiz
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {currentNote.quiz.map((q, qIdx) => (
                          <div key={qIdx} className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-sm font-medium text-slate-200 mb-3">{qIdx + 1}. {q.question}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[qIdx] === oIdx;
                                const isCorrect = q.correct === oIdx;
                                let btnStyle = darkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700';

                                if (quizSubmitted) {
                                  if (isCorrect) btnStyle = 'bg-emerald-950/60 border-emerald-700 text-emerald-300 font-semibold';
                                  else if (isSelected && !isCorrect) btnStyle = 'bg-rose-950/60 border-rose-800 text-rose-300';
                                } else if (isSelected) {
                                  btnStyle = 'bg-indigo-600 text-white border-indigo-500';
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    disabled={quizSubmitted}
                                    onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                                    className={`p-2.5 text-xs text-left rounded-lg border transition ${btnStyle}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {quizSubmitted && (
                              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                                <span className="font-semibold text-indigo-300">Explanation: </span>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {!quizSubmitted && (
                        <button
                          onClick={() => setQuizSubmitted(true)}
                          disabled={Object.keys(quizAnswers).length === 0}
                          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition"
                        >
                          Submit Answers & Check Score
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED NOTES BOOKMARKS */}
        {}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Saved Study Bookmarks</h2>
                <p className="text-xs text-slate-400">Review your stored study notes and concepts.</p>
              </div>
              <span className="text-xs px-3 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded-full font-mono">
                {savedNotes.length} Saved
              </span>
            </div>

            {savedNotes.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No saved notes yet.</p>
                <button
                  onClick={() => setActiveTab('explainer')}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl hover:bg-indigo-500 transition"
                >
                  Explore Topics
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedNotes.map((note) => (
                  <div key={note.id} className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                        {note.category}
                      </span>
                      <button
                        onClick={() => toggleSaveNote(note)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg text-slate-100 mb-1">{note.topic}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{note.summary}</p>
                    <button
                      onClick={() => {
                        setCurrentNote(note);
                        setActiveTab('explainer');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      Open Full Note <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FLASHCARDS GENERATOR */}
        {activeTab === 'flashcards' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-100">Study Flashcard Deck</h2>
              <p className="text-xs text-slate-400">Click card to flip between topic question and key summary.</p>
            </div>

            {currentNote ? (
              <div className="perspective-1000">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`w-full min-h-[260px] p-8 rounded-3xl border cursor-pointer transition-all duration-500 transform shadow-xl flex flex-col justify-between ${
                    darkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Card 1 of 1 • {currentNote.category}</span>
                    <span className="text-indigo-400 font-mono text-[10px] uppercase">Click to Flip</span>
                  </div>

                  <div className="text-center my-6">
                    {!isFlipped ? (
                      <div>
                        <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block mb-2">Question / Concept</span>
                        <h3 className="text-2xl font-bold text-slate-100">{currentNote.topic}</h3>
                        <p className="text-xs text-slate-400 mt-2">What are the core mechanisms and real-world analogy?</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider block mb-2">Answer / Summary</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{currentNote.summary}</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-xs text-slate-500">
                    {isFlipped ? 'Showing Answer Side' : 'Showing Front Side'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500">Generate a topic note first to auto-create flashcards.</p>
            )}
          </div>
        )}

        {/* TAB 4: GIT HUB & DEV TERMINAL SIMULATOR */}
        {}
        {activeTab === 'git-hub' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Project Tree Structure */}
            <div className={`lg:col-span-5 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-400" /> Git Project Structure
              </h3>
              <div className="font-mono text-xs space-y-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                <div className="text-indigo-400 font-semibold">📁 edugenie-learning-assistant/</div>
                <div className="pl-4 text-slate-400">├── 📁 src/</div>
                <div className="pl-8 text-emerald-400">├── 📁 components/</div>
                <div className="pl-12 text-slate-400">├── TopicExplainer.jsx</div>
                <div className="pl-12 text-slate-400">├── FlashcardDeck.jsx</div>
                <div className="pl-12 text-slate-400">├── QuizRunner.jsx</div>
                <div className="pl-8 text-emerald-400">├── 📁 services/</div>
                <div className="pl-12 text-indigo-300">└── gemini.js</div>
                <div className="pl-8 text-slate-400">├── App.jsx</div>
                <div className="pl-8 text-slate-400">└── main.jsx</div>
                <div className="pl-4 text-slate-400">├── package.json</div>
                <div className="pl-4 text-slate-400">├── README.md</div>
                <div className="pl-4 text-slate-400">└── tailwind.config.js</div>
              </div>

              {/* Git Quick Setup Commands */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Clone & Local Setup</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <p className="text-emerald-400">$ git clone https://github.com/edugenie/core.git</p>
                  <p className="text-slate-400">$ cd edugenie-core</p>
                  <p className="text-slate-400">$ npm install @google/genai</p>
                  <p className="text-slate-400">$ npm run dev</p>
                </div>
              </div>
            </div>

            {/* Live Operations Terminal Log */}
            <div className={`lg:col-span-7 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Live Terminal & API Operation Logs
                </h3>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear Logs
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs h-80 overflow-y-auto space-y-2">
                {logs.length === 0 ? (
                  <p className="text-slate-600 italic">No logs recorded yet.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className="text-slate-600 text-[10px]">{log.time}</span>
                      <span
                        className={`font-semibold shrink-0 ${
                          log.type === 'error'
                            ? 'text-rose-400'
                            : log.type === 'warning'
                            ? 'text-amber-400'
                            : log.type === 'success'
                            ? 'text-emerald-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        [{log.type.toUpperCase()}]:
                      </span>
                      <span className="text-slate-300 leading-tight">{log.text}</span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}