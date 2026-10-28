export interface SystemMetricSnapshot {
  timestamp: string;
  timeLabel: string;
  cpuPercent: number;
  cpuCores: number;
  cpuFrequencyGhz: number;
  ramPercent: number;
  ramUsedMb: number;
  ramTotalMb: number;
  diskPercent: number;
  diskUsedGb: number;
  diskTotalGb: number;
  diskIoOpsSec: number;
  networkLatencyMs: number;
  networkThroughputMbps: number;
  threadsCount: number;
  tempCelsius: number;
}

export interface LiveTelemetryState {
  current: SystemMetricSnapshot;
  history: SystemMetricSnapshot[];
  isLive: boolean;
  updateIntervalMs: number;
  highLoadActive: boolean;
  hardwareAnchorId: string;
}

type TelemetryListener = (state: LiveTelemetryState) => void;

class LiveTelemetryService {
  private state: LiveTelemetryState;
  private listeners: Set<TelemetryListener> = new Set();
  private timerId: number | null = null;
  private diskBaseUsedGb = 312.4;
  private diskTotalGb = 1024.0;
  private cpuCoreCount = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 8;

  constructor() {
    const initialSnapshot = this.generateSnapshot();
    const history: SystemMetricSnapshot[] = [];

    // Pre-seed 25 data points so graphs look rich immediately
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const pastTime = new Date(now - i * 1500);
      history.push(this.generateSnapshot(pastTime, false));
    }

    this.state = {
      current: history[history.length - 1],
      history,
      isLive: true,
      updateIntervalMs: 1500,
      highLoadActive: false,
      hardwareAnchorId: 'HB-9982-AX-2026'
    };

    this.startStreaming();
  }

  private generateSnapshot(date: Date = new Date(), allowHighLoad = true): SystemMetricSnapshot {
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Use browser memory if available
    let ramUsedMb = 3450;
    let ramTotalMb = 16384;
    const perf = typeof window !== 'undefined' ? (window.performance as any) : null;
    if (perf && perf.memory) {
      const heapUsedMb = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
      // Anchor to a realistic secure enclave base + heap
      ramUsedMb = 3100 + heapUsedMb * 12;
      ramTotalMb = Math.max(16384, Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024) * 4));
    }

    // High load modifier
    const highLoadMult = (this.state?.highLoadActive && allowHighLoad) ? 2.2 : 1.0;

    // CPU calculations
    const baseCpu = 22 + Math.sin(Date.now() / 6000) * 8 + Math.random() * 9;
    const cpuPercent = Math.min(99.4, Math.max(8.0, Math.round((baseCpu * highLoadMult) * 10) / 10));

    // RAM percentage
    const baseRamPct = (ramUsedMb / ramTotalMb) * 100;
    const ramPercent = Math.min(98.5, Math.max(15.0, Math.round((baseRamPct + (this.state?.highLoadActive ? 32 : 0) + Math.random() * 2) * 10) / 10));

    // Disk calculations
    const diskIoOps = Math.round((420 + Math.random() * 180) * (this.state?.highLoadActive ? 3.4 : 1.0));
    const diskUsedGb = Math.round((this.diskBaseUsedGb + Math.random() * 0.4) * 10) / 10;
    const diskPercent = Math.round((diskUsedGb / this.diskTotalGb) * 1000) / 10;

    // Network & thermals
    const networkLatencyMs = Math.round((12 + Math.random() * 8) * (this.state?.highLoadActive ? 2.1 : 1.0));
    const networkThroughputMbps = Math.round((48.5 + Math.random() * 35.0) * (this.state?.highLoadActive ? 3.8 : 1.0) * 10) / 10;
    const threadsCount = Math.round(184 + this.cpuCoreCount * 12 + Math.random() * 8 + (this.state?.highLoadActive ? 64 : 0));
    const tempCelsius = Math.round(41 + (cpuPercent / 100) * 28 + Math.random() * 2);

    return {
      timestamp: date.toISOString(),
      timeLabel,
      cpuPercent,
      cpuCores: this.cpuCoreCount,
      cpuFrequencyGhz: 3.4 + Math.round(Math.random() * 4) / 10,
      ramPercent,
      ramUsedMb: Math.round((ramPercent / 100) * ramTotalMb),
      ramTotalMb,
      diskPercent,
      diskUsedGb,
      diskTotalGb: this.diskTotalGb,
      diskIoOpsSec: diskIoOps,
      networkLatencyMs,
      networkThroughputMbps,
      threadsCount,
      tempCelsius
    };
  }

  public startStreaming() {
    if (this.timerId !== null) return;
    this.state.isLive = true;

    this.timerId = window.setInterval(() => {
      if (!this.state.isLive) return;

      const newSnapshot = this.generateSnapshot();
      const updatedHistory = [...this.state.history.slice(1), newSnapshot];

      this.state = {
        ...this.state,
        current: newSnapshot,
        history: updatedHistory
      };

      this.notifyListeners();
    }, this.state.updateIntervalMs);
  }

  public stopStreaming() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.state = { ...this.state, isLive: false };
    this.notifyListeners();
  }

  public toggleLive() {
    if (this.state.isLive) {
      this.stopStreaming();
    } else {
      this.startStreaming();
    }
  }

  public setHighLoad(active: boolean) {
    this.state = { ...this.state, highLoadActive: active };
    this.notifyListeners();
  }

  public setUpdateInterval(intervalMs: number) {
    this.state.updateIntervalMs = intervalMs;
    if (this.state.isLive) {
      this.stopStreaming();
      this.startStreaming();
    }
  }

  public getState(): LiveTelemetryState {
    return this.state;
  }

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const liveTelemetryInstance = new LiveTelemetryService();
