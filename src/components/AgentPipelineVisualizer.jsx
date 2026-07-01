import React from "react";
import { Play, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";

const STAGES = [
  { id: "Orchestrator", label: "Orchestrator", color: "purple" },
  { id: "RAG Agent", label: "RAG Agent", color: "teal" },
  { id: "Web Research Agent", label: "Web Research", color: "amber" },
  { id: "Data Analysis Agent", label: "Data Analysis", color: "emerald" },
  { id: "Synthesis Agent", label: "Synthesis / Writer", color: "green" }, // matches Synthesis, Paper Writer, and all 10 specialized agents
  { id: "Confidence Scorer", label: "Confidence Scorer", color: "red" }, // matches Confidence Scorer and revision loops
  { id: "Humanizer", label: "Humanizer", color: "pink" },
  { id: "Memory Engine", label: "Memory Engine", color: "cyan" }
];

export default function AgentPipelineVisualizer({ logs, activeIntent }) {
  const getStageStatus = (stageId) => {
    if (!logs || logs.length === 0) return "idle";
    
    // Find logs for this stage
    const stageLogs = logs.filter(l => 
      l.agent === stageId || 
      (stageId === "Synthesis Agent" && (
        l.agent === "Synthesis Agent" || 
        l.agent === "Paper Writer Agent" ||
        l.agent === "Citation Graph Agent" ||
        l.agent === "Research Gap Finder Agent" ||
        l.agent === "Multi-Paper Comparison Agent" ||
        l.agent === "Methodology Suggester Agent" ||
        l.agent === "Plagiarism-Safe Paraphraser Agent" ||
        l.agent === "Abstract Grader Agent" ||
        l.agent === "Reference Formatter Agent" ||
        l.agent === "Research Proposal Writer Agent"
      ))
    );
    
    if (stageLogs.length === 0) {
      // Check if previous stages are running
      return "idle";
    }
    
    const isError = stageLogs.some(l => l.status === "error");
    if (isError) return "error";
    
    const isCompleted = stageLogs.some(l => l.status === "completed");
    if (isCompleted) return "completed";
    
    const isRunning = stageLogs.some(l => l.status === "running");
    if (isRunning) return "running";
    
    return "info";
  };

  const getStageMessage = (stageId) => {
    if (!logs) return "";
    const stageLogs = logs.filter(l => 
      l.agent === stageId || 
      (stageId === "Synthesis Agent" && (
        l.agent === "Synthesis Agent" || 
        l.agent === "Paper Writer Agent" ||
        l.agent === "Citation Graph Agent" ||
        l.agent === "Research Gap Finder Agent" ||
        l.agent === "Multi-Paper Comparison Agent" ||
        l.agent === "Methodology Suggester Agent" ||
        l.agent === "Plagiarism-Safe Paraphraser Agent" ||
        l.agent === "Abstract Grader Agent" ||
        l.agent === "Reference Formatter Agent" ||
        l.agent === "Research Proposal Writer Agent"
      ))
    );
    if (stageLogs.length === 0) return "";
    return stageLogs[stageLogs.length - 1].message;
  };

  const getStageData = (stageId) => {
    if (!logs) return null;
    const stageLogs = logs.filter(l => 
      l.agent === stageId || 
      (stageId === "Synthesis Agent" && (
        l.agent === "Synthesis Agent" || 
        l.agent === "Paper Writer Agent" ||
        l.agent === "Citation Graph Agent" ||
        l.agent === "Research Gap Finder Agent" ||
        l.agent === "Multi-Paper Comparison Agent" ||
        l.agent === "Methodology Suggester Agent" ||
        l.agent === "Plagiarism-Safe Paraphraser Agent" ||
        l.agent === "Abstract Grader Agent" ||
        l.agent === "Reference Formatter Agent" ||
        l.agent === "Research Proposal Writer Agent"
      ))
    );
    const logWithData = stageLogs.find(l => l.data);
    return logWithData ? logWithData.data : null;
  };

  return (
    <div className="glass-panel rounded-xl p-5 w-full glow-blue">
      <div className="flex items-center gap-2 mb-4 text-emerald-400 border-b border-slate-800 pb-2">
        <Loader2 className="w-5 h-5 animate-pulse text-emerald-400" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Multi-Agent Execution Pipeline</h2>
      </div>

      <div className="flex flex-col gap-4 relative">
        {/* Draw pipeline line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>

        {STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id);
          const msg = getStageMessage(stage.id);
          const data = getStageData(stage.id);
          
          let colorClass = "border-slate-800 text-slate-500 bg-slate-950/40";
          let icon = <HelpCircle className="w-4 h-4" />;
          let pulseClass = "";

          if (status === "running") {
            colorClass = "border-sky-500 text-sky-400 bg-sky-950/20 glow-blue";
            icon = <Loader2 className="w-4 h-4 animate-spin text-sky-400" />;
            pulseClass = "animate-pulse border-sky-400";
          } else if (status === "completed") {
            colorClass = "border-emerald-500 text-emerald-400 bg-emerald-950/20";
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
          } else if (status === "error") {
            colorClass = "border-red-500 text-red-400 bg-red-950/20";
            icon = <AlertCircle className="w-4 h-4 text-red-400" />;
          } else if (status === "info") {
            colorClass = "border-indigo-500 text-indigo-400 bg-indigo-950/20";
            icon = <Play className="w-4 h-4 text-indigo-400" />;
          }

          // Custom override labels for Synthesis / Writer depending on active mode
          let displayLabel = stage.label;
          if (stage.id === "Synthesis Agent" && activeIntent) {
            displayLabel = activeIntent === "QA" ? "Synthesis Agent" : "Paper Writer Agent";
          }

          return (
            <div key={stage.id} className="flex gap-4 items-start z-10">
              {/* Node bubble */}
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 ${colorClass} ${pulseClass}`}>
                {icon}
              </div>

              {/* Node Content */}
              <div className="flex-1 min-w-0 bg-slate-950/40 border border-slate-900 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    status === "running" ? "text-sky-400" : 
                    status === "completed" ? "text-emerald-400" : 
                    status === "error" ? "text-red-400" : "text-slate-400"
                  }`}>
                    {displayLabel}
                  </span>
                  <span className="text-[9px] uppercase text-slate-500 px-2 py-0.5 border border-slate-900 bg-slate-950 rounded">
                    {status}
                  </span>
                </div>

                {msg ? (
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">{msg}</p>
                ) : (
                  <p className="text-xs text-slate-600 italic">Waiting for pipeline trigger...</p>
                )}

                {/* Sub logs context details */}
                {status === "completed" && data && (
                  <div className="mt-2 text-[10px] border-t border-slate-900/60 pt-1.5 space-y-1 text-slate-400 font-mono">
                    {stage.id === "Orchestrator" && (
                      <div>
                        <div>Intent: <span className="text-purple-400 font-bold">{data.intent}</span></div>
                        <div>Profile level: <span className="text-slate-300 font-semibold">{data.profile?.vocab_level}</span></div>
                      </div>
                    )}
                    {stage.id === "RAG Agent" && (
                      <div>
                        <div>Summary: <span className="text-slate-300 italic">"{data.summary}"</span></div>
                        {data.chunks && data.chunks.length > 0 && (
                          <div className="mt-1">
                            <div className="text-slate-500 font-bold mb-0.5">Retrieved PDF Passages:</div>
                            {data.chunks.map((c, i) => (
                              <div key={i} className="text-[9px] text-slate-400 truncate">
                                • {c.filename} (p.{c.page})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {stage.id === "Web Research Agent" && data.papers && data.papers.length > 0 && (
                      <div>
                        <div className="text-slate-500 font-bold mb-0.5">Supporting Papers Found:</div>
                        {data.papers.map((p, i) => (
                          <div key={i} className="text-[9px] text-slate-400 truncate">
                            • [{i+1}] {p.title} ({p.year})
                          </div>
                        ))}
                      </div>
                    )}
                    {stage.id === "Memory Engine" && data.updated_profile && (
                      <div>
                        <div>Updated DNA Model: <span className="text-cyan-400">domain={data.updated_profile.domain}, vocab={data.updated_profile.vocab_level}</span></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
