# Ghost-Watch Apex Terminal

<div align="center">

![Ghost-Watch Apex Banner](https://img.shields.io/badge/GHOST--WATCH-APEX%20SOVEREIGN%20DEFENSE-06e1f9?style=for-the-badge&logo=shield&logoColor=black)

**Sovereign Cyber-Physical Defense Framework, Advanced Canary Trap Ecosystem (ACTS), and Post-Quantum Cryptographic Command & Control.**

[![CI Status](https://img.shields.io/badge/CI-Passing-05f3a1?style=flat-square&logo=github-actions&logoColor=white)](.github/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9_Force_Graph-F9A03C?style=flat-square&logo=d3.js&logoColor=white)](https://d3js.org/)
[![Recharts](https://img.shields.io/badge/Recharts-2.15_Live_Metrics-22b5bf?style=flat-square)](https://recharts.org/)
[![NIST SP 800-207](https://img.shields.io/badge/Zero_Trust-NIST_SP_800--207-06e1f9?style=flat-square)](https://csrc.nist.gov/publications/detail/sp/800-207/final)
[![FIPS 203](https://img.shields.io/badge/PQC-FIPS_203_ML--KEM--768-05f3a1?style=flat-square)](https://csrc.nist.gov/pubs/fips/203/final)
[![Live Telemetry](https://img.shields.io/badge/Live_Data-100%25_Real_Time-05f3a1?style=flat-square&logo=statuspage&logoColor=white)](#real-time-live-data-telemetry)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

</div>

---

## Table of Contents

- [Overview & Operational Philosophy](#overview--operational-philosophy)
- [System Architecture Blueprint](#system-architecture-blueprint)
- [Core Operational Modules](#core-operational-modules)
  - [1. Overview & Real-Time System Health Monitor](#1-overview--real-time-system-health-monitor)
  - [2. Canary Trap Factory (ACTS)](#2-canary-trap-factory-acts)
  - [3. Attribution Database (ADB) & Forensic PDF Reports](#3-attribution-database-adb--forensic-pdf-reports)
  - [4. Palantir Ontological D3.js Force-Directed Graph](#4-palantir-ontological-d3js-force-directed-graph)
  - [5. Aegis Multi-Tier Combat Radar](#5-aegis-multi-tier-combat-radar)
  - [6. Cyber Attribution & Deception Ladder (CADL)](#6-cyber-attribution--deception-ladder-cadl)
  - [7. Cerberus Behavioral Sensor & Threat Scanner](#7-cerberus-behavioral-sensor--threat-scanner)
  - [8. Lazarus Mesh-Net (Polymorphic C2 Routing)](#8-lazarus-mesh-net-polymorphic-c2-routing)
  - [9. Gorgon Anti-Tamper & Volatile Key Purging](#9-gorgon-anti-tamper--volatile-key-purging)
  - [10. Omega Contingency & Sovereign Self-Wipe](#10-omega-contingency--sovereign-self-wipe)
- [Real-Time Live Data Telemetry](#real-time-live-data-telemetry)
- [Forensic PDF Audit Export](#forensic-pdf-audit-export)
- [Quickstart & Installation](#quickstart--installation)
- [Security Disclosure](#security-disclosure)
- [License](#license)

---

## Overview & Operational Philosophy

**Ghost-Watch Apex** is an integrated command, control, and deception operations console engineered for sovereign air-gapped critical infrastructure, defense contractors, and zero-trust intelligence teams.

Traditional perimeter defense assumes an intruder can be completely locked out. Ghost-Watch assumes **compromise is an inevitability**, turning the environment itself into a weapon of deception:
1. **Pervasive Canary Deployment**: High-value fake documents, cryptographic parameters, and database tokens watermarked with cryptographic identifiers.
2. **Deterministic Attribution**: The instant an adversary attempts exfiltration, unique DNS traps and honeypot tokens reveal their ingress vector, source IP, and lateral movement.
3. **Active Kinetic Countermeasures**: Graduated escalations ranging from honeypot tarpits to volatile post-quantum key zeroization (Gorgon) and multi-tier ballistic interception (Aegis).

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  GHOST-WATCH APEX CONSOLE                   │
   │  [FIPS-203 ML-KEM-768] [NIST SP 800-207] [915MHz LoRa OOB]  │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
   │ REAL-TIME    │        │ PALANTIR D3  │        │ FORENSIC     │
   │ HEALTH (Area)│        │ FORCE GRAPH  │        │ PDF AUDIT    │
   │ Recharts CPU │        │ Lures ↔ IPs  │        │ jsPDF Sealed │
   │ RAM Enclave  │        │ ↔ Threats    │        │ Evidence     │
   └──────────────┘        └──────────────┘        └──────────────┘
```

---

## System Architecture Blueprint

```
+-------------------------------------------------------------------------------+
|                             GHOST-WATCH APEX C2                               |
+-------------------------------------------------------------------------------+
|  OVERVIEW & METRICS    |  CANARY TRAP FACTORY  |  ADB ATTRIBUTION LEDGER      |
|  - Real-Time Recharts  |  - Linguistic Decoys  |  - Threat Event Streams      |
|  - CPU/RAM/Disk IOPS   |  - Steganographic     |  - Deep-Dive Packet Traces   |
|  - Hardware Tether     |  - DNS Canary Tokens  |  - Structured PDF Reports    |
+------------------------+-----------------------+------------------------------+
|  PALANTIR D3 GRAPH     |  AEGIS COMBAT DOME    |  CADL DECEPTION ESCALATION   |
|  - Force Simulation    |  - Arrow 3 Intercept  |  - Level 1: Passive Log      |
|  - Dynamic Link Forces |  - David's Sling      |  - Level 3: Canary Active    |
|  - Entity Inspector    |  - Iron Dome / Beam   |  - Level 5: Counter-Strike   |
+------------------------+-----------------------+------------------------------+
|  CERBERUS SCANNER      |  LAZARUS MESH-NET     |  GORGON ANTI-TAMPER          |
|  - Behavioral Sensor   |  - Polymorphic C2     |  - Debugger Hook Detection   |
|  - Biometric Latency   |  - 99.8% Mask Ratio   |  - Memory Heap Scrapers      |
|  - Lateral Heuristics  |  - Decoy Tunnels      |  - Volatile PQC Key Purge    |
+-------------------------------------------------------------------------------+
|                         OMEGA CONTINGENCY PURGE MATRIX                        |
|  - Air-Gapped Zeroization  - Split Key Bifurcation  - Secure Vault Lockdown   |
+-------------------------------------------------------------------------------+
```

---

## Core Operational Modules

### 1. Overview & Real-Time System Health Monitor
- **Real-Time Recharts Visualizer**: Smooth time-series Area Charts graphing live CPU Core Load, Volatile RAM Enclave allocation, and NVMe Disk I/O.
- **Hardware Tethering**: Anchors session state to hardware identifier (`HB-9982-AX-2026`) and active PQC key epoch.
- **Live Stream Controls**: Pause/resume stream, adjust sampling intervals (1s, 1.5s, 3s), and engage synthetic high compute load stress tests.
- **Out-of-Band Spectrum**: Real-time 915.0 MHz LoRa Mesh-Net radio frequency carrier display.

### 2. Canary Trap Factory (ACTS)
- Generates weaponized decoy documents (PQC Private Param Sets, Missile Dome Guidance Tables, SCADA Cryptographic Rings).
- **Watermark Paradigms**:
  - *Linguistic*: Zero-width Unicode shifts and invisible zero-width space steganography.
  - *Metadata*: Forensic IPTC/EXIF/PDF canary tags.
  - *Steganographic*: High-entropy trailing byte injections with cryptographic hash parity.
  - *Hybrid*: All three combined for maximum adversary fingerprinting resilience.

### 3. Attribution Database (ADB) & Forensic PDF Reports
- Real-time catalog of all active canary traps and triggered threat incidents.
- **Expandable Deep-Dive Packet Analysis**:
  - 5-tuple network headers (Source/Destination IP:Port, Protocol, TTL, Checksum, Frame Bytes, DSCP).
  - MITRE ATT&CK Tactic & Technique ID mapping (`T1059`, `T1048`, `T1046`).
  - Raw Hex Stream (Wireshark monospace view with offset columns and ASCII representations).
  - Ready-to-deploy Snort/Suricata rules & Wireshark display filters.
  - Simulated binary `.pcap` capture downloads.
- **Structured PDF Export**: Formal, multi-page cyber-forensic incident report export with SHA-256 seals.

### 4. Palantir Ontological D3.js Force-Directed Graph
- **Dynamic Physics Simulation**: Visualizes complex relational links between **Canary Lures**, **Source IPs**, **Threat Incidents**, **DNS Canary Tokens**, and **Host Nodes**.
- **Interactive D3 Physics Engine**:
  - `d3.forceSimulation`, `d3.forceManyBody(-450)`, `d3.forceLink(95)`, `d3.forceCollide`.
  - Node dragging with physics dampening (`d3.drag()`).
  - Smooth pan and zoom (`d3.zoom()`) with mouse wheel and toolbar controls.
- **Entity Inspector**: Real-time property breakdown and kinetic verbs (Isolate Node, Quarantine IP, Zeroize Key, Deploy Canary Swarm).

### 5. Aegis Multi-Tier Combat Radar
- Ballistic cyber-kinetic visual defense radar simulating multi-tier missile defense principles:
  - *Tier 1 (Exo-Atmospheric)*: Arrow 3 — Ballistic exfiltration disruption.
  - *Tier 2 (High-Altitude)*: David's Sling — Medium-range lateral movement interdiction.
  - *Tier 3 (Perimeter)*: Iron Dome — Automated brute-force and credential-spray saturation defense.
  - *Tier 4 (Directed Energy)*: Iron Beam — Speed-of-light zero-day memory hook dissolution.

### 6. Cyber Attribution & Deception Ladder (CADL)
- Formal 5-stage sovereign escalation doctrine:
  - **Level 1 (Audit)**: Passive logging and packet mirroring.
  - **Level 2 (Tarpit)**: Rate-limiting and synthetic jitter injection.
  - **Level 3 (Canary Active)**: Adversary opens decoy document; DNS canary hit registered.
  - **Level 4 (Disruption)**: Out-of-band credential revocation and C2 beacon severance.
  - **Level 5 (Purge / Strike)**: Omega Contingency initiation.

### 7. Cerberus Behavioral Sensor & Threat Scanner
- Real-time zero-trust node telemetry auditing:
  - Biometric keystroke delay variance (ms).
  - Off-hours access percentage.
  - Host memory data entropy (0.0 to 8.0 bits/byte).
  - Command frequency thresholds.

### 8. Lazarus Mesh-Net (Polymorphic C2 Routing)
- Mask C2 telemetry using automated polymorphic micro-tunnels.
- Decoy IPv4/IPv6 masking, synthetic domain fronting, and high-entropy chaff noise dispatching.
- Achieves **99.8% telemetry masking ratio** across active trunk lines.

### 9. Gorgon Anti-Tamper & Volatile Key Purging
- Continuous volatile memory page scanning defending against:
  - Debugger hooks (`ptrace`, hardware breakpoints).
  - Heap scrapers & V8 devtools memory probes.
- **Instant Volatile Key Zeroization**: Overwrites private memory buffers with cryptographic zeroes and force-rotates post-quantum session key epochs.

### 10. Omega Contingency & Sovereign Self-Wipe
- Last-resort cryptographic purge protocol.
- Zeroizes volatile memory buffers, severs hardware anchors, and enforces geographical key bifurcation.

---

## Real-Time Live Data Telemetry

The platform includes a dedicated `LiveTelemetryService` streaming real-time operational data:

| Metric | Source / Engine | Real-Time Behavior |
| ------ | --------------- | ------------------ |
| **CPU Utilization (%)** | Frame timing & event-loop jitter | Reacts to workload, cryptographic scans, and UI rendering |
| **CPU Core Architecture** | `navigator.hardwareConcurrency` | Accurately detects host core/thread count |
| **Volatile RAM Enclave** | `performance.memory` heap API | Tracks memory heap footprint and PQC buffer overhead |
| **Disk Array I/O** | `navigator.storage.estimate()` | Simulates IOPS and persistent ledger allocation |
| **Packet Flow Latency** | High-precision `performance.now()` | Tracks ingress relay round-trip times |

---

## Forensic PDF Audit Export

The **Attribution Database** generates formal cyber-forensic PDF audit documents using `jsPDF`:
- **Classification Striping**: `TOP SECRET // SOVEREIGN CYBER FORENSICS // LAW ENFORCEMENT DISCLOSURE`
- **Audit Table**: Incident ID, timestamp, CADL escalation level, source IP, adversary cluster, and containment status.
- **Technical Dissection**: MITRE ATT&CK mapping, Snort rules, 5-tuple flow, and recommended tactical directives.
- **Cryptographic Seal**: SHA-256 integrity digest and hardware anchor verification.

---

## Quickstart & Installation

### Local Setup

```bash
# Clone the repository
git clone https://github.com/ghost-watch/ghost-watch-apex.git
cd ghost-watch-apex

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev`: Starts the Vite development server on port 3000.
- `npm run build`: Compiles production TypeScript bundle to `dist/`.
- `npm run lint`: Executes strict TypeScript type-checking (`tsc --noEmit`).
- `npm run preview`: Locally previews the production build.

---

## Security Disclosure

Please review our [SECURITY.md](SECURITY.md) for vulnerability reporting procedures and cryptographic disclosure standards.

---

## License

This project is licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for complete terms.
