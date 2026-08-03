import React, { useEffect, useState, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Pause, Terminal, Trash2 } from "lucide-react";

export default function Logs() {
  const [service, setService] = useState<string>("all");
  const [logs, setLogs] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      const url = service === "all" ? "/api/docker/logs/stream" : `/api/docker/logs/stream?service=${service}`;
      eventSource = new EventSource(url);
      
      eventSource.onmessage = (event) => {
        if (!paused) {
          try {
            const data = JSON.parse(event.data);
            setLogs((prev) => [...prev, data].slice(-2000)); // Keep last 2000 lines
          } catch (e) {
            setLogs((prev) => [...prev, event.data].slice(-2000));
          }
        }
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [service, paused]);

  useEffect(() => {
    if (!paused) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, paused]);

  const highlightLog = (line: string) => {
    let content = line;
    const lowerLine = line.toLowerCase();
    const isError = lowerLine.includes("error") || lowerLine.includes("err=") || lowerLine.includes("level=error");
    const isWarn = lowerLine.includes("warn") || lowerLine.includes("level=warn");
    
    // Attempt to extract timestamp for coloring
    // e.g. "2023-10-01T12:00:00.000Z app | Something happened"
    // We'll just apply a generic style for now to keep it fast
    
    let colorClass = "text-slate-300";
    if (isError) colorClass = "text-red-400";
    else if (isWarn) colorClass = "text-yellow-400";

    // Split on the first "|" to potentially style the service name
    const parts = content.split("|");
    if (parts.length > 1 && parts[0].length < 40) { // arbitrary length check to ensure it's probably a prefix
      const prefix = parts.shift() || "";
      const rest = parts.join("|");
      return (
        <div className={`font-mono text-[13px] whitespace-pre-wrap break-all leading-tight ${colorClass} hover:bg-slate-800/50 px-2 py-0.5 -mx-2 rounded`}>
          <span className="text-blue-400/80 mr-2">{prefix}|</span>
          <span>{rest}</span>
        </div>
      );
    }

    return <div className={`font-mono text-[13px] whitespace-pre-wrap break-all leading-tight ${colorClass} hover:bg-slate-800/50 px-2 py-0.5 -mx-2 rounded`}>{content}</div>;
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <Terminal className="w-7 h-7 mr-3 text-slate-400" />
            Live Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1 ml-10">Real-time output from containers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={service} onValueChange={(val) => { setService(val); setLogs([]); }}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-slate-200">
              <SelectValue placeholder="Filter by service" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="nginx">Nginx Proxy</SelectItem>
              <SelectItem value="app">Node.js App</SelectItem>
              <SelectItem value="prometheus">Prometheus</SelectItem>
              <SelectItem value="grafana">Grafana</SelectItem>
              <SelectItem value="loki">Loki</SelectItem>
              <SelectItem value="alertmanager">Alertmanager</SelectItem>
            </SelectContent>
          </Select>

          <Button variant={paused ? "default" : "outline"} onClick={() => setPaused(!paused)} className={paused ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"}>
            {paused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button variant="ghost" onClick={() => setLogs([])} className="text-slate-400 hover:text-red-400 hover:bg-red-400/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-[#0b0f19] rounded-lg border border-slate-800 shadow-inner overflow-hidden flex flex-col">
        <div className="h-full p-4 overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          {logs.length === 0 ? (
            <div className="text-slate-500 text-sm font-mono h-full flex flex-col items-center justify-center gap-3">
              <Terminal className="w-8 h-8 opacity-50" />
              <span>Waiting for logs...</span>
            </div>
          ) : (
            <div className="space-y-0.5">
              {logs.map((log, index) => (
                <React.Fragment key={index}>
                  {highlightLog(log)}
                </React.Fragment>
              ))}
              <div ref={bottomRef} className="h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
