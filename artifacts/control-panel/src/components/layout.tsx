import React from "react";
import { Link, useLocation } from "wouter";
import { Activity, Settings, TerminalSquare } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { name: "Overview", path: "/", icon: Activity },
    { name: "Configuration", path: "/config", icon: Settings },
    { name: "Live Logs", path: "/logs", icon: TerminalSquare },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-bold text-lg tracking-tight">Ops Control</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-background">
        <div className="p-8 max-w-6xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
