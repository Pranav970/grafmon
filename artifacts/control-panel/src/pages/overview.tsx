import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw, ExternalLink, TerminalSquare, Loader2 } from "lucide-react";
import { useGetDockerStatus, useStartStack, useStopStack, useRestartService, useGetServiceLinks } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Overview() {
  const { data: status } = useGetDockerStatus({ query: { refetchInterval: 5000 } });
  const { data: links } = useGetServiceLinks({ query: { refetchInterval: 5000 } });
  const startStack = useStartStack();
  const stopStack = useStopStack();
  const restart = useRestartService();
  const [output, setOutput] = useState<string>("");
  const { toast } = useToast();

  const handleStart = () => {
    startStack.mutate(undefined, {
      onSuccess: (res) => {
        setOutput(res.output);
        toast({ title: "Stack started", description: "Docker compose up completed." });
      },
      onError: (err) => {
        toast({ title: "Error starting stack", variant: "destructive", description: String(err) });
      }
    });
  };

  const handleStop = () => {
    stopStack.mutate(undefined, {
      onSuccess: (res) => {
        setOutput(res.output);
        toast({ title: "Stack stopped", description: "Docker compose down completed." });
      },
      onError: (err) => {
        toast({ title: "Error stopping stack", variant: "destructive", description: String(err) });
      }
    });
  };

  const handleRestart = (service?: string) => {
    restart.mutate({ data: { service: service || null } }, {
      onSuccess: (res) => {
        setOutput(res.output);
        toast({ title: service ? `${service} restarted` : "Stack restarted", description: "Docker compose restart completed." });
      },
      onError: (err) => {
        toast({ title: "Error restarting", variant: "destructive", description: String(err) });
      }
    });
  };

  const isDeploying = startStack.isPending || stopStack.isPending || restart.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor and control your infrastructure stack.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => handleStart()} disabled={isDeploying} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {startStack.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Start Stack
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleStop()} disabled={isDeploying} className="bg-red-900/80 hover:bg-red-900 text-white">
            {stopStack.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
            Stop Stack
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleRestart()} disabled={isDeploying} className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
            {restart.isPending && !restart.variables?.data?.service ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
            Restart All
          </Button>
        </div>
      </div>

      {links && links.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          {links.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              asChild
              disabled={!link.active}
              className={link.active ? "border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:text-blue-400 text-slate-300" : "opacity-50 border-slate-800 bg-slate-900/50"}
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                {link.name}
              </a>
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {status?.map((container) => {
          let indicatorColor = "bg-slate-500";
          let textColor = "text-slate-400";
          
          if (container.status === 'running') {
             if (container.health === 'unhealthy') {
               indicatorColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
               textColor = 'text-red-400';
             } else if (container.health === 'starting') {
               indicatorColor = 'bg-yellow-500 animate-pulse';
               textColor = 'text-yellow-400';
             } else {
               indicatorColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
               textColor = 'text-emerald-400';
             }
          } else if (container.status === 'exited' || container.status === 'stopped') {
             indicatorColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
             textColor = 'text-red-400';
          }

          const isRestartingThis = restart.isPending && restart.variables?.data?.service === container.service;

          return (
            <Card key={container.name} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-slate-200">{container.service}</div>
                    <div className="text-xs text-slate-500 mt-1 font-mono truncate">{container.name}</div>
                    <div className={`text-xs mt-1.5 capitalize font-medium ${textColor}`}>
                      {container.status} {container.health && container.health !== 'none' ? `(${container.health})` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${indicatorColor} mt-1`} />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700" onClick={() => handleRestart(container.service)} disabled={isDeploying}>
                      {isRestartingThis ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-[#0b0f19] border-slate-800 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 bg-slate-900/50 py-3 px-4">
          <CardTitle className="text-xs font-mono text-slate-400 flex items-center">
            <TerminalSquare className="w-4 h-4 mr-2" />
            Console Output
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative">
          <pre className="p-4 h-64 overflow-auto text-xs font-mono text-slate-300 leading-relaxed selection:bg-slate-700">
            {output || "Ready. Deploy output will appear here..."}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
