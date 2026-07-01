import React, { useState, useEffect } from "react";
import { Brain, Sparkles, RefreshCw, Save, Edit3, ArrowRight } from "lucide-react";
import { getUserProfile, updateUserProfile } from "../utils/api";

export default function MemoryProfilePanel({ userId, refreshTrigger }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Form edit states
  const [vocabLevel, setVocabLevel] = useState("");
  const [citationStyle, setCitationStyle] = useState("");
  const [avgLength, setAvgLength] = useState(20);
  const [connectorsStr, setConnectorsStr] = useState("");
  const [domain, setDomain] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [sentenceVariety, setSentenceVariety] = useState("");
  const [quirks, setQuirks] = useState("");

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getUserProfile(userId);
      setProfile(data.profile);
      
      // Seed form values
      setVocabLevel(data.profile.vocab_level);
      setCitationStyle(data.profile.citation_style);
      setAvgLength(data.profile.avg_sentence_length);
      setConnectorsStr((data.profile.connectors || []).join(", "));
      setDomain(data.profile.domain || "");
      setWritingStyle(data.profile.writing_style || "");
      setSentenceVariety(data.profile.sentence_variety || "");
      setQuirks(data.profile.writing_quirks || "");
    } catch (err) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId, refreshTrigger]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updated = {
        vocab_level: vocabLevel,
        citation_style: citationStyle,
        avg_sentence_length: parseInt(avgLength) || 20,
        connectors: connectorsStr.split(",").map(c => c.trim()).filter(Boolean),
        domain,
        writing_style: writingStyle,
        sentence_variety: sentenceVariety,
        writing_quirks: quirks
      };
      const res = await updateUserProfile(userId, updated);
      setProfile(res.profile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="glass-panel rounded-xl p-5 w-full flex flex-col items-center justify-center min-h-[200px]">
        <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mb-2" />
        <span className="text-xs text-slate-400 uppercase tracking-widest">Sequencing Style DNA...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-xl p-5 w-full border-red-950">
        <span className="text-xs text-red-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
          <Brain className="w-4 h-4 text-red-500" />
          Style Sync Blocked
        </span>
        <p className="text-xs text-slate-400 mt-2">{error}</p>
        <button onClick={loadProfile} className="text-xs text-purple-400 mt-3 hover:underline">Retry</button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="glass-panel rounded-xl p-5 w-full glow-purple">
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-purple-400">
          <Brain className="w-5 h-5" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Style Memory DNA</h2>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button onClick={handleUpdate} className="text-slate-400 hover:text-emerald-400 transition-colors">
              <Save className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-slate-500 hover:text-purple-400 transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button onClick={loadProfile} className="text-slate-500 hover:text-slate-300 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Domain</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Vocabulary</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500"
                value={vocabLevel}
                onChange={(e) => setVocabLevel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Citations</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500"
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Avg Sentence Length: {avgLength} words</label>
            <input
              type="range"
              min="10"
              max="35"
              className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
              value={avgLength}
              onChange={(e) => setAvgLength(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Connectors (comma separated)</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500"
              value={connectorsStr}
              onChange={(e) => setConnectorsStr(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Writing Quirks</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-purple-500 h-12 resize-none"
              value={quirks}
              onChange={(e) => setQuirks(e.target.value)}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-purple-950/40 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
              Session Count: {profile.session_count}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-2.5 border border-slate-900 rounded">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Research Domain</span>
              <span className="font-semibold text-slate-200 capitalize">{profile.domain || "Not set"}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 border border-slate-900 rounded">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Citation style</span>
              <span className="font-semibold text-slate-200 uppercase">{profile.citation_style}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 border border-slate-900 rounded">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Vocab complexity</span>
              <span className="font-semibold text-slate-200 capitalize">{profile.vocab_level}</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 border border-slate-900 rounded">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Writing Style</span>
              <span className="font-semibold text-slate-200 capitalize">{profile.writing_style || "Academic"}</span>
            </div>
          </div>

          {/* Average Sentence Length progress indicator */}
          <div>
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              <span>Avg Sentence Length</span>
              <span className="text-purple-300 font-bold">{profile.avg_sentence_length} words</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full" 
                style={{ width: `${Math.min((profile.avg_sentence_length / 35) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Connectors pills */}
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Writing Connectors</span>
            <div className="flex flex-wrap gap-1.5">
              {(profile.connectors || []).map((conn, idx) => (
                <span key={idx} className="bg-slate-900 text-purple-300 text-[10px] border border-slate-800 rounded-md px-2 py-0.5 font-mono">
                  {conn}
                </span>
              ))}
            </div>
          </div>

          {profile.writing_quirks && (
            <div className="border-t border-slate-800 pt-3">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Writing Quirks</span>
              <p className="text-[11px] text-slate-400 italic bg-slate-950/50 p-2 border border-slate-900/60 rounded">
                "{profile.writing_quirks}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
