import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, Zap, Info, ShieldAlert, Server, Download, 
  ZoomIn, ZoomOut, RotateCcw, Search, Filter, Activity, 
  Cpu, Radio, Shield, Globe, Terminal, FileCode, CheckCircle2,
  Crosshair, AlertTriangle, Layers
} from 'lucide-react';
import { Lure, ThreatEvent } from '../types';

interface PalantirOntologyProps {
  lures: Lure[];
  threats?: ThreatEvent[];
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export type EntityType = 'LureDocument' | 'AdversaryIP' | 'ThreatEvent' | 'HostNode' | 'DNSCanaryToken';

export interface OntologicalNode extends d3.SimulationNodeDatum {
  id: string;
  type: EntityType;
  name: string;
  label: string;
  category: string;
  radius: number;
  color: string;
  strokeColor: string;
  pulse?: boolean;
  properties: Record<string, string>;
  poc: string;
  threatLevel?: number;
}

export interface OntologicalLink extends d3.SimulationLinkDatum<OntologicalNode> {
  id: string;
  source: string | OntologicalNode;
  target: string | OntologicalNode;
  label: string;
  relationType: 'INGRESS_PROBE' | 'CANARY_BREACH' | 'DEPLOYS_TRAP' | 'RESOLVES_DNS' | 'MESH_RELAY' | 'RECON_SWEEP';
  isAlert?: boolean;
}

export default function PalantirOntology({ 
  lures, 
  threats = [], 
  onAddConsoleLog 
}: PalantirOntologyProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Inspector and selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string>('host-vortex');
  const [activeFilter, setActiveFilter] = useState<'ALL' | EntityType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [repulsionStrength, setRepulsionStrength] = useState<number>(-450);
  const [linkDistance, setLinkDistance] = useState<number>(95);
  const [activeActionsCount, setActiveActionsCount] = useState<number>(0);

  // D3 zoom container ref
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<OntologicalNode, OntologicalLink> | null>(null);

  // Build full Ontological Graph from Lures, Threats, Source IPs, and Host Nodes
  const { nodes, links } = useMemo(() => {
    const nodeList: OntologicalNode[] = [];
    const linkList: OntologicalLink[] = [];

    // 1. Core Sovereign Host Nodes
    nodeList.push(
      {
        id: 'host-vortex',
        type: 'HostNode',
        name: 'vortex.ghost.watch.local',
        label: 'VORTEX CORE',
        category: 'Core C2 Infrastructure',
        radius: 17,
        color: '#05f3a1',
        strokeColor: '#05f3a1',
        properties: {
          "Status": "ACTIVE // AIR-GAPPED",
          "IP": "10.230.12.91",
          "Hardware-Tether": "HB-9982-AX-2026",
          "PQC-Algorithm": "ML-KEM-768 / FIPS-203",
          "Vulnerability-Index": "0.01 (PQC Hardened)"
        },
        poc: "Director P-01 (Apex Operations)"
      },
      {
        id: 'host-neon',
        type: 'HostNode',
        name: 'neon.ghost.watch.local',
        label: 'NEON RELAY',
        category: 'Out-Of-Band Comms',
        radius: 15,
        color: '#05f3a1',
        strokeColor: '#05f3a1',
        properties: {
          "Status": "ACTIVE",
          "IP": "10.230.12.102",
          "Frequency": "915.0 MHz LoRa Mesh-Net",
          "HMAC-Signature": "SHA3-512 FIPS-202",
          "Mesh-Mask-Ratio": "99.8%"
        },
        poc: "Sub-Manager Echo-03"
      },
      {
        id: 'host-cobalt',
        type: 'HostNode',
        name: 'cobalt.ghost.watch.local',
        label: 'COBALT SINK',
        category: 'Forensic Storage Enclave',
        radius: 15,
        color: '#05f3a1',
        strokeColor: '#05f3a1',
        properties: {
          "Status": "ACTIVE",
          "IP": "10.14.99.12",
          "Storage-Engine": "Encrypted NVMe RAID-0",
          "Tactical-Dome": "Green Pine Tactical Sync"
        },
        poc: "Forensics Unit Kilo"
      }
    );

    // Host Mesh Links
    linkList.push(
      {
        id: 'link-vortex-neon',
        source: 'host-vortex',
        target: 'host-neon',
        label: '915MHz LoRa Trunk',
        relationType: 'MESH_RELAY'
      },
      {
        id: 'link-neon-cobalt',
        source: 'host-neon',
        target: 'host-cobalt',
        label: 'Optical Bus',
        relationType: 'MESH_RELAY'
      }
    );

    // 2. Canary Lures & DNS Tokens
    lures.forEach((lure) => {
      const lureNodeId = `lure-${lure.id}`;
      const tokenNodeId = `token-${lure.id}`;

      nodeList.push({
        id: lureNodeId,
        type: 'LureDocument',
        name: lure.id,
        label: lure.documentType.length > 18 ? `${lure.documentType.substring(0, 16)}...` : lure.documentType,
        category: 'Canary Decoy Artifact',
        radius: 14,
        color: '#06e1f9',
        strokeColor: lure.isTriggered ? '#ff3d5a' : '#06e1f9',
        pulse: lure.isTriggered,
        properties: {
          "Decoy-ID": lure.id,
          "Document-Class": lure.documentType,
          "Watermark-Paradigm": lure.watermarkType,
          "Status": lure.isTriggered ? "BREACH TRIGGERED" : "DORMANT LISTENING",
          "Hit-Count": `${lure.triggerCount} unauthorized resolutions`,
          "Target-Node": lure.targetNode
        },
        poc: "ACTS Trap Dispatcher"
      });

      nodeList.push({
        id: tokenNodeId,
        type: 'DNSCanaryToken',
        name: lure.dnsToken,
        label: lure.dnsToken.split('.')[0] || 'audit-token',
        category: 'DNS Canary Trap',
        radius: 11,
        color: '#f5b025',
        strokeColor: lure.isTriggered ? '#ff3d5a' : '#f5b025',
        pulse: lure.isTriggered,
        properties: {
          "DNS-Canary-FQDN": lure.dnsToken,
          "Sinkhole-Target": "audit-vault.ghost.watch.local",
          "Canary-State": lure.isTriggered ? "HIT CONFIRMED" : "LISTENING",
          "Associated-Lure": lure.id
        },
        poc: "Citron Automation DNS Engine"
      });

      // Links: Host -> Lure, Lure -> Token
      linkList.push(
        {
          id: `link-vortex-${lure.id}`,
          source: 'host-vortex',
          target: lureNodeId,
          label: 'Deploys Decoy',
          relationType: 'DEPLOYS_TRAP'
        },
        {
          id: `link-lure-token-${lure.id}`,
          source: lureNodeId,
          target: tokenNodeId,
          label: 'Embeds Token',
          relationType: 'RESOLVES_DNS'
        }
      );
    });

    // 3. Source IPs (Adversary Clusters)
    const uniqueSourceIps = new Map<string, { ip: string; nodeName: string }>();
    threats.forEach(t => {
      if (!uniqueSourceIps.has(t.sourceIp)) {
        uniqueSourceIps.set(t.sourceIp, { ip: t.sourceIp, nodeName: t.sourceNode });
      }
    });

    uniqueSourceIps.forEach(({ ip, nodeName }) => {
      const ipNodeId = `ip-${ip.replace(/\./g, '-')}`;
      nodeList.push({
        id: ipNodeId,
        type: 'AdversaryIP',
        name: ip,
        label: ip,
        category: 'Adversary C2 / Ingress Probe',
        radius: 15,
        color: '#ff3d5a',
        strokeColor: '#ff3d5a',
        pulse: true,
        properties: {
          "Source-IP": ip,
          "Attribution-Cluster": nodeName,
          "Threat-Confidence": "96.4% (BSAU Fingerprint)",
          "ASN-Routing": "AS4134 Transit Relay",
          "Geo-Origin": "External Adversary Infrastructure"
        },
        poc: "Forensic Attribution BSAU"
      });
    });

    // 4. Threat Events
    threats.forEach((threat) => {
      const threatNodeId = `threat-${threat.id}`;
      const ipNodeId = `ip-${threat.sourceIp.replace(/\./g, '-')}`;

      nodeList.push({
        id: threatNodeId,
        type: 'ThreatEvent',
        name: threat.id,
        label: `${threat.id}: ${threat.actionTaken}`,
        category: 'CADL Incident Telemetry',
        radius: 13,
        color: threat.level >= 3 ? '#ff3d5a' : '#f97316',
        strokeColor: threat.resolved ? '#05f3a1' : '#ff3d5a',
        pulse: !threat.resolved,
        threatLevel: threat.level,
        properties: {
          "Incident-ID": threat.id,
          "Action-Taken": threat.actionTaken,
          "CADL-Severity-Level": `LEVEL ${threat.level}`,
          "Adversary-Node": threat.sourceNode,
          "Ingress-Source-IP": threat.sourceIp,
          "Timestamp": threat.timestamp,
          "Containment-Status": threat.resolved ? "CONTAINED // RESOLVED" : "ACTIVE EXFILTRATION",
          "Forensic-Details": threat.details
        },
        poc: "Aegis CADL Escalator"
      });

      // Link: Source IP -> Threat Event
      linkList.push({
        id: `link-ip-threat-${threat.id}`,
        source: ipNodeId,
        target: threatNodeId,
        label: 'Executes Attack',
        relationType: 'INGRESS_PROBE',
        isAlert: true
      });

      // Link Threat Event to Canary Lure or Host Node
      if (threat.targetLureId && nodeList.some(n => n.id === `lure-${threat.targetLureId}`)) {
        linkList.push({
          id: `link-threat-lure-${threat.id}`,
          source: threatNodeId,
          target: `lure-${threat.targetLureId}`,
          label: 'Trips Canary',
          relationType: 'CANARY_BREACH',
          isAlert: true
        });
      } else {
        // Lateral sweep to Host Node
        linkList.push({
          id: `link-threat-vortex-${threat.id}`,
          source: threatNodeId,
          target: 'host-vortex',
          label: 'Lateral Scan',
          relationType: 'RECON_SWEEP',
          isAlert: threat.level >= 3
        });
      }
    });

    return { nodes: nodeList, links: linkList };
  }, [lures, threats]);

  // Filtered nodes and links based on UI state
  const { visibleNodes, visibleLinks } = useMemo(() => {
    let filteredNodes = nodes;

    if (activeFilter !== 'ALL') {
      filteredNodes = filteredNodes.filter(n => n.type === activeFilter);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(n => 
        n.name.toLowerCase().includes(q) ||
        n.label.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.id.toLowerCase().includes(q)
      );
    }

    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));

    // Keep links where both ends are in filtered nodes
    const filteredLinks = links.filter(l => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as OntologicalNode).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as OntologicalNode).id;
      return visibleNodeIds.has(srcId) && visibleNodeIds.has(tgtId);
    });

    return { visibleNodes: filteredNodes, visibleLinks: filteredLinks };
  }, [nodes, links, activeFilter, searchQuery]);

  // Selected Object
  const selectedObject = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Connected links for selected node
  const connectedLinks = useMemo(() => {
    if (!selectedObject) return [];
    return links.filter(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as OntologicalNode).id;
      const tId = typeof l.target === 'string' ? l.target : (l.target as OntologicalNode).id;
      return sId === selectedObject.id || tId === selectedObject.id;
    });
  }, [links, selectedObject]);

  // Initialize and run D3 force-directed simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const height = containerRef.current.clientHeight || 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions (glow filters, arrow markers)
    const defs = svg.append('defs');

    // Arrow marker for standard links
    defs.append('marker')
      .attr('id', 'arrow-standard')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#334155');

    // Arrow marker for danger/attack links
    defs.append('marker')
      .attr('id', 'arrow-alert')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 24)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ff3d5a');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Main graph container group
    const g = svg.append('g').attr('class', 'graph-viewport');

    // D3 Zoom & Pan Setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Clone data for simulation
    const simNodes: OntologicalNode[] = visibleNodes.map(d => ({ ...d }));
    const simLinks: OntologicalLink[] = visibleLinks.map(d => ({ ...d }));

    // Create D3 Force Simulation
    const simulation = d3.forceSimulation<OntologicalNode, OntologicalLink>(simNodes)
      .force('link', d3.forceLink<OntologicalNode, OntologicalLink>(simLinks)
        .id(d => d.id)
        .distance(linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(repulsionStrength))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as OntologicalNode).radius + 18));

    simulationRef.current = simulation;

    // Render Links
    const linkGroup = g.append('g').attr('class', 'links');
    const link = linkGroup.selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => d.isAlert ? '#ff3d5a' : '#1e293b')
      .attr('stroke-width', d => d.isAlert ? 1.8 : 1.2)
      .attr('stroke-dasharray', d => d.isAlert ? '4 3' : '0')
      .attr('marker-end', d => d.isAlert ? 'url(#arrow-alert)' : 'url(#arrow-standard)')
      .attr('opacity', 0.85);

    // Link Labels
    const linkLabelGroup = g.append('g').attr('class', 'link-labels');
    const linkLabel = linkLabelGroup.selectAll('text')
      .data(simLinks)
      .enter()
      .append('text')
      .text(d => d.label)
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('fill', d => d.isAlert ? '#ff3d5a' : '#64748b')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('dy', -4);

    // Render Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const node = nodeGroup.selectAll('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3.drag<SVGGElement, OntologicalNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (_, d) => {
        setSelectedNodeId(d.id);
        onAddConsoleLog(`Inspecting ontological entity: ${d.name} [${d.type}]`, 'info');
      });

    // Pulsing outer halo for triggered or critical nodes
    node.filter(d => !!d.pulse)
      .append('circle')
      .attr('r', d => d.radius + 7)
      .attr('fill', 'none')
      .attr('stroke', d => d.strokeColor)
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.4)
      .attr('stroke-dasharray', '3 3')
      .attr('class', 'animate-spin');

    // Selection halo
    node.append('circle')
      .attr('r', d => d.radius + 4)
      .attr('fill', 'none')
      .attr('stroke', d => d.id === selectedNodeId ? '#06e1f9' : 'transparent')
      .attr('stroke-width', 2)
      .attr('class', d => d.id === selectedNodeId ? 'selected-ring' : '');

    // Outer node border
    node.append('circle')
      .attr('r', d => d.radius)
      .attr('fill', '#090d16')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Inner core dot
    node.append('circle')
      .attr('r', d => Math.max(3, d.radius * 0.4))
      .attr('fill', d => d.color);

    // Node label text
    node.append('text')
      .text(d => d.label.length > 20 ? `${d.label.substring(0, 18)}..` : d.label)
      .attr('y', d => d.radius + 13)
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.id === selectedNodeId ? '#ffffff' : '#94a3b8')
      .attr('font-weight', d => d.id === selectedNodeId ? 'bold' : 'normal')
      .attr('pointer-events', 'none')
      .attr('class', 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]');

    // Simulation tick update
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as OntologicalNode).x || 0)
        .attr('y1', d => (d.source as OntologicalNode).y || 0)
        .attr('x2', d => (d.target as OntologicalNode).x || 0)
        .attr('y2', d => (d.target as OntologicalNode).y || 0);

      linkLabel
        .attr('x', d => (((d.source as OntologicalNode).x || 0) + ((d.target as OntologicalNode).x || 0)) / 2)
        .attr('y', d => (((d.source as OntologicalNode).y || 0) + ((d.target as OntologicalNode).y || 0)) / 2);

      node.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [visibleNodes, visibleLinks, selectedNodeId, repulsionStrength, linkDistance, onAddConsoleLog]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  const handleZoomReset = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
    if (simulationRef.current) {
      simulationRef.current.alpha(0.6).restart();
    }
  };

  const handleRestartPhysics = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
      onAddConsoleLog('D3 physics simulation restarted.', 'info');
    }
  };

  const handleExportOntology = () => {
    const dataToDownload = {
      exportTime: new Date().toISOString(),
      architecture: 'Ghost-Watch Apex D3 Ontological Knowledge Graph',
      nodeCount: nodes.length,
      linkCount: links.length,
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        name: n.name,
        category: n.category,
        properties: n.properties
      })),
      links: links.map(l => ({
        id: l.id,
        source: typeof l.source === 'string' ? l.source : (l.source as OntologicalNode).id,
        target: typeof l.target === 'string' ? l.target : (l.target as OntologicalNode).id,
        label: l.label,
        relationType: l.relationType
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToDownload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ghostwatch_ontology_graph_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddConsoleLog(`Exported Palantir D3 Knowledge Graph (${nodes.length} entities, ${links.length} relational edges).`, 'success');
  };

  const handleKineticAction = (actionName: string) => {
    setActiveActionsCount(prev => prev + 1);
    onAddConsoleLog(`Kinetic Verb [${actionName}] invoked on entity: ${selectedObject.name}`, 'success');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">

      {/* LEFT COLUMN: D3 Force-Directed Graph Area (8 columns) */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 backdrop-blur-sm flex flex-col gap-3 h-full">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-cyber-cyan/10 border border-cyber-cyan/35 text-cyber-cyan">
                <Network className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-gray-100 text-sm tracking-wide">
                    Palantir Ontological D3 Force Graph
                  </h2>
                  <span className="px-1.5 py-0.2 rounded border border-cyber-cyan/40 bg-cyber-cyan/10 text-[9px] font-mono text-cyber-cyan">
                    D3.JS PHYSICS
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
                  FORCE-DIRECTED THREAT & CANARY KNOWLEDGE GRAPH
                </p>
              </div>
            </div>

            {/* Action Tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestartPhysics}
                className="text-gray-300 hover:text-white border border-cyber-border hover:border-cyber-cyan bg-cyber-dark px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 transition-all"
                title="Restart D3 Force Physics Simulation"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">PHYSICS</span>
              </button>

              <button
                type="button"
                onClick={handleExportOntology}
                className="text-cyber-cyan hover:text-white border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                title="Export Ontological Knowledge Graph JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT GRAPH</span>
              </button>

              <div className="text-[10px] text-cyber-green border border-cyber-green/40 bg-cyber-green/5 px-2 py-0.5 rounded font-mono animate-pulse">
                {visibleNodes.length} NODES // {visibleLinks.length} EDGES
              </div>
            </div>
          </div>

          {/* Filtering and Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
            
            {/* Entity Type Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 bg-cyber-dark p-0.5 rounded border border-cyber-border text-[9px]">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  activeFilter === 'ALL'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                ALL ({nodes.length})
              </button>
              <button
                onClick={() => setActiveFilter('LureDocument')}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  activeFilter === 'LureDocument'
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                LURES ({nodes.filter(n => n.type === 'LureDocument').length})
              </button>
              <button
                onClick={() => setActiveFilter('ThreatEvent')}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  activeFilter === 'ThreatEvent'
                    ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                THREATS ({nodes.filter(n => n.type === 'ThreatEvent').length})
              </button>
              <button
                onClick={() => setActiveFilter('AdversaryIP')}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  activeFilter === 'AdversaryIP'
                    ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                SOURCE IPs ({nodes.filter(n => n.type === 'AdversaryIP').length})
              </button>
              <button
                onClick={() => setActiveFilter('HostNode')}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  activeFilter === 'HostNode'
                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/40'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                HOSTS ({nodes.filter(n => n.type === 'HostNode').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search node name, IP, or ID..."
                className="w-full bg-cyber-dark text-gray-200 pl-8 pr-3 py-1 rounded border border-cyber-border text-[10px] focus:border-cyber-cyan focus:outline-none"
              />
            </div>

          </div>

          {/* D3 Graph Canvas Viewport */}
          <div 
            ref={containerRef}
            className="flex-1 bg-cyber-dark/95 rounded border-2 border-cyber-border/80 h-[460px] relative overflow-hidden flex flex-col"
          >
            {/* Background cyber grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(22,34,58,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(22,34,58,0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Legend Overlay */}
            <div className="absolute top-3 left-3 bg-cyber-panel/90 border border-cyber-border p-2 rounded text-[9px] font-mono flex flex-col gap-1 z-10 backdrop-blur-md">
              <span className="text-[8px] uppercase tracking-wider text-gray-500 border-b border-cyber-border/50 pb-0.5">
                ONTOLOGICAL LEGEND
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-green" />
                <span className="text-gray-300">HostNode (Core Infrastructure)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                <span className="text-gray-300">LureDocument (Canary Decoy)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-yellow" />
                <span className="text-gray-300">DNSCanaryToken (Trap)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyber-red" />
                <span className="text-gray-300">AdversaryIP / ThreatEvent</span>
              </div>
            </div>

            {/* Zoom / Pan Floating Control Bar */}
            <div className="absolute bottom-3 right-3 bg-cyber-panel/90 border border-cyber-border p-1 rounded flex items-center gap-1 z-10 backdrop-blur-md">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-cyber-dark text-gray-300 hover:text-cyber-cyan transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-cyber-dark text-gray-300 hover:text-cyber-cyan transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="p-1 rounded hover:bg-cyber-dark text-gray-300 hover:text-cyber-green transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Instruction tooltip */}
            <div className="absolute top-3 right-3 text-[9px] font-mono text-gray-500 bg-cyber-dark/80 px-2 py-0.5 rounded border border-cyber-border/40 pointer-events-none">
              DRAG NODES TO POSITION // SCROLL TO ZOOM
            </div>

            {/* Actual D3 SVG Element */}
            <svg 
              ref={svgRef} 
              className="w-full h-full min-h-[440px]"
            />
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN: Ontological Object Inspector (4 columns) */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        <div className="p-4 rounded-lg border-2 border-cyber-border bg-cyber-panel/75 backdrop-blur-sm flex flex-col gap-4 h-full min-h-[460px]">
          
          <div className="flex items-center gap-2.5 border-b border-cyber-border/60 pb-3">
            <Info className="w-4 h-4 text-cyber-yellow" />
            <h3 className="font-display font-bold text-gray-100 text-sm tracking-wide">
              Ontological Object Inspector
            </h3>
          </div>

          <div className="flex-1 flex flex-col gap-3 font-mono text-xs overflow-y-auto">
            
            {/* Selected entity header card */}
            <div className="p-3 bg-cyber-dark/90 border border-cyber-border rounded space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">
                  ENTITY METADATA
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  selectedObject.type === 'HostNode' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/40' :
                  selectedObject.type === 'LureDocument' ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/40' :
                  selectedObject.type === 'DNSCanaryToken' ? 'bg-cyber-yellow/10 text-cyber-yellow border border-cyber-yellow/40' :
                  'bg-cyber-red/10 text-cyber-red border border-cyber-red/40 animate-pulse'
                }`}>
                  {selectedObject.type}
                </span>
              </div>

              <div className="text-sm font-bold text-gray-100 break-all">
                {selectedObject.name}
              </div>

              <div className="text-[10px] text-gray-400">
                {selectedObject.category}
              </div>

              <div className="text-[9px] text-gray-500 border-t border-cyber-border/40 pt-1 flex justify-between">
                <span>POC:</span>
                <span className="text-gray-300">{selectedObject.poc}</span>
              </div>
            </div>

            {/* Properties dynamic list */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                PROPERTIES SCHEMA
              </span>
              <div className="space-y-1">
                {Object.entries(selectedObject.properties).map(([k, v]) => (
                  <div key={k} className="p-2 border border-cyber-border bg-cyber-dark/50 rounded flex flex-col gap-0.5">
                    <span className="text-[8px] text-gray-500 uppercase">{k}</span>
                    <span className="text-gray-200 text-[10px] break-all">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Links / Relational Edges */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">
                CONNECTED RELATIONAL EDGES ({connectedLinks.length})
              </span>
              <div className="space-y-1 max-h-[130px] overflow-y-auto">
                {connectedLinks.map((link) => {
                  const sId = typeof link.source === 'string' ? link.source : (link.source as OntologicalNode).id;
                  const tId = typeof link.target === 'string' ? link.target : (link.target as OntologicalNode).id;
                  const otherId = sId === selectedObject.id ? tId : sId;
                  const isOutgoing = sId === selectedObject.id;

                  return (
                    <div 
                      key={link.id} 
                      onClick={() => setSelectedNodeId(otherId)}
                      className="p-1.5 border border-cyber-border/70 hover:border-cyber-cyan bg-cyber-dark/40 rounded text-[9px] flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-cyber-cyan flex items-center gap-1 truncate">
                        <span>{isOutgoing ? '→' : '←'}</span>
                        <span className="text-gray-200 font-semibold">{link.label}</span>
                      </span>
                      <span className="text-cyber-cyan truncate max-w-[90px]">{otherId}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kinetic Verbs / Sovereign Directives */}
            <div className="flex flex-col gap-2 mt-auto border-t border-cyber-border/60 pt-3">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyber-yellow" /> Kinetic Actions (Ontological Verbs)
              </span>

              <div className="grid grid-cols-2 gap-1.5 text-[9px] text-center">
                <button
                  type="button"
                  onClick={() => handleKineticAction('ISOLATE_ENTITY')}
                  className="py-1.5 px-1 border border-cyber-cyan/40 hover:border-cyber-cyan rounded bg-cyber-cyan/5 hover:bg-cyber-cyan/15 text-cyber-cyan transition-colors font-bold uppercase"
                >
                  Isolate Entity
                </button>

                <button
                  type="button"
                  onClick={() => handleKineticAction('QUARANTINE_TRAFFIC')}
                  className="py-1.5 px-1 border border-cyber-red/40 hover:border-cyber-red rounded bg-cyber-red/5 hover:bg-cyber-red/15 text-cyber-red transition-colors font-bold uppercase"
                >
                  Quarantine Node
                </button>

                <button
                  type="button"
                  onClick={() => handleKineticAction('PURGE_MEMORY_BUFFER')}
                  className="py-1.5 px-1 border border-cyber-yellow/40 hover:border-cyber-yellow rounded bg-cyber-yellow/5 hover:bg-cyber-yellow/15 text-cyber-yellow transition-colors font-bold uppercase"
                >
                  Zeroize Key
                </button>

                <button
                  type="button"
                  onClick={() => handleKineticAction('DEPLOY_CANARY_SWARM')}
                  className="py-1.5 px-1 border border-cyber-green/40 hover:border-cyber-green rounded bg-cyber-green/5 hover:bg-cyber-green/15 text-cyber-green transition-colors font-bold uppercase"
                >
                  Deploy Swarm
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
