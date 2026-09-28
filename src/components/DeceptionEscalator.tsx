import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Zap, Gauge, Server, Terminal, Lock, Play, RefreshCw, Download 
} from 'lucide-react';

interface DeceptionEscalatorProps {
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  onTriggerSelfWipe: () => void;
}

export default function DeceptionEscalator({ onAddConsoleLog, onTriggerSelfWipe }: DeceptionEscalatorProps) {
  const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [snifferPackets, setSnifferPackets] = useState<string[]>([
    "IP: 194.202.91.44 | GET /api/v1/auth/multipass [RECON_HEADER]",
    "IP: 194.202.91.44 | HEAD /ghost/fips-204/params [PROBE_VAL]",
    "IP: 194.202.91.44 | GET /audit-vault-77.ghost.watch.local [TOKEN_RESOLV!]"
  ]);
  const [isSimulatingSidecar, setIsSimulatingSidecar] = useState(true);

  const handleDownloadPackets = () => {
    const dataContent = `====================================================================
GHOST-WATCH CADL SIDECAR INGRESS PACKET CAPTURE
Log Generated: ${new Date().toISOString()}
CADL Escalation State: LEVEL ${activeLevel}
====================================================================

${snifferPackets.map((pkt, idx) => `[Packet #${idx + 1}] ${pkt}`).join('\n')}

====================================================================
EOF - END OF PACKET TRACE
`;
    const blob = new Blob([dataContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cadl_packet_capture_${Date.now()}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog(`CADL sidecar packet capture exported successfully.`, 'success');
  };

  // Sidecar sniffer generator
  useEffect(() => {
    if (!isSimulatingSidecar) return;
    const interval = setInterval(() => {
      const endpoints = [
        '/api/v3/cryo/vault/mnemonic',
        '/local/mesh/915MHz/routing',
        '/oracle/ontological/object-fusion',
        '/aegis/citron-tree/bmc/coords',
        '/fips-203/kem-768/keys',
        '/acts/barium-meal/records'
      ];
      const statuses = ['[RAW_UNENCRYPTED]', '[SIDECAR_SNIFFED]', '[PRE_TUNNEL_INTERCEPT]', '[PORT_SCAN_LURK]'];
      const ips = ['194.202.91.44', '189.92.100.12', '45.132.88.23', '201.21.199.102'];
      const rIp = ips[Math.floor(Math.random() * ips.length)];
      const rEp = endpoints[Math.floor(Math.random() * endpoints.length)];
      const rSt = statuses[Math.floor(Math.random() * statuses.length)];

      setSnifferPackets(prev => {
        const updated = [...prev, `IP: ${rIp} | GET ${rEp} ${rSt}`];
        if (updated.length > 8) updated.shift();
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulatingSidecar]);

  const handleEscalatePlayground = (level: 1 | 2 | 3 | 4 | 5) => {
    setActiveLevel(level);
    switch (level) {
      case 1:
        onAddConsoleLog("CADL LEVEL 1: Collecting adversary digital dust and lateral heuristics.", "info");
        break;
      case 2:
        onAddConsoleLog("CADL LEVEL 2: Sowing network lag. Inserting synthetic latencies: +5200ms API response delays.", "warn");
        break;
      case 3:
        onAddConsoleLog("CADL LEVEL 3: Rerouting unauthorized thread transparently to AETHER synthetic honeypot structure.", "info");
        break;
      case 4:
        onAddConsoleLog("CADL LEVEL 4: Sowing PQC-encrypted poisoned datasets. Saturated exfiltration channels to deplete hostile computing cores.", "warn");
        break;
      case 5:
        onAddConsoleLog("CADL LEVEL 5: CRITICAL threat threshold. Lockout engaged. Neutralizing active socket and calling physical wipe protocols.", "error");
        setTimeout(() => {
          onTriggerSelfWipe();
        }, 1200);
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">

      {/* LEFT COLUMN: 5-level Escalation Hierarchy (6 columns) */}
      <div className="xl:col-span-6 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-2">
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5 text-cyber-yellow" />
              <div>
                <h2 className="font-display font-medium text-gray-100">CADL Escalation Spectrum</h2>
                <p className="text-[10px] text-gray-400 font-mono">COGNITIVE-ADAPTIVE DECEPTION LAYER FRAMEWORK</p>
              </div>
            </div>
            <div className="text-[10px] text-cyber-yellow border border-cyber-yellow/40 bg-cyber-yellow/5 px-2 py-0.5 rounded font-mono">
              EVENT-DRIVEN MATRIX
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 font-mono text-xs">
            
            {/* L1 Card */}
            <div 
              onClick={() => handleEscalatePlayground(1)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeLevel === 1 
                  ? 'border-cyber-cyan bg-cyber-cyan/10 text-white' 
                  : 'border-cyber-border bg-cyber-dark/40 text-gray-400 hover:bg-cyber-dark/80 hover:text-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cyber-cyan">LEVEL 1 - MONITOR</span>
                <span className="px-1.5 py-0.5 bg-cyber-cyan/15 rounded text-[8px] font-bold">DIGITAL DUST</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                Passive logging of adversary footsteps and header fingerprint hashes. No visible security reaction presented, evading discovery of honeypot parameters.
              </p>
            </div>

            {/* L2 Card */}
            <div 
              onClick={() => handleEscalatePlayground(2)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeLevel === 2 
                  ? 'border-cyber-yellow bg-cyber-yellow/10 text-white' 
                  : 'border-cyber-border bg-cyber-dark/40 text-gray-400 hover:bg-cyber-dark/80 hover:text-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cyber-yellow">LEVEL 2 - DELAY</span>
                <span className="px-1.5 py-0.5 bg-cyber-yellow/15 rounded text-[8px] font-bold">SYNTHETIC LATENCY</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                Weave custom delay gates into connection pools. Degrades automated crawl tools by artificially multiplying packet response delays by up to 5200ms.
              </p>
            </div>

            {/* L3 Card */}
            <div 
              onClick={() => handleEscalatePlayground(3)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeLevel === 3 
                  ? 'border-cyber-cyan bg-cyber-cyan/10 text-white' 
                  : 'border-cyber-border bg-cyber-dark/40 text-gray-400 hover:bg-cyber-dark/80 hover:text-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cyber-cyan">LEVEL 3 - REROUTE</span>
                <span className="px-1.5 py-0.5 bg-cyber-cyan/15 rounded text-[8px] font-bold">HONEPOT ALIGNMENT</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                Transparents redirect. Utilizing post-quantum ML-KEM parameters, reroutes targeted credential sprays to AETHER—a fully isolated honeynet environment.
              </p>
            </div>

            {/* L4 Card */}
            <div 
              onClick={() => handleEscalatePlayground(4)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeLevel === 4 
                  ? 'border-cyber-green bg-cyber-green/10 text-white' 
                  : 'border-cyber-border bg-cyber-dark/40 text-gray-400 hover:bg-cyber-dark/80 hover:text-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cyber-green">LEVEL 4 - DEGRADE</span>
                <span className="px-1.5 py-0.5 bg-cyber-green/15 rounded text-[8px] font-bold">DATA POISONING</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                Emplaces decoy parameter sets generated by the WE-FORGE engines. Returns cryptographically uncompromisable file dumps to deplete adversary analytical cores.
              </p>
            </div>

            {/* L5 Card */}
            <div 
              onClick={() => handleEscalatePlayground(5)}
              className={`p-3 rounded border cursor-pointer transition-all hover:bg-cyber-red/20 ${
                activeLevel === 5 
                  ? 'border-cyber-red bg-cyber-red/15 text-white' 
                  : 'border-cyber-border bg-cyber-dark/40 text-gray-400 hover:bg-cyber-dark/80 hover:text-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-cyber-red">LEVEL 5 - NEUTRALIZE</span>
                <span className="px-1.5 py-0.5 bg-cyber-red/15 rounded text-[8px] font-bold animate-pulse">TOTAL WIPE</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                Terminates routing socket completely. Instantly triggers the Aegis physical self-destruction protocol (Omega Contingency) to neutralize digital presence.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Raw Traffic Sidecar Inspect panel (6 columns) */}
      <div className="xl:col-span-6 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full h-[450px]">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-cyber-cyan" />
              <h2 className="font-display font-medium text-gray-100">CADL Sidecar Packet Sniffer</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPackets}
                className="text-cyber-cyan hover:text-white transition-all border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 rounded px-2 py-1 text-[10px] flex items-center gap-1.5 font-mono cursor-pointer"
                title="Download Packet Capture Dump"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT PCAP</span>
              </button>
              <button
                onClick={() => setIsSimulatingSidecar(p => !p)}
                className="text-[10px] font-mono border border-cyber-border rounded px-2 py-1 bg-cyber-dark hover:bg-cyber-dark/80 text-gray-400 hover:text-white transition-all flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isSimulatingSidecar ? 'animate-spin' : ''}`} />
                {isSimulatingSidecar ? 'SNIFFING' : 'PAUSED'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-cyber-dark/95 p-4 rounded-lg border-2 border-cyber-border font-mono text-xs flex flex-col gap-2 relative">
            <div className="text-[10px] uppercase text-gray-500 tracking-wider flex justify-between">
              <span>UNENCAPSULATED DATASTREAM INGRESS LOGS</span>
              <span className="text-cyber-cyan text-[9px] border border-cyber-cyan/30 px-1">RAW TERMINAL INTERCEPT</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 font-bold scrollbar-thin">
              {snifferPackets.map((pkt, idx) => (
                <div key={idx} className="text-cyber-green text-[10px] flex items-start gap-1 leading-normal selection:bg-cyber-cyan/25">
                  <span className="text-gray-500 flex-shrink-0 select-none">[{idx + 1}]</span>
                  <span>{pkt}</span>
                </div>
              ))}
            </div>

            <div className="p-2 border border-cyber-border bg-cyber-panel/60 rounded text-[10px] text-gray-400 font-sans leading-normal mt-auto">
              <strong>Sidecar Architecture Principle:</strong> CADL inspects ingress requests <em>prior</em> to encapsulation in post-quantum tunnels. This allows secure deep telemetry mapping of threats before exfiltrations or queries execute.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
