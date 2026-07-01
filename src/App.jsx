import React, { useState, useEffect } from "react";
import { Brain, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";
import SettingsPanel from "./components/SettingsPanel";
import MemoryProfilePanel from "./components/MemoryProfilePanel";
import AgentPipelineVisualizer from "./components/AgentPipelineVisualizer";
import ChatInterface from "./components/ChatInterface";

export default function App() {
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [tavilyKey, setTavilyKey] = useState(localStorage.getItem("tavily_api_key") || "");
  const [llmBaseUrl, setLlmBaseUrl] = useState(localStorage.getItem("llm_base_url") || "");
  const [llmModel, setLlmModel] = useState(localStorage.getItem("llm_model") || "gpt-4o-mini");
  const [userId, setUserId] = useState(localStorage.getItem("research_user_id") || "default_academic");
  
  const [pipelineLogs, setPipelineLogs] = useState([]);
  const [activeIntent, setActiveIntent] = useState("QA");
  const [refreshProfileCounter, setRefreshProfileCounter] = useState(0);

  const handleApiKeyChange = ({ openaiKey, tavilyKey, userId, llmBaseUrl, llmModel }) => {
    setOpenaiKey(openaiKey);
    setTavilyKey(tavilyKey);
    setUserId(userId);
    setLlmBaseUrl(llmBaseUrl || "");
    setLlmModel(llmModel || "gpt-4o-mini");
  };

  // Simulated live progress logs during backend fetch
  let progressInterval = null;
  const startProgressSimulation = () => {
    setPipelineLogs([]);
    const simulatedLogs = [
      { agent: "Orchestrator", status: "running", message: "Initializing session & loading user memory profile..." }
    ];
    setPipelineLogs([...simulatedLogs]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        simulatedLogs[0] = { agent: "Orchestrator", status: "completed", message: "Loaded profile and classified user research intent." };
        simulatedLogs.push({ agent: "RAG Agent", status: "running", message: "Searching local database for uploaded PDF context..." });
      } else if (step === 2) {
        simulatedLogs[1] = { agent: "RAG Agent", status: "completed", message: "PDF similarity search complete. Vector summary generated." };
        simulatedLogs.push({ agent: "Web Research Agent", status: "running", message: "Querying arXiv, Semantic Scholar, and Tavily fallback APIs..." });
      } else if (step === 4) {
        simulatedLogs[2] = { agent: "Web Research Agent", status: "completed", message: "Deduplicated academic bibliography compiled and relevancies indexed." };
        simulatedLogs.push({ agent: "Data Analysis Agent", status: "running", message: "Inspecting data tables and analyzing statistical properties..." });
      } else if (step === 6) {
        simulatedLogs[3] = { agent: "Data Analysis Agent", status: "completed", message: "Dataset summarized, data cleaning completed, and outliers identified." };
        simulatedLogs.push({ agent: "Synthesis Agent", status: "running", message: "Synthesizing sources and data insights into a cited draft..." });
      } else if (step === 9) {
        simulatedLogs[4] = { agent: "Synthesis Agent", status: "completed", message: "Response drafted and citations locked to references." };
        simulatedLogs.push({ agent: "Humanizer", status: "running", message: "Tuning sentence lengths (burstiness), style, and replacing AI giveaway patterns..." });
      } else if (step === 11) {
        simulatedLogs[5] = { agent: "Humanizer", status: "completed", message: "Stylistic refinement complete. Writing voice matches user profile." };
        simulatedLogs.push({ agent: "Memory Engine", status: "running", message: "Analyzing user style fingerprints and saving updated profile to DB..." });
      } else if (step === 12) {
        simulatedLogs[6] = { agent: "Memory Engine", status: "completed", message: "Memory database update finalized silently." };
        clearInterval(interval);
      }
      setPipelineLogs([...simulatedLogs]);
    }, 2000);
    
    return interval;
  };

  const handlePipelineStart = () => {
    progressInterval = startProgressSimulation();
  };

  const handlePipelineComplete = (finalLogs, profile) => {
    // Stop any running simulation
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    if (finalLogs) {
      setPipelineLogs(finalLogs);
      
      // Determine active intent from logs
      const orchLog = finalLogs.find(l => l.agent === "Orchestrator" && l.data);
      if (orchLog && orchLog.data.intent) {
        setActiveIntent(orchLog.data.intent);
      }
    }
  };

  const triggerProfileRefresh = () => {
    setRefreshProfileCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col antialiased">
      {/* Premium Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-sky-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">
                Research Agent Workspace
              </h1>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest block">
                v3 · Multi-Agent Cognitive Pipeline
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              Active Session: <span className="text-sky-300 font-bold">{userId}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Settings and DNA */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          <SettingsPanel onApiKeyChange={handleApiKeyChange} />
          <MemoryProfilePanel userId={userId} refreshTrigger={refreshProfileCounter} />
        </section>

        {/* Center Column: Chat/Document Workspace */}
        <section className="lg:col-span-6 flex flex-col">
          <ChatInterface 
            userId={userId} 
            openaiKey={openaiKey}
            tavilyKey={tavilyKey}
            llmBaseUrl={llmBaseUrl}
            llmModel={llmModel}
            onPipelineStart={handlePipelineStart}
            onPipelineComplete={handlePipelineComplete}
            onProfileUpdate={triggerProfileRefresh}
          />
        </section>
        {/* Right Column: Active Agent Execution Visualizer */}
        <section className="lg:col-span-3 flex flex-col">
          <AgentPipelineVisualizer logs={pipelineLogs} activeIntent={activeIntent} />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950/20 py-4 px-6 text-center text-[10px] text-slate-600">
        Multi-Agent Research Laboratory Framework · Licensed under MIT · Runs Local sqlite vector DB + academic APIs
      </footer>
    </div>
  );
}
