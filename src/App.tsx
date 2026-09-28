import React, { useState, useEffect } from 'react';
import { 
  Shield, Cpu, AlertTriangle, Radio, HelpCircle, LayoutGrid, 
  Settings, FolderKanban, Terminal, Activity, FileWarning, KeyRound,
  ShieldAlert, Crosshair, Users, Power, Download, Network, Eye, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Core types
import { Lure, ThreatEvent } from './types';
import { generatePacketTraceForThreat } from './services/PacketAnalysisEngine';

// Custom subcomponents
import CommandCenter from './components/CommandCenter';
import CanaryTrapFactory from './components/CanaryTrapFactory';
import AttributionDatabase from './components/AttributionDatabase';
import PalantirOntology from './components/PalantirOntology';
import AegisDefenseSimulator from './components/AegisDefenseSimulator';
import DeceptionEscalator from './components/DeceptionEscalator';
import CerberusScanner from './components/CerberusScanner';
import OmegaContingency from './components/OmegaContingency';
import LazarusMeshViewer from './components/LazarusMeshViewer';
import GorgonAntiTamperViewer from './components/GorgonAntiTamperViewer';

type TabId = 
  | 'COMMAND_CENTER' 
  | 'CANARY_FACTORY' 
  | 'ADB_LEDGER' 
  | 'PALANTIR_ONTOLOGY' 
  | 'AEGIS_RADAR' 
  | 'CADL_DECEPTION' 
  | 'CERBERUS_SCANNER' 
  | 'LAZARUS_MESH'
  | 'GORGON_ANTITAMPER'
  | 'OMEGA_CONTINGENCY';

const SECURE_TIME_ZONE = "UTC-07:00 (Pacific Time)";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('COMMAND_CENTER');
  
  // Terminal system state
  const [hardwareBoundId] = useState('HB-9982-AX-2026');
  const [pqcStatus] = useState('ML-KEM-768/ML-DSA-65 Hybrid');
  const [isWiped, setIsWiped] = useState(false);
  const [warningAlertActive, setWarningAlertActive] = useState(false);

  // Active terminal logs feed
  const [logsList, setLogsList] = useState<Array<{ id: string; text: string; time: string; type: 'info' | 'warn' | 'error' | 'success' }>>([
    { id: '1', text: "Ghost-Watch main terminal bound to hardware secure element HB-9982-AX-2026.", time: "12:24:50", type: 'success' },
    { id: '2', text: "915.0 MHz LoRa Mesh-net out-of-band transmitter engaged in listening mode.", time: "12:24:52", type: 'info' },
    { id: '3', text: "NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) active shared-secret modules initialized.", time: "12:24:53", type: 'success' },
    { id: '4', text: "Attribution Database Ledger state mapped to high-integrity secure sync indices.", time: "12:25:01", type: 'info' }
  ]);

  // Seed default items in Canary Trap DB (ACTS)
  const [lures, setLures] = useState<Lure[]>([
    {
      id: 'GW-LURE_2026_5911_A9FC',
      targetNode: 'vortex.ghost.watch.local',
      dnsToken: 'audit-vault-77.vortex.watch.local',
      documentType: 'NIST FIPS 213 (ML-KEM-768) Secret Parameter Set',
      watermarkType: 'Linguistic',
      details: {
        originalText: "The module lattice-based key encapsulation mechanism utilizes an integer matrix division of 768 to establish a shared secret.",
        watermarkedText: "The module lattice-based key encapsulation mechanism utilizes an integer matrix division of [ALTERED: 752 (modified polynomial constraint)] to establish a shared secret.",
        shiftsApplied: ["Replaced '768' with '752 (modified polynomial constraint)'"]
      },
      createdTimestamp: "2026-06-21T12:24:00.000Z",
      isTriggered: false,
      triggerCount: 0
    },
    {
      id: 'GW-LURE_2026_8192_A9FC',
      targetNode: 'neon.ghost.watch.local',
      dnsToken: 'audit-vault-119.neon.watch.local',
      documentType: 'LoRa Mesh-Net Radio Relay Network Routing Strategy',
      watermarkType: 'Steganographic',
      details: {
        stegoOffsetHex: "0x40B3",
        stegoPayloadSize: "4.2 KB"
      },
      createdTimestamp: "2026-06-21T12:24:32.000Z",
      isTriggered: false,
      triggerCount: 0
    }
  ]);

  // Active threats telemetry list
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>(() => {
    const defaultThreats: ThreatEvent[] = [
      {
        id: 'T-108',
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        sourceIp: "194.202.91.72",
        sourceNode: "External APT-29 Exfil Cluster",
        actionTaken: "CANARY TRIGGERED",
        level: 3,
        details: "Adversary resolved DNS canary token [audit-vault-92.ghost.watch.local]. Active file reading identified.",
        resolved: false
      },
      {
        id: 'T-105',
        timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        sourceIp: "84.17.51.109",
        sourceNode: "Automated Recon Crawler",
        actionTaken: "SYN Stealth Scan",
        level: 2,
        details: "Half-open TCP SYN port sweeps tracking PostgreSQL (5432) and REST C2 (8080) endpoints.",
        resolved: false
      },
      {
        id: 'T-102',
        timestamp: "2026-06-21T12:24:55.000Z",
        sourceIp: "194.202.91.44",
        sourceNode: "External Probe Gateway (APT-37)",
        actionTaken: "Passive Sniffer Audit",
        level: 1,
        details: "Lateral host scans tracking default PostgreSQL ports on local subnets.",
        resolved: true
      }
    ];

    return defaultThreats.map(t => ({
      ...t,
      packetTrace: generatePacketTraceForThreat(t)
    }));
  });

  // Shared alert check
  useEffect(() => {
    const hasTriggeredLure = lures.some(l => l.isTriggered);
    const activeThreatCount = threatEvents.some(t => !t.resolved);
    setWarningAlertActive(hasTriggeredLure || activeThreatCount);
  }, [lures, threatEvents]);

  // Log modifier
  const addSystemLog = (text: string, type: 'info' | 'warn' | 'error' | 'success' = 'info') => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logId = String(Math.random() * 100000);
    setLogsList(prev => [...prev, { id: logId, text, time: timeStr, type }]);
  };

  // Add customized lure to global array
  const handleRegisterLure = (lure: Lure) => {
    setLures(prev => [lure, ...prev]);
  };

  // Quick command generator for CommandCenter or Scanner trigger
  const handleRegisterLureQuick = (nodeName: string, docType: string, watermark: 'Linguistic' | 'Metadata' | 'Steganographic') => {
    const generatedId = `GW-LURE_2026_${Math.floor(Math.random() * 9000 + 1000)}_A9FC`;
    const generatedDnsToken = `audit-vault-${Math.floor(Math.random() * 800 + 100)}.${nodeName.replace('.local', '')}.local`;
    
    const newLure: Lure = {
      id: generatedId,
      targetNode: nodeName,
      dnsToken: generatedDnsToken,
      documentType: docType,
      watermarkType: watermark,
      details: {
        shiftsApplied: ["Custom administrative rapid inject triggered."]
      },
      createdTimestamp: new Date().toISOString(),
      isTriggered: false,
      triggerCount: 0
    };
    setLures(prev => [newLure, ...prev]);
  };

  // Handle simulated DNS trigger of a lure (Compromise simulation)
  const handleTriggerLureAlert = (lureId: string) => {
    setLures(prev => prev.map(l => {
      if (l.id === lureId) {
        return { ...l, isTriggered: true, triggerCount: l.triggerCount + 1 };
      }
      return l;
    }));

    // Spawn a matching active threat event
    const sourceIp = "194.202.91." + Math.floor(Math.random() * 250 + 2);
    const targetLure = lures.find(l => l.id === lureId);

    const newThreat: ThreatEvent = {
      id: `T-${Math.floor(Math.random() * 900 + 100)}`,
      timestamp: new Date().toISOString(),
      sourceIp: sourceIp,
      sourceNode: targetLure ? targetLure.targetNode : 'Unspecified Client',
      targetLureId: lureId,
      actionTaken: "CANARY TRIGGERED",
      level: 3, // CADL Reroute Honeypot Trigger Point
      details: `Adversary resolved unique DNS canary token [${targetLure?.dnsToken}] indicating active file reading.`,
      resolved: false
    };
    newThreat.packetTrace = generatePacketTraceForThreat(newThreat, targetLure);

    setThreatEvents(prev => [newThreat, ...prev]);
    addSystemLog(`CRITICAL: Canary breach registered on token: ${targetLure?.dnsToken || lureId}! Dispatching CADL containment systems!`, 'error');
  };

  const handleResolveThreat = (threatId: string) => {
    setThreatEvents(prev => prev.map(t => t.id === threatId ? { ...t, resolved: !t.resolved } : t));
    const target = threatEvents.find(t => t.id === threatId);
    const newStatus = target?.resolved ? 're-opened for forensic review' : 'marked as resolved / contained';
    addSystemLog(`Threat incident ${threatId} ${newStatus}.`, 'success');
  };

  const handleSimulateThreat = (type: 'DNS_CANARY' | 'PORT_SCAN' | 'MEMORY_TAMPER' | 'MULTIPASS') => {
    const id = `T-${Math.floor(Math.random() * 900 + 100)}`;
    const randomIp = `194.202.${Math.floor(Math.random() * 90 + 10)}.${Math.floor(Math.random() * 250 + 2)}`;
    let newThreat: ThreatEvent;

    if (type === 'DNS_CANARY') {
      const targetLure = lures[0];
      newThreat = {
        id,
        timestamp: new Date().toISOString(),
        sourceIp: randomIp,
        sourceNode: "CozyBear APT-29 C2 Relay",
        actionTaken: "CANARY TRIGGERED",
        targetLureId: targetLure?.id,
        level: 3,
        details: `Adversary resolved DNS canary token [${targetLure?.dnsToken || 'audit-vault-92.ghost.watch.local'}]. Exfiltration detected.`,
        resolved: false,
      };
    } else if (type === 'PORT_SCAN') {
      newThreat = {
        id,
        timestamp: new Date().toISOString(),
        sourceIp: randomIp,
        sourceNode: "Recon-Bot-Cluster (APT-37)",
        actionTaken: "SYN Stealth Scan",
        level: 2,
        details: "Rapid half-open TCP SYN probe against internal C2 endpoints on port 5432 and 8080.",
        resolved: false,
      };
    } else if (type === 'MEMORY_TAMPER') {
      newThreat = {
        id,
        timestamp: new Date().toISOString(),
        sourceIp: "127.0.0.1",
        sourceNode: "Local Injected Process (Ring-3 Hook)",
        actionTaken: "Volatile Memory Scraper",
        level: 4,
        details: "ptrace attach probe detected on volatile ML-KEM private key buffer region.",
        resolved: false,
      };
    } else {
      newThreat = {
        id,
        timestamp: new Date().toISOString(),
        sourceIp: randomIp,
        sourceNode: "Automated Botnet Crawler",
        actionTaken: "Multipass API Probe",
        level: 1,
        details: "HTTP/2 unauthorized multipass credential stuffing probe on /api/v1/auth/multipass.",
        resolved: false,
      };
    }

    newThreat.packetTrace = generatePacketTraceForThreat(newThreat, lures[0]);
    setThreatEvents(prev => [newThreat, ...prev]);
    addSystemLog(`Simulated threat ingress registered: ${newThreat.id} (${newThreat.actionTaken})`, 'warn');
  };

  const handleRemoveLure = (lureId: string) => {
    setLures(prev => prev.filter(l => l.id !== lureId));
  };

  const handleDownloadSystemLogs = () => {
    const logText = logsList.map(log => `[${log.time}] [${log.type.toUpperCase()}] ${log.text}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghostwatch_system_logs_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addSystemLog('Realtime Ghost Secure System Logs downloaded successfully.', 'success');
  };

  const handleResetEntireDatabase = () => {
    // Scrub logs and rebuild initial state
    setLures([
      {
        id: 'GW-LURE_2026_5911_A9FC',
        targetNode: 'vortex.ghost.watch.local',
        dnsToken: 'audit-vault-77.vortex.watch.local',
        documentType: 'NIST FIPS 213 (ML-KEM-768) Secret Parameter Set',
        watermarkType: 'Linguistic',
        details: {
          originalText: "The module lattice-based key encapsulation mechanism utilizes an integer matrix division of 768 to establish a shared secret.",
          watermarkedText: "The module lattice-based key encapsulation mechanism utilizes an integer matrix division of [ALTERED: 752 (modified polynomial constraint)] to establish a shared secret.",
          shiftsApplied: ["Replaced '768' with '752 (modified polynomial constraint)'"]
        },
        createdTimestamp: "2026-06-21T12:24:00.000Z",
        isTriggered: false,
        triggerCount: 0
      }
    ]);
    setThreatEvents([]);
    setLogsList([
      { id: 'b1', text: "Sovereign recovery sequence complete. Hard reset of database registers successful.", time: "12:26:01", type: 'success' },
      { id: 'b2', text: "Systems online and sweeping out-of-band Mesh corridors.", time: "12:26:03", type: 'info' }
    ]);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col font-sans select-none relative overflow-x-hidden p-4 md:p-6">
      
      {/* Background visual ambiance styling */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-cyber-cyan/5 to-transparent pointer-events-none z-0" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col flex-1 gap-5 z-10 relative">
        
        {/* TOP SYSTEM BAR WITH HIGH-INTEGRITY STATUSES */}
        <header className="p-4 bg-cyber-dark/95 rounded-lg border-2 border-cyber-border flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-cyber-green/10 border-2 border-cyber-green/45 text-cyber-green shadow-[0_0_15px_rgba(5,243,161,0.2)]">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-base md:text-lg text-white tracking-widest uppercase">
                  Ghost-Watch C2 Terminal
                </h1>
                <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/35 px-1.5 py-0.5 rounded font-mono font-bold">
                  APEX TIER
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                BINDING: {hardwareBoundId} | FREQ: 915.0 MHz (LoRa LPWAN Grid)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5 text-[10px] font-mono">
            {/* Timestamp */}
            <div className="px-2.5 py-1.5 rounded border border-cyber-border bg-cyber-panel/60">
              <span className="text-gray-500">SECURE TIME: </span>
              <span className="text-gray-300">2026-06-21 12:24:50 UTC</span>
            </div>

            {/* Warning Alert state */}
            {warningAlertActive ? (
              <div className="px-2.5 py-1.5 rounded border border-cyber-red bg-cyber-red/10 text-cyber-red font-bold animate-pulse flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ALERT: CONTRADICTORY VECTOR DETECTED</span>
              </div>
            ) : (
              <div className="px-2.5 py-1.5 rounded border border-cyber-green-dim bg-cyber-green/5 text-cyber-green font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>ACTIVE AIRSPACE ENVELOPE SECURE</span>
              </div>
            )}

            {/* Emergency hard reset button */}
            <button 
              onClick={() => {
                setIsWiped(true);
                addSystemLog("Direct access OMEGA purge command executed manually.", 'error');
              }}
              className="p-1.5 border border-cyber-red/50 hover:border-cyber-red bg-cyber-red/5 hover:bg-cyber-red/20 text-cyber-red rounded cursor-pointer group flex items-center gap-1 transition-all font-bold uppercase"
              title="Manual Trigger Omega contingency wipe"
            >
              <Power className="w-3 h-3 group-hover:rotate-18" /> WIPE
            </button>
          </div>
        </header>

        {/* CONTROLS DIVISION: SIDEBAR SHEETS + ACTIVE SCREEN VIEWPORT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px]">

          {/* SIDEBAR NAVIGATION GRID (3 columns) */}
          <nav className="lg:col-span-3 flex flex-col gap-3.5">
            
            {/* Tab selection matrix box */}
            <div className="p-4 bg-cyber-panel/85 rounded-lg border-2 border-cyber-border flex flex-col gap-2.5">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold border-b border-cyber-border/40 pb-1.5">
                C2 SOVEREIGN DIRECTIVES
              </span>

              <div className="flex flex-col gap-1 text-xs">
                
                <button
                  onClick={() => !isWiped && setActiveTab('COMMAND_CENTER')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'COMMAND_CENTER'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>1. C2 Master Console</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('CANARY_FACTORY')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'CANARY_FACTORY'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>2. Canary Factory (ACTS)</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('ADB_LEDGER')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'ADB_LEDGER'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FolderKanban className="w-4 h-4" />
                  <span>3. Active ADB Ledger</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('PALANTIR_ONTOLOGY')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'PALANTIR_ONTOLOGY'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>4. Palantir Ontology</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('AEGIS_RADAR')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'AEGIS_RADAR'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Crosshair className="w-4 h-4" />
                  <span>5. Aegis Combat Dome</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('CADL_DECEPTION')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'CADL_DECEPTION'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>6. CADL Deception</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('CERBERUS_SCANNER')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'CERBERUS_SCANNER'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>7. Cerberus BSAU</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('LAZARUS_MESH')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'LAZARUS_MESH'
                        ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan font-bold block shadow-[0_0_10px_rgba(6,225,249,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Network className="w-4 h-4" />
                  <span>8. Lazarus Mesh-Net</span>
                </button>

                <button
                  onClick={() => !isWiped && setActiveTab('GORGON_ANTITAMPER')}
                  disabled={isWiped}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    isWiped 
                      ? 'border-gray-800 text-gray-600 cursor-not-allowed bg-transparent' 
                      : activeTab === 'GORGON_ANTITAMPER'
                        ? 'border-cyber-green bg-cyber-green/15 text-cyber-green font-bold block shadow-[0_0_10px_rgba(5,243,161,0.1)]'
                        : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>9. Gorgon Anti-Tamper</span>
                </button>

                <button
                  onClick={() => setActiveTab('OMEGA_CONTINGENCY')}
                  className={`w-full py-2.5 px-3 rounded text-left border flex items-center gap-2.5 transition-all font-mono ${
                    activeTab === 'OMEGA_CONTINGENCY' || isWiped
                      ? 'border-cyber-red bg-cyber-red/15 text-cyber-red font-bold animate-pulse'
                      : 'border-cyber-border/40 hover:bg-cyber-dark/40 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FileWarning className="w-4 h-4" />
                  <span>10. Omega Purge Panel</span>
                </button>

              </div>
            </div>

            {/* INTERNAL SECURE COMMUNICATION CHAT DIALOGUE LOG FEED */}
            <div className="p-4 bg-cyber-panel/85 rounded-lg border-2 border-cyber-border flex flex-col flex-1 h-[250px]">
              <div className="flex items-center justify-between border-b border-cyber-border/40 pb-1.5 mb-2.5">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
                  REALTIME GHOST SECURE LOG
                </span>
                <button
                  type="button"
                  onClick={handleDownloadSystemLogs}
                  className="text-cyber-green hover:text-white transition-all border border-cyber-green/40 hover:border-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 rounded px-1.5 py-0.5 text-[9px] flex items-center gap-1 font-mono cursor-pointer"
                  title="Download Realtime System Logs"
                >
                  <Download className="w-2.5 h-2.5" />
                  <span>EXPORT LOGS</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 text-[10px] font-mono scrollbar-thin select-all">
                {logsList.map((log) => {
                  let typeColor = 'text-cyber-green';
                  if (log.type === 'warn') typeColor = 'text-cyber-yellow';
                  if (log.type === 'error') typeColor = 'text-cyber-red font-bold animate-pulse';
                  if (log.type === 'info') typeColor = 'text-cyber-cyan';

                  return (
                    <div key={log.id} className="leading-relaxed border-b border-cyber-border/20 pb-1 text-xs">
                      <span className="text-gray-500">[{log.time}] </span>
                      <span className={typeColor}>{log.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </nav>

          {/* MAIN SECURE OPERATIONAL TAB ENVIRONMENT (9 columns) */}
          <main className="lg:col-span-9 flex flex-col h-full">
            <AnimatePresence mode="wait">
              
              {/* Force view lockout if Wiped protocol is active */}
              {isWiped && activeTab !== 'OMEGA_CONTINGENCY' ? (
                <motion.div
                  key="purged-locked-fallback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full min-h-[460px] flex items-center justify-center p-4 bg-cyber-dark border bg-cyber-panel/20 text-center rounded border-cyber-red rounded-lg"
                >
                  <div className="space-y-4">
                    <ShieldAlert className="w-12 h-12 text-cyber-red animate-ping mx-auto" />
                    <h2 className="text-gray-100 font-display font-medium text-lg uppercase tracking-widest">
                      SYSTEM INTEGRITY COMPROMISED - VAULT LOCKOUT
                    </h2>
                    <p className="text-xs font-mono text-gray-400 max-w-md mx-auto">
                      All virtual structures scraped. Active control matrix remains disabled until proper mnemonic verification challenges are fulfilled.
                    </p>
                    <button
                      onClick={() => setActiveTab('OMEGA_CONTINGENCY')}
                      className="px-4 py-2 border-2 border-cyber-red hover:bg-cyber-red/25 text-cyber-red rounded text-xs font-mono font-bold uppercase transition-all"
                    >
                      Retrieve Cryptographic Roots
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full">
                  {activeTab === 'COMMAND_CENTER' && !isWiped && (
                    <CommandCenter 
                      lures={lures}
                      threats={threatEvents}
                      hardwareBoundId={hardwareBoundId}
                      pqcStatus={pqcStatus}
                      onAddConsoleLog={addSystemLog}
                      onRegisterLure={handleRegisterLureQuick}
                      onTriggerSelfWipe={() => {
                        setIsWiped(true);
                        addSystemLog("Omega Purge called from secure console commands.", "error");
                        setActiveTab('OMEGA_CONTINGENCY');
                      }}
                      onNavigateTab={(tab) => setActiveTab(tab as TabId)}
                    />
                  )}

                  {activeTab === 'CANARY_FACTORY' && !isWiped && (
                    <CanaryTrapFactory 
                      onRegisterCustomLure={handleRegisterLure}
                      onAddConsoleLog={addSystemLog}
                    />
                  )}

                  {activeTab === 'ADB_LEDGER' && !isWiped && (
                    <AttributionDatabase 
                      lures={lures}
                      threats={threatEvents}
                      onTriggerLureAlert={handleTriggerLureAlert}
                      onRemoveLure={handleRemoveLure}
                      onResolveThreat={handleResolveThreat}
                      onSimulateThreat={handleSimulateThreat}
                      onAddConsoleLog={addSystemLog}
                    />
                  )}

                  {activeTab === 'PALANTIR_ONTOLOGY' && !isWiped && (
                    <PalantirOntology 
                      lures={lures}
                      onAddConsoleLog={addSystemLog}
                    />
                  )}

                  {activeTab === 'AEGIS_RADAR' && !isWiped && (
                    <AegisDefenseSimulator 
                      onAddConsoleLog={addSystemLog}
                    />
                  )}

                  {activeTab === 'CADL_DECEPTION' && !isWiped && (
                    <DeceptionEscalator 
                      onAddConsoleLog={addSystemLog}
                      onTriggerSelfWipe={() => {
                        setIsWiped(true);
                        addSystemLog("Wipe called due to CADL Level 5 automated trigger event.", "error");
                        setActiveTab('OMEGA_CONTINGENCY');
                      }}
                    />
                  )}

                  {activeTab === 'CERBERUS_SCANNER' && !isWiped && (
                    <CerberusScanner 
                      onAddConsoleLog={addSystemLog}
                      onAutoAddLure={(name) => handleRegisterLureQuick(name, 'WE-FORGE Anomaly Blueprint', 'Linguistic')}
                    />
                  )}

                  {activeTab === 'LAZARUS_MESH' && !isWiped && (
                    <LazarusMeshViewer 
                      onAddConsoleLog={addSystemLog}
                    />
                  )}

                  {activeTab === 'GORGON_ANTITAMPER' && !isWiped && (
                    <GorgonAntiTamperViewer 
                      onAddConsoleLog={addSystemLog}
                    />
                  )}

                  {activeTab === 'OMEGA_CONTINGENCY' && (
                    <OmegaContingency 
                      isWiped={isWiped}
                      onSetIsWiped={(val) => {
                        setIsWiped(val);
                        if (!val) {
                          setActiveTab('COMMAND_CENTER');
                        }
                      }}
                      onAddConsoleLog={addSystemLog}
                      onResetDatabase={handleResetEntireDatabase}
                    />
                  )}
                </div>
              )}

            </AnimatePresence>
          </main>

        </div>

      </div>

    </div>
  );
}
