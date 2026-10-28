# Security Policy & Vulnerability Disclosure

## Supported Versions

Ghost-Watch Apex maintains active security patches for the following versions:

| Version | Supported          | Cryptographic Protocol |
| ------- | ------------------ | ---------------------- |
| 3.8.x   | :white_check_mark: | FIPS-203 ML-KEM-768    |
| 3.7.x   | :white_check_mark: | FIPS-203 ML-KEM-768    |
| < 3.7   | :x:                | Deprecated             |

---

## Reporting a Vulnerability

We prioritize responsible and coordinated vulnerability disclosure. If you identify a potential security vulnerability within Ghost-Watch Apex:

1. **Do NOT** file a public GitHub issue.
2. Send an encrypted disclosure email to:
   - **Email**: `security@ghostwatch.local` or `apex-ops@ghostwatch.local`
3. Include the following details in your report:
   - Type of vulnerability (e.g. Canary token leak, Memory scraper evasion, PQC key exposure)
   - Step-by-step reproduction guide or proof-of-concept
   - Impact assessment on sovereign infrastructure
   - Proposed remediations or patch diffs

---

## Cryptographic & Sovereign Defense Standards

- **Post-Quantum Cryptography**: All master cryptographic exchanges are anchored to **NIST FIPS-203 (ML-KEM-768)** and **NIST FIPS-204 (ML-DSA-65)**.
- **Zero-Trust Network Architecture**: Complies with **NIST SP 800-207**.
- **Volatile Key Purging**: The Gorgon Anti-Tamper engine actively monitors for debugger attachments and unauthorized memory access (e.g. `ptrace`, V8 heap scraping), executing immediate volatile zeroization upon breach detection.
- **Omega Contingency Protocol**: In catastrophic containment failures (CADL Level 5), the system triggers an air-gapped cryptographic scrub and geographical key bifurcation.
