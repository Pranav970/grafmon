import { Router, type IRouter } from "express";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import path from "path";
import {
  GetDockerStatusResponse,
  StartStackResponse,
  StopStackResponse,
  RestartServiceBody,
  RestartServiceResponse,
} from "@workspace/api-zod";

const execAsync = promisify(exec);
const INFRA_DIR =
  process.env["INFRA_DIR"] ??
  path.resolve(process.cwd(), "../../monitoring-infra");

const router: IRouter = Router();

// ── Helper: map container name → logical service name ─────────────────────────
function containerToService(name: string): string {
  const map: Record<string, string> = {
    "target-app": "app",
    "nginx-proxy": "nginx",
    prometheus: "prometheus",
    grafana: "grafana",
    alertmanager: "alertmanager",
    loki: "loki",
    promtail: "promtail",
    "node-exporter": "node-exporter",
    "nginx-exporter": "nginx-exporter",
  };
  return map[name] ?? name;
}

// ── Helper: extract health from Docker "Status" string ────────────────────────
// e.g. "Up 3 minutes (healthy)" → "healthy"
//      "Up 2 hours"             → "none"
//      "Exited (0) 5 minutes"   → "none"
function extractHealth(statusStr: string): string {
  if (/\(healthy\)/i.test(statusStr)) return "healthy";
  if (/\(unhealthy\)/i.test(statusStr)) return "unhealthy";
  if (/\(health: starting\)/i.test(statusStr)) return "starting";
  return "none";
}

// ── Helper: extract uptime from Docker "Status" string ───────────────────────
function extractUptime(statusStr: string): string {
  // Strip health suffix like "(healthy)", "(unhealthy)"
  return statusStr.replace(/\s*\([^)]*\)/g, "").trim() || "—";
}

// ── GET /docker/status ────────────────────────────────────────────────────────
router.get("/docker/status", async (req, res) => {
  try {
    const { stdout } = await execAsync(
      `docker ps -a --filter "network=monitoring" --format '{{json .}}'`,
      { timeout: 15_000 },
    );

    const statuses = stdout
      .trim()
      .split("\n")
      .filter((l) => l.trim())
      .map((line) => {
        const c = JSON.parse(line) as {
          Names: string;
          State: string;
          Status: string;
          Ports: string;
        };
        const name = c.Names.replace(/^\//, "");
        return {
          name,
          service: containerToService(name),
          status: (c.State || "stopped").toLowerCase(),
          health: extractHealth(c.Status),
          uptime: extractUptime(c.Status),
          ports: c.Ports
            ? c.Ports.split(", ")
                .map((p) => p.trim())
                .filter(Boolean)
            : [],
        };
      });

    res.json(GetDockerStatusResponse.parse(statuses));
  } catch (err) {
    req.log.error({ err }, "Failed to get docker status");
    res.status(500).json({ error: "Failed to get container statuses" });
  }
});

// ── POST /docker/up ───────────────────────────────────────────────────────────
router.post("/docker/up", async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync(
      "docker compose up -d --remove-orphans 2>&1",
      { cwd: INFRA_DIR, timeout: 180_000 },
    );
    const output = [stdout, stderr].filter(Boolean).join("\n");
    res.json(StartStackResponse.parse({ success: true, output, exitCode: 0 }));
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    res.json(
      StartStackResponse.parse({ success: false, output, exitCode: e.code ?? 1 }),
    );
  }
});

// ── POST /docker/down ─────────────────────────────────────────────────────────
router.post("/docker/down", async (req, res) => {
  try {
    const { stdout, stderr } = await execAsync(
      "docker compose down 2>&1",
      { cwd: INFRA_DIR, timeout: 120_000 },
    );
    const output = [stdout, stderr].filter(Boolean).join("\n");
    res.json(StopStackResponse.parse({ success: true, output, exitCode: 0 }));
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    res.json(
      StopStackResponse.parse({ success: false, output, exitCode: e.code ?? 1 }),
    );
  }
});

// ── POST /docker/restart ──────────────────────────────────────────────────────
router.post("/docker/restart", async (req, res) => {
  const body = RestartServiceBody.parse(req.body);
  const serviceArg = body.service ?? "";

  try {
    const cmd = serviceArg
      ? `docker compose restart ${serviceArg} 2>&1`
      : "docker compose restart 2>&1";

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: INFRA_DIR,
      timeout: 120_000,
    });
    const output = [stdout, stderr].filter(Boolean).join("\n");
    res.json(
      RestartServiceResponse.parse({ success: true, output, exitCode: 0 }),
    );
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & {
      stdout?: string;
      stderr?: string;
      code?: number;
    };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    res.json(
      RestartServiceResponse.parse({
        success: false,
        output,
        exitCode: e.code ?? 1,
      }),
    );
  }
});

// ── GET /docker/logs/stream  (Server-Sent Events) ────────────────────────────
// Query params:
//   ?service=<name>  — filter to a specific service (optional)
// Each SSE `data:` event is a JSON-stringified log line string.
router.get("/docker/logs/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const service =
    typeof req.query["service"] === "string" ? req.query["service"] : null;

  const args = ["compose", "logs", "--follow", "--tail=200", "--no-color"];
  if (service) args.push(service);

  const proc = spawn("docker", args, { cwd: INFRA_DIR });

  const sendLine = (line: string) => {
    const trimmed = line.trimEnd();
    if (trimmed) {
      res.write(`data: ${JSON.stringify(trimmed)}\n\n`);
    }
  };

  let stdout_buf = "";
  proc.stdout.on("data", (chunk: Buffer) => {
    stdout_buf += chunk.toString();
    const lines = stdout_buf.split("\n");
    stdout_buf = lines.pop() ?? "";
    lines.forEach(sendLine);
  });

  let stderr_buf = "";
  proc.stderr.on("data", (chunk: Buffer) => {
    stderr_buf += chunk.toString();
    const lines = stderr_buf.split("\n");
    stderr_buf = lines.pop() ?? "";
    lines.forEach(sendLine);
  });

  proc.on("error", (err) => {
    req.log.error({ err }, "docker logs process error");
    res.write(`data: ${JSON.stringify("[ERROR] " + err.message)}\n\n`);
  });

  proc.on("close", (code) => {
    req.log.info({ code }, "docker logs process closed");
    res.write(`data: ${JSON.stringify("[Process exited with code " + code + "]")}\n\n`);
    res.end();
  });

  req.on("close", () => {
    proc.kill("SIGTERM");
  });
});

export default router;
