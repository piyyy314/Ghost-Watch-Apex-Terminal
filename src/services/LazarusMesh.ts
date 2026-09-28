import { MicroTunnelEndpoint, LazarusStats, MaskingMode } from '../types';

type LazarusListener = (tunnels: MicroTunnelEndpoint[], stats: LazarusStats) => void;
type LogCallback = (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;

const SYNTHETIC_DOMAIN_PREFIXES = [
  'cdn-edge-obfs', 'telemetry-flux', 'quic-relay', 'sync-mesh-node',
  'lora-gateway', 'dns-transit', 'lattice-router', 'stealth-pipe',
  'fastly-edge-proxy', 'akamai-shim-cluster', 'cloudflare-warp-decoy'
];

const SYNTHETIC_DOMAIN_TLDS = [
  'internal.net', 'cloud-mesh.io', 'telemetry-obfs.org', 'secure-proxy.zone',
  'lora-grid.infra', 'flux-routing.dev', 'defense-mesh.int'
];

const PROTOCOLS: Array<MicroTunnelEndpoint['protocol']> = [
  'gRPC-over-QUIC', 'TLS-1.3-ECH', 'WebSocket-Obfs', 'DNS-Over-HTTPS', 'LoRa-LPWAN-Flux'
];

export class LazarusMesh {
  private activeTunnels: MicroTunnelEndpoint[] = [];
  private stats: LazarusStats = {
    activeTunnelCount: 0,
    totalHopsGenerated: 0,
    telemetryMaskingRatio: 99.85,
    averageHopDurationMs: 2200,
    entropyMean: 8.74,
    mode: 'POLYMORPHIC_BURST',
    isRunning: false,
    totalChaffDispatchedKb: 1420.5,
  };

  private hopTimer: ReturnType<typeof setInterval> | null = null;
  private decayTimer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<LazarusListener> = new Set();
  private onLog?: LogCallback;
  private maxTunnels: number = 8;
  private hopIntervalMs: number = 1800;

  constructor(onLog?: LogCallback, initialAutoStart: boolean = true) {
    this.onLog = onLog;
    this.initializeBaselineTunnels();
    if (initialAutoStart) {
      this.startMeshRouting();
    }
  }

  public setLogCallback(cb: LogCallback) {
    this.onLog = cb;
  }

  /**
   * Generates a realistic randomized Fake IPv4 address
   */
  public generateFakeIpv4(): string {
    const blocks = [
      Math.floor(Math.random() * 220 + 10),
      Math.floor(Math.random() * 254 + 1),
      Math.floor(Math.random() * 254 + 1),
      Math.floor(Math.random() * 254 + 1)
    ];
    return blocks.join('.');
  }

  /**
   * Generates a realistic randomized Fake IPv6 address mask
   */
  public generateFakeIpv6(): string {
    const hexParts = Array.from({ length: 8 }, () => 
      Math.floor(Math.random() * 65536).toString(16).padStart(4, '0')
    );
    return `2001:db8:${hexParts.slice(2).join(':')}`;
  }

  /**
   * Generates a synthetic decoy hostname & micro-tunnel endpoint URL
   */
  public generateSyntheticEndpoint(): { domain: string; url: string } {
    const prefix = SYNTHETIC_DOMAIN_PREFIXES[Math.floor(Math.random() * SYNTHETIC_DOMAIN_PREFIXES.length)];
    const tld = SYNTHETIC_DOMAIN_TLDS[Math.floor(Math.random() * SYNTHETIC_DOMAIN_TLDS.length)];
    const hexTag = Math.floor(Math.random() * 0xFFFFF).toString(16).padStart(5, '0');
    const port = [443, 8443, 9443, 2083, 2096][Math.floor(Math.random() * 5)];
    const domain = `${prefix}-${hexTag}.${tld}`;
    const url = `https://${domain}:${port}/v1/flux-telemetry/stream`;
    return { domain, url };
  }

  /**
   * Generates a randomized polymorphic hop chain
   */
  public generateHopChain(): string[] {
    const hopCount = Math.floor(Math.random() * 3 + 3); // 3 to 5 hops
    const hops: string[] = [];
    for (let i = 0; i < hopCount; i++) {
      hops.push(`Node-${Math.floor(Math.random() * 90 + 10)} [${this.generateFakeIpv4()}]`);
    }
    return hops;
  }

  /**
   * Constructs a single Polymorphic Micro-Tunnel Endpoint
   */
  public createPolymorphicTunnel(isBurst: boolean = false): MicroTunnelEndpoint {
    const { domain, url } = this.generateSyntheticEndpoint();
    const ttl = isBurst ? Math.floor(Math.random() * 3000 + 2000) : Math.floor(Math.random() * 8000 + 4000);
    const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
    const entropy = Number((Math.random() * 1.8 + 8.1).toFixed(2));
    const chaff = Math.floor(Math.random() * 4096 + 1024);

    return {
      id: `TUN-${Math.floor(Math.random() * 90000 + 10000)}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      endpointUrl: url,
      fakeIpv4: this.generateFakeIpv4(),
      fakeIpv6: this.generateFakeIpv6(),
      syntheticDomain: domain,
      protocol,
      tunnelHopChain: this.generateHopChain(),
      entropyScore: entropy,
      chaffNoiseBytes: chaff,
      bandwidthKbps: Math.floor(Math.random() * 450 + 150),
      ttlMs: ttl,
      timeRemainingMs: ttl,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Initialize baseline tunnels
   */
  private initializeBaselineTunnels() {
    this.activeTunnels = [];
    for (let i = 0; i < 4; i++) {
      this.activeTunnels.push(this.createPolymorphicTunnel());
    }
    this.updateStats();
  }

  /**
   * Starts the polymorphic routing continuous cycle
   */
  public startMeshRouting(intervalMs?: number) {
    if (intervalMs) this.hopIntervalMs = intervalMs;
    this.stopMeshRouting();

    this.stats.isRunning = true;
    this.log(`[LazarusMesh] Polymorphic C2 routing engine ENGAGED at ${this.hopIntervalMs}ms hop frequency.`, 'success');

    // Hop generator interval
    this.hopTimer = setInterval(() => {
      this.executePolymorphicHop();
    }, this.hopIntervalMs);

    // Decay countdown interval (every 250ms for smooth UI timers)
    this.decayTimer = setInterval(() => {
      this.tickDecay(250);
    }, 250);

    this.notify();
  }

  /**
   * Stops the polymorphic routing
   */
  public stopMeshRouting() {
    if (this.hopTimer) {
      clearInterval(this.hopTimer);
      this.hopTimer = null;
    }
    if (this.decayTimer) {
      clearInterval(this.decayTimer);
      this.decayTimer = null;
    }
    this.stats.isRunning = false;
    this.log(`[LazarusMesh] Polymorphic C2 routing engine PAUSED.`, 'warn');
    this.notify();
  }

  /**
   * Executes a single polymorphic hop cycle:
   * Rotates oldest tunnels, generates new endpoints with randomized fake IPs,
   * adds chaff noise packets to obscure telemetry signatures.
   */
  public executePolymorphicHop() {
    // Pick 1-2 tunnels to mark as rotating/hopping
    if (this.activeTunnels.length > 0) {
      const idxToRotate = Math.floor(Math.random() * this.activeTunnels.length);
      this.activeTunnels[idxToRotate].status = 'ROTATING';
    }

    // Filter expired and replace
    setTimeout(() => {
      const freshTunnel = this.createPolymorphicTunnel();
      
      // Keep within maxTunnels capacity
      if (this.activeTunnels.length >= this.maxTunnels) {
        this.activeTunnels.shift();
      }
      this.activeTunnels.push(freshTunnel);

      this.stats.totalHopsGenerated += 1;
      this.stats.totalChaffDispatchedKb += Number((freshTunnel.chaffNoiseBytes / 1024).toFixed(1));
      
      this.updateStats();
      this.notify();
    }, 200);
  }

  /**
   * Injects a rapid burst of synthetic decoy tunnels (e.g. under active threat/recon)
   */
  public injectBurstDecoy(count: number = 3) {
    this.log(`[LazarusMesh] INJECTING POLYMORPHIC BURST: Generating ${count} ephemeral high-entropy micro-tunnels.`, 'warn');
    for (let i = 0; i < count; i++) {
      const burstTunnel = this.createPolymorphicTunnel(true);
      burstTunnel.status = 'MASKED';
      this.activeTunnels.unshift(burstTunnel);
    }
    if (this.activeTunnels.length > 12) {
      this.activeTunnels = this.activeTunnels.slice(0, 12);
    }
    this.stats.totalHopsGenerated += count;
    this.stats.totalChaffDispatchedKb += count * 4.5;
    this.updateStats();
    this.notify();
  }

  /**
   * Manually force instant rotation of all micro-tunnels
   */
  public forceFullTopologyRotate() {
    this.log(`[LazarusMesh] FORCING FULL TOPOLOGY MESH ROTATION: Instant zero-downtime key & IP flush.`, 'info');
    this.activeTunnels = Array.from({ length: 5 }, () => this.createPolymorphicTunnel());
    this.stats.totalHopsGenerated += 5;
    this.updateStats();
    this.notify();
  }

  /**
   * Sets the polymorphic masking algorithm mode
   */
  public setMaskingMode(mode: MaskingMode) {
    this.stats.mode = mode;
    if (mode === 'POLYMORPHIC_BURST') {
      this.hopIntervalMs = 1200;
      this.maxTunnels = 8;
    } else if (mode === 'ADAPTIVE_FLUX') {
      this.hopIntervalMs = 2200;
      this.maxTunnels = 6;
    } else if (mode === 'CHAOS_JITTER') {
      this.hopIntervalMs = 800;
      this.maxTunnels = 10;
    }

    this.log(`[LazarusMesh] Masking mode updated to: ${mode} (Hop Interval: ${this.hopIntervalMs}ms)`, 'info');

    if (this.stats.isRunning) {
      this.startMeshRouting(this.hopIntervalMs);
    } else {
      this.notify();
    }
  }

  /**
   * Progresses countdown for timeRemainingMs
   */
  private tickDecay(deltaMs: number) {
    let changed = false;
    this.activeTunnels = this.activeTunnels.map(tun => {
      const remaining = Math.max(0, tun.timeRemainingMs - deltaMs);
      if (remaining === 0 && tun.status !== 'ROTATING') {
        changed = true;
        return { ...tun, timeRemainingMs: 0, status: 'ROTATING' as const };
      }
      return { ...tun, timeRemainingMs: remaining };
    });

    // Remove expired and add fresh if too few
    const unexpired = this.activeTunnels.filter(t => t.timeRemainingMs > 0);
    if (unexpired.length < 3) {
      unexpired.push(this.createPolymorphicTunnel());
      changed = true;
    }

    this.activeTunnels = unexpired;
    if (changed) {
      this.updateStats();
      this.notify();
    }
  }

  private updateStats() {
    this.stats.activeTunnelCount = this.activeTunnels.length;
    if (this.activeTunnels.length > 0) {
      const sumEntropy = this.activeTunnels.reduce((acc, t) => acc + t.entropyScore, 0);
      this.stats.entropyMean = Number((sumEntropy / this.activeTunnels.length).toFixed(2));
    }
    // Compute masking ratio
    this.stats.telemetryMaskingRatio = Number((99.5 + (this.activeTunnels.length * 0.04)).toFixed(2));
    this.stats.averageHopDurationMs = this.hopIntervalMs;
  }

  public getTunnels(): MicroTunnelEndpoint[] {
    return [...this.activeTunnels];
  }

  public getStats(): LazarusStats {
    return { ...this.stats };
  }

  public subscribe(listener: LazarusListener): () => void {
    this.listeners.add(listener);
    listener(this.getTunnels(), this.getStats());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const tunnels = this.getTunnels();
    const stats = this.getStats();
    this.listeners.forEach(fn => fn(tunnels, stats));
  }

  private log(text: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') {
    if (this.onLog) {
      this.onLog(text, type);
    }
  }

  public exportTopologyJson(): string {
    return JSON.stringify({
      classification: 'GHOST-WATCH LAZARUS MESH TELEMETRY AUDIT',
      timestamp: new Date().toISOString(),
      stats: this.stats,
      activeMicroTunnels: this.activeTunnels,
    }, null, 2);
  }
}

// Export singleton instance for global app sharing
export const lazarusMeshInstance = new LazarusMesh();
