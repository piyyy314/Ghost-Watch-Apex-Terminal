import React, { useState } from 'react';
import { 
  GitCommit, Network, ShieldCheck, Zap, Info, ShieldAlert,
  Server, UserX, User, HelpCircle, FileCheck2, Download 
} from 'lucide-react';
import { Lure } from '../types';

interface PalantirOntologyProps {
  lures: Lure[];
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

interface OntologicalObject {
  id: string;
  type: 'LureDocument' | 'Adversary' | 'HostNode' | 'DNSCanaryToken';
  name: string;
  properties: Record<string, string>;
  poc: string;
  x: number;
  y: number;
}

interface OntologicalLink {
  sourceId: string;
  targetId: string;
  label: string;
}

export default function PalantirOntology({ lures, onAddConsoleLog }: PalantirOntologyProps) {
  // Setup static nodes plus dynamic lures
  const getOntologyElements = (): { nodes: OntologicalObject[]; links: OntologicalLink[] } => {
    // Standard static nodes
    const baseNodes: OntologicalObject[] = [
      {
        id: 'host-vortex',
        type: 'HostNode',
        name: 'vortex.ghost.watch.local',
        properties: {
          "Status": "ACTIVE",
          "IP": "10.230.12.91",
          "Hardware-ID": "HB-9982-AX-2026",
          "System-Vulnerability-Index": "0.01 (PQC Protected)"
        },
        poc: "Director P-01",
        x: 180,
        y: 100
      },
      {
        id: 'host-neon',
        type: 'HostNode',
        name: 'neon.ghost.watch.local',
        properties: {
          "Status": "ACTIVE",
          "IP": "10.230.12.102",
          "Frequency": "915.0 MHz LoRa Mesh",
          "Auth": "HMAC SHA-3"
        },
        poc: "Sub-Manager Echo-03",
        x: 380,
        y: 110
      },
      {
        id: 'host-cobalt',
        type: 'HostNode',
        name: 'cobalt.ghost.watch.local',
        properties: {
          "Status": "ACTIVE",
          "IP": "10.14.99.12",
          "Missile-Dome-Integration": "Green Pine Tactical Sync",
          "Core-DB-Engine": "PostgreSQL ssl-full"
        },
        poc: "Director P-01",
        x: 580,
        y: 100
      },
      {
        id: 'adversary-alpha',
        type: 'Adversary',
        name: 'APT-37 (State Sponsored Pivot)',
        properties: {
          "Confidence-Score": "0.94",
          "Sub-Vector": "Credential Spray & Lateral Exfil",
          "Sovereignty-Threat": "CRITICAL",
          "Last-Known-IP": "194.202.91.44"
        },
        poc: "Security intelligence BSAU",
        x: 380,
        y: 350
      }
    ];

    const baseLinks: OntologicalLink[] = [
      { sourceId: 'host-vortex', targetId: 'host-neon', label: 'Out-Of-Band LoRa' },
      { sourceId: 'host-neon', targetId: 'host-cobalt', label: 'Secure Trunk Relay' },
      { sourceId: 'adversary-alpha', targetId: 'host-vortex', label: 'Probing Ports' }
    ];

    // Inject active lures from the canal trap db!
    lures.forEach((lure, index) => {
      const lureNodeId = `lure-${lure.id}`;
      const tokenNodeId = `token-${lure.id}`;
      
      const angle = (index / (lures.length || 1)) * 2 * Math.PI;
      const xOffset = Math.cos(angle) * 120;
      const yOffset = Math.sin(angle) * 70;

      // Add lure object
      baseNodes.push({
        id: lureNodeId,
        type: 'LureDocument',
        name: lure.id,
        properties: {
          "Document-Class": lure.documentType,
          "Watermark": lure.watermarkType,
          "PQC-KEM": "ML-KEM-768 Enabled",
          "Decoy-Status": lure.isTriggered ? 'TRIGGERED / BREACHED' : 'DORMANT'
        },
        poc: "Director P-01",
        x: 220 + xOffset,
        y: 220 + yOffset
      });

      // Add dns token object
      baseNodes.push({
        id: tokenNodeId,
        type: 'DNSCanaryToken',
        name: lure.dnsToken,
        properties: {
          "Resolution-Target": "audit-vault.ghost.local",
          "Status": lure.isTriggered ? "HIT REGISTERED" : "LISTENING"
        },
        poc: "Citron-Automation-Service",
        x: 220 + xOffset + 50,
        y: 220 + yOffset + 50
      });

      // Links
      baseLinks.push({ sourceId: 'host-vortex', targetId: lureNodeId, label: 'Deploys Trap' });
      baseLinks.push({ sourceId: lureNodeId, targetId: tokenNodeId, label: 'Resolves Through' });
      
      if (lure.isTriggered) {
        baseLinks.push({ sourceId: 'adversary-alpha', targetId: tokenNodeId, label: 'Triggered By Accessing' });
      }
    });

    return { nodes: baseNodes, links: baseLinks };
  };

  const { nodes, links } = getOntologyElements();

  const handleDownloadOntology = () => {
    const dataToDownload = {
      exportTime: new Date().toISOString(),
      nodes: nodes,
      links: links
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToDownload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ghostwatch_ontology_graph_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddConsoleLog('Palantir Ontological Data structure exported successfully.', 'success');
  };

  const [selectedObjectId, setSelectedObjectId] = useState<string>('host-vortex');
  const [activeActionsCount, setActiveActionsCount] = useState(0);

  const selectedObject = nodes.find(n => n.id === selectedObjectId) || nodes[0];

  const handleOntologicalAction = (actionName: string) => {
    setActiveActionsCount(prev => prev + 1);
    onAddConsoleLog(`Action invoked from Palantir Ontology Workspace: ${actionName} on target ${selectedObject.name}`, 'success');
  };

  const getNodeColor = (type: OntologicalObject['type'], isTriggeredLure = false) => {
    if (isTriggeredLure) return '#f43f5e'; // red
    switch (type) {
      case 'HostNode': return '#05f3a1'; // green
      case 'Adversary': return '#ff3d5a'; // red
      case 'LureDocument': return '#06e1f9'; // cyan
      case 'DNSCanaryToken': return '#f5b025'; // yellow
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">

      {/* LEFT COLUMN: Vis Node Network Map (7 columns) */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-2">
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-cyber-cyan" />
              <div>
                <h2 className="font-display font-medium text-gray-100">Palantir Ontological Data Fusion Maps</h2>
                <p className="text-[10px] text-gray-400 font-mono">OBJECT-CENTRIC ONTOLOGY GRAPH REPRESENTATION</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadOntology}
                className="text-cyber-cyan hover:text-white transition-all border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 rounded px-2.5 py-1 text-[10px] flex items-center gap-1.5 font-mono cursor-pointer"
                title="Download Ontological Schema JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT GRAPH</span>
              </button>
              <div className="text-[10px] text-cyber-green border border-cyber-green-dim bg-cyber-green/5 px-2 py-0.5 rounded font-mono animate-pulse">
                SEMANTIC RULES SYNCED
              </div>
            </div>
          </div>

          <div className="flex-1 bg-cyber-dark/85 rounded border-2 border-cyber-border/80 h-[380px] relative overflow-hidden flex flex-col">
            
            {/* Legend Overlay */}
            <div className="absolute top-3 left-3 bg-cyber-panel/90 border border-cyber-border p-2.5 rounded text-[10px] font-mono flex flex-col gap-1.5 z-10">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5 border-b border-cyber-border/50 pb-0.5">LEGEND</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-green" />
                <span className="text-gray-300">HostNode (Core network)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                <span className="text-gray-300">LureDocument (Canaries)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-yellow" />
                <span className="text-gray-300">DNSCanaryToken</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-red" />
                <span className="text-gray-300">Adversary Threat Vector</span>
              </div>
            </div>

            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(22,34,58,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(22,34,58,0.15)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* SVG Interactive Area */}
            <svg className="w-full h-full min-h-[300px]">
              {/* Lines */}
              {links.map((link, idx) => {
                const sNode = nodes.find(n => n.id === link.sourceId);
                const tNode = nodes.find(n => n.id === link.targetId);
                if (!sNode || !tNode) return null;

                const isDangerLink = link.label.includes('Triggered') || link.label.includes('Probing');

                return (
                  <g key={idx}>
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={isDangerLink ? '#ff3d5a' : '#232d3f'}
                      strokeWidth={isDangerLink ? 2 : 1}
                      strokeDasharray={isDangerLink ? "4 4" : "0"}
                      className={isDangerLink ? "animate-[dash_10s_linear_infinite]" : ""}
                    />
                    {/* Link Label */}
                    <text
                      x={(sNode.x + tNode.x) / 2}
                      y={(sNode.y + tNode.y) / 2 - 5}
                      fill={isDangerLink ? '#ff3d5a' : '#475569'}
                      fontSize="8px"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-cyber-dark px-1 pointer-events-none text-shadow-glow"
                    >
                      {link.label}
                    </text>
                  </g>
                );
              })}

              {/* Node Vertices */}
              {nodes.map(node => {
                const isSelected = node.id === selectedObjectId;
                const isTriggered = node.type === 'LureDocument' && node.properties['Decoy-Status']?.includes('TRIGGERED');
                const nodeColor = getNodeColor(node.type, isTriggered);

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group"
                    onClick={() => setSelectedObjectId(node.id)}
                  >
                    {/* Selected glow ring */}
                    {isSelected && (
                      <circle
                        r="18"
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className="animate-[spin_8s_linear_infinite]"
                      />
                    )}

                    {/* Outer trigger border */}
                    {isTriggered && (
                      <circle
                        r="16"
                        fill="none"
                        stroke="#ff3d5a"
                        strokeWidth="1"
                        className="animate-ping"
                      />
                    )}

                    <circle
                      r="11"
                      fill="#0d1222"
                      stroke={nodeColor}
                      strokeWidth="2"
                    />

                    {/* Dot */}
                    <circle
                      r="4"
                      fill={nodeColor}
                    />

                    {/* Node Text Label */}
                    <text
                      y="23"
                      fill={isSelected ? '#ffffff' : '#c8d2e6'}
                      fontSize="9px"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    >
                      {node.name.length > 22 ? `${node.name.substring(0, 19)}...` : node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Properties Inspector & KINETIC ELEMENTS (5 columns) */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        
        {/* Properties Inspector */}
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full min-h-[300px]">
          <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
            <Info className="w-5 h-5 text-cyber-yellow" />
            <h2 className="font-display font-medium text-gray-100">Ontological Object Inspector</h2>
          </div>

          <div className="flex-1 flex flex-col gap-4 font-mono text-xs">
            <div className="p-3 bg-cyber-dark/80 border border-cyber-border rounded space-y-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-widest">OBJECT METADATA PARADIGM</div>
              <div className="text-sm font-bold text-cyber-green truncate">{selectedObject.name}</div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 border-t border-cyber-border/20 pt-1.5">
                <span>OBJECT TYPE:</span>
                <span className="text-cyber-cyan font-bold">{selectedObject.type}</span>
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>POINT OF CONTACT:</span>
                <span className="text-gray-300">{selectedObject.poc}</span>
              </div>
            </div>

            {/* Properties dynamic list */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Properties Schema</span>
              <div className="space-y-1.5">
                {Object.entries(selectedObject.properties).map(([k, v]) => (
                  <div key={k} className="p-2 border border-cyber-border bg-cyber-dark/40 rounded flex flex-col gap-0.5">
                    <span className="text-[9px] text-gray-500">{k}</span>
                    <span className="text-gray-200 truncate">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kinetic Verbs / Actions Area */}
            <div className="flex flex-col gap-2 mt-auto border-t border-cyber-border/60 pt-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyber-yellow" /> Kinetic Actions (Ontological Verbs)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
                
                <button
                  onClick={() => handleOntologicalAction('REVOKE_MULTIPASS')}
                  className="py-2.5 px-1.5 border border-cyber-yellow/40 hover:border-cyber-yellow rounded bg-cyber-yellow/5 hover:bg-cyber-yellow/15 text-cyber-yellow transition-colors font-bold uppercase"
                >
                  Revoke Credentials
                </button>

                <button
                  onClick={() => handleOntologicalAction('ISOLATE_SERVER')}
                  className="py-2.5 px-1.5 border border-cyber-cyan/40 hover:border-cyber-cyan rounded bg-cyber-cyan/5 hover:bg-cyber-cyan/15 text-cyber-cyan transition-colors font-bold uppercase"
                >
                  Isolate Host Server
                </button>

                <button
                  onClick={() => handleOntologicalAction('QUARANTINE_NODE')}
                  className="py-2.5 px-1.5 border border-cyber-red/40 hover:border-cyber-red rounded bg-cyber-red/5 hover:bg-cyber-red/15 text-cyber-red transition-colors font-bold uppercase"
                >
                  Quarantine Node
                </button>

                <button
                  onClick={() => handleOntologicalAction('IRON_BEAM_DISRUPT')}
                  className="py-2.5 px-1.5 border border-cyber-green/40 hover:border-cyber-green rounded bg-cyber-green/5 hover:bg-cyber-green/15 text-cyber-green transition-colors font-bold uppercase"
                >
                  Iron Beam Terminal
                </button>

              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
