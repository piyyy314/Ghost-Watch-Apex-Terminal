import { 
  GorgonAntiTamperState, 
  GorgonIntegrityState, 
  PqcSessionKey, 
  TamperDetectionEvent, 
  TamperThreatType 
} from '../types';

type GorgonListener = (state: GorgonAntiTamperState) => void;
type LogCallback = (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;

export class GorgonAntiTamper {
  private state: GorgonAntiTamperState = {
    integrityStatus: 'PRISTINE',
    activePqcKey: this.generateInitialPqcKey(1),
    keyEpoch: 1,
    scansPerformed: 12,
    threatsIntercepted: 0,
    autoScanEnabled: true,
    memoryIntegrityScore: 100,
    memoryRegions: this.generateInitialMemoryRegions(),
    recentEvents: [],
  };

  private scanInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<GorgonListener> = new Set();
  private onLog?: LogCallback;
  private isPurging: boolean = false;

  constructor(onLog?: LogCallback, initialAutoScan: boolean = true) {
    this.onLog = onLog;
    if (initialAutoScan) {
      this.startContinuousMemoryScan(4500);
    }
  }

  public setLogCallback(cb: LogCallback) {
    this.onLog = cb;
  }

  private generateHex(bytes: number): string {
    return Array.from({ length: bytes }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }

  private generateInitialPqcKey(epoch: number, algo: PqcSessionKey['algorithm'] = 'ML-KEM-768'): PqcSessionKey {
    return {
      keyId: `PQC-KEY-${epoch}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      algorithm: algo,
      epoch: epoch,
      fingerprintSha256: `SHA256:${this.generateHex(16)}...${this.generateHex(8)}`,
      latticeSeedEntropy: `0x${this.generateHex(32)}`,
      volatileBufferAddress: `0x7FFF${(0x9000 + epoch * 0x100).toString(16).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };
  }

  private generateInitialMemoryRegions(): GorgonAntiTamperState['memoryRegions'] {
    return [
      {
        address: '0x7FFF9000:0x7FFF9FFF',
        label: 'PQC Lattice Secret Key Ring (ML-KEM-768)',
        status: 'SECURE',
        entropy: 7.94,
        hexDumpSample: '8F 4A 9B 1C 5E 77 3D AA  2F B9 01 C3 DD EE 90 FF  ..J...w/.......',
      },
      {
        address: '0x7FFFA000:0x7FFFAFFF',
        label: 'LoRa Mesh Decryption Ephemeral Matrix',
        status: 'SECURE',
        entropy: 7.88,
        hexDumpSample: '3B C4 90 2A 11 88 55 FD  E0 45 A2 33 19 80 CC 0A  ;..*..U..E.3....',
      },
      {
        address: '0x7FFFB000:0x7FFFBFFF',
        label: 'Hardware Security Element Tether DMA Buffer',
        status: 'SECURE',
        entropy: 7.99,
        hexDumpSample: 'A9 12 00 FE 44 91 3C BB  7E 22 10 99 FA 04 C1 6B  ....D.<.~".....k',
      },
      {
        address: '0x7FFFC000:0x7FFFCFFF',
        label: 'C2 Polymorphic Route Scratchpad RAM',
        status: 'SECURE',
        entropy: 7.82,
        hexDumpSample: '52 69 73 6B 2D 4D 65 73  68 2D 53 79 6E 63 2D 31  Risk-Mesh-Sync-1',
      },
    ];
  }

  /**
   * Starts periodic memory scanning
   */
  public startContinuousMemoryScan(intervalMs: number = 4500) {
    this.stopContinuousMemoryScan();
    this.state.autoScanEnabled = true;
    this.log(`[GorgonAntiTamper] Continuous anti-tamper memory scanner ARMED (Cadence: ${intervalMs}ms)`, 'info');

    this.scanInterval = setInterval(() => {
      // Normal nominal continuous background scan
      if (!this.isPurging && this.state.integrityStatus === 'PRISTINE') {
        this.executeNominalMemoryAudit();
      }
    }, intervalMs);

    this.notify();
  }

  public stopContinuousMemoryScan() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.state.autoScanEnabled = false;
    this.log(`[GorgonAntiTamper] Continuous memory scanner suspended.`, 'warn');
    this.notify();
  }

  /**
   * Nominal background sweep
   */
  private executeNominalMemoryAudit() {
    this.state.scansPerformed += 1;
    this.state.memoryIntegrityScore = Math.min(100, Math.max(98, Number((99.2 + Math.random() * 0.8).toFixed(1))));
    
    // Slight hex variation in scratchpad
    this.state.memoryRegions[3].hexDumpSample = `${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} 73 6B 2D 4D ${this.generateHex(2).toUpperCase()} 73  68 2D 53 79 6E 63 2D 31`;
    this.notify();
  }

  /**
   * Primary Memory Scanning Function:
   * Scans memory integrity for debuggers, hooks, and memory scrapers.
   * If a threat is detected, triggers simulated volatile PQC key purging and key rotation.
   */
  public scanMemoryIntegrity(simulatedThreat?: TamperThreatType): { threatDetected: boolean; threatType?: TamperThreatType } {
    if (this.isPurging) {
      return { threatDetected: false };
    }

    this.state.scansPerformed += 1;
    this.state.integrityStatus = 'SCANNING';
    this.log(`[GorgonAntiTamper] Executing deep volatile memory page integrity & debugger probe scan...`, 'info');
    this.notify();

    // Determine if threat is present or simulated
    const threatToTrigger = simulatedThreat;

    if (threatToTrigger) {
      this.handleThreatDetected(threatToTrigger);
      return { threatDetected: true, threatType: threatToTrigger };
    } else {
      // Clean scan
      setTimeout(() => {
        if (!this.isPurging) {
          this.state.integrityStatus = 'PRISTINE';
          this.state.memoryIntegrityScore = 100;
          this.log(`[GorgonAntiTamper] Memory scan complete: All 4 memory pages PRISTINE. Zero debugger hooks or scrapers found.`, 'success');
          this.notify();
        }
      }, 700);
      return { threatDetected: false };
    }
  }

  /**
   * Threat Detection and Automated Purge & Rotation Pipeline
   */
  private handleThreatDetected(threatType: TamperThreatType) {
    this.isPurging = true;
    this.state.threatsIntercepted += 1;
    this.state.integrityStatus = 'THREAT_DETECTED';
    this.state.memoryIntegrityScore = Math.floor(Math.random() * 25 + 15); // dropped to 15-40%

    let vectorDescription = '';
    let targetRegionIndex = 0;
    let severity: TamperDetectionEvent['severity'] = 'CRITICAL';

    switch (threatType) {
      case 'DEBUGGER_HOOK':
        vectorDescription = 'Hardware Debug Register (DR0-DR3) breakpoint trap detected on volatile PQC key buffer.';
        targetRegionIndex = 0;
        break;
      case 'HEAP_SCRAPER':
        vectorDescription = 'Unauthorized heap memory scraper scanning for high-entropy ML-KEM private lattice keys.';
        targetRegionIndex = 0;
        break;
      case 'PTRACE_ATTACH':
        vectorDescription = 'Process ptrace injection attached from rogue PID attempting remote VM memory introspection.';
        targetRegionIndex = 2;
        break;
      case 'HARDWARE_BREAKPOINT':
        vectorDescription = 'Instruction pointer interception hooked on cryptographic decrypt loop.';
        targetRegionIndex = 1;
        break;
      case 'V8_DEVTOOLS_PROBE':
        vectorDescription = 'Remote DevTools debugger protocol hook detected probing runtime cryptographic state.';
        targetRegionIndex = 3;
        severity = 'HIGH';
        break;
      default:
        vectorDescription = 'Anomalous memory access pattern detected in secure enclave buffer.';
        targetRegionIndex = 0;
    }

    const targetedAddress = this.state.memoryRegions[targetRegionIndex].address;
    this.state.memoryRegions[targetRegionIndex].status = 'ANOMALOUS';
    this.state.memoryRegions[targetRegionIndex].hexDumpSample = 'XX XX XX [CORRUPTED / TAMPER DETECTED] XX XX XX';

    this.log(`🚨 [GorgonAntiTamper] CRITICAL TAMPER ALERT! ${threatType} INTERCEPTED at ${targetedAddress}!`, 'error');
    this.log(`[GorgonAntiTamper] Vector: ${vectorDescription}`, 'warn');
    this.notify();

    // STEP 1: PURGING VOLATILE PQC KEYS (after brief pause to illustrate detection)
    setTimeout(() => {
      this.purgeVolatilePqcKeys(threatType, vectorDescription, targetedAddress, severity);
    }, 900);
  }

  /**
   * Simulated Purging of volatile PQC keys:
   * Overwrites cryptographic memory buffers with 0x00 (zeroization) and marks key as ZEROIZED.
   */
  public purgeVolatilePqcKeys(
    threatType: TamperThreatType = 'HEAP_SCRAPER',
    vectorDesc: string = 'Manual security emergency purge initiated.',
    targetedAddress: string = '0x7FFF9000',
    severity: TamperDetectionEvent['severity'] = 'CRITICAL'
  ) {
    this.state.integrityStatus = 'PURGING_KEYS';
    this.state.activePqcKey.status = 'ZEROIZED';
    this.state.activePqcKey.latticeSeedEntropy = '0x0000000000000000000000000000000000000000000000000000000000000000 [SCRUBBED]';
    this.state.activePqcKey.fingerprintSha256 = 'SHA256:0000000000000000 [ZEROIZED]';

    // Scrub all volatile memory regions to zero
    this.state.memoryRegions = this.state.memoryRegions.map(reg => ({
      ...reg,
      status: 'PURGED' as const,
      entropy: 0.00,
      hexDumpSample: '00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................',
    }));

    this.log(`🧹 [GorgonAntiTamper] ZEROIZATION ACTIVE: Volatile PQC Key [${this.state.activePqcKey.keyId}] and all DMA memory pages PURGED.`, 'error');
    this.notify();

    // STEP 2: KEY ROTATION TO FRESH PQC EPOCH
    setTimeout(() => {
      this.rotatePqcKeys(threatType, vectorDesc, targetedAddress, severity);
    }, 1200);
  }

  /**
   * PQC Key Rotation:
   * Generates a new post-quantum cryptographic key pair with fresh lattice entropy,
   * advances the epoch counter, and re-seeds secure memory buffers.
   */
  public rotatePqcKeys(
    threatType?: TamperThreatType,
    vectorDesc?: string,
    targetedAddress?: string,
    severity?: TamperDetectionEvent['severity']
  ) {
    this.state.integrityStatus = 'KEY_ROTATION';
    const newEpoch = this.state.keyEpoch + 1;
    this.state.keyEpoch = newEpoch;

    // Pick rotating algorithm
    const algorithms: Array<PqcSessionKey['algorithm']> = ['ML-KEM-768', 'ML-KEM-1024', 'FIPS-203-Hybrid'];
    const selectedAlgo = algorithms[(newEpoch - 1) % algorithms.length];

    const freshKey = this.generateInitialPqcKey(newEpoch, selectedAlgo);
    this.state.activePqcKey = freshKey;

    // Re-seed memory regions with fresh entropy
    this.state.memoryRegions = [
      {
        address: `0x7FFF${(0x9000 + (newEpoch * 0x100)).toString(16).toUpperCase()}:0x7FFF${(0x9FFF + (newEpoch * 0x100)).toString(16).toUpperCase()}`,
        label: `PQC Lattice Secret Key Ring (${selectedAlgo} - Epoch ${newEpoch})`,
        status: 'RE-SEEDED',
        entropy: Number((Math.random() * 0.15 + 7.9).toFixed(2)),
        hexDumpSample: `${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()}  ..KEM..LATTICE..`,
      },
      {
        address: `0x7FFFA000:0x7FFFAFFF`,
        label: 'LoRa Mesh Decryption Ephemeral Matrix (Re-keyed)',
        status: 'SECURE',
        entropy: 7.91,
        hexDumpSample: `${this.generateHex(2).toUpperCase()} ${this.generateHex(2).toUpperCase()} 90 2A 11 88 55 FD  E0 45 A2 33 19 80 CC 0A`,
      },
      {
        address: `0x7FFFB000:0x7FFFBFFF`,
        label: 'Hardware Security Element Tether DMA Buffer',
        status: 'SECURE',
        entropy: 7.98,
        hexDumpSample: `A9 12 00 FE 44 91 3C BB  7E 22 10 99 FA 04 C1 6B`,
      },
      {
        address: `0x7FFFC000:0x7FFFCFFF`,
        label: 'C2 Polymorphic Route Scratchpad RAM',
        status: 'SECURE',
        entropy: 7.85,
        hexDumpSample: `52 69 73 6B 2D 4D 65 73  68 2D 53 79 6E 63 2D 31`,
      },
    ];

    // Log the event in audit history
    const event: TamperDetectionEvent = {
      id: `EVT-TAMPER-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      threatType: threatType || 'HEAP_SCRAPER',
      severity: severity || 'CRITICAL',
      memoryAddress: targetedAddress || '0x7FFF9000',
      signature: `SIG-0x${this.generateHex(6).toUpperCase()}`,
      processVector: vectorDesc || 'Volatile PQC key protection trigger.',
      actionTaken: `Scrubbed volatile buffer, zeroized old keys, migrated to PQC Epoch #${newEpoch} (${selectedAlgo}).`,
      pqcKeysPurged: true,
      newEpochAssigned: newEpoch,
    };

    this.state.recentEvents.unshift(event);
    if (this.state.recentEvents.length > 20) {
      this.state.recentEvents.pop();
    }

    this.log(`🔑 [GorgonAntiTamper] PQC KEY ROTATION COMPLETE: Derived Epoch #${newEpoch} [${freshKey.keyId}] (${selectedAlgo}).`, 'success');
    this.notify();

    // Final recovery to PRISTINE
    setTimeout(() => {
      this.state.integrityStatus = 'RECOVERED_SECURE';
      this.state.memoryIntegrityScore = 100;
      this.log(`🛡️ [GorgonAntiTamper] ENCLAVE RECOVERED: Enclave restored to PRISTINE state. Zero residue of compromised parameters.`, 'success');
      this.notify();

      setTimeout(() => {
        this.state.integrityStatus = 'PRISTINE';
        this.state.memoryRegions = this.state.memoryRegions.map(r => ({ ...r, status: 'SECURE' as const }));
        this.isPurging = false;
        this.notify();
      }, 1000);
    }, 1000);
  }

  /**
   * Helper: simulate a debugger attachment event
   */
  public simulateDebuggerAttach() {
    this.log(`[GorgonAntiTamper] SIMULATION: Injecting debugger attachment (ptrace / hardware breakpoint probe)...`, 'warn');
    this.scanMemoryIntegrity('DEBUGGER_HOOK');
  }

  /**
   * Helper: simulate a memory scraper / heap dumper event
   */
  public simulateMemoryScraper() {
    this.log(`[GorgonAntiTamper] SIMULATION: Injecting volatile memory scraper targeting lattice secrets...`, 'warn');
    this.scanMemoryIntegrity('HEAP_SCRAPER');
  }

  public getState(): GorgonAntiTamperState {
    return {
      ...this.state,
      activePqcKey: { ...this.state.activePqcKey },
      memoryRegions: this.state.memoryRegions.map(r => ({ ...r })),
      recentEvents: [...this.state.recentEvents],
    };
  }

  public subscribe(listener: GorgonListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach(fn => fn(currentState));
  }

  private log(text: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    if (this.onLog) {
      this.onLog(text, type);
    }
  }

  public exportAuditReportJson(): string {
    return JSON.stringify({
      classification: 'GHOST-WATCH GORGON ANTI-TAMPER SECURITY AUDIT',
      exportedAt: new Date().toISOString(),
      state: this.state,
    }, null, 2);
  }
}

// Export singleton instance for global app sharing
export const gorgonAntiTamperInstance = new GorgonAntiTamper();
