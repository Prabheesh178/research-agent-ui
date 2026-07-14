import React, { useState, useEffect } from "react";
import { 
  Brain, Sparkles, Menu, X, Pin, Plus, MessageSquare, ChevronDown, ChevronRight, 
  Settings, Key, FileText, Database, ShieldAlert, Sliders, Palette, Trash2, 
  Download, HelpCircle, Server, FileCode, Check, RefreshCw
} from "lucide-react";
import ChatInterface from "./components/ChatInterface";
import MemoryProfilePanel from "./components/MemoryProfilePanel";
import AgentPipelineVisualizer from "./components/AgentPipelineVisualizer";
import SkillsPanel from "./components/SkillsPanel";
import PluginsPanel from "./components/PluginsPanel";
import { getApiBaseUrl, setApiBaseUrl } from "./utils/api";

const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"];
const OPENROUTER_MODELS = [
  "google/gemma-2-9b-it:free", 
  "meta-llama/llama-3.1-8b-instruct:free", 
  "mistralai/mistral-7b-instruct:free", 
  "qwen/qwen-2.5-72b-instruct:free"
];
const OLLAMA_MODELS = ["qwen2.5:8b", "llama3", "mistral"];

export default function App() {
  // Sidebar states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarPinned, setSidebarPinned] = useState(true);
  const [activeSubpage, setActiveSubpage] = useState("none"); // "none", "skills", "plugins"
  
  // Stats
  const [requestCount, setRequestCount] = useState(5);
  const [backendStatus, setBackendStatus] = useState("cold");
  
  // Collapsible settings sections
  const [collapsedSections, setCollapsedSections] = useState({
    model: false,
    defaults: true,
    memory: true,
    pipeline: true,
    appearance: true
  });

  // System credentials and models
  const [provider, setProvider] = useState(localStorage.getItem("llm_provider") || "openai");
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [tavilyKey, setTavilyKey] = useState(localStorage.getItem("tavily_api_key") || "");
  const [llmBaseUrl, setLlmBaseUrl] = useState(localStorage.getItem("llm_base_url") || "");
  const [llmModel, setLlmModel] = useState(localStorage.getItem("llm_model") || "gpt-4o-mini");
  const [modelTier, setModelTier] = useState(localStorage.getItem("model_tier") || "FREE");
  const [userId, setUserId] = useState(localStorage.getItem("research_user_id") || "default_academic");
  const [apiBase, setApiBase] = useState(getApiBaseUrl());

  // Document Defaults
  const [citationStyle, setCitationStyle] = useState(localStorage.getItem("default_citation") || "IEEE");
  const [outputFormat, setOutputFormat] = useState(localStorage.getItem("default_output") || "DOCX / LaTeX");
  const [language, setLanguage] = useState(localStorage.getItem("default_lang") || "English");

  // Memory settings
  const [selfLearning, setSelfLearning] = useState(localStorage.getItem("mem_self_learning") !== "OFF");
  const [styleMatching, setStyleMatching] = useState(localStorage.getItem("mem_style_matching") !== "OFF");
  const [sessionHistory, setSessionHistory] = useState(localStorage.getItem("mem_session_history") !== "OFF");

  // Pipeline toggles
  const [webSearchToggle, setWebSearchToggle] = useState(localStorage.getItem("pipe_web_search") !== "OFF");
  const [ragToggle, setRagToggle] = useState(localStorage.getItem("pipe_rag") !== "OFF");
  const [humanizerToggle, setHumanizerToggle] = useState(localStorage.getItem("pipe_humanizer") !== "OFF");
  const [confidenceScoreToggle, setConfidenceScoreToggle] = useState(localStorage.getItem("pipe_confidence") === "ON");
  const [citationGraphToggle, setCitationGraphToggle] = useState(localStorage.getItem("pipe_cit_graph") === "ON");

  // Appearance
  const [theme, setTheme] = useState(localStorage.getItem("app_theme") || "dark");
  const [fontSize, setFontSize] = useState(localStorage.getItem("app_font_size") || "normal");
  const [streaming, setStreaming] = useState(localStorage.getItem("app_streaming") !== "OFF");

  // Pipeline execution logs
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [activeIntent, setActiveIntent] = useState("QA");
  const [refreshProfileCounter, setRefreshProfileCounter] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Skills & Plugins Counts
  const [skillsCount, setSkillsCount] = useState(0);
  const [pluginsCount, setPluginsCount] = useState(0);

  // Warm up Render backend ping
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const res = await fetch(`${apiBase}/ping`);
        const data = await res.json();
        if (data.status === "awake") {
          setBackendStatus("live");
        }
      } catch (err) {
        console.error("Backend ping failed:", err);
      }
    };
    pingBackend();
  }, [apiBase]);

  // Request count reset interval (60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setRequestCount(prev => (prev > 0 ? Math.max(0, prev - 1) : 0));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-sync LLM providers & keys
  useEffect(() => {
    localStorage.setItem("llm_provider", provider);
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("tavily_api_key", tavilyKey);
    localStorage.setItem("llm_base_url", llmBaseUrl);
    localStorage.setItem("llm_model", llmModel);
    localStorage.setItem("model_tier", modelTier);
    localStorage.setItem("research_user_id", userId);
    setApiBaseUrl(apiBase);
  }, [provider, openaiKey, tavilyKey, llmBaseUrl, llmModel, modelTier, userId, apiBase]);

  // Auto-sync document defaults
  useEffect(() => {
    localStorage.setItem("default_citation", citationStyle);
    localStorage.setItem("default_output", outputFormat);
    localStorage.setItem("default_lang", language);
  }, [citationStyle, outputFormat, language]);

  // Sync memory options
  useEffect(() => {
    localStorage.setItem("mem_self_learning", selfLearning ? "ON" : "OFF");
    localStorage.setItem("mem_style_matching", styleMatching ? "ON" : "OFF");
    localStorage.setItem("mem_session_history", sessionHistory ? "ON" : "OFF");
  }, [selfLearning, styleMatching, sessionHistory]);

  // Sync pipeline flags
  useEffect(() => {
    localStorage.setItem("pipe_web_search", webSearchToggle ? "ON" : "OFF");
    localStorage.setItem("pipe_rag", ragToggle ? "ON" : "OFF");
    localStorage.setItem("pipe_humanizer", humanizerToggle ? "ON" : "OFF");
    localStorage.setItem("pipe_confidence", confidenceScoreToggle ? "ON" : "OFF");
    localStorage.setItem("pipe_cit_graph", citationGraphToggle ? "ON" : "OFF");
  }, [webSearchToggle, ragToggle, humanizerToggle, confidenceScoreToggle, citationGraphToggle]);

  // Sync appearance
  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    localStorage.setItem("app_font_size", fontSize);
    localStorage.setItem("app_streaming", streaming ? "ON" : "OFF");
  }, [theme, fontSize, streaming]);

  // Trigger counts updates
  const refreshLibraryCounts = async () => {
    try {
      const skillsRes = await fetch(`${apiBase}/api/skills/${userId}`);
      const sData = await skillsRes.json();
      setSkillsCount(sData.skills ? sData.skills.length : 0);

      const pluginsRes = await fetch(`${apiBase}/api/plugins/${userId}`);
      const pData = await pluginsRes.json();
      setPluginsCount(pData.plugins ? pData.plugins.length : 0);
    } catch (err) {
      console.warn("Could not load counts:", err);
    }
  };

  useEffect(() => {
    refreshLibraryCounts();
  }, [userId, apiBase, activeSubpage]);

  const toggleSection = (sec) => {
    setCollapsedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handlePipelineStart = () => {
    setPipelineLogs([]);
    setRequestCount(prev => prev + 1);
  };

  const handlePipelineComplete = (finalLogs) => {
    if (finalLogs) {
      setPipelineLogs(finalLogs);
      const orchLog = finalLogs.find(l => l.agent === "Orchestrator" && l.data);
      if (orchLog && orchLog.data.intent) {
        setActiveIntent(orchLog.data.intent);
      }
    }
    setRefreshProfileCounter(prev => prev + 1);
  };

  const handleClearMemory = async () => {
    if (!confirm("Are you sure you want to clear your researcher memory profile and data files? This cannot be undone.")) return;
    try {
      await fetch(`${apiBase}/api/profile/${userId}`, { method: "DELETE" });
      setRefreshProfileCounter(prev => prev + 1);
      alert("Researcher profile memory successfully cleared!");
    } catch (err) {
      alert("Failed to clear memory: " + err.message);
    }
  };

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-slate-50 text-slate-900" : "bg-[#050811] text-slate-100"} flex flex-col antialiased font-sans transition-colors duration-300`}>
      
      {/* MINIMAL TOP BAR */}
      <header className={`border-b ${theme === "light" ? "border-slate-200 bg-white/80" : "border-slate-900 bg-slate-950/60"} backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-1.5 hover:bg-slate-900/50 rounded-lg text-slate-400 hover:text-white transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-sky-500 flex items-center justify-center shadow-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">
              Antigravity
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tier indicator pill */}
          <button 
            onClick={() => {
              setSidebarOpen(true);
              setCollapsedSections(prev => ({ ...prev, model: false }));
            }}
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition ${
              modelTier === "PAID" 
                ? "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:border-purple-400" 
                : modelTier === "LOCAL"
                ? "bg-amber-950/40 border-amber-500/30 text-amber-300 hover:border-amber-400"
                : "bg-sky-950/40 border-sky-500/30 text-sky-300 hover:border-sky-400"
            }`}
          >
            {modelTier}
          </button>

          {/* Request count */}
          {modelTier === "FREE" && (
            <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">
              {requestCount}/20 req
            </span>
          )}

          {/* Backend Status warmup indicator */}
          <div className="flex items-center gap-1.5 bg-slate-900/40 border border-slate-850 px-2.5 py-0.5 rounded-full">
            <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === "live" ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}></span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
              {backendStatus === "live" ? "Live" : "Warming"}
            </span>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE CONTENT */}
      <div className="flex-1 flex items-stretch overflow-hidden relative">
        
        {/* SIDEBAR PANEL */}
        <aside 
          className={`shrink-0 border-r border-slate-900 bg-slate-950 flex relative transition-all duration-300 z-50 ${
            sidebarOpen ? "w-80" : "w-12"
          }`}
        >
          {/* COLLAPSED COLUMN: Icons Only */}
          {!sidebarOpen && (
            <div className="w-12 py-4 flex flex-col items-center gap-5 text-slate-500">
              <button onClick={() => setSidebarOpen(true)} className="p-1 hover:text-white transition">
                <Menu className="w-4 h-4" />
              </button>
              <button onClick={() => alert("New Chat")} className="p-1.5 hover:bg-slate-900 rounded-lg hover:text-white transition">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-slate-900 rounded-lg hover:text-white transition">
                <MessageSquare className="w-4 h-4" />
              </button>
              <button onClick={() => { setSidebarOpen(true); setActiveSubpage("skills"); }} className="p-1.5 hover:bg-slate-900 rounded-lg hover:text-white transition">
                🔧
              </button>
              <button onClick={() => { setSidebarOpen(true); setActiveSubpage("plugins"); }} className="p-1.5 hover:bg-slate-900 rounded-lg hover:text-white transition">
                🔌
              </button>
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-slate-900 rounded-lg hover:text-white transition">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* EXPANDED PANEL: Full Hamburger Sidebar */}
          {sidebarOpen && (
            <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
              
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">Antigravity Menu</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSidebarPinned(!sidebarPinned)}
                    className={`p-1 hover:bg-slate-900 rounded transition ${sidebarPinned ? "text-sky-400" : "text-slate-600"}`}
                    title="Pin sidebar"
                  >
                    <Pin className="w-3.5 h-3.5 rotate-45" />
                  </button>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                
                {/* [+ New Chat] */}
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-xs font-bold text-slate-200 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-sky-400" /> New Research Session
                </button>

                {/* Library Navigation Toggles */}
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setActiveSubpage("skills")}
                    className="w-full px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 rounded-lg flex items-center justify-between text-xs text-slate-300 transition"
                  >
                    <span className="flex items-center gap-2">🔧 Skills Library <span className="text-[10px] text-slate-500 font-mono">({skillsCount})</span></span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                  <button 
                    onClick={() => setActiveSubpage("plugins")}
                    className="w-full px-3 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-900/60 rounded-lg flex items-center justify-between text-xs text-slate-300 transition"
                  >
                    <span className="flex items-center gap-2">🔌 Connected Plugins <span className="text-[10px] text-slate-500 font-mono">({pluginsCount})</span></span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Accordion Settings Sections */}
                <div className="space-y-2 border-t border-slate-900 pt-4">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-2 flex items-center gap-1.5">
                    <Settings className="w-3 h-3" /> System Preferences
                  </div>

                  {/* Section 1: Model & API */}
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/20">
                    <button 
                      onClick={() => toggleSection("model")}
                      className="w-full px-3 py-2 bg-slate-900/40 flex items-center justify-between text-xs font-bold text-slate-300"
                    >
                      <span className="flex items-center gap-2"><Server className="w-3.5 h-3.5 text-purple-400" /> Model & API</span>
                      {collapsedSections.model ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {!collapsedSections.model && (
                      <div className="p-3 space-y-3 border-t border-slate-900/50">
                        {/* Provider */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Provider</label>
                          <select 
                            value={provider}
                            onChange={(e) => {
                              setProvider(e.target.value);
                              if (e.target.value === "openrouter") {
                                setLlmBaseUrl("https://openrouter.ai/api/v1");
                                setLlmModel("google/gemma-2-9b-it:free");
                              } else if (e.target.value === "ollama") {
                                setLlmBaseUrl("http://localhost:11434/v1");
                                setLlmModel("qwen2.5:8b");
                              } else {
                                setLlmBaseUrl("");
                                setLlmModel("gpt-4o-mini");
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                          >
                            <option value="openai">OpenAI (Official)</option>
                            <option value="openrouter">OpenRouter (Free Tiers)</option>
                            <option value="ollama">Ollama (Local Offline)</option>
                          </select>
                        </div>
                        {/* Custom LLM Base URL */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">API Endpoint URL</label>
                          <input 
                            type="text"
                            value={llmBaseUrl}
                            onChange={e => setLlmBaseUrl(e.target.value)}
                            placeholder="Default Endpoint"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                          />
                        </div>
                        {/* Model */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Model Name</label>
                          <input 
                            type="text"
                            value={llmModel}
                            onChange={e => setLlmModel(e.target.value)}
                            placeholder="gpt-4o-mini"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 font-mono"
                          />
                        </div>
                        {/* API Key */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">API Key credentials</label>
                          <input 
                            type="password"
                            value={openaiKey}
                            onChange={e => setOpenaiKey(e.target.value)}
                            placeholder="sk-••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                          />
                        </div>
                        {/* Tavily key */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tavily Key (web research)</label>
                          <input 
                            type="password"
                            value={tavilyKey}
                            onChange={e => setTavilyKey(e.target.value)}
                            placeholder="tvly-••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                          />
                        </div>
                        {/* Model tier toggle */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Budgeting Tier</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setModelTier("FREE")}
                              className={`flex-1 py-1 text-center text-[10px] font-bold rounded border transition ${
                                modelTier === "FREE" ? "bg-sky-950 border-sky-500 text-sky-400" : "bg-slate-950 border-slate-850 text-slate-500"
                              }`}
                            >
                              Free
                            </button>
                            <button 
                              onClick={() => setModelTier("PAID")}
                              className={`flex-1 py-1 text-center text-[10px] font-bold rounded border transition ${
                                modelTier === "PAID" ? "bg-purple-950 border-purple-500 text-purple-400" : "bg-slate-950 border-slate-850 text-slate-500"
                              }`}
                            >
                              Paid
                            </button>
                            <button 
                              onClick={() => setModelTier("LOCAL")}
                              className={`flex-1 py-1 text-center text-[10px] font-bold rounded border transition ${
                                modelTier === "LOCAL" ? "bg-amber-950 border-amber-500 text-amber-400" : "bg-slate-950 border-slate-850 text-slate-500"
                              }`}
                            >
                              Local
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Document Defaults */}
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/20">
                    <button 
                      onClick={() => toggleSection("defaults")}
                      className="w-full px-3 py-2 bg-slate-900/40 flex items-center justify-between text-xs font-bold text-slate-300"
                    >
                      <span className="flex items-center gap-2"><FileText className="w-3.5 h-3.5 text-sky-400" /> Document Defaults</span>
                      {collapsedSections.defaults ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {!collapsedSections.defaults && (
                      <div className="p-3 space-y-3 border-t border-slate-900/50">
                        {/* Citation Style */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Citation Style</label>
                          <select 
                            value={citationStyle}
                            onChange={e => setCitationStyle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                          >
                            <option value="IEEE">IEEE</option>
                            <option value="APA">APA 7th</option>
                            <option value="MLA">MLA 9th</option>
                            <option value="Harvard">Harvard</option>
                          </select>
                        </div>
                        {/* Output Format */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Export Format</label>
                          <select 
                            value={outputFormat}
                            onChange={e => setOutputFormat(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                          >
                            <option value="DOCX / LaTeX">Word (.docx) & LaTeX (.tex)</option>
                            <option value="Markdown">Markdown Only</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 3: Memory */}
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/20">
                    <button 
                      onClick={() => toggleSection("memory")}
                      className="w-full px-3 py-2 bg-slate-900/40 flex items-center justify-between text-xs font-bold text-slate-300"
                    >
                      <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-emerald-400" /> Profile & Memory</span>
                      {collapsedSections.memory ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {!collapsedSections.memory && (
                      <div className="p-3 space-y-3 border-t border-slate-900/50">
                        {/* Toggles */}
                        <div className="space-y-2">
                          <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                            Self-learning profile
                            <input 
                              type="checkbox" 
                              checked={selfLearning}
                              onChange={e => setSelfLearning(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                          </label>
                          <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                            Style voice matching
                            <input 
                              type="checkbox" 
                              checked={styleMatching}
                              onChange={e => setStyleMatching(e.target.checked)}
                              className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                            />
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                          <button 
                            onClick={() => setShowProfileModal(true)}
                            className="w-full py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[10px] font-bold rounded text-slate-300 transition"
                          >
                            View Writing DNA Fingerprint
                          </button>
                          <button 
                            onClick={handleClearMemory}
                            className="w-full py-1.5 bg-rose-950/20 border border-rose-900/50 hover:bg-rose-900/20 text-[10px] font-bold rounded text-rose-400 transition"
                          >
                            Clear Memory Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Pipeline */}
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/20">
                    <button 
                      onClick={() => toggleSection("pipeline")}
                      className="w-full px-3 py-2 bg-slate-900/40 flex items-center justify-between text-xs font-bold text-slate-300"
                    >
                      <span className="flex items-center gap-2"><Sliders className="w-3.5 h-3.5 text-amber-400" /> Agent Pipeline</span>
                      {collapsedSections.pipeline ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {!collapsedSections.pipeline && (
                      <div className="p-3 space-y-2 border-t border-slate-900/50">
                        <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                          Web Search APIs
                          <input 
                            type="checkbox" 
                            checked={webSearchToggle}
                            onChange={e => setWebSearchToggle(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                        <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                          RAG (PDF Search)
                          <input 
                            type="checkbox" 
                            checked={ragToggle}
                            onChange={e => setRagToggle(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                        <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                          Humanizer
                          <input 
                            type="checkbox" 
                            checked={humanizerToggle}
                            onChange={e => setHumanizerToggle(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                        <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                          Confidence Scorer
                          <input 
                            type="checkbox" 
                            checked={confidenceScoreToggle}
                            onChange={e => setConfidenceScoreToggle(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                        <label className="flex items-center justify-between text-[10px] text-slate-400 cursor-pointer">
                          Citation Graph
                          <input 
                            type="checkbox" 
                            checked={citationGraphToggle}
                            onChange={e => setCitationGraphToggle(e.target.checked)}
                            className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Section 5: Appearance */}
                  <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/20">
                    <button 
                      onClick={() => toggleSection("appearance")}
                      className="w-full px-3 py-2 bg-slate-900/40 flex items-center justify-between text-xs font-bold text-slate-300"
                    >
                      <span className="flex items-center gap-2"><Palette className="w-3.5 h-3.5 text-pink-400" /> Appearance</span>
                      {collapsedSections.appearance ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {!collapsedSections.appearance && (
                      <div className="p-3 space-y-3 border-t border-slate-900/50">
                        {/* Theme Toggle */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Theme Mode</label>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setTheme("dark")}
                              className={`flex-1 py-1 text-[10px] font-bold rounded border transition ${
                                theme === "dark" ? "bg-slate-900 border-sky-500 text-sky-400" : "bg-slate-950 border-slate-850 text-slate-500"
                              }`}
                            >
                              Dark
                            </button>
                            <button 
                              onClick={() => setTheme("light")}
                              className={`flex-1 py-1 text-[10px] font-bold rounded border transition ${
                                theme === "light" ? "bg-slate-100 border-sky-500 text-sky-600" : "bg-slate-950 border-slate-850 text-slate-500"
                              }`}
                            >
                              Light
                            </button>
                          </div>
                        </div>
                        {/* Font size */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Font size</label>
                          <select 
                            value={fontSize}
                            onChange={e => setFontSize(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300"
                          >
                            <option value="small">Small text</option>
                            <option value="normal">Normal text</option>
                            <option value="large">Large text</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings Bottom Options */}
                <div className="pt-4 border-t border-slate-900 space-y-2 text-[10px] text-slate-500 px-1">
                  <div className="flex items-center justify-between">
                    <span>Version</span>
                    <span className="font-mono">v1.0.0</span>
                  </div>
                </div>

              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-slate-900 bg-slate-950 flex items-center justify-between text-[10px] text-slate-500">
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="hover:text-rose-400 transition"
                >
                  Clear settings cache
                </button>
              </div>

            </div>
          )}

          {/* SLIDING OVERLAY PANEL: Skills / Plugins subpages */}
          {sidebarOpen && activeSubpage !== "none" && (
            <div className="absolute inset-y-0 left-0 right-0 z-50 bg-slate-950">
              {activeSubpage === "skills" && (
                <SkillsPanel 
                  userId={userId} 
                  onClose={() => setActiveSubpage("none")} 
                  onRefreshSkills={refreshLibraryCounts} 
                />
              )}
              {activeSubpage === "plugins" && (
                <PluginsPanel 
                  userId={userId} 
                  onClose={() => setActiveSubpage("none")} 
                  onRefreshPlugins={refreshLibraryCounts} 
                />
              )}
            </div>
          )}
        </aside>

        {/* CENTER / MAIN VIEW AREA */}
        <div className={`flex-1 flex flex-col lg:flex-row gap-6 p-6 overflow-hidden ${
          fontSize === "small" ? "text-xs" : fontSize === "large" ? "text-base" : "text-sm"
        }`}>
          
          {/* Chat Interface Column */}
          <section className="flex-1 flex flex-col h-full overflow-hidden">
            <ChatInterface 
              userId={userId} 
              openaiKey={openaiKey}
              tavilyKey={tavilyKey}
              llmBaseUrl={llmBaseUrl}
              llmModel={llmModel}
              modelTier={modelTier}
              onPipelineStart={handlePipelineStart}
              onPipelineComplete={handlePipelineComplete}
              onProfileUpdate={() => setRefreshProfileCounter(prev => prev + 1)}
            />
          </section>

          {/* Active Agent Pipeline Tracing Visualizer */}
          <section className="w-full lg:w-80 flex flex-col h-full shrink-0">
            <AgentPipelineVisualizer logs={pipelineLogs} activeIntent={activeIntent} />
          </section>

        </div>

      </div>

      {/* Writing DNA Fingerprint Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 max-w-lg w-full flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Researcher Writing DNA</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              <MemoryProfilePanel userId={userId} refreshTrigger={refreshProfileCounter} />
            </div>
            <div className="border-t border-slate-900 pt-3 flex justify-end mt-4">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold rounded-lg text-slate-300 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
