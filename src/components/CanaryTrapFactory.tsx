import React, { useState } from 'react';
import { 
  FileText, ShieldAlert, Cpu, Settings, CheckCircle, Database, HelpCircle, Download 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Lure } from '../types';

interface CanaryTrapFactoryProps {
  onRegisterCustomLure: (lure: Lure) => void;
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

const DOCUMENT_TEMPLATES = [
  {
    id: 'pqc-keys',
    title: 'NIST FIPS 213 (ML-KEM-768) Secret Parameter Set',
    original: `The module lattice-based key encapsulation mechanism utilizes an integer matrix division of 768 to establish a shared secret. Ephemeral keys derived under ML-KEM must employ a secure HKDF-SHA256 salt with a static length of 256 bits, ensuring backward compatibility with classical legacy clients.`,
    decoyReplacements: [
      { original: "768", decoy: "752 (modified polynomial constraint)" },
      { original: "matrix division", decoy: "matrix convolution" },
      { original: "HKDF-SHA256", decoy: "HKDF-MD5-HMAC (legacy hybrid)" },
      { original: "static length of 256 bits", decoy: "dynamic salt offset ranging from 128 to 384 bits" }
    ],
    metadataDefaults: {
      "System-Class": "Apex-C2-Vault",
      "PQC-Standard": "FIPS-203-Draft",
      "Created-By": "Citron-System-Svc",
      "Security-Level": "Cosmic-Direct"
    },
    suggestedNode: "vortex"
  },
  {
    id: 'lora-relay',
    title: 'LoRa Mesh-Net Radio Relay Spectrum Routing Configuration',
    original: `Grid communications utilize a LPWAN LoRa modulation bound to 915.0 MHz. Handshakes between the terminal HB-9982-AX-2026 and node vectors are authenticated using an SHA3-512 cryptographic HMAC token, resetting the frequency offset index every 300 seconds to evade spectrum jammer signatures.`,
    decoyReplacements: [
      { original: "915.0 MHz", decoy: "913.8 MHz (spectral bias corridor)" },
      { original: "SHA3-512", decoy: "SHA-1-Legacy (unaligned secure proxy)" },
      { original: "300 seconds", decoy: "1800 seconds (long-dwell spectrum sweep)" }
    ],
    metadataDefaults: {
      "RF-Standard": "LoRaWAN-Mesh",
      "Hardware-Binding": "HB-9982-AX-2026",
      "Created-By": "Operator-P01",
      "Security-Level": "Tactical-Grid"
    },
    suggestedNode: "neon"
  },
  {
    id: 'citron-missile-db',
    title: 'Citron Tree BMC Missile Intercept Database Coordinates',
    original: `The battle management center routes Arrow-3 tactical radar feeds database connections to server terminal green-pine-01 via port 5432 using standard PostgreSQL sslmode=verify-full. Schema partitions represent localized flight altitudes, indexing interception coefficients.`,
    decoyReplacements: [
      { original: "verify-full", decoy: "allow (unencrypted telemetry tunnel)" },
      { original: "green-pine-01", decoy: "green-pine-shadow-host" },
      { original: "port 5432", decoy: "port 15432 (custom diagnostic gate)" }
    ],
    metadataDefaults: {
      "Aegis-Standard": "Aigis-IV-BMC",
      "System-Class": "CitronTree-DB",
      "Created-By": "GreenPine-Auto",
      "Security-Level": "Supreme-Defense"
    },
    suggestedNode: "cobalt"
  }
];

export default function CanaryTrapFactory({ onRegisterCustomLure, onAddConsoleLog }: CanaryTrapFactoryProps) {
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [targetNode, setTargetNode] = useState('vortex.ghost.watch.local');
  const [watermarkType, setWatermarkType] = useState<'Linguistic' | 'Metadata' | 'Steganographic' | 'Hybrid'>('Linguistic');
  const [selectedReplacements, setSelectedReplacements] = useState<Record<string, boolean>>({});
  
  // Custom metadata variables
  const [customMetadata, setCustomMetadata] = useState<Record<string, string>>({
    "Origin-Platform": "Ghost-Watch-C2",
    "Watermark-Checksum": "0xFE239A"
  });
  
  // Steganography settings
  const [stegoLSBOffset, setStegoLSBOffset] = useState('0x40B3');
  const [stegoEmbedSize, setStegoEmbedSize] = useState('4.2 KB');

  const [isDeploying, setIsDeploying] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [deployedLureInfo, setDeployedLureInfo] = useState<Lure | null>(null);

  const template = DOCUMENT_TEMPLATES[selectedTemplateIdx];

  const toggleReplacement = (originalWord: string) => {
    setSelectedReplacements(prev => ({
      ...prev,
      [originalWord]: !prev[originalWord]
    }));
  };

  const getWatermarkedText = () => {
    let text = template.original;
    if (watermarkType !== 'Linguistic' && watermarkType !== 'Hybrid') return text;
    
    template.decoyReplacements.forEach(rep => {
      // If checked
      if (selectedReplacements[rep.original]) {
        text = text.replace(new RegExp(rep.original, 'g'), `[ALTERED: ${rep.decoy}]`);
      }
    });
    return text;
  };

  const handleDownloadDecoy = () => {
    const textToDownload = watermarkType === 'Linguistic' || watermarkType === 'Hybrid'
      ? getWatermarkedText()
      : template.original;

    const fileContent = `====================================================================
GHOST-WATCH SECURE WE-FORGE DECOY SYSTEM GENERANT
Created Stamp: ${new Date().toISOString()}
Target Node: ${targetNode}
Document Title: ${template.title}
Watermark Type: ${watermarkType}
====================================================================

DOCUMENT BODY:
-----------------
${textToDownload}

-----------------
GHOST-WATCH AUTOMATED METADATA SPECIFICATIONS:
ID: GW-LURE-${Math.floor(Math.random() * 90000 + 10000)}
DNS Token Beacon: audit-vault-${Math.floor(Math.random() * 800 + 100)}.${targetNode}
Checksum: ${customMetadata["Watermark-Checksum"] || '0xFE239A'}
Security Class: ${customMetadata["Security-Level"] || 'Cosmic-Direct'}
====================================================================
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `we_forge_decoy_${targetNode.replace(/\./g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog(`WE-FORGE Decoy document configuration downloaded successfully.`, 'success');
  };

  const handleCreateAndInject = () => {
    setIsDeploying(true);
    onAddConsoleLog(`Drafting WE-FORGE decoy template: ${template.title}`, 'info');

    setTimeout(() => {
      // Build watermark shiftsApplied structure
      const shifts: string[] = [];
      template.decoyReplacements.forEach(rep => {
        if (selectedReplacements[rep.original]) {
          shifts.push(`Replaced '${rep.original}' with '${rep.decoy}'`);
        }
      });

      if (shifts.length === 0 && (watermarkType === 'Linguistic' || watermarkType === 'Hybrid')) {
        shifts.push("No explicit linguistic replacements selected. Embedded default watermark hashing tag.");
      }

      const generatedLureId = `GW-LURE_2026_${Math.floor(Math.random() * 9000 + 1000)}_A9FC`;
      const generatedDnsToken = `audit-vault-${Math.floor(Math.random() * 800 + 100)}.${targetNode.replace('.local', '')}.local`;

      const newLure: Lure = {
        id: generatedLureId,
        targetNode: targetNode,
        dnsToken: generatedDnsToken,
        documentType: template.title,
        watermarkType: watermarkType,
        details: {
          originalText: template.original,
          watermarkedText: getWatermarkedText(),
          shiftsApplied: shifts,
          metadataTags: { ...template.metadataDefaults, ...customMetadata },
          stegoOffsetHex: watermarkType === 'Steganographic' || watermarkType === 'Hybrid' ? stegoLSBOffset : undefined,
          stegoPayloadSize: watermarkType === 'Steganographic' || watermarkType === 'Hybrid' ? stegoEmbedSize : undefined,
        },
        createdTimestamp: new Date().toISOString(),
        isTriggered: false,
        triggerCount: 0
      };

      onRegisterCustomLure(newLure);
      setDeployedLureInfo(newLure);
      setIsDeploying(false);
      setShowSuccessToast(true);
      onAddConsoleLog(`WE-FORGE Lure injected successfully: ${generatedLureId} targetted at [${targetNode}]`, 'success');
      
      // Clear replacements
      setSelectedReplacements({});
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full relative">
      
      {/* LEFT FORM SECTION: Configuration & Controls (5 columns) */}
      <div className="xl:col-span-5 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
            <Settings className="w-5 h-5 text-cyber-cyan" />
            <h2 className="font-display font-medium text-gray-100">Identifier Injection Configuration</h2>
          </div>

          {/* Target Host Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Configure Target Identity / Host</span>
            <select 
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="bg-cyber-dark/80 text-cyber-green border border-cyber-border rounded px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-cyber-cyan"
            >
              <option value="vortex.ghost.watch.local">vortex.ghost.watch.local (Core Vault Gateway)</option>
              <option value="neon.ghost.watch.local">neon.ghost.watch.local (Spectrum Relay)</option>
              <option value="cobalt.ghost.watch.local">cobalt.ghost.watch.local (Israel Aegis Database)</option>
              <option value="phantom.ghost.watch.local">phantom.ghost.watch.local (CADL Deception)</option>
              <option value="nexus.ghost.watch.local">nexus.ghost.watch.local (Operator Rail)</option>
            </select>
          </div>

          {/* Template document type */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Lure Content Paradigm (WE-FORGE Schema)</span>
            <div className="flex flex-col gap-2">
              {DOCUMENT_TEMPLATES.map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedTemplateIdx(idx);
                    setSelectedReplacements({});
                  }}
                  className={`p-2.5 rounded text-left border transition-all text-xs font-mono flex items-center justify-between ${
                    selectedTemplateIdx === idx 
                      ? 'border-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_8px_rgba(6,225,249,0.15)]' 
                      : 'border-cyber-border bg-cyber-dark/40 hover:bg-cyber-dark text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="truncate">{doc.title}</span>
                  <FileText className="w-4 h-4 ml-2 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Watermarking type selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Watermarking Injection Vectors</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {(['Linguistic', 'Metadata', 'Steganographic', 'Hybrid'] as const).map(wt => (
                <button
                  key={wt}
                  onClick={() => setWatermarkType(wt)}
                  className={`py-2 px-1 rounded border text-center transition-all ${
                    watermarkType === wt 
                      ? 'border-cyber-green bg-cyber-green/10 text-cyber-green' 
                      : 'border-cyber-border bg-cyber-dark/40 hover:bg-cyber-dark text-gray-400'
                  }`}
                >
                  {wt}
                </button>
              ))}
            </div>
          </div>

          {/* Customize Subsystem Settings */}
          <div className="p-3 bg-cyber-dark/80 rounded border border-cyber-border text-xs flex flex-col gap-2.5">
            {watermarkType === 'Linguistic' && (
              <>
                <div className="text-cyber-green font-mono text-[10px] uppercase tracking-widest font-bold">Linguistic Replacement Switch</div>
                <div className="text-[11px] text-gray-400 leading-relaxed">
                  Select key values/clauses below. The WE-FORGE generator swaps them with plausible, non-functional decoys to uniquely tag unauthorized exfiltrators.
                </div>
              </>
            )}

            {watermarkType === 'Metadata' && (
              <>
                <div className="text-cyber-green font-mono text-[10px] uppercase tracking-widest font-bold font-mono">Simulated DB Header Metadata Padding</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div>
                    <span className="text-gray-500">Security-Layer:</span>
                    <input 
                      type="text" 
                      value={customMetadata["Security-Level"] || "Cosmic-Direct"}
                      onChange={(e) => setCustomMetadata(prev => ({ ...prev, "Security-Level": e.target.value }))}
                      className="w-full bg-cyber-panel text-cyber-cyan border border-cyber-border rounded px-1.5 py-0.5 mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-gray-500">Checksum offset:</span>
                    <input 
                      type="text" 
                      value={customMetadata["Watermark-Checksum"] || "0xFE239A"}
                      onChange={(e) => setCustomMetadata(prev => ({ ...prev, "Watermark-Checksum": e.target.value }))}
                      className="w-full bg-cyber-panel text-cyber-cyan border border-cyber-border rounded px-1.5 py-0.5 mt-1"
                    />
                  </div>
                </div>
              </>
            )}

            {watermarkType === 'Steganographic' && (
              <>
                <div className="text-cyber-green font-mono text-[10px] uppercase tracking-widest font-bold">Least Significant Bit (LSB) Offset Tuning</div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div>
                    <span className="text-gray-500">LSB Byte Target:</span>
                    <input 
                      type="text" 
                      value={stegoLSBOffset}
                      onChange={(e) => setStegoLSBOffset(e.target.value)}
                      className="w-full bg-cyber-panel text-cyber-cyan border border-cyber-border rounded px-1.5 py-0.5 mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-gray-500">Decoy Encrypted Payload:</span>
                    <input 
                      type="text" 
                      value={stegoEmbedSize}
                      onChange={(e) => setStegoEmbedSize(e.target.value)}
                      className="w-full bg-cyber-panel text-cyber-cyan border border-cyber-border rounded px-1.5 py-0.5 mt-1"
                    />
                  </div>
                </div>
              </>
            )}

            {watermarkType === 'Hybrid' && (
              <div className="text-[11px] text-gray-400 font-mono leading-relaxed space-y-1">
                <span className="text-cyber-cyan font-bold block">🚨 HYBRID SYSTEM ENGAGED</span>
                <span>Active synthesis: Linguistic prose modifications + Steganographic LSB payload embedding + DB metadata injection tags. Highly resilient back-tracing.</span>
              </div>
            )}
          </div>

          {/* Trigger Button */}
          <button
            onClick={handleCreateAndInject}
            disabled={isDeploying}
            className={`w-full py-2.5 rounded font-display font-semibold border-2 text-sm uppercase transition-all tracking-wider ${
              isDeploying 
                ? 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow cursor-wait animate-pulse' 
                : 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan hover:bg-cyber-cyan/35 hover:shadow-[0_0_15px_rgba(6,225,249,0.3)]'
            }`}
          >
            {isDeploying ? 'WE-FORGE Synthesis Active...' : 'Inject & Synchronize Canary Lure'}
          </button>
        </div>
      </div>

      {/* RIGHT DISPLAY SECTION: Interactive WE-FORGE Compare Preview (7 columns) */}
      <div className="xl:col-span-7 flex flex-col h-full gap-4">
        
        {/* Comparison Board Card */}
        <div className="flex-1 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm p-5 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-cyber-yellow" />
              <h2 className="font-display font-medium text-gray-100">WE-FORGE Linguistic Variance Sandbox</h2>
            </div>
            <div className="px-2 py-0.5 rounded border border-cyber-yellow/40 bg-cyber-yellow/5 text-cyber-yellow text-[10px] font-mono animate-pulse">
              AUTOGENERATE PLAUSIBLE DECOYS
            </div>
          </div>

          {/* Side-by-side linguistic panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            
            {/* Original Panel */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                <span>Original Prose File</span>
                <span className="text-cyber-green text-[9px] border border-cyber-green/30 px-1 bg-cyber-green/5">HIGH SECURITY REPO</span>
              </div>
              <div className="flex-1 bg-cyber-dark/80 p-4 rounded border border-cyber-border font-mono text-xs text-gray-300 leading-relaxed h-[240px] overflow-y-auto">
                {template.original}
              </div>
            </div>

            {/* Simulated Watermarked Decoy Panel */}
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center justify-between">
                <span>Engaged WE-FORGE Decoy</span>
                <button
                  type="button"
                  onClick={handleDownloadDecoy}
                  className="text-cyber-cyan hover:text-white transition-all border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 rounded px-1.5 py-0.5 text-[9px] flex items-center gap-1 font-mono cursor-pointer"
                  title="Download Decoy Document"
                >
                  <Download className="w-3 h-3" />
                  <span>EXPORT DECOY</span>
                </button>
              </div>
              <div className="flex-1 bg-cyber-dark/85 p-4 rounded border border-cyber-border font-mono text-xs text-cyber-green leading-relaxed h-[240px] overflow-y-auto whitespace-pre-wrap select-all selection:bg-cyber-cyan/25">
                {watermarkType === 'Linguistic' || watermarkType === 'Hybrid' ? (
                  getWatermarkedText()
                ) : (
                  <span className="text-gray-500 italic">Linguistic modification is disabled. Lure content is exact. Tracking remains active via {watermarkType} tag methods.</span>
                )}
              </div>
            </div>

          </div>

          {/* Interactive Replacement Controls if Linguistic */}
          {(watermarkType === 'Linguistic' || watermarkType === 'Hybrid') && (
            <div className="mt-4 pt-4 border-t border-cyber-border/40 flex flex-col gap-2">
              <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Toggle Individual Plausible Bins</div>
              <div className="flex flex-wrap gap-2">
                {template.decoyReplacements.map(rep => {
                  const isActive = !!selectedReplacements[rep.original];
                  return (
                    <button
                      key={rep.original}
                      onClick={() => toggleReplacement(rep.original)}
                      className={`text-[11px] font-mono py-1 px-2.5 rounded border transition-all ${
                        isActive 
                          ? 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow text-shadow-glow' 
                          : 'border-cyber-border bg-cyber-dark/40 text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {isActive ? '✓ ' : '+ '} {rep.original} 🡒 {rep.decoy}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Successful integration modal / animation */}
        {showSuccessToast && deployedLureInfo && (
          <div className="p-4 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-cyber-green" />
              <div>
                <div className="text-cyber-green font-bold uppercase">CANARY LURE LIVE IN DIRECTORY</div>
                <div className="text-gray-400 mt-0.5">
                  ID: <span className="text-white">{deployedLureInfo.id}</span> | Beacon: <span className="text-cyber-yellow">{deployedLureInfo.dnsToken}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="px-2 py-1 rounded hover:bg-cyber-dark text-[10px] text-gray-400 hover:text-white transition-colors"
            >
              DISMISS
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
