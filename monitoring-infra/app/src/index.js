import express from "express";
import {
  register,
  metricsMiddleware,
  errorMiddleware,
  appErrorsTotal,
} from "./metrics.js";

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());

// ── Instrumentation middleware (must come before routes) ──────────────────────
app.use(metricsMiddleware);

// ── Routes ────────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    message: "Hello, World!",
    service: "target-app",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/api/users", (req, res) => {
  res.json({
    users: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
  });
});

app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const users = { 1: "Alice", 2: "Bob" };
  const name = users[id];

  if (!name) {
    return res.status(404).json({ error: `User ${id} not found` });
  }

  res.json({ id: Number(id), name });
});

// Simulate a slow endpoint — useful for testing latency panels
app.get("/api/slow", async (req, res) => {
  const delay = Number(req.query.ms) || 500;
  await new Promise((r) => setTimeout(r, Math.min(delay, 5000)));
  res.json({ delayed_ms: delay });
});

// Simulate an error — useful for testing error rate panels
app.get("/api/error", (req, res) => {
  appErrorsTotal.inc({ type: "route_error", route: "/api/error" });
  res.status(500).json({ error: "Simulated server error" });
});

// ── Metrics endpoint ──────────────────────────────────────────────────────────
// Scraped by Prometheus every 15 seconds.
// NOT exposed publicly — Nginx blocks /metrics on port 80.
// Prometheus reaches this directly via app:3000/metrics inside the Docker network.
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ── Error handling (must come after routes) ───────────────────────────────────
app.use(errorMiddleware);

// ── Process-level error tracking ─────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
  appErrorsTotal.inc({ type: "unhandled_rejection", route: "global" });
});

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err.message);
  appErrorsTotal.inc({ type: "uncaught_exception", route: "global" });
});

app.listen(PORT, HOST, () => {
  console.log(`[target-app] Listening on http://${HOST}:${PORT}`);
  console.log(`[target-app] Metrics available at http://${HOST}:${PORT}/metrics`);
});
