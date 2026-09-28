import React, { useState, useEffect } from 'react';
import { 
  Network, Shuffle, ShieldCheck, Zap, Activity, Globe, 
  RefreshCw, Play, Pause, Download, Layers, Radio, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MicroTunnelEndpoint, LazarusStats, MaskingMode } from '../types';
import { lazarusMeshInstance } from '../services/LazarusMesh';

interface LazarusMeshViewerProps {
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function LazarusMeshViewer({ onAddConsoleLog }: LazarusMeshViewerProps) {
  const [tunnels, setTunnels] = useState<MicroTunnelEndpoint[]>([]);
  const [stats, setStats] = useState<LazarusStats>(lazarusMeshInstance.getStats());
  const [selectedTunnel, setSelectedTunnel] = useState<MicroTunnelEndpoint | null>(null);

  useEffect(() => {
    lazarusMeshInstance.setLogCallback(onAddConsoleLog);
    const unsubscribe = lazarusMeshInstance.subscribe((updatedTunnels, updatedStats) => {
      setTunnels(updatedTunnels);
      setStats(updatedStats);
      if (selectedTunnel) {
        const found = updatedTunnels.find(t => t.id === selectedTunnel.id);
        setSelectedTunnel(found || updatedTunnels[0] || null);
      }
    });
    return () => unsubscribe();
  }, [onAddConsoleLog]);

  const handleToggleRouting = () => {
    if (stats.isRunning) {
      lazarusMeshInstance.stopMeshRouting();
    } else {
      lazarusMeshInstance.startMeshRouting();
    }
  };

  const handleInjectBurst = () => {
    lazarusMeshInstance.injectBurstDecoy(4);
  };

  const handleForceRotate = () => {
    lazarusMeshInstance.forceFullTopologyRotate();
  };

  const handleModeChange = (mode: MaskingMode) => {
    lazarusMeshInstance.setMaskingMode(mode);
  };

  const handleExportTopology = () => {
    const jsonStr = lazarusMeshInstance.exportTopologyJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lazarus_mesh_topology_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog('LazarusMesh active polymorphic routing topology exported.', 'success');
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* TOP STATS BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        
        {/* Active Tunnels */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Polymorphic Tunnels</span>
            <Network className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-display text-cyber-cyan">{stats.activeTunnelCount}</span>
            <span className="text-[10px] font-mono text-gray-400">active channels</span>
          </div>
          <div className="text-[9px] font-mono text-cyber-green mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
            Zero static telemetry endpoints
          </div>
        </div>

        {/* Total Polymorphic Hops */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Hops Rotated</span>
            <Shuffle className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-display text-cyber-green">{stats.totalHopsGenerated}</span>
            <span className="text-[10px] font-mono text-gray-400">cycles</span>
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-1">
            Cadence: ~{stats.averageHopDurationMs}ms / hop
          </div>
        </div>

        {/* Masking Efficiency */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Telemetry Masking</span>
            <ShieldCheck className="w-4 h-4 text-cyber-yellow" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-display text-cyber-yellow">{stats.telemetryMaskingRatio}%</span>
            <span className="text-[10px] font-mono text-cyber-green">HIGH OBFUSCATION</span>
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-1">
            Mean Entropy: {stats.entropyMean} / 10.0 H
          </div>
        </div>

        {/* Dispatched Chaff */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Chaff Decoy Dispatched</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-display text-purple-400">{stats.totalChaffDispatchedKb.toFixed(1)}</span>
            <span className="text-[10px] font-mono text-gray-400">KB noise padding</span>
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-1">
            Signatures dynamically shaped
          </div>
        </div>

      </div>

      {/* CONTROLS TOOLBAR */}
      <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/90 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
            <Network className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-gray-100 text-sm md:text-base uppercase tracking-wider">
                LazarusMesh Polymorphic C2 Router
              </h2>
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                stats.isRunning 
                  ? 'border-cyber-green/40 bg-cyber-green/10 text-cyber-green' 
                  : 'border-cyber-yellow/40 bg-cyber-yellow/10 text-cyber-yellow'
              }`}>
                {stats.isRunning ? 'ONLINE - ROTATING' : 'SUSPENDED'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-400">
              Generates ephemeral micro-tunnel endpoints, fake IP masks, and decoy chaff to obscure C2 traffic.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-cyber-dark p-1 rounded border border-cyber-border text-[10px] font-mono">
            <span className="text-gray-500 px-1">MODE:</span>
            {(['POLYMORPHIC_BURST', 'ADAPTIVE_FLUX', 'CHAOS_JITTER'] as MaskingMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-2 py-0.5 rounded transition-all ${
                  stats.mode === mode
                    ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan font-bold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode === 'POLYMORPHIC_BURST' ? 'BURST' : mode === 'ADAPTIVE_FLUX' ? 'FLUX' : 'JITTER'}
              </button>
            ))}
          </div>

          <button
            onClick={handleInjectBurst}
            className="text-cyber-yellow hover:text-white border border-cyber-yellow/40 hover:border-cyber-yellow bg-cyber-yellow/10 hover:bg-cyber-yellow/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all"
            title="Inject rapid burst of randomized ephemeral tunnels"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>INJECT BURST</span>
          </button>

          <button
            onClick={handleForceRotate}
            className="text-cyber-cyan hover:text-white border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all"
            title="Force immediate replacement of all micro-tunnels"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>FLUSH TOPOLOGY</span>
          </button>

          <button
            onClick={handleToggleRouting}
            className={`border rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all ${
              stats.isRunning
                ? 'border-cyber-red/40 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20'
                : 'border-cyber-green/40 bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20'
            }`}
          >
            {stats.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{stats.isRunning ? 'PAUSE ROUTING' : 'RESUME ROUTING'}</span>
          </button>

          <button
            onClick={handleExportTopology}
            className="text-gray-300 hover:text-white border border-cyber-border hover:border-cyber-cyan bg-cyber-dark rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all"
            title="Download active topology JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* MAIN VIEW: 2 COLUMNS (Tunnels list + Tunnel detail inspection) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[420px]">
        
        {/* LEFT: Realtime Micro-Tunnel Grid (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2 mb-3">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-cyan" />
              Active Polymorphic Micro-Tunnels ({tunnels.length})
            </span>
            <span className="text-[10px] font-mono text-cyber-green animate-pulse">
              Live Hop Simulation Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[460px] scrollbar-thin">
            <AnimatePresence>
              {tunnels.map((tunnel) => {
                const isSelected = selectedTunnel?.id === tunnel.id;
                const percentLife = Math.max(0, Math.min(100, (tunnel.timeRemainingMs / tunnel.ttlMs) * 100));

                return (
                  <motion.div
                    key={tunnel.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedTunnel(tunnel)}
                    className={`p-3 rounded border cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-cyber-cyan bg-cyber-cyan/15 shadow-[0_0_12px_rgba(6,225,249,0.15)]'
                        : tunnel.status === 'ROTATING'
                          ? 'border-cyber-yellow/50 bg-cyber-yellow/5'
                          : tunnel.status === 'MASKED'
                            ? 'border-purple-500/50 bg-purple-950/20'
                            : 'border-cyber-border/70 bg-cyber-dark/80 hover:border-cyber-border hover:bg-cyber-dark'
                    }`}
                  >
                    {/* Life countdown bar */}
                    <div 
                      style={{ width: `${percentLife}%` }} 
                      className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${
                        percentLife > 50 ? 'bg-cyber-green' : percentLife > 20 ? 'bg-cyber-yellow' : 'bg-cyber-red'
                      }`} 
                    />

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {tunnel.id}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border border-cyber-border text-gray-300 bg-cyber-panel">
                          {tunnel.protocol}
                        </span>
                        {tunnel.status === 'ROTATING' && (
                          <span className="text-[9px] font-mono text-cyber-yellow font-bold animate-pulse">
                            [HOPPING...]
                          </span>
                        )}
                        {tunnel.status === 'MASKED' && (
                          <span className="text-[9px] font-mono text-purple-300 font-bold">
                            [BURST DECOY]
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-gray-400">
                        TTL: <span className={percentLife > 20 ? 'text-cyber-green font-bold' : 'text-cyber-red font-bold'}>
                          {(tunnel.timeRemainingMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>

                    {/* Masked fake IPs and Synthetic hostname */}
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-1.5 rounded bg-black/40 border border-cyber-border/40">
                        <div className="text-[9px] text-gray-500">FAKE IPv4 MASK:</div>
                        <div className="text-cyber-cyan font-semibold text-[11px] truncate">
                          {tunnel.fakeIpv4}
                        </div>
                      </div>
                      <div className="p-1.5 rounded bg-black/40 border border-cyber-border/40">
                        <div className="text-[9px] text-gray-500">SYNTHETIC DOMAIN:</div>
                        <div className="text-gray-200 text-[11px] truncate">
                          {tunnel.syntheticDomain}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>Hops: <span className="text-gray-200 font-semibold">{tunnel.tunnelHopChain.length} nodes</span></span>
                      <span>Entropy: <span className="text-cyber-yellow font-semibold">{tunnel.entropyScore} H</span></span>
                      <span>Chaff: <span className="text-purple-300 font-semibold">{tunnel.chaffNoiseBytes} B</span></span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Detailed Inspection of Selected Tunnel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2 mb-3">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyber-green" />
              Micro-Tunnel Route Telemetry
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {selectedTunnel ? selectedTunnel.id : 'No tunnel selected'}
            </span>
          </div>

          {selectedTunnel ? (
            <div className="flex flex-col gap-3 font-mono text-xs overflow-y-auto pr-1">
              
              {/* Synthetic Endpoint URL */}
              <div className="p-3 bg-cyber-dark rounded border border-cyber-border">
                <span className="text-[9px] text-gray-500 uppercase block mb-1">Decoy Telemetry Endpoint URL:</span>
                <span className="text-cyber-green font-semibold break-all text-[11px]">
                  {selectedTunnel.endpointUrl}
                </span>
              </div>

              {/* Masked IP Set */}
              <div className="p-3 bg-cyber-dark rounded border border-cyber-border space-y-2">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase block">Simulated Ingress IPv4:</span>
                  <span className="text-cyber-cyan text-sm font-bold">{selectedTunnel.fakeIpv4}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase block">Simulated Ingress IPv6:</span>
                  <span className="text-gray-300 text-[10px] break-all">{selectedTunnel.fakeIpv6}</span>
                </div>
              </div>

              {/* Hop Chain Path Visualizer */}
              <div className="p-3 bg-cyber-dark rounded border border-cyber-border">
                <span className="text-[9px] text-gray-500 uppercase block mb-2">Dynamic Polymorphic Hop Chain:</span>
                <div className="space-y-1.5">
                  <div className="text-[10px] text-cyber-cyan flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                    <span>[C2 Ingress Gateway] : localhost</span>
                  </div>
                  {selectedTunnel.tunnelHopChain.map((hop, idx) => (
                    <div key={idx} className="text-[10px] text-gray-300 flex items-center gap-2 pl-3 border-l-2 border-cyber-border">
                      <span className="text-cyber-yellow">↓</span>
                      <span>{hop}</span>
                    </div>
                  ))}
                  <div className="text-[10px] text-cyber-green flex items-center gap-1 pl-3 border-l-2 border-cyber-border">
                    <span className="text-cyber-yellow">↓</span>
                    <span className="w-2 h-2 rounded-full bg-cyber-green" />
                    <span>[Egress Mask] : {selectedTunnel.syntheticDomain}</span>
                  </div>
                </div>
              </div>

              {/* Shannon Entropy & Chaff noise meters */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                  <span className="text-gray-500 block">SHANNON ENTROPY:</span>
                  <span className="text-cyber-yellow font-bold text-sm">{selectedTunnel.entropyScore} / 10.0</span>
                  <span className="text-gray-500 block mt-0.5">High unpredictability</span>
                </div>
                <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                  <span className="text-gray-500 block">CHAFF PADDING:</span>
                  <span className="text-purple-300 font-bold text-sm">{selectedTunnel.chaffNoiseBytes} Bytes</span>
                  <span className="text-gray-500 block mt-0.5">Packet size jitter</span>
                </div>
              </div>

              {/* Protocol Specs */}
              <div className="p-2.5 bg-cyber-dark/60 rounded border border-cyber-border text-[10px] text-gray-400 flex justify-between">
                <span>ENCRYPTION: TLS 1.3 + ECH</span>
                <span className="text-cyber-green">OBFUSCATED C2</span>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs font-mono text-gray-500">
              Select a polymorphic micro-tunnel to inspect its hop topology.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
