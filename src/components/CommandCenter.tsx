import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Radio, Shield, Terminal as TerminalIcon, 
  Key, Database, AlertOctagon, RefreshCw, Send, CheckCircle2, Download,
  Network, ShieldAlert, Bug, Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { Lure, ThreatEvent, MicroTunnelEndpoint, LazarusStats, GorgonAntiTamperState } from '../types';
import { lazarusMeshInstance } from '../services/LazarusMesh';
import { gorgonAntiTamperInstance } from '../services/GorgonAntiTamper';

interface CommandCenterProps {
  lures: Lure[];
  threats: ThreatEvent[];
  hardwareBoundId: string;
  pqcStatus: string;
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  onRegisterLure: (nodeName: string, docType: string, watermark: 'Linguistic' | 'Metadata' | 'Steganographic') => void;
  onTriggerSelfWipe: () => void;
  onNavigateTab?: (tab: string) => void;
}

export default function CommandCenter({
  lures,
  threats,
  hardwareBoundId,
  pqcStatus,
  onAddConsoleLog,
  onRegisterLure,
  onTriggerSelfWipe,
  onNavigateTab,
}: CommandCenterProps) {
  // Command input states
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState<string[]>([
    '-- GHOST-WATCH APEX TIER SECURE CLI V3.8A --',
    'Session bound to hardware: HB-9982-AX-2026',
    'Frequency interface on 915.0 MHz LoRa Mesh-Net: ACTIVE',
    'LazarusMesh polymorphic C2 telemetry masking: ENGAGED',
    'GorgonAntiTamper volatile memory scanner: ARMED',
    'PQC hybrid encryption stack validated. Type /help for available sovereign operations.',
    ''
  ]);
  const [loaFrequencyActive, setLoaFrequencyActive] = useState(true);
  const [frequencyNoise, setFrequencyNoise] = useState<number[]>(Array.from({ length: 24 }, () => Math.random() * 40 + 20));
  
  // Real-time subscriptions for LazarusMesh & GorgonAntiTamper
  const [meshStats, setMeshStats] = useState<LazarusStats>(lazarusMeshInstance.getStats());
  const [meshTunnels, setMeshTunnels] = useState<MicroTunnelEndpoint[]>(lazarusMeshInstance.getTunnels());
  const [gorgonState, setGorgonState] = useState<GorgonAntiTamperState>(gorgonAntiTamperInstance.getState());

  useEffect(() => {
    const unsubMesh = lazarusMeshInstance.subscribe((tunnels, stats) => {
      setMeshTunnels(tunnels);
      setMeshStats(stats);
    });
    const unsubGorgon = gorgonAntiTamperInstance.subscribe((state) => {
      setGorgonState(state);
    });
    return () => {
      unsubMesh();
      unsubGorgon();
    };
  }, []);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Simple spectrum noise simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setFrequencyNoise(Array.from({ length: 24 }, () => Math.random() * 50 + (loaFrequencyActive ? 25 : 5)));
    }, 400);
    return () => clearInterval(timer);
  }, [loaFrequencyActive]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [cliHistory]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    const args = cmd.toLowerCase().split(' ');
    const primaryCmd = args[0];

    const newHistory = [...cliHistory, `> ${cmd}`];

    switch (primaryCmd) {
      case '/help':
        newHistory.push(
          'Available Sovereign Directives:',
          '  /status           - Display node architecture integrity',
          '  /lures            - Query active physical canary lures',
          '  /inject [node]    - Instantly inject standard lure into target [node]',
          '  /spectrum         - Toggle LoRa Mesh-Net 915MHz spectrum interface',
          '  /mesh             - Query LazarusMesh polymorphic C2 routes & fake IPs',
          '  /mesh-burst       - Rapidly inject polymorphic burst of decoy micro-tunnels',
          '  /mesh-rotate      - Force instant full rotation of mesh topology',
          '  /antitamper       - Query GorgonAntiTamper memory enclave status',
          '  /scan             - Execute deep memory scan for debuggers & scrapers',
          '  /tamper-test      - Simulate debugger attach or scraper threat detection',
          '  /purge-pqc        - Zeroize volatile PQC keys and force epoch rotation',
          '  /threats          - Check active Aegis tactical warning state',
          '  /wipe             - Emergency trigger for the OMEGA CONTINGENCY',
          '  /clear            - Flush active CLI scrollback buffer'
        );
        onAddConsoleLog('CLI help directory queried', 'info');
        break;

      case '/status':
        newHistory.push(
          `SYSTEM: ACTIVE`,
          `HARDWARE TETHER: ${hardwareBoundId}`,
          `PQC ENGINE: ${pqcStatus} (Epoch #${gorgonState.keyEpoch})`,
          `LAZARUS MESH: ${meshStats.isRunning ? 'ACTIVE' : 'PAUSED'} (${meshStats.activeTunnelCount} polymorphic tunnels, ${meshStats.telemetryMaskingRatio}% mask ratio)`,
          `GORGON INTEGRITY: ${gorgonState.integrityStatus} (${gorgonState.memoryIntegrityScore}% score)`,
          `SECURE VAULT PATH: ghost.watch.local`
        );
        onAddConsoleLog('Node architecture audit executed', 'success');
        break;

      case '/mesh':
      case '/lazarus':
        newHistory.push(
          `LAZARUS MESH POLYMORPHIC ROUTING STATUS:`,
          `  Engine: ${meshStats.isRunning ? 'ONLINE' : 'STOPPED'} | Mode: ${meshStats.mode}`,
          `  Active Micro-Tunnels: ${meshStats.activeTunnelCount} | Total Hops: ${meshStats.totalHopsGenerated}`,
          `  Telemetry Masking: ${meshStats.telemetryMaskingRatio}% | Mean Entropy: ${meshStats.entropyMean} H`,
          `  Active Decoy Tunnels:`
        );
        meshTunnels.slice(0, 4).forEach(t => {
          newHistory.push(`    - ${t.id} | Mask IPv4: ${t.fakeIpv4} | Domain: ${t.syntheticDomain} [${t.protocol}]`);
        });
        onAddConsoleLog('LazarusMesh polymorphic telemetry queried', 'info');
        break;

      case '/mesh-burst':
        lazarusMeshInstance.injectBurstDecoy(4);
        newHistory.push(`[+] LazarusMesh injected 4 high-entropy ephemeral micro-tunnels to mask C2 telemetry.`);
        break;

      case '/mesh-rotate':
        lazarusMeshInstance.forceFullTopologyRotate();
        newHistory.push(`[+] LazarusMesh topology completely rotated. Generated 5 fresh micro-tunnels with randomized fake IPs.`);
        break;

      case '/antitamper':
      case '/gorgon':
        newHistory.push(
          `GORGON ANTI-TAMPER STATUS:`,
          `  Enclave Status: ${gorgonState.integrityStatus}`,
          `  Memory Integrity Score: ${gorgonState.memoryIntegrityScore}%`,
          `  Active PQC Key: ${gorgonState.activePqcKey.keyId} (${gorgonState.activePqcKey.algorithm})`,
          `  Epoch: #${gorgonState.keyEpoch} | RAM Address: ${gorgonState.activePqcKey.volatileBufferAddress}`,
          `  Audits Run: ${gorgonState.scansPerformed} | Intercepts: ${gorgonState.threatsIntercepted}`
        );
        onAddConsoleLog('GorgonAntiTamper status checked', 'info');
        break;

      case '/scan':
        newHistory.push(`[+] Executing deep volatile memory page scan for debuggers and memory scrapers...`);
        const scanRes = gorgonAntiTamperInstance.scanMemoryIntegrity();
        if (!scanRes.threatDetected) {
          newHistory.push(`[+] Scan complete. All volatile memory regions PRISTINE. Zero debugger hooks found.`);
        }
        break;

      case '/tamper-test':
        const testType = args[1] === 'scraper' ? 'HEAP_SCRAPER' : 'DEBUGGER_HOOK';
        newHistory.push(`[!] INJECTING SIMULATED THREAT: ${testType}...`);
        newHistory.push(`[!] GorgonAntiTamper will intercept, zeroize volatile PQC keys, and rotate epoch.`);
        if (testType === 'HEAP_SCRAPER') {
          gorgonAntiTamperInstance.simulateMemoryScraper();
        } else {
          gorgonAntiTamperInstance.simulateDebuggerAttach();
        }
        break;

      case '/purge-pqc':
      case '/rotate-pqc':
        newHistory.push(`[!] Initiating manual volatile key zeroization and PQC key rotation...`);
        gorgonAntiTamperInstance.purgeVolatilePqcKeys('MEMORY_CORRUPTION', 'Manual CLI operator directive.');
        break;

      case '/lures':
        if (lures.length === 0) {
          newHistory.push('No canary lures actively registered in ADB ledger.');
        } else {
          newHistory.push('ACTIVE CANARY TRAP LEDGER:');
          lures.forEach(l => {
            newHistory.push(`  ID: ${l.id} | Node: ${l.targetNode} | Token: ${l.dnsToken} | [${l.isTriggered ? 'TRIGGERED!' : 'DORMANT'}]`);
          });
        }
        break;

      case '/inject':
        const targetNode = args[1] || 'Vortex_Node';
        onRegisterLure(targetNode, 'ML-KEM Private Param Set', 'Linguistic');
        newHistory.push(`[+] Requesting instant inject: ${targetNode} -> DNS Token established.`);
        break;

      case '/spectrum':
        setLoaFrequencyActive(prev => !prev);
        newHistory.push(`LoRa Mesh-Net spectrum toggled: ${!loaFrequencyActive ? 'ENABLED' : 'DISABLED'}`);
        onAddConsoleLog(`LoRa interface status changed to: ${!loaFrequencyActive ? 'ON' : 'OFF'}`, 'info');
        break;

      case '/threats':
        const activeCount = threats.filter(t => !t.resolved).length;
        newHistory.push(
          `ACTIVE ALERTS: ${activeCount}`,
          `Citron Tree BMC Status: OPERATIONAL`,
          `Active Threats Log:${threats.map(t => `  [Lvl ${t.level}] ${t.sourceNode} -> ${t.actionTaken} (${t.resolved ? 'CLEARED' : 'PENDING INTERCEPT'})`).join('\n')}`
        );
        break;

      case '/wipe':
        newHistory.push('!!! INITIALIZING OMEGA WIPE CALL !!!');
        setTimeout(() => {
          onTriggerSelfWipe();
        }, 800);
        break;

      case '/clear':
        setCliHistory(['Buffer flushed. Secure terminal link active.']);
        setCliInput('');
        return;

      default:
        newHistory.push(`Command '${primaryCmd}' unrecognized. Type /help for assistance.`);
    }

    newHistory.push('');
    setCliHistory(newHistory);
    setCliInput('');
  };

  const handleDownloadHistory = () => {
    const historyText = cliHistory.join('\n');
    const blob = new Blob([historyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ghostwatch_cli_session_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog('CLI history downloaded successfully.', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      
      {/* LEFT COLUMN: Hardware anchor, LazarusMesh status & Gorgon Anti-Tamper (5 cols) */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        
        {/* Hardware Binding Card */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm relative overflow-hidden flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-cyber-green/10 border border-cyber-green/35 text-cyber-green">
                <Cpu className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Security Anchor Unit</div>
                <div className="font-display font-bold text-gray-100 text-sm">HW Physical Tether</div>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded text-[10px] font-mono border border-cyber-green/40 text-cyber-green bg-cyber-green/5 animate-pulse">
              BOUND
            </div>
          </div>

          <div className="p-2.5 bg-cyber-dark rounded border border-cyber-border/80 font-mono flex items-center justify-between text-xs">
            <div>
              <div className="text-[9px] text-gray-500 uppercase tracking-widest">Hardware Identifier</div>
              <div className="font-bold text-cyber-cyan tracking-wider text-sm">{hardwareBoundId}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-gray-500 uppercase">PQC Status</div>
              <div className="text-cyber-green font-bold text-[11px]">EPOCH #{gorgonState.keyEpoch} ACTIVE</div>
            </div>
          </div>
        </div>

        {/* LazarusMesh & Gorgon Anti-Tamper Quick Tiles */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* LazarusMesh Polymorphic Tile */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('LAZARUS_MESH')}
            className="p-3 rounded-lg border-2 border-cyber-border hover:border-cyber-cyan bg-cyber-panel/80 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-cyber-cyan flex items-center gap-1">
                <Network className="w-3 h-3" />
                Lazarus Mesh
              </span>
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-ping" />
            </div>
            <div className="mt-2">
              <div className="text-base font-bold font-display text-gray-100 group-hover:text-cyber-cyan transition-colors">
                {meshStats.activeTunnelCount} Tunnels
              </div>
              <div className="text-[9px] font-mono text-gray-400">
                Mask: <span className="text-cyber-yellow">{meshStats.telemetryMaskingRatio}%</span>
              </div>
            </div>
            <div className="text-[8px] font-mono text-cyber-green mt-1 flex items-center justify-between">
              <span>{meshStats.totalHopsGenerated} hops</span>
              <span className="text-cyber-cyan">VIEW →</span>
            </div>
          </div>

          {/* Gorgon Anti-Tamper Tile */}
          <div 
            onClick={() => onNavigateTab && onNavigateTab('GORGON_ANTITAMPER')}
            className="p-3 rounded-lg border-2 border-cyber-border hover:border-cyber-green bg-cyber-panel/80 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-cyber-green flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Gorgon Tamper
              </span>
              <span className={`text-[9px] font-mono px-1 rounded border ${
                gorgonState.integrityStatus === 'PRISTINE' 
                  ? 'border-cyber-green/40 text-cyber-green' 
                  : 'border-cyber-red/50 text-cyber-red animate-pulse'
              }`}>
                {gorgonState.integrityStatus === 'PRISTINE' ? 'PRISTINE' : 'ACTION'}
              </span>
            </div>
            <div className="mt-2">
              <div className="text-base font-bold font-display text-gray-100 group-hover:text-cyber-green transition-colors">
                {gorgonState.memoryIntegrityScore}%
              </div>
              <div className="text-[9px] font-mono text-gray-400">
                PQC: <span className="text-cyber-cyan">{gorgonState.activePqcKey.algorithm}</span>
              </div>
            </div>
            <div className="text-[8px] font-mono text-gray-400 mt-1 flex items-center justify-between">
              <span>{gorgonState.threatsIntercepted} intercepted</span>
              <span className="text-cyber-green">VIEW →</span>
            </div>
          </div>

        </div>

        {/* LoRa Frequency Spectrum Monitor */}
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-3 flex-1 min-h-[200px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Out-Of-Band Comms</div>
                <div className="font-display font-semibold text-gray-100 text-xs">915.0 MHz LoRa Mesh-Net</div>
              </div>
            </div>
            <button
              onClick={() => {
                setLoaFrequencyActive(!loaFrequencyActive);
                onAddConsoleLog(`LoRa 915MHz interface toggled manually`, 'info');
              }}
              className={`px-2 py-0.5 rounded border transition-all text-[10px] font-mono font-bold uppercase ${
                loaFrequencyActive 
                  ? 'border-cyber-green text-cyber-green hover:bg-cyber-green/15' 
                  : 'border-cyber-red/40 text-cyber-red/80 hover:bg-cyber-red/10 bg-cyber-red/5'
              }`}
            >
              {loaFrequencyActive ? 'ON AIR' : 'OFF-NET'}
            </button>
          </div>

          <div className="flex-1 bg-cyber-dark/80 rounded border-2 border-cyber-border p-2.5 flex flex-col justify-between h-[120px] relative">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(22,34,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(22,34,58,0.2)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            {/* Spectrum waves */}
            <div className="w-full flex items-end justify-between h-4/5 pt-2 z-10">
              {frequencyNoise.map((val, idx) => (
                <div 
                  key={idx}
                  style={{ height: `${val}%` }}
                  className={`w-1.5 rounded-t transition-all duration-300 ${
                    loaFrequencyActive 
                      ? idx % 3 === 0 
                        ? 'bg-cyber-cyan shadow-[0_0_10px_rgba(6,225,249,0.3)]' 
                        : 'bg-cyber-green shadow-[0_0_8px_rgba(5,243,161,0.25)]'
                      : 'bg-gray-700/60'
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 border-t border-cyber-border/40 pt-1 z-10">
              <span>914.5 MHz</span>
              <span className="text-cyber-cyan animate-pulse">CENTER: 915.0 MHz</span>
              <span>915.5 MHz</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Sovereign CLI Interactive Matrix (7 cols) */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex-1 rounded-lg border-2 border-cyber-border bg-cyber-dark/95 backdrop-blur-sm shadow-[0_12px_24px_rgba(0,0,0,0.4)] flex flex-col h-[525px] overflow-hidden relative">
          
          {/* CLI Header bar */}
          <div className="px-4 py-2 bg-cyber-panel border-b border-cyber-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyber-cyan">
              <TerminalIcon className="w-4 h-4" />
              <span>GHOST-WATCH SECURE SHELL CLIENT v3.8_APEX</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadHistory}
                className="text-cyber-green hover:text-white transition-all border border-cyber-green/40 hover:border-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 rounded px-2 py-0.5 text-[10px] flex items-center gap-1.5 font-mono cursor-pointer"
                title="Download CLI Session Logs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD LOGS</span>
              </button>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-red/60 hover:bg-cyber-red transition-colors cursor-pointer" onClick={onTriggerSelfWipe} title="Emergency Self Wipe" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-yellow/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyber-green/60" />
              </div>
            </div>
          </div>

          {/* CLI Console Feed */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-cyber-border select-all">
            {cliHistory.map((line, index) => {
              let textClass = "text-cyber-green";
              if (line.startsWith('>')) {
                textClass = "text-cyber-cyan font-bold";
              } else if (line.includes('[+]') || line.includes('SUCCESS') || line.includes('ACTIVE') || line.includes('ONLINE')) {
                textClass = "text-cyber-green font-semibold";
              } else if (line.includes('[!]') || line.includes('unrecognized') || line.includes('ALERT:')) {
                textClass = "text-cyber-yellow";
              } else if (line.includes('!!!') || line.includes('CRITICAL') || line.includes('SYSTEM SCRUBBED')) {
                textClass = "text-cyber-red font-bold animate-pulse";
              } else if (line.startsWith('  ')) {
                textClass = "text-gray-300";
              } else if (line === '') {
                textClass = "h-1";
              } else {
                textClass = "text-gray-400";
              }

              return (
                <div key={index} className={`${textClass} whitespace-pre-wrap leading-relaxed`}>
                  {line}
                </div>
              );
            })}
            <div ref={consoleEndRef} />
          </div>

          {/* Secure Seed bifurcation reminder bottom banner */}
          <div className="px-4 py-2 bg-cyber-panel/50 border-t border-cyber-border/60 text-[10px] font-mono text-gray-500 flex justify-between items-center">
            <span>SOVEREIGN CRYO-SEED: geographical bifurcation active</span>
            <span className="text-cyber-yellow">SPLIT KEY DOCTRINE ENABLED</span>
          </div>

          {/* CLI Command Entry Form */}
          <form onSubmit={handleCommandSubmit} className="p-3 bg-cyber-panel border-t border-cyber-border flex gap-3">
            <span className="text-cyber-cyan font-bold font-mono self-center select-none">{`Director_P-01@Apex-Terminal:~$`}</span>
            <input
              type="text"
              value={cliInput}
              onChange={(e) => setCliInput(e.target.value)}
              placeholder="Inject command... (try /help, /mesh, /antitamper, /scan, /tamper-test, /purge-pqc)"
              className="flex-1 bg-cyber-dark/80 text-cyber-green placeholder-cyber-green/40 border border-cyber-border rounded px-3 py-1.5 font-mono text-xs focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/35"
              autoFocus
            />
            <button
              type="submit"
              className="p-1.5 rounded border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/15 hover:text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}

