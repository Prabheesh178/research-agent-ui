import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Shield, Settings, ToggleLeft, ToggleRight, Search, Download, HelpCircle, Eye, EyeOff, Upload } from "lucide-react";
import { getUserPlugins, toggleUserPlugin, authUserPlugin, queryResearchAgent, uploadLocalPlugin } from "../utils/api";

const PRESET_PLUGINS = [
  { id: "zotero-sync", name: "Zotero Sync", tools_provided: ["fetch_library", "add_reference"], auth_type: "api_key", auth_fields: [{ key: "zotero_api_key", label: "Zotero API Key", type: "password" }] },
  { id: "notion-export", name: "Notion Export", tools_provided: ["create_notion_page"], auth_type: "api_key", auth_fields: [{ key: "notion_api_key", label: "Notion API Key/Token", type: "password" }] },
  { id: "overleaf-push", name: "Overleaf Push", tools_provided: ["push_to_overleaf"], auth_type: "api_key", auth_fields: [{ key: "overleaf_cookie", label: "Overleaf Session Cookie", type: "password" }] },
  { id: "google-scholar", name: "Google Scholar", tools_provided: ["google_scholar_search"], auth_type: "api_key", auth_fields: [{ key: "serpapi_key", label: "SerpAPI Key", type: "password" }] },
  { id: "grammarly", name: "Grammarly", tools_provided: ["grammarly_check"], auth_type: "none", auth_fields: [] }
];

export default function PluginsPanel({ userId, onClose, onRefreshPlugins }) {
  const [plugins, setPlugins] = useState([]);
  const [search, setSearch] = useState("");
  const [installUrl, setInstallUrl] = useState("");
  const [installing, setInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Settings Credentials Modal
  const [editingPlugin, setEditingPlugin] = useState(null);
  const [authForm, setAuthForm] = useState({});
  const [showPassword, setShowPassword] = useState({});

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const res = await getUserPlugins(userId);
      setPlugins(res.plugins || []);
    } catch (err) {
      console.error("Failed to load plugins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
  }, [userId]);

  const handleToggle = async (pluginId, currentStatus) => {
    try {
      await toggleUserPlugin(userId, pluginId, !currentStatus);
      fetchPlugins();
      if (onRefreshPlugins) onRefreshPlugins();
    } catch (err) {
      alert("Failed to toggle plugin: " + err.message);
    }
  };

  const handleUninstall = async (pluginId) => {
    if (!confirm(`Are you sure you want to remove plugin ${pluginId}?`)) return;
    try {
      const savedKey = localStorage.getItem("openai_api_key") || "mock-key";
      await queryResearchAgent(`/uninstall ${pluginId}`, userId, savedKey);
      fetchPlugins();
      if (onRefreshPlugins) onRefreshPlugins();
    } catch (err) {
      alert("Failed to uninstall: " + err.message);
    }
  };

  const handleInstall = async (e, customUrl = null) => {
    if (e) e.preventDefault();
    const targetUrl = customUrl || installUrl.trim();
    if (!targetUrl) return;

    setInstalling(true);
    setInstallStatus("Downloading plugin configuration...");
    try {
      const savedKey = localStorage.getItem("openai_api_key") || "mock-key";
      const res = await queryResearchAgent(`/install ${targetUrl}`, userId, savedKey);
      setInstallStatus(res.answer);
      setInstallUrl("");
      fetchPlugins();
      if (onRefreshPlugins) onRefreshPlugins();
    } catch (err) {
      setInstallStatus("❌ Connection failed: " + err.message);
    } finally {
      setInstalling(false);
    }
  };

  const handleUploadPlugin = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setInstalling(true);
    setInstallStatus(`Uploading and parsing ${file.name}...`);
    try {
      const res = await uploadLocalPlugin(userId, file);
      setInstallStatus(res.message);
      fetchPlugins();
      if (onRefreshPlugins) onRefreshPlugins();
    } catch (err) {
      setInstallStatus("❌ Upload failed: " + err.message);
    } finally {
      setInstalling(false);
      e.target.value = "";
    }
  };

  const handleOpenAuth = (plugin) => {
    setEditingPlugin(plugin);
    setAuthForm(plugin.auth_data || {});
  };

  const handleSaveAuth = async () => {
    try {
      await authUserPlugin(userId, editingPlugin.plugin_id, authForm);
      setEditingPlugin(null);
      fetchPlugins();
    } catch (err) {
      alert("Failed to save auth settings: " + err.message);
    }
  };

  // Find which preset plugins are NOT installed yet
  const installedIds = plugins.map(p => p.plugin_id);
  const availablePresets = PRESET_PLUGINS.filter(p => !installedIds.includes(p.id));

  const filteredConnected = plugins.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.plugin_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-4 border-l border-slate-900 shadow-2xl relative z-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-4 mb-4">
        <button onClick={onClose} className="p-1.5 hover:bg-slate-900 rounded-lg transition text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            🔌 Connected Plugins
          </h2>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
            {plugins.filter(p => p.enabled).length} Connected
          </span>
        </div>
      </div>

      {/* Main content scroll */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search connected plugins..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        {/* Connected Plugins */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Connected</h3>
          {loading ? (
            <div className="text-center py-4 text-xs text-slate-500">Loading plugins...</div>
          ) : filteredConnected.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 bg-slate-900/10 border border-slate-900 rounded-lg">
              No connected plugins.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConnected.map(p => (
                <div key={p.plugin_id} className="p-3 bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-lg transition space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${p.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`}></span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                        <span className="text-[9px] text-slate-500 block">ID: {p.plugin_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggle(p.plugin_id, p.enabled)} className="text-slate-400 hover:text-white transition">
                        {p.enabled ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-600" />
                        )}
                      </button>
                      {p.auth_type !== "none" && (
                        <button onClick={() => handleOpenAuth(p)} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition">
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => handleUninstall(p.plugin_id)} className="p-1 hover:bg-slate-800 text-rose-500 hover:text-rose-400 rounded transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <span className="text-slate-500 font-semibold block mb-0.5">Tools:</span>
                    {p.tools_provided.map((t, idx) => (
                      <span key={idx} className="inline-block bg-slate-950 text-purple-400 px-1.5 py-0.5 rounded text-[9px] mr-1 mb-1 font-mono border border-slate-900">
                        {t}()
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preset/Available Plugins */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Available Integrations</h3>
          <div className="space-y-2">
            {availablePresets.map(p => (
              <div key={p.id} className="p-3 bg-slate-900/20 border border-slate-900 rounded-lg flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">{p.name}</h4>
                  <p className="text-[9px] text-slate-500">{p.tools_provided.join(", ")}</p>
                </div>
                <button
                  onClick={() => handleInstall(null, `prabheesh/antigravity-hub/plugins/${p.id}`)}
                  disabled={installing}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500 text-purple-400 hover:text-purple-300 text-[10px] font-bold rounded transition disabled:opacity-50"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub installer */}
      <div className="border-t border-slate-900 pt-4 bg-slate-950">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
          <Download className="w-3 h-3 text-purple-400" /> Install Plugin Repo
        </h3>
        <form onSubmit={handleInstall} className="space-y-2">
          <input
            type="text"
            placeholder="owner/repo (or full URL)"
            value={installUrl}
            onChange={e => setInstallUrl(e.target.value)}
            disabled={installing}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={installing || !installUrl.trim()}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-xs text-white font-bold rounded-lg transition shadow-lg"
          >
            {installing ? "Connecting Plugin..." : "Connect Plugin"}
          </button>
        </form>

        <div className="mt-3 border-t border-slate-900/60 pt-3">
          <label className="w-full py-2 bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-xs text-slate-200 font-bold-none rounded-lg transition flex items-center justify-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <Upload className="w-3.5 h-3.5 text-purple-400" /> Upload Local Plugin JSON
            <input
              type="file"
              accept=".json"
              onChange={handleUploadPlugin}
              className="hidden"
              disabled={installing}
            />
          </label>
        </div>

        {installStatus && (
          <div className="mt-3 p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-[9px] text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap max-h-20">
            {installStatus}
          </div>
        )}
      </div>

      {/* Settings Modal Overlay */}
      {editingPlugin && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex flex-col p-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
            <ArrowLeft onClick={() => setEditingPlugin(null)} className="w-4 h-4 cursor-pointer text-slate-400 hover:text-white" />
            <h3 className="text-xs font-bold text-slate-200">Configure {editingPlugin.name}</h3>
          </div>
          <div className="flex-1 space-y-4">
            {editingPlugin.auth_fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{field.label}</label>
                <div className="relative">
                  <input
                    type={showPassword[field.key] ? "text" : "password"}
                    value={authForm[field.key] || ""}
                    onChange={e => setAuthForm({ ...authForm, [field.key]: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, [field.key]: !showPassword[field.key] })}
                    className="absolute right-3 top-2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-900 pt-3 flex gap-2">
            <button onClick={() => setEditingPlugin(null)} className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[11px] text-slate-400 rounded-lg font-semibold transition">
              Cancel
            </button>
            <button onClick={handleSaveAuth} className="flex-1 py-1.5 bg-purple-600 hover:bg-purple-500 text-[11px] text-white rounded-lg font-bold transition">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
