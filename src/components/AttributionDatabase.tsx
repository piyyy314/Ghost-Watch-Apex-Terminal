import React, { useState } from 'react';
import { 
  Database, AlertOctagon, Terminal as LogIcon, Calendar, HardDrive, 
  Trash2, ShieldAlert, CheckCircle2, ExternalLink, Download, ChevronDown,
  ChevronUp, ChevronRight, Activity, Network, FileCode, Copy, Check,
  Search, Filter, Clock, Eye, AlertTriangle, ShieldCheck, Zap, RefreshCw,
  Layers, Lock, Bug, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lure, ThreatEvent, PacketAnalysisTrace } from '../types';
import { generatePacketTraceForThreat, createSimulatedPcapBlob } from '../services/PacketAnalysisEngine';

interface AttributionDatabaseProps {
  lures: Lure[];
  threats?: ThreatEvent[];
  onTriggerLureAlert: (lureId: string) => void;
  onRemoveLure: (lureId: string) => void;
  onResolveThreat?: (threatId: string) => void;
  onSimulateThreat?: (type: 'DNS_CANARY' | 'PORT_SCAN' | 'MEMORY_TAMPER' | 'MULTIPASS') => void;
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

type PacketSubTab = 'DISSECTION' | 'HOPS' | 'HEX' | 'RULES';

export default function AttributionDatabase({
  lures,
  threats = [],
  onTriggerLureAlert,
  onRemoveLure,
  onResolveThreat,
  onSimulateThreat,
  onAddConsoleLog,
}: AttributionDatabaseProps) {
  // Main view switcher: Threat Incidents vs Canary Traps
  const [activeView, setActiveView] = useState<'THREATS' | 'LURES'>('THREATS');
  
  // Threat events filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  
  // Accordion state: ID of currently expanded threat
  const [expandedThreatId, setExpandedThreatId] = useState<string | null>(
    threats.find(t => !t.resolved)?.id || threats[0]?.id || null
  );

  // Sub-tabs within each expanded packet trace: [threatId]: 'DISSECTION' | 'HOPS' | 'HEX' | 'RULES'
  const [activeTraceTabs, setActiveTraceTabs] = useState<Record<string, PacketSubTab>>({});

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Canary lure selection state
  const [selectedLureId, setSelectedLureId] = useState<string | null>(lures[0]?.id || null);
  const selectedLure = lures.find(l => l.id === selectedLureId) || lures[0];

  // Helper to ensure every threat has a valid packet analysis trace
  const getPacketTrace = (threat: ThreatEvent): PacketAnalysisTrace => {
    if (threat.packetTrace) return threat.packetTrace;
    const matchingLure = lures.find(l => l.id === threat.targetLureId);
    return generatePacketTraceForThreat(threat, matchingLure);
  };

  const handleToggleExpand = (threatId: string) => {
    setExpandedThreatId(prev => (prev === threatId ? null : threatId));
  };

  const getActiveSubTab = (threatId: string): PacketSubTab => {
    return activeTraceTabs[threatId] || 'DISSECTION';
  };

  const setSubTabForThreat = (threatId: string, tab: PacketSubTab) => {
    setActiveTraceTabs(prev => ({ ...prev, [threatId]: tab }));
  };

  const handleCopyText = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onAddConsoleLog(`Copied ${label} to clipboard.`, 'info');
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleDownloadPcap = (trace: PacketAnalysisTrace, threatId: string) => {
    const blob = createSimulatedPcapBlob(trace);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghostwatch_trace_${threatId}_${trace.captureId}.pcap`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog(`Downloaded simulated PCAP packet trace for incident ${threatId}.`, 'success');
  };

  const handleDownloadLedger = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      architecture: 'Ghost-Watch Apex ADB Forensic Ledger',
      canaryLures: lures,
      threatEvents: threats.map(t => ({
        ...t,
        packetTrace: getPacketTrace(t)
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ghostwatch_adb_forensic_ledger_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddConsoleLog(`ADB Forensic Ledger exported (${lures.length} lures, ${threats.length} threat traces).`, 'success');
  };

  const handleSimulateIntruderInteraction = (lureId: string) => {
    onAddConsoleLog(`Forensic alert: Unsanctioned DNS resolution triggered on lure reference: ${lureId}`, 'error');
    onTriggerLureAlert(lureId);
    setActiveView('THREATS');
  };

  const getWatermarkBadgeStyle = (type: Lure['watermarkType']) => {
    switch (type) {
      case 'Linguistic': return 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/5';
      case 'Metadata': return 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/5';
      case 'Steganographic': return 'border-cyber-green text-cyber-green bg-cyber-green/5';
      case 'Hybrid': return 'border-cyber-green text-cyber-green bg-cyber-green/5 animate-pulse';
    }
  };

  const getCadlLevelBadge = (level: number) => {
    switch (level) {
      case 5:
        return 'border-cyber-red bg-cyber-red/20 text-cyber-red animate-pulse font-bold';
      case 4:
        return 'border-cyber-red/80 bg-cyber-red/10 text-cyber-red font-semibold';
      case 3:
        return 'border-orange-500/70 bg-orange-500/10 text-orange-400 font-semibold';
      case 2:
        return 'border-cyber-yellow/70 bg-cyber-yellow/10 text-cyber-yellow font-medium';
      default:
        return 'border-cyber-cyan/60 bg-cyber-cyan/10 text-cyber-cyan';
    }
  };

  // Filtered threats
  const filteredThreats = threats.filter(t => {
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? !t.resolved :
      t.resolved;

    const matchesSearch = 
      searchQuery.trim() === '' ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sourceNode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.actionTaken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.details.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const activeThreatsCount = threats.filter(t => !t.resolved).length;

  return (
    <div className="flex flex-col gap-5 h-full">

      {/* Top Header & Forensic Telemetry Overview Bar */}
      <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/80 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title and stats */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-gray-100 text-base tracking-wide">Attribution Database (ADB) Ledger</h2>
              <span className="px-1.5 py-0.5 rounded border border-cyber-cyan/40 bg-cyber-cyan/10 text-[9px] font-mono text-cyber-cyan">
                FORENSIC REGISTRY
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              REAL-TIME CANARY DISCLOSURES & PACKET DEEP-DIVE ANALYSIS
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* View Toggle Tabs */}
          <div className="bg-cyber-dark p-1 rounded border border-cyber-border flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setActiveView('THREATS')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-2 ${
                activeView === 'THREATS'
                  ? 'bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan font-bold shadow-[0_0_8px_rgba(6,225,249,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>THREAT INCIDENTS</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeThreatsCount > 0 
                  ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/50 animate-pulse' 
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {threats.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('LURES')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-2 ${
                activeView === 'LURES'
                  ? 'bg-cyber-green/20 border border-cyber-green text-cyber-green font-bold shadow-[0_0_8px_rgba(5,243,161,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CANARY TRAPS</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-gray-800 text-gray-400">
                {lures.length}
              </span>
            </button>
          </div>

          {/* Export JSON Button */}
          <button
            type="button"
            onClick={handleDownloadLedger}
            className="text-cyber-cyan hover:text-white transition-all border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 rounded px-3 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer"
            title="Download Full ADB Forensic JSON Ledger"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT ADB LEDGER</span>
          </button>

        </div>
      </div>

      {/* VIEW 1: THREAT INCIDENTS LIST WITH EXPANDABLE DEEP-DIVE PACKET TRACES */}
      {activeView === 'THREATS' && (
        <div className="flex flex-col gap-4 flex-1">
          
          {/* Threat List Filters & Quick Simulation Bar */}
          <div className="p-3.5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
            
            {/* Search and status filter */}
            <div className="flex flex-1 items-center gap-2.5">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by IP, Node, T-ID, or protocol..."
                  className="w-full bg-cyber-dark/90 text-gray-200 pl-8 pr-3 py-1.5 rounded border border-cyber-border focus:border-cyber-cyan focus:outline-none text-xs"
                />
              </div>

              {/* Status filter buttons */}
              <div className="flex items-center gap-1 bg-cyber-dark/80 p-1 rounded border border-cyber-border">
                {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-2 py-0.5 rounded text-[10px] uppercase transition-all ${
                      statusFilter === filter
                        ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 font-bold'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Simulate Attack Ingress Buttons */}
            {onSimulateThreat && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyber-yellow" />
                  Simulate Ingress:
                </span>
                <button
                  onClick={() => onSimulateThreat('DNS_CANARY')}
                  className="px-2 py-1 rounded border border-cyber-red/50 bg-cyber-red/10 text-cyber-red hover:bg-cyber-red/20 text-[10px] font-bold transition-all"
                  title="Simulate DNS Honeytoken resolution probe"
                >
                  + Canary Hit
                </button>
                <button
                  onClick={() => onSimulateThreat('PORT_SCAN')}
                  className="px-2 py-1 rounded border border-cyber-yellow/50 bg-cyber-yellow/10 text-cyber-yellow hover:bg-cyber-yellow/20 text-[10px] font-bold transition-all"
                  title="Simulate TCP SYN port reconnaissance"
                >
                  + Port Scan
                </button>
                <button
                  onClick={() => onSimulateThreat('MEMORY_TAMPER')}
                  className="px-2 py-1 rounded border border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 text-[10px] font-bold transition-all"
                  title="Simulate ptrace / memory scraper hook"
                >
                  + Memory Scraper
                </button>
              </div>
            )}

          </div>

          {/* Threats Accordion List */}
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {filteredThreats.length === 0 ? (
              <div className="p-10 rounded-lg border border-dashed border-cyber-border bg-cyber-panel/30 flex flex-col items-center justify-center gap-3 text-center">
                <ShieldCheck className="w-10 h-10 text-cyber-green opacity-40" />
                <div className="font-mono text-gray-300 text-sm">NO THREAT INCIDENTS FOUND MATCHING CRITERIA</div>
                <div className="text-xs text-gray-500 font-mono max-w-md">
                  All active adversary reconnaissance probes are either resolved or filtered out. Trigger a canary trap or inject an ingress event above to test packet analysis.
                </div>
              </div>
            ) : (
              filteredThreats.map((threat) => {
                const isExpanded = expandedThreatId === threat.id;
                const trace = getPacketTrace(threat);
                const currentSubTab = getActiveSubTab(threat.id);

                return (
                  <div 
                    key={threat.id}
                    className={`rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                      isExpanded 
                        ? 'border-cyber-cyan/80 bg-cyber-panel/95 shadow-[0_4px_20px_rgba(6,225,249,0.12)]' 
                        : 'border-cyber-border bg-cyber-panel/60 hover:border-cyber-cyan/40 hover:bg-cyber-panel/80'
                    }`}
                  >
                    
                    {/* Collapsed Header / Summary Row */}
                    <div 
                      onClick={() => handleToggleExpand(threat.id)}
                      className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      {/* Left: ID, Chevron, Severity, Node, Action */}
                      <div className="flex items-center gap-3 flex-wrap flex-1">
                        <button 
                          className="p-1 rounded hover:bg-cyber-dark text-cyber-cyan transition-colors"
                          aria-label="Toggle packet analysis details"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-cyber-cyan" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        <div className="font-mono font-bold text-sm text-gray-100 flex items-center gap-2">
                          <span className="text-cyber-cyan">{threat.id}</span>
                          <span className="text-[10px] text-gray-500 font-normal">
                            {new Date(threat.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>

                        {/* CADL Escalation Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getCadlLevelBadge(threat.level)}`}>
                          CADL LVL {threat.level}
                        </span>

                        {/* Action Taken */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-cyber-border bg-cyber-dark text-gray-200 font-semibold flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-cyber-cyan" />
                          {threat.actionTaken}
                        </span>

                        {/* Node & IP */}
                        <div className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
                          <span className="text-gray-400">Node:</span>
                          <span className="text-gray-100 font-semibold">{threat.sourceNode}</span>
                          <span className="text-gray-500 font-mono text-[11px]">({threat.sourceIp})</span>
                        </div>
                      </div>

                      {/* Right: Protocol badge, status badge, Deep Dive indicator */}
                      <div className="flex items-center gap-2.5 self-end lg:self-auto font-mono text-xs">
                        
                        {/* Protocol badge */}
                        <span className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-border/80 text-[10px] text-cyber-cyan font-bold">
                          {trace.header.protocol}
                        </span>

                        {/* Threat score */}
                        <span className="px-2 py-0.5 rounded bg-cyber-dark border border-cyber-red/40 text-[10px] text-cyber-red font-bold">
                          SCORE {trace.payload.heuristicThreatScore}/100
                        </span>

                        {/* Incident Status */}
                        {threat.resolved ? (
                          <span className="px-2 py-0.5 rounded border border-cyber-green/40 text-cyber-green bg-cyber-green/5 text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            CONTAINED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded border border-cyber-red/60 text-cyber-red bg-cyber-red/10 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            ACTIVE BREACH
                          </span>
                        )}

                        {/* Expandable trigger prompt */}
                        <span className="text-[10px] text-cyber-cyan flex items-center gap-1 font-semibold ml-1">
                          {isExpanded ? 'COLLAPSE' : 'DEEP DIVE'}
                        </span>
                      </div>
                    </div>

                    {/* EXPANDABLE SECTION: Simulated Deep-Dive Packet Analysis Trace */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="border-t-2 border-cyber-border bg-cyber-dark/95"
                        >
                          <div className="p-4 flex flex-col gap-4 font-mono">
                            
                            {/* Trace Action Bar & Sub-Tabs Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyber-border/70">
                              
                              {/* Sub Navigation */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => setSubTabForThreat(threat.id, 'DISSECTION')}
                                  className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                                    currentSubTab === 'DISSECTION'
                                      ? 'bg-cyber-cyan text-cyber-dark font-bold'
                                      : 'bg-cyber-panel text-gray-400 hover:text-gray-200 border border-cyber-border'
                                  }`}
                                >
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>1. Dissection & Architecture</span>
                                </button>

                                <button
                                  onClick={() => setSubTabForThreat(threat.id, 'HOPS')}
                                  className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                                    currentSubTab === 'HOPS'
                                      ? 'bg-cyber-cyan text-cyber-dark font-bold'
                                      : 'bg-cyber-panel text-gray-400 hover:text-gray-200 border border-cyber-border'
                                  }`}
                                >
                                  <Network className="w-3.5 h-3.5" />
                                  <span>2. Hop Sequence Trace ({trace.hopSequence.length})</span>
                                </button>

                                <button
                                  onClick={() => setSubTabForThreat(threat.id, 'HEX')}
                                  className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                                    currentSubTab === 'HEX'
                                      ? 'bg-cyber-cyan text-cyber-dark font-bold'
                                      : 'bg-cyber-panel text-gray-400 hover:text-gray-200 border border-cyber-border'
                                  }`}
                                >
                                  <FileCode className="w-3.5 h-3.5" />
                                  <span>3. Raw Hex Stream</span>
                                </button>

                                <button
                                  onClick={() => setSubTabForThreat(threat.id, 'RULES')}
                                  className={`px-3 py-1 rounded text-xs transition-all flex items-center gap-1.5 ${
                                    currentSubTab === 'RULES'
                                      ? 'bg-cyber-cyan text-cyber-dark font-bold'
                                      : 'bg-cyber-panel text-gray-400 hover:text-gray-200 border border-cyber-border'
                                  }`}
                                >
                                  <ShieldAlert className="w-3.5 h-3.5" />
                                  <span>4. IDS Signatures & Containment</span>
                                </button>
                              </div>

                              {/* Action controls (PCAP download + Resolve) */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadPcap(trace, threat.id)}
                                  className="px-2.5 py-1 rounded border border-cyber-cyan/50 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan hover:text-white transition-all text-xs flex items-center gap-1.5"
                                  title="Download Raw PCAP File for Wireshark"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>DOWNLOAD .PCAP</span>
                                </button>

                                {onResolveThreat && (
                                  <button
                                    onClick={() => onResolveThreat(threat.id)}
                                    className={`px-2.5 py-1 rounded border transition-all text-xs flex items-center gap-1.5 font-bold ${
                                      threat.resolved
                                        ? 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200'
                                        : 'border-cyber-green/60 bg-cyber-green/10 hover:bg-cyber-green/20 text-cyber-green hover:text-white'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{threat.resolved ? 'RE-OPEN' : 'RESOLVE INCIDENT'}</span>
                                  </button>
                                )}
                              </div>

                            </div>

                            {/* SUBTAB 1: DISSECTION & ARCHITECTURE */}
                            {currentSubTab === 'DISSECTION' && (
                              <div className="flex flex-col gap-4">
                                
                                {/* 5-Tuple Network Header Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                                  <div className="p-2 rounded bg-cyber-panel/70 border border-cyber-border">
                                    <div className="text-[10px] text-gray-500 uppercase">Protocol</div>
                                    <div className="text-cyber-cyan font-bold">{trace.header.protocol}</div>
                                  </div>
                                  <div className="p-2 rounded bg-cyber-panel/70 border border-cyber-border">
                                    <div className="text-[10px] text-gray-500 uppercase">Source Endpoint</div>
                                    <div className="text-gray-200 font-bold truncate">{trace.header.srcIp}:{trace.header.srcPort}</div>
                                  </div>
                                  <div className="p-2 rounded bg-cyber-panel/70 border border-cyber-border">
                                    <div className="text-[10px] text-gray-500 uppercase">Destination Endpoint</div>
                                    <div className="text-gray-200 font-bold truncate">{trace.header.dstIp}:{trace.header.dstPort}</div>
                                  </div>
                                  <div className="p-2 rounded bg-cyber-panel/70 border border-cyber-border">
                                    <div className="text-[10px] text-gray-500 uppercase">Frame Size</div>
                                    <div className="text-gray-300 font-bold">{trace.header.frameLengthBytes} Bytes</div>
                                  </div>
                                  <div className="p-2 rounded bg-cyber-panel/70 border border-cyber-border">
                                    <div className="text-[10px] text-gray-500 uppercase">TTL / DSCP</div>
                                    <div className="text-gray-300 font-bold">{trace.header.ttl} / {trace.header.dscpClass || 'CS0'}</div>
                                  </div>
                                  <div className="p-2 rounded bg-cyber-panel/70 border border-cyber-border">
                                    <div className="text-[10px] text-gray-500 uppercase">L4 Checksum</div>
                                    <div className="text-cyber-green font-bold">{trace.header.checksum} (OK)</div>
                                  </div>
                                </div>

                                {/* Threat Intelligence & MITRE Classification */}
                                <div className="p-3 rounded bg-cyber-panel/40 border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="flex items-center gap-4 flex-wrap">
                                    <div>
                                      <span className="text-[10px] text-gray-500 uppercase block">MITRE ATT&CK Tactic</span>
                                      <span className="text-xs text-cyber-yellow font-bold">{trace.payload.mitreAttackTactic}</span>
                                    </div>
                                    <div className="border-l border-cyber-border pl-4">
                                      <span className="text-[10px] text-gray-500 uppercase block">Technique ID</span>
                                      <span className="text-xs text-cyber-cyan font-bold">{trace.payload.mitreTechniqueId}</span>
                                    </div>
                                    <div className="border-l border-cyber-border pl-4">
                                      <span className="text-[10px] text-gray-500 uppercase block">Entropy Density</span>
                                      <span className="text-xs text-cyber-green font-bold">{trace.payload.payloadEntropy} bits/byte</span>
                                    </div>
                                  </div>

                                  {/* Threat score progress */}
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <div className="text-[10px] text-gray-500 uppercase">Threat Confidence</div>
                                      <div className="text-xs font-bold text-cyber-red">{trace.payload.heuristicThreatScore}% CRITICAL</div>
                                    </div>
                                    <div className="w-24 h-2 rounded bg-cyber-dark overflow-hidden border border-cyber-border">
                                      <div 
                                        className="h-full bg-gradient-to-r from-cyber-yellow to-cyber-red" 
                                        style={{ width: `${trace.payload.heuristicThreatScore}%` }} 
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Dissected Protocol Fields Table */}
                                <div className="rounded border border-cyber-border overflow-hidden">
                                  <div className="px-3 py-1.5 bg-cyber-panel/80 border-b border-cyber-border text-[10px] text-gray-400 uppercase tracking-wider flex justify-between items-center">
                                    <span>Dissected Protocol Fields (Wireshark PDML Representation)</span>
                                    <span className="text-cyber-cyan">Capture: {trace.captureId} on {trace.interfaceName}</span>
                                  </div>
                                  <div className="divide-y divide-cyber-border/50 text-xs">
                                    {Object.entries(trace.payload.dissectedFields).map(([key, val]) => (
                                      <div key={key} className="px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-cyber-panel/30 transition-colors">
                                        <span className="text-gray-400 text-xs font-semibold">{key}:</span>
                                        <span className="text-cyber-green font-mono text-xs">{val}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                              </div>
                            )}

                            {/* SUBTAB 2: HOP SEQUENCE & ROUTE FORENSICS */}
                            {currentSubTab === 'HOPS' && (
                              <div className="flex flex-col gap-4">
                                <div className="text-xs text-gray-400">
                                  Sequential packet traversal verified through physical promiscuous taps, BGP edge gateways, and honey-sink nodes:
                                </div>

                                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-cyber-border">
                                  {trace.hopSequence.map((hop, idx) => (
                                    <div key={idx} className="relative flex items-start gap-4">
                                      {/* Hop badge circle */}
                                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                                        hop.status === 'SINKHOLE'
                                          ? 'border-cyber-red bg-cyber-red/20 text-cyber-red'
                                          : hop.status === 'INTERCEPTED'
                                            ? 'border-cyber-yellow bg-cyber-yellow/20 text-cyber-yellow'
                                            : 'border-cyber-cyan bg-cyber-cyan/20 text-cyber-cyan'
                                      }`}>
                                        {hop.hopIndex}
                                      </div>

                                      {/* Hop Content Card */}
                                      <div className="flex-1 p-3 rounded bg-cyber-panel/60 border border-cyber-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-100 text-xs">{hop.node}</span>
                                            <span className="text-cyber-cyan text-[11px]">({hop.ip})</span>
                                          </div>
                                          <div className="text-[10px] text-gray-400 mt-0.5">
                                            Location: <span className="text-gray-300">{hop.location}</span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-end sm:self-auto">
                                          <div className="text-right">
                                            <div className="text-[9px] text-gray-500 uppercase">Layer</div>
                                            <div className="text-[11px] text-gray-300">{hop.protocolLayer}</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-[9px] text-gray-500 uppercase">Delta Latency</div>
                                            <div className="text-[11px] text-cyber-green font-bold">+{hop.latencyMs} ms</div>
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                            hop.status === 'SINKHOLE'
                                              ? 'border-cyber-red text-cyber-red bg-cyber-red/10 animate-pulse'
                                              : hop.status === 'INTERCEPTED'
                                                ? 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10'
                                                : 'border-cyber-green text-cyber-green bg-cyber-green/10'
                                          }`}>
                                            {hop.status}
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* SUBTAB 3: RAW HEX STREAM DUMP */}
                            {currentSubTab === 'HEX' && (
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <span>Raw Packet Frame Hex Dump (Standard tcpdump / Wireshark Octets)</span>
                                  <button
                                    onClick={() => handleCopyText(trace.payload.rawHex, `hex-${threat.id}`, 'Raw Hex Dump')}
                                    className="px-2 py-0.5 rounded border border-cyber-border hover:border-cyber-cyan text-gray-300 hover:text-cyber-cyan transition-colors text-[10px] flex items-center gap-1"
                                  >
                                    {copiedKey === `hex-${threat.id}` ? (
                                      <>
                                        <Check className="w-3 h-3 text-cyber-green" />
                                        <span className="text-cyber-green">COPIED</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>COPY HEX</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Hex Dump Viewer */}
                                <div className="p-3 bg-black/90 rounded border border-cyber-border/90 font-mono text-[11px] leading-relaxed overflow-x-auto select-all text-cyber-green">
                                  {trace.payload.hexDump.map((line, idx) => (
                                    <div key={idx} className="whitespace-pre hover:bg-cyber-cyan/10 px-1 rounded transition-colors">
                                      {line}
                                    </div>
                                  ))}
                                </div>

                                {/* ASCII Representation */}
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] text-gray-500 uppercase">Ascii Decoded Payload Stream:</span>
                                  <div className="p-2.5 bg-cyber-panel/60 rounded border border-cyber-border text-xs text-cyber-cyan font-mono whitespace-pre-wrap">
                                    {trace.payload.asciiRepresentation}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB 4: IDS SIGNATURES & CONTAINMENT */}
                            {currentSubTab === 'RULES' && (
                              <div className="flex flex-col gap-4">
                                
                                {/* Snort Signature */}
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-300 font-bold flex items-center gap-1.5">
                                      <ShieldAlert className="w-3.5 h-3.5 text-cyber-yellow" />
                                      Snort / Suricata IDS Signature Rule:
                                    </span>
                                    <button
                                      onClick={() => handleCopyText(trace.snortRuleSignature, `snort-${threat.id}`, 'Snort IDS Rule')}
                                      className="text-[10px] text-cyber-cyan hover:text-white flex items-center gap-1 border border-cyber-cyan/40 px-2 py-0.5 rounded hover:bg-cyber-cyan/20 transition-all"
                                    >
                                      {copiedKey === `snort-${threat.id}` ? (
                                        <>
                                          <Check className="w-3 h-3 text-cyber-green" />
                                          <span className="text-cyber-green">COPIED</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>COPY RULE</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="p-2.5 bg-cyber-panel rounded border border-cyber-border text-xs font-mono text-cyber-yellow whitespace-pre-wrap select-all">
                                    {trace.snortRuleSignature}
                                  </div>
                                </div>

                                {/* Wireshark Filter */}
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-300 font-bold flex items-center gap-1.5">
                                      <Search className="w-3.5 h-3.5 text-cyber-cyan" />
                                      Wireshark Display Filter:
                                    </span>
                                    <button
                                      onClick={() => handleCopyText(trace.wiresharkFilter, `filter-${threat.id}`, 'Wireshark Filter')}
                                      className="text-[10px] text-cyber-cyan hover:text-white flex items-center gap-1 border border-cyber-cyan/40 px-2 py-0.5 rounded hover:bg-cyber-cyan/20 transition-all"
                                    >
                                      {copiedKey === `filter-${threat.id}` ? (
                                        <>
                                          <Check className="w-3 h-3 text-cyber-green" />
                                          <span className="text-cyber-green">COPIED</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>COPY FILTER</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="p-2.5 bg-cyber-panel rounded border border-cyber-border text-xs font-mono text-cyber-cyan whitespace-pre-wrap select-all">
                                    {trace.wiresharkFilter}
                                  </div>
                                </div>

                                {/* Containment Directive */}
                                <div className="p-3 rounded bg-cyber-red/10 border border-cyber-red/40 flex flex-col gap-1.5">
                                  <span className="text-xs font-bold text-cyber-red flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Ghost-Watch Tactical Containment Recommendation:
                                  </span>
                                  <p className="text-xs text-gray-200 leading-relaxed font-mono">
                                    {trace.containmentRecommendation}
                                  </p>
                                </div>

                              </div>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* VIEW 2: CANARY TRAPS REGISTRY & FORENSICS (ORIGINAL VIEW ENHANCED) */}
      {activeView === 'LURES' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1">
          
          {/* Left: Canary Lures Table (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-2">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-cyber-green" />
                  <div>
                    <h3 className="font-display font-medium text-gray-100">Canary Trap Ledger Records</h3>
                    <p className="text-[10px] text-gray-400 font-mono">POST-QUANTUM WATERMARKED HONEYTOKEN ARRAYS</p>
                  </div>
                </div>
                <div className="text-xs font-mono text-gray-400 bg-cyber-dark/80 border border-cyber-border rounded px-2.5 py-1">
                  TOTAL LURES: <span className="text-cyber-green">{lures.length}</span>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                {lures.length === 0 ? (
                  <div className="h-[300px] flex flex-col items-center justify-center border border-dashed border-cyber-border text-xs font-mono text-gray-500 gap-2 rounded">
                    <HardDrive className="w-8 h-8 opacity-30 text-cyber-cyan" />
                    <span>NO CANARY TRAPS INJECTED UNTIL RE-CONFIG</span>
                    <span className="text-[10px] text-gray-600">Head to the 'Canary Trap Factory' tab to deploy the first trap.</span>
                  </div>
                ) : (
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-cyber-border/80 text-[10px] text-gray-500 uppercase tracking-widest bg-cyber-dark/40">
                        <th className="py-2.5 px-3">Lure ID</th>
                        <th className="py-2.5 px-3">Target Host</th>
                        <th className="py-2.5 px-3">Paradigm</th>
                        <th className="py-2.5 px-3">Canary Resolv Token</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cyber-border/40">
                      {lures.map((lure) => {
                        const isSelected = selectedLureId === lure.id || (selectedLureId === null && selectedLure?.id === lure.id);
                        return (
                          <tr 
                            key={lure.id}
                            onClick={() => setSelectedLureId(lure.id)}
                            className={`hover:bg-cyber-dark/40 transition-colors cursor-pointer ${
                              isSelected ? 'bg-cyber-cyan/5 border-l-2 border-l-cyber-cyan' : ''
                            }`}
                          >
                            <td className="py-3 px-3 font-semibold text-gray-200">{lure.id}</td>
                            <td className="py-3 px-3 text-gray-300">{lure.targetNode}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getWatermarkBadgeStyle(lure.watermarkType)}`}>
                                {lure.watermarkType}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-cyber-cyan">{lure.dnsToken}</td>
                            <td className="py-3 px-3 text-center">
                              {lure.isTriggered ? (
                                <span className="px-2 py-0.5 rounded border border-cyber-red/60 text-cyber-red bg-cyber-red/5 font-bold animate-pulse text-[9px]">
                                  ALERT: COMPROMISED
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded border border-cyber-green-dim text-cyber-green bg-cyber-green/5 text-[9px]">
                                  SECURE / DORMANT
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right space-x-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => handleSimulateIntruderInteraction(lure.id)}
                                className="bg-cyber-red/10 border border-cyber-red/40 hover:bg-cyber-red/25 text-cyber-red hover:text-white px-1.5 py-0.5 rounded text-[10px] transition-all font-bold"
                                title="Simulate intrusion trigger & open threat packet trace"
                              >
                                TRIGGER
                              </button>
                              <button
                                onClick={() => {
                                  onRemoveLure(lure.id);
                                  onAddConsoleLog(`Canary lure record purged: ${lure.id}`, 'warn');
                                }}
                                className="text-gray-500 hover:text-cyber-red p-1 rounded transition-colors inline-block align-middle"
                                title="Purge record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right: Canary Forensic Metadata Inspector (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full min-h-[400px]">
              <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
                <ShieldAlert className="w-5 h-5 text-cyber-yellow" />
                <h3 className="font-display font-medium text-gray-100">Lure Forensic Metadata</h3>
              </div>

              {selectedLure ? (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto font-mono text-xs max-h-[450px] scrollbar-thin">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 border border-cyber-border bg-cyber-dark/40 rounded">
                      <div className="text-gray-500">LURE ID</div>
                      <div className="text-cyber-cyan font-bold truncate">{selectedLure.id}</div>
                    </div>
                    <div className="p-2 border border-cyber-border bg-cyber-dark/40 rounded">
                      <div className="text-gray-500">TRIGGER STATS</div>
                      <div className={selectedLure.isTriggered ? 'text-cyber-red' : 'text-cyber-green'}>
                        {selectedLure.isTriggered ? `ACTIVATED (${selectedLure.triggerCount} RESOLV)` : '0 SEEN'}
                      </div>
                    </div>
                  </div>

                  {/* Watermark detail boxes */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-gray-500">COMPROMISED TIME:</span>
                    <div className="p-2.5 bg-cyber-dark rounded border border-cyber-border scrollbar-thin overflow-y-auto max-h-[100px] leading-relaxed">
                      {selectedLure.isTriggered ? (
                        <span className="text-cyber-red">
                          [ALERT] Exfil timestamp recorded: {new Date().toISOString().substring(0, 19)} UTC from diagnostic terminal node tracking source vectors.
                        </span>
                      ) : (
                        <span className="text-gray-500">Dormant. Waiting for DNS handshakes...</span>
                      )}
                    </div>
                  </div>

                  {selectedLure.details.shiftsApplied && selectedLure.details.shiftsApplied.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500">WE-FORGE APPLIED BINS:</span>
                      <div className="p-2 bg-cyber-dark/80 rounded border border-cyber-border text-[10px] space-y-1">
                        {selectedLure.details.shiftsApplied.map((shift, idx) => (
                          <div key={idx} className="text-cyber-yellow leading-snug">
                            • {shift}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLure.details.metadataTags && Object.keys(selectedLure.details.metadataTags).length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500">INJECTED RECORD HEADERS:</span>
                      <div className="p-2 bg-cyber-dark/80 rounded border border-cyber-border text-[10px] space-y-1">
                        {Object.entries(selectedLure.details.metadataTags).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-400">{k}:</span>
                            <span className="text-cyber-green">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLure.details.stegoOffsetHex && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500">STEGANOGRAPHY TRACE:</span>
                      <div className="p-2 bg-cyber-dark/80 rounded border border-cyber-border text-[10px] flex justify-between">
                        <span className="text-gray-400">Byte Index Offset:</span>
                        <span className="text-cyber-cyan">{selectedLure.details.stegoOffsetHex}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-500 font-mono">
                  Inquire active ledger lures to inspect
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
