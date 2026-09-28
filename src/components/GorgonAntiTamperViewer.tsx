import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Cpu, Eye, Bug, RefreshCw, Trash2, 
  CheckCircle2, AlertTriangle, Download, Terminal, Lock, Key, ShieldCheck, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GorgonAntiTamperState, GorgonIntegrityState, TamperThreatType } from '../types';
import { gorgonAntiTamperInstance } from '../services/GorgonAntiTamper';

interface GorgonAntiTamperViewerProps {
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function GorgonAntiTamperViewer({ onAddConsoleLog }: GorgonAntiTamperViewerProps) {
  const [gorgonState, setGorgonState] = useState<GorgonAntiTamperState>(gorgonAntiTamperInstance.getState());

  useEffect(() => {
    gorgonAntiTamperInstance.setLogCallback(onAddConsoleLog);
    const unsubscribe = gorgonAntiTamperInstance.subscribe((updatedState) => {
      setGorgonState(updatedState);
    });
    return () => unsubscribe();
  }, [onAddConsoleLog]);

  const handleScanIntegrityClean = () => {
    gorgonAntiTamperInstance.scanMemoryIntegrity();
  };

  const handleSimulateDebugger = () => {
    gorgonAntiTamperInstance.simulateDebuggerAttach();
  };

  const handleSimulateScraper = () => {
    gorgonAntiTamperInstance.simulateMemoryScraper();
  };

  const handleManualPurgeAndRotate = () => {
    onAddConsoleLog('[GorgonAntiTamper] Manual emergency volatile memory purge triggered by operator.', 'warn');
    gorgonAntiTamperInstance.purgeVolatilePqcKeys('MEMORY_CORRUPTION', 'Manual operator emergency purge command.');
  };

  const handleToggleAutoScan = () => {
    if (gorgonState.autoScanEnabled) {
      gorgonAntiTamperInstance.stopContinuousMemoryScan();
    } else {
      gorgonAntiTamperInstance.startContinuousMemoryScan(4500);
    }
  };

  const handleExportAuditReport = () => {
    const reportJson = gorgonAntiTamperInstance.exportAuditReportJson();
    const blob = new Blob([reportJson], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gorgon_antitamper_audit_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog('GorgonAntiTamper memory integrity audit report exported.', 'success');
  };

  // Status visual badge helpers
  const getStatusColor = (status: GorgonIntegrityState) => {
    switch (status) {
      case 'PRISTINE':
      case 'RECOVERED_SECURE':
        return {
          border: 'border-cyber-green',
          bg: 'bg-cyber-green/10',
          text: 'text-cyber-green',
          label: 'ENCLAVE PRISTINE & SECURE',
        };
      case 'SCANNING':
        return {
          border: 'border-cyber-cyan',
          bg: 'bg-cyber-cyan/15',
          text: 'text-cyber-cyan',
          label: 'SCANNING MEMORY PAGES...',
        };
      case 'THREAT_DETECTED':
        return {
          border: 'border-cyber-red',
          bg: 'bg-cyber-red/20',
          text: 'text-cyber-red',
          label: 'CRITICAL: TAMPER THREAT DETECTED!',
        };
      case 'PURGING_KEYS':
        return {
          border: 'border-cyber-yellow',
          bg: 'bg-cyber-yellow/20',
          text: 'text-cyber-yellow',
          label: 'ZEROIZING VOLATILE PQC KEYS...',
        };
      case 'KEY_ROTATION':
        return {
          border: 'border-purple-400',
          bg: 'bg-purple-950/30',
          text: 'text-purple-300',
          label: 'DERIVING FRESH PQC KEY EPOCH...',
        };
      default:
        return {
          border: 'border-cyber-border',
          bg: 'bg-cyber-dark',
          text: 'text-gray-300',
          label: 'STANDBY',
        };
    }
  };

  const currentStatusDisplay = getStatusColor(gorgonState.integrityStatus);

  return (
    <div className="flex flex-col gap-5 h-full">
      
      {/* TOP SYSTEM OVERVIEW BANNER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        
        {/* Integrity Score */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Memory Integrity</span>
            <Activity className="w-4 h-4 text-cyber-green" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-bold font-display ${
              gorgonState.memoryIntegrityScore > 80 ? 'text-cyber-green' : 'text-cyber-red animate-pulse'
            }`}>
              {gorgonState.memoryIntegrityScore}%
            </span>
            <span className="text-[10px] font-mono text-gray-400">Score</span>
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-1">
            Volatile RAM Pages Verified
          </div>
        </div>

        {/* PQC Key Epoch */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">PQC Lattice Epoch</span>
            <Key className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-display text-cyber-cyan">#{gorgonState.keyEpoch}</span>
            <span className="text-[10px] font-mono text-gray-300">{gorgonState.activePqcKey.algorithm}</span>
          </div>
          <div className="text-[9px] font-mono text-cyber-green mt-1">
            Status: {gorgonState.activePqcKey.status}
          </div>
        </div>

        {/* Scans Performed */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Memory Audits Run</span>
            <Eye className="w-4 h-4 text-cyber-yellow" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-display text-cyber-yellow">{gorgonState.scansPerformed}</span>
            <span className="text-[10px] font-mono text-gray-400">cycles</span>
          </div>
          <div className="text-[9px] font-mono text-gray-400 mt-1">
            Cadence: Continuous Watch
          </div>
        </div>

        {/* Threats Intercepted */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Tamper Intercepts</span>
            <ShieldAlert className="w-4 h-4 text-cyber-red" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-2xl font-bold font-display ${gorgonState.threatsIntercepted > 0 ? 'text-cyber-red' : 'text-cyber-green'}`}>
              {gorgonState.threatsIntercepted}
            </span>
            <span className="text-[10px] font-mono text-gray-400">auto-purged</span>
          </div>
          <div className="text-[9px] font-mono text-cyber-green mt-1">
            Zero parameter leakage
          </div>
        </div>

      </div>

      {/* ACTIVE INTEGRITY RADAR BANNER & SIMULATION CONTROLS */}
      <div className={`p-4 rounded-lg border-2 ${currentStatusDisplay.border} ${currentStatusDisplay.bg} flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300`}>
        
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded border ${currentStatusDisplay.border} ${currentStatusDisplay.text}`}>
            {gorgonState.integrityStatus === 'PRISTINE' || gorgonState.integrityStatus === 'RECOVERED_SECURE' ? (
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            ) : gorgonState.integrityStatus === 'SCANNING' ? (
              <Eye className="w-6 h-6 animate-spin" />
            ) : gorgonState.integrityStatus === 'PURGING_KEYS' ? (
              <Trash2 className="w-6 h-6 animate-bounce" />
            ) : (
              <AlertTriangle className="w-6 h-6 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm md:text-base font-display font-bold uppercase tracking-wider ${currentStatusDisplay.text}`}>
                {currentStatusDisplay.label}
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-300 mt-0.5">
              Gorgon anti-tamper subsystem continuously sweeps runtime memory for debugger attachments, hardware breakpoints, and scrapers.
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          
          <button
            onClick={handleScanIntegrityClean}
            disabled={gorgonState.integrityStatus !== 'PRISTINE'}
            className="text-cyber-green hover:text-white border border-cyber-green/40 hover:border-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all disabled:opacity-50"
            title="Perform manual integrity check on volatile memory"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>SCAN INTEGRITY</span>
          </button>

          <button
            onClick={handleSimulateDebugger}
            disabled={gorgonState.integrityStatus !== 'PRISTINE'}
            className="text-cyber-yellow hover:text-white border border-cyber-yellow/40 hover:border-cyber-yellow bg-cyber-yellow/10 hover:bg-cyber-yellow/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all disabled:opacity-50"
            title="Simulate detection of debugger hook / ptrace probe"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>SIMULATE DEBUGGER</span>
          </button>

          <button
            onClick={handleSimulateScraper}
            disabled={gorgonState.integrityStatus !== 'PRISTINE'}
            className="text-cyber-red hover:text-white border border-cyber-red/40 hover:border-cyber-red bg-cyber-red/10 hover:bg-cyber-red/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all disabled:opacity-50"
            title="Simulate detection of heap memory scraper probing cryptographic keys"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SIMULATE SCRAPER</span>
          </button>

          <button
            onClick={handleManualPurgeAndRotate}
            disabled={gorgonState.integrityStatus !== 'PRISTINE'}
            className="text-purple-300 hover:text-white border border-purple-400/40 hover:border-purple-400 bg-purple-950/30 hover:bg-purple-900/40 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all disabled:opacity-50"
            title="Zeroize current volatile PQC keys and advance epoch"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>EMERGENCY PURGE & ROTATE</span>
          </button>

          <button
            onClick={handleToggleAutoScan}
            className={`border rounded px-2 py-1.5 text-xs flex items-center gap-1 font-mono cursor-pointer transition-all ${
              gorgonState.autoScanEnabled
                ? 'border-cyber-border text-gray-400 hover:text-gray-200 bg-cyber-dark'
                : 'border-cyber-yellow/50 text-cyber-yellow bg-cyber-yellow/10'
            }`}
            title="Toggle background auto-scanning loop"
          >
            <span>{gorgonState.autoScanEnabled ? 'PAUSE SCAN' : 'RESUME SCAN'}</span>
          </button>

          <button
            onClick={handleExportAuditReport}
            className="text-gray-300 hover:text-white border border-cyber-border hover:border-cyber-cyan bg-cyber-dark rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer transition-all"
            title="Download anti-tamper audit report JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>

        </div>

      </div>

      {/* MAIN TWO-COLUMN SPLIT: Volatile Memory Inspection & PQC Key Enclave */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[420px]">
        
        {/* LEFT: Volatile Enclave Memory Pages Hex-Dump Monitor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2 mb-3">
            <span className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              Volatile RAM Pages & Lattice Buffers (Zeroization Watch)
            </span>
            <span className="text-[10px] font-mono text-cyber-green">
              {gorgonState.memoryRegions.length} Active Memory Pages Monitored
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[460px] scrollbar-thin">
            {gorgonState.memoryRegions.map((region, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded border transition-all ${
                  region.status === 'ANOMALOUS'
                    ? 'border-cyber-red bg-cyber-red/15 animate-pulse'
                    : region.status === 'PURGED'
                      ? 'border-cyber-yellow/60 bg-cyber-yellow/10'
                      : region.status === 'RE-SEEDED'
                        ? 'border-cyber-cyan bg-cyber-cyan/15'
                        : 'border-cyber-border/70 bg-cyber-dark/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-cyber-cyan font-bold">{region.address}</span>
                    <span className="text-gray-300">{region.label}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    region.status === 'SECURE'
                      ? 'border-cyber-green/40 text-cyber-green bg-cyber-green/5'
                      : region.status === 'ANOMALOUS'
                        ? 'border-cyber-red text-cyber-red bg-cyber-red/20 animate-pulse'
                        : region.status === 'PURGED'
                          ? 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/20'
                          : 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/20'
                  }`}>
                    {region.status}
                  </span>
                </div>

                <div className="mt-2 p-2 bg-black/60 rounded border border-cyber-border/40 font-mono text-[11px] text-gray-300">
                  <div className="text-[9px] text-gray-500 mb-1 flex justify-between">
                    <span>HEX DUMP PREVIEW:</span>
                    <span>Entropy: {region.entropy} H</span>
                  </div>
                  <div className={`tracking-wider break-all ${
                    region.status === 'PURGED' ? 'text-cyber-yellow font-bold' : region.status === 'ANOMALOUS' ? 'text-cyber-red font-bold' : 'text-cyber-green'
                  }`}>
                    {region.hexDumpSample}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Active PQC Session Key Card & Tamper History Log (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Active PQC Key Enclave State */}
          <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyber-yellow" />
                Active PQC Volatile Key Ring
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-cyber-green/40 text-cyber-green bg-cyber-green/5">
                EPOCH #{gorgonState.activePqcKey.epoch}
              </span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                <span className="text-[9px] text-gray-500 uppercase block">Key Identifier:</span>
                <span className="text-cyber-cyan font-bold text-xs">{gorgonState.activePqcKey.keyId}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                  <span className="text-[9px] text-gray-500 uppercase block">Algorithm:</span>
                  <span className="text-gray-200 font-semibold text-[11px]">{gorgonState.activePqcKey.algorithm}</span>
                </div>
                <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                  <span className="text-[9px] text-gray-500 uppercase block">RAM Pointer:</span>
                  <span className="text-cyber-green font-semibold text-[11px]">{gorgonState.activePqcKey.volatileBufferAddress}</span>
                </div>
              </div>

              <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                <span className="text-[9px] text-gray-500 uppercase block">SHA-256 Key Fingerprint:</span>
                <span className="text-gray-400 text-[10px] break-all">{gorgonState.activePqcKey.fingerprintSha256}</span>
              </div>

              <div className="p-2 bg-cyber-dark rounded border border-cyber-border">
                <span className="text-[9px] text-gray-500 uppercase block">Lattice Seed Entropy:</span>
                <span className="text-cyber-yellow text-[10px] break-all font-mono">
                  {gorgonState.activePqcKey.latticeSeedEntropy}
                </span>
              </div>
            </div>
          </div>

          {/* Tamper Intercept Audit Ledger */}
          <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col flex-1 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-cyber-border/60 pb-2 mb-2">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyber-red" />
                Tamper Intercept Audit History
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {gorgonState.recentEvents.length} Recorded
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px] scrollbar-thin text-xs font-mono">
              {gorgonState.recentEvents.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-[11px] text-center p-4">
                  No tampering detected. Volatile key enclave is currently undisturbed.
                </div>
              ) : (
                gorgonState.recentEvents.map((evt) => (
                  <div key={evt.id} className="p-2.5 rounded border border-cyber-red/40 bg-cyber-red/10 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-cyber-red font-bold">{evt.threatType}</span>
                      <span className="text-gray-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[10px] text-gray-300">{evt.processVector}</div>
                    <div className="text-[9px] text-cyber-green border-t border-cyber-border/40 pt-1 mt-1">
                      Action: {evt.actionTaken}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
