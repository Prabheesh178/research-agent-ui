import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Shield, ToggleLeft, ToggleRight, Search, Download, HelpCircle, ExternalLink } from "lucide-react";
import { getUserSkills, toggleUserSkill, queryResearchAgent } from "../utils/api";

export default function SkillsPanel({ userId, onClose, onRefreshSkills }) {
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [installUrl, setInstallUrl] = useState("");
  const [forceReinstall, setForceReinstall] = useState(false);
  const [enableAfter, setEnableAfter] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await getUserSkills(userId);
      setSkills(res.skills || []);
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [userId]);

  const handleToggle = async (skillId, currentStatus) => {
    try {
      await toggleUserSkill(userId, skillId, !currentStatus);
      fetchSkills();
      if (onRefreshSkills) onRefreshSkills();
    } catch (err) {
      alert("Failed to toggle skill: " + err.message);
    }
  };

  const handleUninstall = async (skillId) => {
    if (!confirm(`Are you sure you want to remove skill ${skillId}?`)) return;
    try {
      const savedKey = localStorage.getItem("openai_api_key") || "mock-key";
      await queryResearchAgent(`/uninstall ${skillId}`, userId, savedKey);
      fetchSkills();
      if (onRefreshSkills) onRefreshSkills();
    } catch (err) {
      alert("Failed to uninstall: " + err.message);
    }
  };

  const handleInstall = async (e) => {
    e.preventDefault();
    if (!installUrl.trim()) return;

    setInstalling(true);
    setInstallStatus("Downloading manifest and checking safety rules...");
    try {
      const savedKey = localStorage.getItem("openai_api_key") || "mock-key";
      const res = await queryResearchAgent(`/install ${installUrl.trim()}`, userId, savedKey);
      
      setInstallStatus(res.answer);
      setInstallUrl("");
      fetchSkills();
      if (onRefreshSkills) onRefreshSkills();
    } catch (err) {
      setInstallStatus("❌ Installation failed: " + err.message);
    } finally {
      setInstalling(false);
    }
  };

  const filteredSkills = skills.filter(
    s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.skill_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 border-l border-slate-900 shadow-2xl relative z-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-4">
        <button onClick={onClose} className="p-1.5 hover:bg-slate-900 rounded-lg transition text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            🔧 Skills Library
          </h2>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            {skills.filter(s => s.enabled).length}/{skills.length} Enabled
          </span>
        </div>
      </div>

      {/* Installed Skills List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search installed skills..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Installed Skills</h3>
          {loading ? (
            <div className="text-center py-4 text-xs text-slate-500">Loading skills...</div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 bg-slate-900/20 border border-slate-900 rounded-lg">
              No skills match your search.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSkills.map(skill => (
                <div key={skill.skill_id} className="p-3 bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-lg transition space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{skill.name}</h4>
                      <span className="text-[9px] text-slate-500 block">ID: {skill.skill_id}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleToggle(skill.skill_id, skill.enabled)} className="text-slate-400 hover:text-white transition">
                        {skill.enabled ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-600" />
                        )}
                      </button>
                      <button onClick={() => handleUninstall(skill.skill_id)} className="p-1 hover:bg-slate-800 text-rose-500/80 hover:text-rose-400 rounded transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-900/80">
                    <span className="font-semibold text-slate-500 block mb-0.5">Triggers:</span>
                    {skill.trigger_keywords.map((kw, i) => (
                      <span key={i} className="inline-block bg-slate-900 border border-slate-800 text-sky-400 px-1.5 py-0.5 rounded text-[9px] mr-1 mb-1 font-mono">
                        "{kw}"
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* GitHub Installer Form */}
      <div className="border-t border-slate-900 pt-4 bg-slate-950">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
          <Download className="w-3 h-3 text-sky-400" /> Install from GitHub
        </h3>
        <form onSubmit={handleInstall} className="space-y-3">
          <input
            type="text"
            placeholder="owner/repo (or full URL)"
            value={installUrl}
            onChange={e => setInstallUrl(e.target.value)}
            disabled={installing}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={forceReinstall}
                onChange={e => setForceReinstall(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
              />
              Force reinstall
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAfter}
                onChange={e => setEnableAfter(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-sky-500 focus:ring-0 focus:ring-offset-0"
              />
              Enable after install
            </label>
          </div>
          <button
            type="submit"
            disabled={installing || !installUrl.trim()}
            className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-xs text-white font-bold rounded-lg transition shadow-lg shadow-indigo-900/20"
          >
            {installing ? "Installing Skill..." : "Install Skill"}
          </button>
        </form>

        {installStatus && (
          <div className="mt-3 p-2.5 bg-slate-900/60 border border-slate-800/80 rounded-lg text-[10px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-24">
            {installStatus}
          </div>
        )}

        <div className="mt-4 border-t border-slate-900/60 pt-3 flex items-center justify-between">
          <a
            href="https://github.com/prabheesh/antigravity-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-500 hover:text-sky-400 transition flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> Browse Skills Hub
          </a>
        </div>
      </div>
    </div>
  );
}
