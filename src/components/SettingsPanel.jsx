import React, { useState, useEffect } from "react";
import { Settings, Save, Server, Key, User, Brain } from "lucide-react";
import { getApiBaseUrl, setApiBaseUrl } from "../utils/api";

export default function SettingsPanel({ onApiKeyChange }) {
  const [apiBase, setApiBase] = useState(getApiBaseUrl());
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem("openai_api_key") || "");
  const [tavilyKey, setTavilyKey] = useState(localStorage.getItem("tavily_api_key") || "");
  const [llmBaseUrl, setLlmBaseUrl] = useState(localStorage.getItem("llm_base_url") || "");
  const [llmModel, setLlmModel] = useState(localStorage.getItem("llm_model") || "gpt-4o-mini");
  const [userId, setUserId] = useState(localStorage.getItem("research_user_id") || "default_academic");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiBaseUrl(apiBase);
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("tavily_api_key", tavilyKey);
    localStorage.setItem("llm_base_url", llmBaseUrl);
    localStorage.setItem("llm_model", llmModel);
    localStorage.setItem("research_user_id", userId);
    setSaved(true);
    if (onApiKeyChange) {
      onApiKeyChange({ openaiKey, tavilyKey, userId, llmBaseUrl, llmModel });
    }
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-panel rounded-xl p-5 w-full glow-blue">
      <div className="flex items-center gap-2 mb-4 text-sky-400 border-b border-slate-800 pb-2">
        <Settings className="w-5 h-5" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">System Settings</h2>
      </div>

      <div className="space-y-4">
        {/* User ID */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            User Session ID
          </label>
          <input
            type="text"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="e.g. academic_user_1"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        {/* API Base URL */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            FastAPI Base URL
          </label>
          <input
            type="text"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="http://localhost:8000"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
          />
        </div>

        {/* Custom LLM Endpoint Base URL */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            LLM Base URL (Optional)
          </label>
          <input
            type="text"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="e.g. https://openrouter.ai/api/v1"
            value={llmBaseUrl}
            onChange={(e) => setLlmBaseUrl(e.target.value)}
          />
        </div>

        {/* Custom LLM Model Name */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-slate-500" />
            LLM Model Name
          </label>
          <input
            type="text"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="e.g. meta-llama/llama-3-8b-instruct:free"
            value={llmModel}
            onChange={(e) => setLlmModel(e.target.value)}
          />
        </div>

        {/* OpenAI Key */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            LLM API Key
          </label>
          <input
            type="password"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="Key for OpenAI, OpenRouter, Groq, etc."
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
          />
          <p className="text-[10px] text-slate-500 mt-1">Leaves no traces on the server. Passed per session request.</p>
        </div>

        {/* Tavily Key */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-slate-500" />
            Tavily API Key
          </label>
          <input
            type="password"
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="tvly-..."
            value={tavilyKey}
            onChange={(e) => setTavilyKey(e.target.value)}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium py-2 rounded transition-all focus:ring-1 focus:ring-sky-400"
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? "Saved Configuration!" : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
