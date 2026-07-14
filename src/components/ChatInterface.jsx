import React, { useState, useEffect, useRef } from "react";
import { Send, Upload, FileText, Trash2, BookOpen, AlertTriangle, FileDown, Eye, CheckCircle, FileSpreadsheet, Loader2, Sparkles } from "lucide-react";
import { queryResearchAgent, getUserDocuments, deleteDocument, getUserSkills } from "../utils/api";

export default function ChatInterface({ 
  userId, 
  openaiKey, 
  tavilyKey, 
  llmBaseUrl, 
  llmModel, 
  modelTier, 
  onPipelineStart, 
  onPipelineComplete, 
  onProfileUpdate 
}) {
  const [prompt, setPrompt] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Chat History
  const [messages, setMessages] = useState([]);
  const [cardExpanded, setCardExpanded] = useState({});
  const [skills, setSkills] = useState([]);
  const [activeSkillHint, setActiveSkillHint] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loadUploadedDocuments = async () => {
    if (!userId) return;
    try {
      const data = await getUserDocuments(userId);
      setUploadedDocs(data.documents || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  };

  const loadSkills = async () => {
    if (!userId) return;
    try {
      const res = await getUserSkills(userId);
      setSkills(res.skills || []);
    } catch (err) {
      console.warn("Could not load skills for prompt triggers", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    loadUploadedDocuments();
    loadSkills();
    setMessages([]);
    setActiveSkillHint(null);
  }, [userId]);

  const handleFileChange = (e) => {
    const allowed = [".pdf", ".csv", ".tsv", ".json", ".xlsx", ".xls"];
    const files = Array.from(e.target.files).filter(f => 
      allowed.some(ext => f.name.toLowerCase().endsWith(ext))
    );
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (idx) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDeleteUploaded = async (docId) => {
    try {
      await deleteDocument(userId, docId);
      loadUploadedDocuments();
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const handlePromptChange = (val) => {
    setPrompt(val);
    if (!val.trim()) {
      setActiveSkillHint(null);
      return;
    }
    const lowerVal = val.toLowerCase();
    const matched = skills.find(s => 
      s.enabled && s.trigger_keywords.some(kw => lowerVal.includes(kw.toLowerCase()))
    );
    if (matched) {
      setActiveSkillHint(matched);
    } else {
      setActiveSkillHint(null);
    }
  };

  const parseResponseContent = (content) => {
    if (!content) return { card: null, body: "" };
    
    // Split on the boundary line
    const separator = "─────────────────────────────────────";
    if (content.includes(separator)) {
      const parts = content.split(separator);
      if (parts.length >= 3) {
        const cardText = parts[1].trim();
        const bodyText = parts.slice(2).join(separator).trim();
        return { card: cardText, body: bodyText };
      }
    }
    return { card: null, body: content };
  };

  const convertMarkdownToHtml = (markdown) => {
    if (!markdown) return "";
    let html = markdown;
    
    // Escapes HTML tags
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
    
    // Bullet lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');
    
    // Paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
      p = p.trim();
      if (!p) return "";
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) {
        return p;
      }
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');
    
    return html;
  };

  const handleDownloadWord = (content, filename) => {
    const { body } = parseResponseContent(content);
    const title = filename.replace(/\.(doc|docx)$/i, "");
    const bodyHtml = convertMarkdownToHtml(body);
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
          "xmlns:w='urn:schemas-microsoft-com:office:word' "+
          "xmlns='http://www.w3.org/TR/REC-html40'>"+
          "<head><title>" + title + "</title>"+
          "<style>body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; padding: 1in; } "+
          "h1 { text-align: center; color: #111; margin-bottom: 20px; } "+
          "h2 { border-bottom: 1px solid #ddd; padding-bottom: 5px; color: #222; } "+
          "h3 { color: #444; } "+
          "p { text-align: justify; text-indent: 0.5in; margin-bottom: 12px; } "+
          "li { text-align: justify; margin-bottom: 6px; }</style></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + bodyHtml + footer;
    
    const blob = new Blob(['\ufeff' + sourceHTML], {
       type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (content, filename) => {
    const { body } = parseResponseContent(content);
    const title = filename.replace(/\.pdf$/i, "");
    const bodyHtml = convertMarkdownToHtml(body);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export as PDF.");
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
            body {
              font-family: 'Lora', Georgia, serif;
              color: #1a1a1a;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 20px;
            }
            h1, h2, h3 {
              font-family: 'Inter', sans-serif;
              font-weight: 700;
              color: #111;
            }
            h1 {
              font-size: 2.2rem;
              text-align: center;
              margin-bottom: 30px;
            }
            h2 {
              font-size: 1.5rem;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-top: 40px;
            }
            h3 {
              font-size: 1.2rem;
              margin-top: 30px;
            }
            p {
              margin-bottom: 20px;
              text-align: justify;
            }
            ul, ol {
              margin-bottom: 20px;
              padding-left: 20px;
            }
            li {
              margin-bottom: 8px;
            }
            strong {
              color: #000;
            }
            @media print {
              body { margin: 20mm; }
              h2, h3 { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          ${bodyHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();
    if (!currentPrompt && selectedFiles.length === 0) return;
    
    // Clear inputs
    setPrompt("");
    setActiveSkillHint(null);
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: currentPrompt || `Ingesting ${selectedFiles.length} file(s)...`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    
    setLoading(true);
    if (onPipelineStart) onPipelineStart();

    try {
      const result = await queryResearchAgent(
        currentPrompt,
        userId,
        openaiKey,
        tavilyKey,
        selectedFiles,
        llmBaseUrl,
        llmModel,
        modelTier
      );
      
      const agentMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: result
      };
      
      setMessages(prev => [...prev, agentMsg]);
      setSelectedFiles([]); // Clear queue
      loadUploadedDocuments(); // Refresh document list
      
      if (onPipelineComplete) onPipelineComplete(result.trace_logs, result.memory_profile);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: "error",
        content: err.message || "Failed to generate research response."
      };
      setMessages(prev => [...prev, errorMsg]);
      
      if (onPipelineComplete) {
        onPipelineComplete([
          { agent: "Pipeline Orchestrator", status: "error", message: err.message || "Execution error" }
        ], null);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCitations = (text) => {
    if (!text) return "";
    
    const pdfRegex = /\[PDF:\s*([^,\]]+),\s*p\.(\d+)\]/g;
    const webRegex = /\[(\d+)\]/g;
    
    let formatted = text
      .replace(pdfRegex, '<span class="bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] px-1.5 py-0.5 rounded font-bold mx-0.5 hover:bg-indigo-900 transition-colors" title="$1 (p.$2)">PDF: $1, p.$2</span>')
      .replace(webRegex, '<span class="bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded font-bold mx-0.5 hover:bg-amber-900 transition-colors" title="Web Reference $1">[$1]</span>');
      
    return <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const downloadFile = (content, filename, contentType) => {
    const { body } = parseResponseContent(content);
    const blob = new Blob([body], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleCard = (msgId) => {
    setCardExpanded(prev => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Document Workspace Panel */}
      <div className="glass-panel rounded-xl p-5 glow-blue">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sky-400">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Document Workspace</h2>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">
            {uploadedDocs.length} Files Active
          </span>
        </div>

        {/* Drag & Drop Area */}
        <div 
          onClick={() => fileInputRef.current.click()}
          className="border border-dashed border-slate-800 hover:border-sky-500/40 rounded-lg p-4 text-center cursor-pointer transition bg-slate-950/20"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            className="hidden" 
            accept=".pdf,.csv,.tsv,.json,.xlsx,.xls"
          />
          <Upload className="w-5 h-5 text-sky-400 mx-auto mb-2" />
          <span className="text-xs text-slate-400 block font-medium">Drag & Drop references here, or click to browse</span>
          <span className="text-[9px] text-slate-600 block mt-1">Accepts: PDF (literature context) & CSV/Excel/JSON (data sheets)</span>
        </div>

        {/* Selected queue */}
        {selectedFiles.length > 0 && (
          <div className="mt-3 p-3 bg-slate-900/30 border border-slate-800 rounded-lg space-y-1.5">
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Files Queue for Ingestion:</span>
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-xs bg-slate-950/50 p-1.5 rounded border border-slate-900">
                <span className="flex items-center gap-2 text-slate-300 min-w-0">
                  {f.name.endsWith(".pdf") ? (
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="truncate">{f.name}</span>
                </span>
                <button type="button" onClick={() => removeSelectedFile(i)} className="text-slate-600 hover:text-rose-400 p-0.5 rounded transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Ingested list */}
        {uploadedDocs.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-900 pt-3">
            <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2">Ingested Session Library:</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
              {uploadedDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 text-[10px] bg-slate-900/20 p-2 rounded border border-slate-900">
                  <span className="flex items-center gap-1.5 text-slate-400 min-w-0">
                    {doc.filename.endsWith(".pdf") ? (
                      <FileText className="w-3.5 h-3.5 text-indigo-500/80 shrink-0" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500/80 shrink-0" />
                    )}
                    <span className="truncate" title={doc.filename}>{doc.filename}</span>
                  </span>
                  <button type="button" onClick={() => handleDeleteUploaded(doc.id)} className="text-slate-600 hover:text-rose-500 p-0.5 rounded transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Interface Panel */}
      <div className="flex-1 glass-panel rounded-xl p-5 flex flex-col min-h-[400px] glow-purple relative overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Cognitive Pipeline Console</h3>
              <p className="text-[10px] text-slate-600 mt-1 max-w-sm">
                Enter a question or write prompt below. Upload references on the left to inject local context and methodology parameters.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-indigo-600/30 border border-indigo-500/20 rounded-lg px-4 py-2.5 max-w-[85%] text-xs text-slate-200">
                    <div className="flex items-center justify-between gap-8 mb-1">
                      <span className="font-bold text-indigo-300">You</span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            } else if (msg.role === "error") {
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="flex gap-2.5 items-start bg-red-950/20 border border-red-500/20 rounded-lg p-4 text-red-300 text-xs max-w-[90%]">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <span className="font-bold uppercase tracking-wider block mb-1">Execution Blocked</span>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Assistant message
              const responseData = msg.data;
              const { card, body } = parseResponseContent(msg.content);
              
              return (
                <div key={msg.id} className="space-y-4 border-b border-slate-900/60 pb-4 last:border-0 last:pb-0">
                  
                  {/* MONOSPACE PRE-RUN TRANSPARENCY CARD */}
                  {card && (
                    <div className="bg-slate-950/80 border border-slate-900 rounded-lg overflow-hidden max-w-lg">
                      <div 
                        onClick={() => toggleCard(msg.id)}
                        className="px-4 py-2 bg-slate-900/60 flex items-center justify-between cursor-pointer border-b border-slate-900 hover:bg-slate-900 transition-colors"
                      >
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
                          ⚡ Pre-Run Pipeline Plan
                        </span>
                        <span className="text-[9px] uppercase font-bold text-slate-500">
                          {cardExpanded[msg.id] ? "Hide Detail" : "View Plan"}
                        </span>
                      </div>
                      {cardExpanded[msg.id] && (
                        <pre className="p-4 text-[9px] font-mono text-slate-400 leading-relaxed overflow-x-auto select-all max-h-40 bg-slate-950">
                          {card}
                        </pre>
                      )}
                    </div>
                  )}

                  <div className="flex justify-start">
                    <div className="glass-panel border-slate-800 rounded-lg px-4 py-3 w-full text-xs text-slate-200 glow-purple">
                      <div className="flex items-center justify-between gap-8 mb-2 pb-1 border-b border-slate-900">
                        <span className="font-bold text-sky-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Consolidated Research Draft
                        </span>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => downloadFile(msg.content, "research_draft.md", "text/markdown")}
                            className="text-[9px] flex items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                            title="Download Markdown"
                          >
                            <FileDown className="w-3 h-3" />
                            Markdown
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDownloadWord(msg.content, "research_draft.doc")}
                            className="text-[9px] flex items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                            title="Download Word Document"
                          >
                            <FileDown className="w-3 h-3 text-sky-500" />
                            Word
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDownloadPDF(msg.content, "research_paper.pdf")}
                            className="text-[9px] flex items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                            title="Print / Save as PDF"
                          >
                            <FileDown className="w-3 h-3 text-red-400" />
                            PDF
                          </button>
                          {body.includes("## TITLE") && (
                            <button 
                              type="button"
                              onClick={() => downloadFile(msg.content, "research_paper.tex", "text/plain")}
                              className="text-[9px] flex items-center gap-1 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                              title="Download LaTeX Source"
                            >
                              <FileDown className="w-3 h-3 text-indigo-400" />
                              LaTeX
                            </button>
                          )}
                        </div>
                      </div>

                      {renderCitations(body)}
                    </div>
                  </div>

                  {/* RAG Context segment */}
                  {responseData.rag_chunks && responseData.rag_chunks.length > 0 && (
                    <div className="pl-4 border-l-2 border-teal-500/30 space-y-2">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Retrieved Local Passages</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {responseData.rag_chunks.map((c, i) => (
                          <div key={i} className="text-[10px] bg-slate-950/60 p-2.5 border border-slate-900/60 rounded">
                            <div className="text-teal-400 font-bold font-mono mb-1">{c.filename} (p. {c.page})</div>
                            <p className="text-slate-400 italic">"{c.text}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Web Papers Bibliography */}
                  {responseData.references && responseData.references.length > 0 && (
                    <div className="pl-4 border-l-2 border-amber-500/30 space-y-2">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-bold">Retrieved Web Bibliography</span>
                      <div className="space-y-2">
                        {responseData.references.map((paper, idx) => (
                          <div key={idx} className="bg-slate-950/40 p-2.5 border border-slate-900 rounded">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-amber-400 font-bold shrink-0">[{idx + 1}]</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-slate-200 font-bold block">{paper.title}</span>
                                <span className="text-slate-400 block mt-0.5">{paper.authors} ({paper.year}) — {paper.venue}</span>
                                {paper.relevance && (
                                  <p className="text-slate-500 italic mt-1 font-sans">Relevance: {paper.relevance}</p>
                                )}
                              </div>
                              {paper.url && (
                                <a 
                                  href={paper.url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-sky-500 hover:text-sky-400 shrink-0 flex items-center gap-0.5 hover:underline"
                                >
                                  <Eye className="w-3 h-3" />
                                  Link
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })}

          {loading && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Agents Collaborative Drafting...</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Panel with Skill Triggers banner */}
        <div className="space-y-2">
          {activeSkillHint && (
            <div className="bg-sky-950/30 border border-sky-500/20 px-3 py-1.5 rounded-t-lg text-[10px] text-sky-400 flex items-center gap-2 animate-pulse">
              <span>🔧</span>
              <span className="font-bold">Skill matched: {activeSkillHint.name}</span>
              <span className="text-slate-500">— Trigger keyword detected</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <textarea
              className="flex-1 min-h-[44px] max-h-[120px] text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors resize-none font-sans"
              placeholder="Type a research query or system command (e.g. '/install owner/repo')..."
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || (!prompt.trim() && selectedFiles.length === 0)}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg px-4 flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
