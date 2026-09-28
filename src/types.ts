export interface Lure {
  id: string; // e.g. GW-LURE_20260621_9a2f
  targetNode: string; // e.g. LAE_Node_09
  dnsToken: string; // e.g. audit-vault-77.ghost.watch.local
  documentType: string; // e.g. PQC Master Cryptographic Key
  watermarkType: 'Linguistic' | 'Metadata' | 'Steganographic' | 'Hybrid';
  details: {
    originalText?: string;
    watermarkedText?: string;
    shiftsApplied?: string[];
    metadataTags?: Record<string, string>;
    stegoOffsetHex?: string;
    stegoPayloadSize?: string;
  };
  createdTimestamp: string;
  isTriggered: boolean;
  alertSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  triggerCount: number;
}

export interface PacketTraceHop {
  hopIndex: number;
  node: string;
  ip: string;
  location: string;
  latencyMs: number;
  protocolLayer: string;
  status: 'VERIFIED' | 'INTERCEPTED' | 'ROUTED' | 'SINKHOLE';
}

export interface PacketTraceHeader {
  protocol: 'DNS' | 'TCP' | 'UDP' | 'TLS 1.3' | 'HTTP/2' | 'QUIC' | 'ICMP';
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  seqAck?: string;
  flags: string[];
  windowSize?: number;
  ttl: number;
  frameLengthBytes: number;
  checksum: string;
  dscpClass?: string;
}

export interface PacketTracePayload {
  hexDump: string[];
  rawHex: string;
  asciiRepresentation: string;
  dissectedFields: Record<string, string>;
  iocSignatures: string[];
  mitreAttackTactic: string;
  mitreTechniqueId: string;
  heuristicThreatScore: number;
  payloadEntropy: number; // 0.0 - 8.0 bits/byte
}

export interface PacketAnalysisTrace {
  captureId: string;
  interfaceName: string;
  timestamp: string;
  capturedFramesCount: number;
  header: PacketTraceHeader;
  payload: PacketTracePayload;
  hopSequence: PacketTraceHop[];
  snortRuleSignature: string;
  wiresharkFilter: string;
  containmentRecommendation: string;
}

export interface ThreatEvent {
  id: string;
  timestamp: string; // ISO 8601
  sourceIp: string;
  sourceNode: string;
  targetLureId?: string;
  actionTaken: string;
  level: 1 | 2 | 3 | 4 | 5; // CADL Level
  details: string;
  resolved: boolean;
  packetTrace?: PacketAnalysisTrace;
}

export interface BehavioralNode {
  name: string; // e.g. vortex
  status: 'SAFE' | 'WARN' | 'COMPROMISED';
  ipAddress: string;
  threatLevel: number; // 0-100
  metrics: {
    biometricDelayMs: number;
    accessOffHoursPct: number;
    dataEntropy: number; // 0.0 - 8.0
    commandFrequency: number; // cmds/min
  };
  assignedLuresCount: number;
  lastScanned: string;
}

export interface AirInterceptObject {
  id: string;
  name: string; // e.g. Lateral_Pivot_09, Ballistic_Credential_Spray
  type: 'Exfiltration' | ' lateral_movement' | 'recon' | 'brute_force';
  altitude: number; // 100 to 0 (where 0 is final breach)
  speed: number;
  defenseTier: 'Arrow 3' | 'David\'s Sling' | 'Iron Dome' | 'Iron Beam' | 'None';
  interceptStatus: 'descending' | 'intercepted' | 'destroyed' | 'breached';
  xPos: number; // for rendering
}

// --- LAZARUS MESH (Polymorphic Routing & C2 Telemetry Masking) ---
export type MaskingMode = 'POLYMORPHIC_BURST' | 'ADAPTIVE_FLUX' | 'CHAOS_JITTER';

export interface MicroTunnelEndpoint {
  id: string;
  endpointUrl: string;
  fakeIpv4: string;
  fakeIpv6: string;
  syntheticDomain: string;
  protocol: 'gRPC-over-QUIC' | 'TLS-1.3-ECH' | 'WebSocket-Obfs' | 'DNS-Over-HTTPS' | 'LoRa-LPWAN-Flux';
  tunnelHopChain: string[];
  entropyScore: number; // 0.0 - 10.0
  chaffNoiseBytes: number;
  bandwidthKbps: number;
  ttlMs: number;
  timeRemainingMs: number;
  status: 'ACTIVE' | 'HOPPING' | 'MASKED' | 'ROTATING';
  createdAt: string;
}

export interface LazarusStats {
  activeTunnelCount: number;
  totalHopsGenerated: number;
  telemetryMaskingRatio: number; // percentage (e.g. 99.8%)
  averageHopDurationMs: number;
  entropyMean: number;
  mode: MaskingMode;
  isRunning: boolean;
  totalChaffDispatchedKb: number;
}

// --- GORGON ANTI-TAMPER (Memory Scanning, Debugger & Scraper Detection, Volatile Key Purging) ---
export type TamperThreatType = 
  | 'DEBUGGER_HOOK' 
  | 'HEAP_SCRAPER' 
  | 'PTRACE_ATTACH' 
  | 'MEMORY_CORRUPTION' 
  | 'HARDWARE_BREAKPOINT' 
  | 'V8_DEVTOOLS_PROBE';

export type GorgonIntegrityState = 
  | 'PRISTINE' 
  | 'SCANNING' 
  | 'ELEVATED_WATCH' 
  | 'THREAT_DETECTED' 
  | 'PURGING_KEYS' 
  | 'KEY_ROTATION' 
  | 'RECOVERED_SECURE';

export interface PqcSessionKey {
  keyId: string;
  algorithm: 'ML-KEM-768' | 'ML-KEM-1024' | 'ML-DSA-65' | 'FIPS-203-Hybrid';
  epoch: number;
  fingerprintSha256: string;
  latticeSeedEntropy: string;
  volatileBufferAddress: string;
  generatedAt: string;
  status: 'ACTIVE' | 'ZEROIZED' | 'ROTATED';
}

export interface TamperDetectionEvent {
  id: string;
  timestamp: string;
  threatType: TamperThreatType;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  memoryAddress: string;
  signature: string;
  processVector: string;
  actionTaken: string;
  pqcKeysPurged: boolean;
  newEpochAssigned: number;
}

export interface GorgonAntiTamperState {
  integrityStatus: GorgonIntegrityState;
  activePqcKey: PqcSessionKey;
  keyEpoch: number;
  scansPerformed: number;
  threatsIntercepted: number;
  autoScanEnabled: boolean;
  memoryIntegrityScore: number; // 0 - 100%
  memoryRegions: Array<{
    address: string;
    label: string;
    status: 'SECURE' | 'ANOMALOUS' | 'PURGED' | 'RE-SEEDED';
    entropy: number;
    hexDumpSample: string;
  }>;
  recentEvents: TamperDetectionEvent[];
}

