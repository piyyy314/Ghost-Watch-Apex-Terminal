# Contributing to Ghost-Watch Apex

Thank you for your interest in contributing to the **Ghost-Watch Apex Sovereign Defense** platform.

Ghost-Watch is a military-grade, zero-trust cybersecurity operations framework implementing Advanced Canary Traps (ACTS), Attribution Databases (ADB), Post-Quantum Cryptography (ML-KEM-768/FIPS-203), Polymorphic Routing (Lazarus Mesh), Volatile Memory Integrity (Gorgon Anti-Tamper), and multi-tier active kinetic countermeasures (Aegis Combat Dome).

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to `security@ghostwatch.local`.

---

## Development Workflow

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` v10+

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/ghost-watch/ghost-watch-apex.git
cd ghost-watch-apex

# 2. Install dependencies
npm install

# 3. Launch local dev environment on port 3000
npm run dev

# 4. Verify TypeScript compilation and lint rules
npm run lint

# 5. Build production bundle
npm run build
```

---

## Branching & Commit Conventions

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- `feat:` Adds a new capability or architectural component (e.g., `feat(d3): integrate force-directed graph in PalantirOntology`)
- `fix:` Resolves a bug, defect, or vulnerability (e.g., `fix(pdf): handle multiline text wrapping in forensic report`)
- `sec:` Security hardening, cryptographic updates, or PQC compliance
- `perf:` Performance optimization or telemetry sampling enhancements
- `docs:` Documentation, README, or architectural diagrams
- `refactor:` Code restructuring without functional changes

---

## Pull Request Checklist

Before submitting a Pull Request, ensure:

1. [ ] `npm run lint` passes without any TypeScript errors or warnings.
2. [ ] `npm run build` succeeds cleanly.
3. [ ] All new components adhere to the cyber-defense dark design system and Tailwind CSS standards.
4. [ ] No cryptographic secrets or unencrypted keys are checked into source control.
5. [ ] Any new forensic telemetry exports conform to standard JSON or PDF specifications.
