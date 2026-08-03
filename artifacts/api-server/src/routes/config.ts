import { Router, type IRouter } from "express";
import fs from "fs/promises";
import path from "path";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";
import {
  GetPrometheusConfigResponse,
  UpdatePrometheusConfigBody,
  UpdatePrometheusConfigResponse,
  GetAlertmanagerConfigResponse,
  UpdateAlertmanagerConfigBody,
  UpdateAlertmanagerConfigResponse,
} from "@workspace/api-zod";

const INFRA_DIR =
  process.env["INFRA_DIR"] ??
  path.resolve(process.cwd(), "../../monitoring-infra");
const PROMETHEUS_YML = path.join(INFRA_DIR, "prometheus", "prometheus.yml");
const ENV_FILE = path.join(INFRA_DIR, ".env");
const ENV_EXAMPLE = path.join(INFRA_DIR, ".env.example");

const router: IRouter = Router();

// ── Prometheus config ─────────────────────────────────────────────────────────

// GET /config/prometheus — read scrape_interval, evaluation_interval, retention
router.get("/config/prometheus", async (req, res) => {
  try {
    const raw = await fs.readFile(PROMETHEUS_YML, "utf8");
    const doc = yamlLoad(raw) as {
      global?: {
        scrape_interval?: string;
        evaluation_interval?: string;
      };
    };

    // Retention time is in the Prometheus command in docker-compose.yml
    const composePath = path.join(INFRA_DIR, "docker-compose.yml");
    const composeRaw = await fs.readFile(composePath, "utf8");
    const retentionMatch = composeRaw.match(
      /--storage\.tsdb\.retention\.time=([^"\s]+)/,
    );

    res.json(
      GetPrometheusConfigResponse.parse({
        scrapeInterval: doc.global?.scrape_interval ?? "15s",
        evaluationInterval: doc.global?.evaluation_interval ?? "15s",
        retentionTime: retentionMatch?.[1] ?? "15d",
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to read prometheus config");
    res.status(500).json({ error: "Failed to read Prometheus configuration" });
  }
});

// PUT /config/prometheus — update those values and write back
router.put("/config/prometheus", async (req, res) => {
  try {
    const body = UpdatePrometheusConfigBody.parse(req.body);

    // Update prometheus.yml global block
    const raw = await fs.readFile(PROMETHEUS_YML, "utf8");
    const doc = yamlLoad(raw) as {
      global?: Record<string, string>;
      [key: string]: unknown;
    };

    if (!doc.global) doc.global = {};
    doc.global["scrape_interval"] = body.scrapeInterval;
    doc.global["evaluation_interval"] = body.evaluationInterval;
    doc.global["scrape_timeout"] = "10s"; // keep existing default

    const updated = yamlDump(doc, { lineWidth: 120 });
    await fs.writeFile(PROMETHEUS_YML, updated, "utf8");

    // Update docker-compose.yml retention time
    const composePath = path.join(INFRA_DIR, "docker-compose.yml");
    let composeRaw = await fs.readFile(composePath, "utf8");
    composeRaw = composeRaw.replace(
      /--storage\.tsdb\.retention\.time=\S+/,
      `--storage.tsdb.retention.time=${body.retentionTime}`,
    );
    await fs.writeFile(composePath, composeRaw, "utf8");

    res.json(
      UpdatePrometheusConfigResponse.parse({
        success: true,
        message: "Prometheus configuration updated. Restart Prometheus to apply.",
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to update prometheus config");
    res.status(500).json({ error: "Failed to update Prometheus configuration" });
  }
});

// ── Alertmanager env config ───────────────────────────────────────────────────
// Config is stored as key=value pairs in monitoring-infra/.env
// (or read from .env.example if .env doesn't exist yet)

async function readEnvFile(filePath: string): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const result: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      result[key] = val;
    }
    return result;
  } catch {
    return {};
  }
}

async function writeEnvFile(
  filePath: string,
  vars: Record<string, string>,
): Promise<void> {
  const lines = Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  await fs.writeFile(filePath, lines + "\n", "utf8");
}

// GET /config/alertmanager
router.get("/config/alertmanager", async (req, res) => {
  try {
    let envVars = await readEnvFile(ENV_FILE);
    if (Object.keys(envVars).length === 0) {
      envVars = await readEnvFile(ENV_EXAMPLE);
    }

    const portStr = envVars["EMAIL_SMTP_PORT"] ?? "587";
    const port = parseInt(portStr, 10);

    res.json(
      GetAlertmanagerConfigResponse.parse({
        slackWebhookUrl: envVars["SLACK_WEBHOOK_URL"] ?? "",
        slackChannel: envVars["SLACK_CHANNEL"] ?? "#alerts",
        discordWebhookUrl: envVars["DISCORD_WEBHOOK_URL"] ?? "",
        emailSmtpHost: envVars["EMAIL_SMTP_HOST"] ?? "",
        emailSmtpPort: isNaN(port) ? 587 : port,
        emailFrom: envVars["EMAIL_FROM"] ?? "",
        emailTo: envVars["EMAIL_TO"] ?? "",
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to read alertmanager config");
    res.status(500).json({ error: "Failed to read Alertmanager configuration" });
  }
});

// PUT /config/alertmanager
router.put("/config/alertmanager", async (req, res) => {
  try {
    const body = UpdateAlertmanagerConfigBody.parse(req.body);

    // Merge with existing .env (keep non-alertmanager vars intact)
    let existing = await readEnvFile(ENV_FILE);
    if (Object.keys(existing).length === 0) {
      existing = await readEnvFile(ENV_EXAMPLE);
    }

    const updated: Record<string, string> = {
      ...existing,
      ...(body.slackWebhookUrl != null && {
        SLACK_WEBHOOK_URL: body.slackWebhookUrl,
      }),
      ...(body.slackChannel != null && { SLACK_CHANNEL: body.slackChannel }),
      ...(body.discordWebhookUrl != null && {
        DISCORD_WEBHOOK_URL: body.discordWebhookUrl,
      }),
      ...(body.emailSmtpHost != null && {
        EMAIL_SMTP_HOST: body.emailSmtpHost,
      }),
      ...(body.emailSmtpPort != null && {
        EMAIL_SMTP_PORT: String(body.emailSmtpPort),
      }),
      ...(body.emailFrom != null && { EMAIL_FROM: body.emailFrom }),
      ...(body.emailTo != null && { EMAIL_TO: body.emailTo }),
    };

    await writeEnvFile(ENV_FILE, updated);

    res.json(
      UpdateAlertmanagerConfigResponse.parse({
        success: true,
        message:
          "Alertmanager configuration saved to .env. Restart the stack to apply.",
      }),
    );
  } catch (err) {
    req.log.error({ err }, "Failed to update alertmanager config");
    res
      .status(500)
      .json({ error: "Failed to update Alertmanager configuration" });
  }
});

export default router;
