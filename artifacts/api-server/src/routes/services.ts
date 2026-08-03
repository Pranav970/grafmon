import { Router, type IRouter } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { GetServiceLinksResponse } from "@workspace/api-zod";

const execAsync = promisify(exec);

const router: IRouter = Router();

// Service definitions — ports match .env.example defaults
const SERVICE_DEFS = [
  {
    name: "Grafana",
    container: "grafana",
    port: process.env["GRAFANA_PORT"] ?? "3001",
    description: "Metrics dashboards and log exploration",
    icon: "BarChart3",
    path: "",
  },
  {
    name: "Prometheus",
    container: "prometheus",
    port: process.env["PROMETHEUS_PORT"] ?? "9090",
    description: "Metrics storage and query engine",
    icon: "Activity",
    path: "",
  },
  {
    name: "Alertmanager",
    container: "alertmanager",
    port: process.env["ALERTMANAGER_PORT"] ?? "9093",
    description: "Alert routing and notification management",
    icon: "Bell",
    path: "",
  },
  {
    name: "Target App",
    container: "target-app",
    port: process.env["NGINX_PORT"] ?? "8080",
    description: "Monitored Node.js application (via Nginx)",
    icon: "Globe",
    path: "",
  },
  {
    name: "Loki",
    container: "loki",
    port: process.env["LOKI_PORT"] ?? "3100",
    description: "Log aggregation and query API",
    icon: "FileText",
    path: "/ready",
  },
] as const;

// GET /services/links
router.get("/services/links", async (req, res) => {
  try {
    // Check which containers are running
    let runningContainers = new Set<string>();
    try {
      const { stdout } = await execAsync(
        `docker ps --filter "network=monitoring" --format "{{.Names}}"`,
        { timeout: 10_000 },
      );
      runningContainers = new Set(
        stdout
          .trim()
          .split("\n")
          .map((n) => n.trim().replace(/^\//, ""))
          .filter(Boolean),
      );
    } catch {
      // Docker might not be running — treat all as inactive
    }

    // Build the public base URL from request headers
    // In Replit the host header includes the proxy prefix
    const host = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "localhost";
    const proto = req.headers["x-forwarded-proto"] ?? "http";
    const baseUrl = `${proto}://${host}`;

    const links = SERVICE_DEFS.map((svc) => ({
      name: svc.name,
      url: `${baseUrl}`,   // The control panel already knows the right port
      active: runningContainers.has(svc.container),
      description: svc.description,
      icon: svc.icon,
    }));

    // Override URL with direct host:port links for external services
    const portLinks = SERVICE_DEFS.map((svc, i) => ({
      ...links[i]!,
      url: `http://localhost:${svc.port}${svc.path}`,
    }));

    res.json(GetServiceLinksResponse.parse(portLinks));
  } catch (err) {
    req.log.error({ err }, "Failed to get service links");
    res.status(500).json({ error: "Failed to get service links" });
  }
});

export default router;
