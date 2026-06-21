# 🌌 PulseSRE — Full-Stack DevOps Observability Hub & Deployment Panel

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions)]()
[![Docker Compose](https://img.shields.io/badge/Docker--Compose-v2.20+-blue?style=for-the-badge&logo=docker)]()
[![Prometheus](https://img.shields.io/badge/Prometheus-v2.45-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)]()
[![Grafana](https://img.shields.io/badge/Grafana-v10.1-F46800?style=for-the-badge&logo=grafana&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()

An ultra-modern, production-ready infrastructure telemetry stack. This system couples industry-standard metrics and logging pipelines (**Prometheus, Grafana, Loki, Promtail**) with a custom, high-fidelity **DevOps Deployment Control Panel** built directly into the codebase to eliminate terminal friction.

Monitor host systems, application runtimes, and network layers effortlessly with a sleek, automated web interface.

---

## 🗺️ Architectural Ecosystem


```

```
                   ┌───────────────────────────────┐
                   │   Client Web Browser (User)   │
                   └───────────────┬───────────────┘
                                   │
                                   ▼ (Port 8000)
┌──────────────────────────────────────────────────────────────────┐
│              🎛️ CENTAL DEVOPS UI CONTROL PANEL                    │
│   - State & Daemon Manager (Docker SDK/Shell Engine)             │
│   - Live Stream Terminal Interface                               │
│   - Automated Configuration Schema Generator                     │
└──────────────────────────────┬───────────────────────────────────┘
                               │
  ┌────────────────────────────┴─────────────────────────────┐
  ▼ (Deploys Target Stack)                                   ▼ (Monitors Live Telemetry)

```

┌──────────────────────────────────────────┐               ┌───────────────────────────────────┐
│     🌐 TARGET APPLICATION LAYER          │               │      📊 OBSERVABILITY LAYER       │
│                                          │               │                                   │
│  ┌────────────────────────────────────┐  │               │  ┌─────────────────────────────┐  │
│  │   Nginx Edge Proxy (Port 80)       │  │               │  │  Grafana Engine (Port 3000) │  │
│  └─────────────────┬──────────────────┘  │               │  └──────────────▲──────────────┘  │
│                    │                     │               │                 │ (Visualizes)    │
│                    ▼ (Internal Route)    │               │  ┌──────────────┴──────────────┐  │
│  ┌────────────────────────────────────┐  │               │  │  Prometheus TSDB (Port 9090)│  │
│  │   Node.js Microservice (Port 3000) │  │               │  └──────────────▲──────────────┘  │
│  └────────────────────────────────────┘  │               │                 │                 │
└────────────────────┬─────────────────────┘               └─────────────────┼─────────────────┘
│                                                       │
│ (Exposes Telemetry Endpoints)                         │ (Pulls Metrics)
▼                                                       │
┌────────────────────────────────────────────────────────────────────────────┴─────────────────┐
│     📡 DATA EXPORTERS & LOG PIPELINES                                                        │
│                                                                                              │
│  🔹 Node Exporter (Port 9100)       ──► System Metrics (CPU, RAM, Disk, IO, Network)        │
│  🔹 Nginx Prometheus Exporter       ──► Server Analytics (Connections, Handshakes, Traffic)   │
│  🔹 App Instrumentation (/metrics)  ──► Node.js Application V8 Runtime & Custom Gauges       │
│  🔹 Promtail Log Shipper            ──► Collects Container Stream Logs ──► Sent to Loki DB   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘

```

---

## ✨ Features Blueprint

### 🎛️ 1. Centralized DevOps Control Panel
* **One-Click Deployments:** High-fidelity UI triggers execution hooks (`docker-compose up -d` / `down`) under the hood without opening a shell window.
* **Live Microservice Telemetry Status:** Responsive visual cards tracking container health (Active/Inactive) using clear green/red ping micro-animations.
* **Smart Config Synthesizer:** Modify scrape parameters, metrics retention policies, or target endpoints dynamically inside forms—the backend updates your `.yml` definitions on the fly.
* **Terminal Stream Emulation:** A viewport reflecting live terminal stdout/stderr sequences directly on the page during deployment setup.

### 📊 2. Deep Metrics Infrastructure (Prometheus & PromQL)
* Dynamic system polling across the host OS using custom-mapped namespaces.
* Service layer telemetry for traffic routing and socket connectivity via optimized Nginx exporters.
* Preconfigured metric scraping intervals fine-tuned to 15-second cycles for granular anomaly tracking.

### 🎨 3. Auto-Provisioned Dashboards (Grafana)
* Fully code-driven initialization inside Grafana (`datasources.yaml` & JSON dashboards) so configurations are fully up on spin-up. No manual web UI point-and-click setup needed.
* Dual telemetry views: **System Health Metrics Engine** and an **Application Traffic Performance Dashboard**.

### 🚨 4. Production Resilience (Alerting & Logs)
* Seamless integration with Prometheus Alertmanager to monitor container failure cascades, storage threshold limits, or thread freezes.
* Standardized log consolidation managed via Grafana Loki and Promtail, matching explicit runtime event lines with your core metrics.

---

## 🛠️ Technology Stack Ecosystem

* **Frontend Orchestrator:** Tailwind CSS, Lucide Icons, Vanilla ES6 Web Sockets / Async Engines.
* **System Control Backend:** FastAPI (Python) or Express (Node.js) communicating with system runtimes.
* **Time-Series Telemetry Core:** Prometheus TSDB, PromQL Query Compiler.
* **Analytical Visualization Platform:** Grafana Metrics Engine.
* **Data Log Aggregators:** Loki DB Cluster, Promtail Log Shippers.
* **Application Infrastructure Targets:** Nginx HTTP Engine, Node.js runtime, Node Exporter.

---

## 📂 Project Directory Structure

```text
.
├── README.md                          # Comprehensive Documentation
├── docker-compose.yml                 # Master Multi-Container Manifest Blueprint
├── .env                               # Protected Secrets and Credentials Environment Config
│
├── 🎛️ devops-control-panel/           # Sleek Management UI Dashboard Component
│   ├── main.py / server.js            # Control Panel Backend Engine (Docker Hooks)
│   ├── public/                        # Core Static Assets Directory
│   │   ├── index.html                 # Main Single-Page App Layout Dashboard
│   │   └── app.js                     # Interactive WebSocket/Fetch Event Controller
│   └── requirements.txt / package.json# Dependencies Specification Matrix
│
├── 🌐 application/                    # Production Sample Microservices Target
│   ├── app.js                         # Node.js Express App with Custom Instrumentation
│   ├── package.json                   # Runtime Definitions Checklist
│   └── nginx.conf                     # Nginx Configuration Proxy with Metrics Access
│
└── 📊 monitoring/                     # SRE Infrastructure Configuration Engine
    ├── prometheus/
    │   ├── prometheus.yml             # Scraping Specifications and Global Rules Matrix
    │   └── alert_rules.yml            # System Failure Metric Notification Conditions
    ├── alertmanager/
    │   └── alertmanager.yml           # Alert Payload Webhook Mappings (Slack/Discord)
    └── grafana/
        ├── provisioning/
        │   ├── datasources/
        │   │   └── datasources.yaml   # Zero-Config Auto-Connect Mapping to Prometheus
        │   └── dashboards/
        │       └── dashboards.yaml    # Dashboard Auto-Provisioning Definition File
        └── dashboards/
            ├── system_overview.json   # JSON-based Metrics Visualization Interface
            └── app_performance.json   # App Engine Traffic Analytics Visual Interface

```

---

## 🚀 Rapid Quickstart Protocol

### 1. Verification of System Pre-requisites

Ensure your deployment machine or Replit instance has Docker and Docker-Compose installed:

```bash
docker --version && docker-compose --version

```

### 2. Cloned Repository Deployment

Pull down the project files and enter the build context directory:

```bash
git clone [https://github.com/your-username/pulsesre-monitoring-stack.git](https://github.com/your-username/pulsesre-monitoring-stack.git)
cd pulsesre-monitoring-stack

```

### 3. Initialize Control Panel Engine

Navigate to the DevOps Control Panel module, install system hooks, and ignite the initialization routine.

```bash
cd devops-control-panel
# If Python FastAPI:
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# If Node.js Express:
npm install
npm start

```

Open your web viewport to `http://localhost:8000`. You will be met by the PulseSRE modern deployment layout interface.

---

## 🔄 The Stepwise Deployment Workflow

The core architecture builds out incrementally using the Control Panel UI tabs, or execution instructions mapped sequentially below:

### 📍 Step 1: Base Application Activation

This launches the underlying target web platform infrastructure—the custom Node.js application and its companion Nginx Reverse Proxy wrapper. Nginx routes inbound port connections while securely opening server status ports to tracking loops.

### 📍 Step 2: System Metrics Scraping

Injects Prometheus and the Node Exporter sidecar. Node Exporter binds to the base system metrics and maps raw host statistics (CPU, RAM utilization loops) directly to Prometheus time-series indices.

### 📍 Step 3: Application Telemetry Ingestion

Integrates custom Prometheus middleware parameters inside the application. The application tracks active HTTP request loads, response latency percentiles, and runtime error conditions, opening up detailed tracking on `/metrics`.

### 📍 Step 4: Zero-Config Grafana Boot

Deploys the Grafana analytics environment. The system utilizes automated data provider configuration records (`datasources.yaml`) to instantly discover and securely connect to Prometheus on start.

### 📍 Step 5: High-Fidelity Dashboards Provisioning

Automated execution profiles load JSON specifications directly into Grafana's visualization server. The platform serves complete, production-ready diagnostic dashboards out-of-the-box.

---

## ⚙️ Core Configuration Reference

### 🔹 Prometheus Setup (`monitoring/prometheus/prometheus.yml`)

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'nginx-exporter'
    static_configs:
      - targets: ['nginx-exporter:9113']

  - job_name: 'nodejs-app'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['nodejs-app:3000']

```

### 🔹 Core Docker Architecture Manifest (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: pulsesre-prometheus
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
    ports:
      - "9090:9090"
    restart: unless-stopped

  grafana:
    image: grafana/grafana:10.1.0
    container_name: pulsesre-grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=${ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${ADMIN_PASSWORD:-pulseadmin123}
    volumes:
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - grafana-data:/var/lib/grafana
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:v1.6.1
    container_name: pulsesre-node-exporter
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
    restart: unless-stopped

volumes:
  prometheus-data:
  grafana-data:

```

---

## 📈 SRE PromQL Analytics Command Cheat-Sheet

Here are the operational production metrics configured within your system panels:

* **CPU Saturation Rate (%):**
```promql
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

```


* **Memory Utilization Scale (%):**
```promql
((node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes) * 100

```


* **HTTP Request Volume Tracking (Nginx):**
```promql
rate(nginx_extractor_requests_total[5m])

```


* **Application Framework Fault Tracking Ratio (5xx Errors):**
```promql
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100

```



---

## 🩺 System Diagnostic & Verification Scripts

Verify internal network packet handshakes and scrapers cleanly via simple health endpoints:

```bash
# Verify Prometheus Discovery Loop Contexts
curl -s http://localhost:9090/api/v1/targets | json_pp

# Query App Server Specific Metric Expositions
curl http://localhost:3000/metrics

# Validate Scraper Node Engine Integrity
curl http://localhost:9100/metrics

```

---

## 📄 Licensing & Open Source Standalone Policies

Distributed securely under the **MIT License**. Check out `LICENSE` documentation details inside the source root for full legal parameters.

---

Developed with 💙 by a SRE Architect. Keep your systems stable and your latency low!

```

```
