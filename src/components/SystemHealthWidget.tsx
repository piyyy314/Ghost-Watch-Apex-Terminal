import React, { useState, useEffect } from 'react';
import { 
  Cpu, HardDrive, Zap, RefreshCw, Activity, 
  Play, Pause, Flame, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';
import { liveTelemetryInstance, LiveTelemetryState, SystemMetricSnapshot } from '../services/LiveTelemetryService';

interface SystemHealthWidgetProps {
  onAddConsoleLog?: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

type MetricView = 'COMPOSITE' | 'CPU' | 'RAM' | 'DISK';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTelemetryTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cyber-dark/95 border-2 border-cyber-border p-2.5 rounded shadow-xl font-mono text-[10px] min-w-[160px] backdrop-blur-md">
        <div className="text-gray-400 border-b border-cyber-border/60 pb-1 mb-1.5 flex justify-between items-center">
          <span>TIME: {label}</span>
          <span className="text-cyber-cyan text-[8px]">LIVE TELEMETRY</span>
        </div>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const isCpu = entry.dataKey === 'cpuPercent';
            const isRam = entry.dataKey === 'ramPercent';
            const isDisk = entry.dataKey === 'diskPercent';
            const isIo = entry.dataKey === 'diskIoOpsSec';

            const labelName = isCpu ? 'CPU Load' : isRam ? 'RAM In-Use' : isDisk ? 'Disk Space' : isIo ? 'Disk I/O' : entry.name;
            const unit = isIo ? ' IOPS' : '%';

            return (
              <div key={`item-${index}`} className="flex justify-between items-center gap-3">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {labelName}:
                </span>
                <span className="font-bold text-gray-100">
                  {entry.value}{unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export default function SystemHealthWidget({ onAddConsoleLog }: SystemHealthWidgetProps) {
  const [telemetry, setTelemetry] = useState<LiveTelemetryState>(liveTelemetryInstance.getState());
  const [activeMetricView, setActiveMetricView] = useState<MetricView>('COMPOSITE');

  useEffect(() => {
    const unsubscribe = liveTelemetryInstance.subscribe((state) => {
      setTelemetry(state);
    });
    return () => unsubscribe();
  }, []);

  const current = telemetry.current;
  const isHighLoad = telemetry.highLoadActive;

  const handleToggleLive = () => {
    liveTelemetryInstance.toggleLive();
    onAddConsoleLog?.(
      `Live system health telemetry stream ${!telemetry.isLive ? 'RESUMED' : 'PAUSED'}.`,
      !telemetry.isLive ? 'success' : 'warn'
    );
  };

  const handleToggleHighLoad = () => {
    const newState = !isHighLoad;
    liveTelemetryInstance.setHighLoad(newState);
    onAddConsoleLog?.(
      `Sovereign node synthetic workload test: ${newState ? 'HIGH COMPUTE LOAD ENGAGED' : 'NOMINAL BASELINE RESTORED'}.`,
      newState ? 'warn' : 'info'
    );
  };

  const handleIntervalChange = (ms: number) => {
    liveTelemetryInstance.setUpdateInterval(ms);
    onAddConsoleLog?.(`Telemetry sample rate configured to ${ms}ms.`, 'info');
  };

  return (
    <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 backdrop-blur-sm flex flex-col gap-4">
      
      {/* Widget Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-cyber-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-gray-100 text-sm tracking-wide">System Health & Live Resource Monitor</h3>
              <span className={`px-1.5 py-0.2 rounded border text-[9px] font-mono ${
                telemetry.isLive 
                  ? 'border-cyber-green/40 text-cyber-green bg-cyber-green/10 animate-pulse' 
                  : 'border-cyber-yellow/40 text-cyber-yellow bg-cyber-yellow/10'
              }`}>
                {telemetry.isLive ? 'LIVE STREAM' : 'PAUSED'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              REAL-TIME CPU, VOLATILE RAM ENCLAVE & DISK I/O TELEMETRY
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Refresh interval selector */}
          <div className="hidden md:flex items-center gap-1 bg-cyber-dark p-0.5 rounded border border-cyber-border text-[9px] font-mono">
            {[1000, 1500, 3000].map((ms) => (
              <button
                key={ms}
                onClick={() => handleIntervalChange(ms)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  telemetry.updateIntervalMs === ms 
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {ms / 1000}s
              </button>
            ))}
          </div>

          {/* High load simulation toggle */}
          <button
            type="button"
            onClick={handleToggleHighLoad}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition-all border ${
              isHighLoad
                ? 'border-cyber-red bg-cyber-red/20 text-cyber-red font-bold animate-pulse'
                : 'border-cyber-yellow/40 hover:border-cyber-yellow text-cyber-yellow bg-cyber-yellow/5 hover:bg-cyber-yellow/15'
            }`}
            title="Simulate Elevated Compute Workload"
          >
            <Flame className="w-3 h-3" />
            <span>{isHighLoad ? 'LOAD SURGE' : 'TEST LOAD'}</span>
          </button>

          {/* Pause / Resume Stream */}
          <button
            type="button"
            onClick={handleToggleLive}
            className={`px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition-all border ${
              telemetry.isLive
                ? 'border-cyber-border hover:border-cyber-cyan text-gray-300 hover:text-cyber-cyan bg-cyber-dark'
                : 'border-cyber-green bg-cyber-green/15 text-cyber-green font-bold'
            }`}
            title={telemetry.isLive ? 'Pause Live Telemetry Stream' : 'Resume Live Telemetry Stream'}
          >
            {telemetry.isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden sm:inline">{telemetry.isLive ? 'PAUSE' : 'RESUME'}</span>
          </button>
        </div>
      </div>

      {/* 3 Real-Time KPI Cards: CPU, RAM, Disk */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* CPU Card */}
        <div className={`p-3 rounded border-2 transition-all bg-cyber-dark/80 relative overflow-hidden flex flex-col justify-between ${
          current.cpuPercent > 80 ? 'border-cyber-red/80' : 'border-cyber-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
              CPU Core Engine
            </span>
            <span className="text-[9px] font-mono text-gray-400">
              {current.cpuCores} Cores @ {current.cpuFrequencyGhz} GHz
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="font-display font-bold text-2xl text-cyber-cyan tracking-tight">
              {current.cpuPercent}%
            </span>
            <div className="text-right font-mono text-[9px] text-gray-400">
              <span className="text-gray-300 font-semibold">{current.tempCelsius}°C</span> | {current.threadsCount} Th
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-cyber-panel h-1.5 rounded-full overflow-hidden border border-cyber-border/40">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                current.cpuPercent > 80 
                  ? 'bg-cyber-red shadow-[0_0_8px_rgba(255,61,90,0.6)]' 
                  : current.cpuPercent > 60 
                    ? 'bg-cyber-yellow' 
                    : 'bg-cyber-cyan shadow-[0_0_8px_rgba(6,225,249,0.4)]'
              }`}
              style={{ width: `${current.cpuPercent}%` }}
            />
          </div>
        </div>

        {/* RAM Card */}
        <div className={`p-3 rounded border-2 transition-all bg-cyber-dark/80 relative overflow-hidden flex flex-col justify-between ${
          current.ramPercent > 85 ? 'border-cyber-red/80' : 'border-cyber-border'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyber-green" />
              Volatile RAM Enclave
            </span>
            <span className="text-[9px] font-mono text-cyber-green">
              ML-KEM PQC ZEROIZED
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="font-display font-bold text-2xl text-cyber-green tracking-tight">
              {current.ramPercent}%
            </span>
            <div className="text-right font-mono text-[9px] text-gray-400">
              <span className="text-gray-300 font-semibold">{Math.round(current.ramUsedMb / 102.4) / 10} GB</span> / {Math.round(current.ramTotalMb / 102.4) / 10} GB
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-cyber-panel h-1.5 rounded-full overflow-hidden border border-cyber-border/40">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                current.ramPercent > 85 
                  ? 'bg-cyber-red shadow-[0_0_8px_rgba(255,61,90,0.6)]' 
                  : 'bg-cyber-green shadow-[0_0_8px_rgba(5,243,161,0.4)]'
              }`}
              style={{ width: `${current.ramPercent}%` }}
            />
          </div>
        </div>

        {/* Disk Card */}
        <div className="p-3 rounded border-2 border-cyber-border bg-cyber-dark/80 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 uppercase font-semibold flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-cyber-yellow" />
              Disk Array & I/O
            </span>
            <span className="text-[9px] font-mono text-gray-400">
              NVMe AES-XTS-256
            </span>
          </div>

          <div className="my-2 flex items-baseline justify-between">
            <span className="font-display font-bold text-2xl text-cyber-yellow tracking-tight">
              {current.diskPercent}%
            </span>
            <div className="text-right font-mono text-[9px] text-gray-400">
              <span className="text-cyber-yellow font-semibold">{current.diskIoOpsSec} IOPS</span> | {current.diskUsedGb} GB
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-cyber-panel h-1.5 rounded-full overflow-hidden border border-cyber-border/40">
            <div 
              className="h-full transition-all duration-500 rounded-full bg-cyber-yellow shadow-[0_0_8px_rgba(245,176,37,0.4)]"
              style={{ width: `${current.diskPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Chart View Selector & Real-Time Recharts Graph */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-cyber-dark p-0.5 rounded border border-cyber-border text-[9px] font-mono">
            {(['COMPOSITE', 'CPU', 'RAM', 'DISK'] as MetricView[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setActiveMetricView(mode)}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  activeMetricView === mode 
                    ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode === 'COMPOSITE' ? 'ALL METRICS' : `${mode} VIEW`}
              </button>
            ))}
          </div>

          <div className="text-[9px] font-mono text-gray-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan" /> CPU
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyber-green" /> RAM
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyber-yellow" /> DISK
            </span>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-[175px] w-full bg-cyber-dark/90 rounded border-2 border-cyber-border/80 p-1 relative overflow-hidden">
          
          {/* Subtle background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(22,34,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(22,34,58,0.2)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={telemetry.history} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06e1f9" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#06e1f9" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#05f3a1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#05f3a1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="diskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5b025" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f5b025" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                stroke="#1e293b"
                tickLine={false}
              />
              
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                stroke="#1e293b"
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />

              <Tooltip content={<CustomTelemetryTooltip />} />

              {/* Conditional Area Renderings */}
              {(activeMetricView === 'COMPOSITE' || activeMetricView === 'CPU') && (
                <Area 
                  type="monotone" 
                  dataKey="cpuPercent" 
                  name="CPU Load"
                  stroke="#06e1f9" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#cpuGrad)" 
                  isAnimationActive={false}
                />
              )}

              {(activeMetricView === 'COMPOSITE' || activeMetricView === 'RAM') && (
                <Area 
                  type="monotone" 
                  dataKey="ramPercent" 
                  name="RAM Usage"
                  stroke="#05f3a1" 
                  strokeWidth={1.8}
                  fillOpacity={1} 
                  fill="url(#ramGrad)" 
                  isAnimationActive={false}
                />
              )}

              {(activeMetricView === 'COMPOSITE' || activeMetricView === 'DISK') && (
                <Area 
                  type="monotone" 
                  dataKey="diskPercent" 
                  name="Disk Capacity"
                  stroke="#f5b025" 
                  strokeWidth={1.6}
                  fillOpacity={1} 
                  fill="url(#diskGrad)" 
                  isAnimationActive={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
