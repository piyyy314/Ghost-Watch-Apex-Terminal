# Changelog

All notable changes to the **Ghost-Watch Apex Sovereign Defense** platform are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.8.0] - 2026-10-28

### Added
- **D3.js Force-Directed Graph (Palantir Ontology)**:
  - Dynamic simulation of cyber-physical entities: Canary Lures, DNS Tokens, Source IPs, Threat Incidents, and Sovereign Host Nodes.
  - Interactive physics drag behavior with velocity dampening and collision boundaries.
  - Interactive mouse wheel zoom, pan, and automated viewport centering.
  - Real-time Entity Inspector displaying ontological properties, connected edges, and kinetic verbs.
  - Filtering by node type (`ALL`, `LURES`, `THREATS`, `SOURCE IPs`, `HOSTS`) and instant search query.
- **Structured Cyber-Forensic PDF Incident Report (Attribution Database)**:
  - Formatted multi-page PDF generation via `jsPDF`.
  - Executive threat summary table with CADL level, timestamp, source IP/cluster, and containment status.
  - Technical dissection cards with MITRE ATT&CK mappings, 5-tuple packet flows, Snort/Suricata rules, and containment directives.
  - Digital custody watermark, SHA-256 seal, and hardware anchor tether.
- **Real-Time System Health Monitor (Overview Module)**:
  - Interactive Recharts area graphs displaying live CPU load, volatile RAM enclave consumption, and NVMe disk I/O.
  - Multi-metric composite and single-metric breakout views with custom cyber tooltips.
  - Live stream pause/resume controls, selectable sampling rates (1s, 1.5s, 3s), and high-load test simulation.
  - Direct integration with browser performance APIs (`navigator.hardwareConcurrency`, memory heap allocation).
- **Professional GitHub Repository Infrastructure**:
  - Full GitHub Actions CI workflow (`.github/workflows/ci.yml`).
  - Apache 2.0 License, Security Policy (`SECURITY.md`), Contribution Guidelines (`CONTRIBUTING.md`), and Contributor Covenant (`CODE_OF_CONDUCT.md`).
  - Live data status badges complying with real technical specifications.

### Changed
- Enhanced `AttributionDatabase` header to support dual exports: structured forensic PDF reports and raw JSON ledger.
- Synchronized `PalantirOntology` with active live `ThreatEvent` telemetry.

---

## [3.7.0] - 2026-06-21

### Added
- Expandable Threat Incident Ledger with deep-dive simulated packet analysis traces.
- Wireshark display filter generation and Snort rule export.
- PCAP binary trace simulation download.
- LazarusMesh polymorphic C2 routing and decoy micro-tunnels.
- GorgonAntiTamper memory scanner with volatile ML-KEM-768 key zeroization.
