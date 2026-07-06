import client from "prom-client";

// ── Registry ──────────────────────────────────────────────────────────────────
// Use a dedicated registry so we have full control over what is exposed.
export const register = new client.Registry();

// Attach default Node.js / process metrics (heap, GC, event loop lag, etc.)
client.collectDefaultMetrics({
  register,
  prefix: "nodejs_",          // namespace keeps them separate from app metrics
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});

// ── HTTP metrics ──────────────────────────────────────────────────────────────

/**
 * Total HTTP requests completed.
 * Labels: method (GET/POST/…), route (/health, /api/users, …), status_code (200/404/…)
 */
export const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests completed",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

/**
 * HTTP request duration histogram.
 * Buckets are tuned for a web API — covers everything from sub-ms to 10s.
 */
export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

/**
 * Currently in-flight (active) HTTP requests.
 * A sustained high value here means the app is struggling to keep up.
 */
export const httpRequestsInFlight = new client.Gauge({
  name: "http_requests_in_flight",
  help: "Number of HTTP requests currently being processed",
  labelNames: ["method"],
  registers: [register],
});

/**
 * Application-level error counter.
 * Incremented manually in error-handling middleware and catch blocks.
 * Labels: type (unhandled_rejection / uncaught_exception / route_error)
 */
export const appErrorsTotal = new client.Counter({
  name: "app_errors_total",
  help: "Total number of application-level errors",
  labelNames: ["type", "route"],
  registers: [register],
});

// ── Middleware factory ────────────────────────────────────────────────────────

/**
 * Express middleware that instruments every request automatically.
 *
 * Usage:
 *   app.use(metricsMiddleware);
 *
 * It records: in-flight gauge, request counter, duration histogram.
 * Route normalisation uses req.route.path (set by Express after routing)
 * so /api/users/:id counts as one route, not N distinct paths.
 */
export function metricsMiddleware(req, res, next) {
  // Skip the /metrics endpoint itself — avoid self-referential data skew
  if (req.path === "/metrics") {
    return next();
  }

  const startNs = process.hrtime.bigint();
  const { method } = req;

  httpRequestsInFlight.inc({ method });

  res.on("finish", () => {
    const durationSeconds = Number(process.hrtime.bigint() - startNs) / 1e9;

    // Prefer the matched Express route pattern over the raw path.
    // Falls back to req.path if the route hasn't been matched (e.g. 404s).
    const route = req.route?.path ?? req.path ?? "unknown";
    const statusCode = String(res.statusCode);

    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, durationSeconds);
    httpRequestsInFlight.dec({ method });
  });

  next();
}

/**
 * Express error-handling middleware.
 * Must be registered AFTER all routes with app.use(errorMiddleware).
 */
export function errorMiddleware(err, req, res, next) {
  const route = req.route?.path ?? req.path ?? "unknown";
  appErrorsTotal.inc({ type: "route_error", route });

  console.error(`[error] ${req.method} ${req.path} →`, err.message);
  res.status(500).json({ error: "Internal server error" });
}
