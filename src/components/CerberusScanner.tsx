import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldAlert, Cpu, Percent, BarChart, Network, RefreshCw, CheckCircle2, Download, FileText 
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { BehavioralNode } from '../types';

interface CerberusScannerProps {
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  onAutoAddLure: (nodeName: string) => void;
}

export default function CerberusScanner({ onAddConsoleLog, onAutoAddLure }: CerberusScannerProps) {
  const [nodes, setNodes] = useState<BehavioralNode[]>([
    { name: 'vortex.ghost.watch.local', status: 'SAFE', ipAddress: '10.230.12.91', threatLevel: 8, metrics: { biometricDelayMs: 250, accessOffHoursPct: 5, dataEntropy: 2.1, commandFrequency: 1.2 }, assignedLuresCount: 2, lastScanned: 'Just now' },
    { name: 'neon.ghost.watch.local', status: 'SAFE', ipAddress: '10.230.12.102', threatLevel: 15, metrics: { biometricDelayMs: 280, accessOffHoursPct: 15, dataEntropy: 1.9, commandFrequency: 3.5 }, assignedLuresCount: 1, lastScanned: '2 mins ago' },
    { name: 'cobalt.ghost.watch.local', status: 'WARN', ipAddress: '10.14.99.12', threatLevel: 62, metrics: { biometricDelayMs: 110, accessOffHoursPct: 78, dataEntropy: 6.8, commandFrequency: 18.2 }, assignedLuresCount: 0, lastScanned: '5 mins ago' },
    { name: 'phantom.ghost.watch.local', status: 'SAFE', ipAddress: '10.21.3.44', threatLevel: 4, metrics: { biometricDelayMs: 310, accessOffHoursPct: 0, dataEntropy: 1.2, commandFrequency: 0.4 }, assignedLuresCount: 0, lastScanned: '1 hour ago' },
    { name: 'nexus.ghost.watch.local', status: 'COMPROMISED', ipAddress: '10.88.92.115', threatLevel: 94, metrics: { biometricDelayMs: 40, accessOffHoursPct: 95, dataEntropy: 7.9, commandFrequency: 45.1 }, assignedLuresCount: 0, lastScanned: 'Just now' }
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [lastScanSummary, setLastScanSummary] = useState<string>('Scan completed successfully. BSAU algorithms operating continuously.');

  const handleDownloadReport = () => {
    const reportData = {
      reportTimestamp: new Date().toISOString(),
      summary: lastScanSummary,
      complianceStandard: "NSITA / LAE Insider Threat Standard",
      evaluatedNodesCount: nodes.length,
      insiderRiskProfiles: nodes.map(node => ({
        nodeName: node.name,
        ipAddress: node.ipAddress,
        threatIndex: node.threatLevel,
        statusClassification: node.status,
        biometricKeystrokeLatencyMs: node.metrics.biometricDelayMs,
        offHoursAccessPct: node.metrics.accessOffHoursPct,
        fileEntropyScore: node.metrics.dataEntropy,
        commandTriggerFrequencySec: node.metrics.commandFrequency,
        deployTrapRemediationCount: node.assignedLuresCount,
        lastAuditedStamp: node.lastScanned
      }))
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cerberus_insider_risk_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddConsoleLog('Insider Risk Biometric Analytics & anomaly report downloaded successfully.', 'success');
  };

  const handleDownloadPDFReport = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
      let y = 15;

      // --- HEADER BANNER ---
      doc.setFillColor(11, 19, 36); // #0b1324
      doc.rect(0, 0, pageWidth, 30, 'F');

      // Cyber accent top border line
      doc.setFillColor(6, 182, 212); // #06b6d4 (cyber-cyan)
      doc.rect(0, 0, pageWidth, 2.5, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(6, 182, 212);
      doc.text('CERBERUS BSAU - VULNERABILITY & ANOMALY REPORT', 12, 13);

      // Subtitle & Metadata
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('NATIONAL INSIDER THREAT & BEHAVIORAL ANOMALY AUDIT (LAE / NSITA STANDARD)', 12, 19);
      doc.text(`DATE: ${new Date().toLocaleString()}  |  ENGINE: BSAU v4.2.1-SEC`, 12, 25);

      // Classification Box
      doc.setFillColor(239, 68, 68); // red
      doc.rect(pageWidth - 48, 8, 36, 14, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text('RESTRICTED // LAE', pageWidth - 46, 13);
      doc.text('INSIDER THREAT', pageWidth - 46, 18);

      y = 38;

      // --- EXECUTIVE SUMMARY SECTION ---
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(12, y, pageWidth - 24, 28, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(12, y, pageWidth - 24, 28, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('1. EXECUTIVE SUMMARY & SCAN STATS', 16, y + 6);

      const totalNodes = nodes.length;
      const compromised = nodes.filter(n => n.status === 'COMPROMISED').length;
      const warn = nodes.filter(n => n.status === 'WARN').length;
      const safe = nodes.filter(n => n.status === 'SAFE').length;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`Audited Endpoints: ${totalNodes}  |  Compromised: ${compromised}  |  Warnings: ${warn}  |  Clean: ${safe}`, 16, y + 12);

      // Status text message box
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const summaryLines = doc.splitTextToSize(`Audit Note: ${lastScanSummary}`, pageWidth - 36);
      doc.text(summaryLines, 16, y + 18);

      y += 35;

      // --- DETECTED VULNERABILITIES & ANOMALY ANALYSIS ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('2. EVALUATED ENDPOINT VULNERABILITY MATRIX', 12, y);

      y += 5;

      // Table Header
      doc.setFillColor(15, 23, 42);
      doc.rect(12, y, pageWidth - 24, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('ENDPOINT NODE', 15, y + 5);
      doc.text('IP ADDRESS', 65, y + 5);
      doc.text('STATUS', 105, y + 5);
      doc.text('THREAT INDEX', 135, y + 5);
      doc.text('ACTIVE LURES', 170, y + 5);

      y += 7;

      nodes.forEach((node, index) => {
        // Check if near page bottom
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 15;
        }

        const rowHeight = 30;

        // Alternating row background
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(12, y, pageWidth - 24, rowHeight, 'F');
        } else {
          doc.setFillColor(255, 255, 255);
          doc.rect(12, y, pageWidth - 24, rowHeight, 'F');
        }
        doc.setDrawColor(226, 232, 240);
        doc.rect(12, y, pageWidth - 24, rowHeight, 'S');

        // Main Row Data
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(node.name, 15, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(node.ipAddress, 65, y + 5);

        // Status Badge color
        if (node.status === 'COMPROMISED') {
          doc.setTextColor(220, 38, 38); // red-600
          doc.setFont('helvetica', 'bold');
        } else if (node.status === 'WARN') {
          doc.setTextColor(217, 119, 6); // amber-600
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setTextColor(22, 163, 74); // green-600
          doc.setFont('helvetica', 'bold');
        }
        doc.text(node.status, 105, y + 5);

        // Threat Score
        doc.setFont('helvetica', 'bold');
        doc.text(`${node.threatLevel} / 100`, 135, y + 5);

        // Active lures
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`${node.assignedLuresCount} lures`, 170, y + 5);

        // Detailed Biometric & Anomaly Indicators sub-panel
        let subY = y + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text('Biometric Metrics:', 15, subY);

        doc.setFont('helvetica', 'normal');
        doc.text(`Keystroke Delay: ${node.metrics.biometricDelayMs}ms | Off-Hours Access: ${node.metrics.accessOffHoursPct}% | Data Entropy: ${node.metrics.dataEntropy.toFixed(1)}H | Query Rate: ${node.metrics.commandFrequency.toFixed(1)}/min`, 42, subY);

        // Specific Detected Vulnerabilities list for this node
        subY += 5;
        const vulnerabilities: string[] = [];
        if (node.metrics.biometricDelayMs < 80) {
          vulnerabilities.push('CRITICAL: Keystroke Latency anomaly (< 80ms) - High probability of automated script/bot execution.');
        }
        if (node.metrics.accessOffHoursPct > 50) {
          vulnerabilities.push('WARNING: Severe Off-Hours Access (> 50%) - Unsanctioned temporal access pattern detected.');
        }
        if (node.metrics.dataEntropy > 5.5) {
          vulnerabilities.push('CRITICAL: High Shannon Data Entropy (> 5.5H) - Bulk encrypted data exfiltration indicator.');
        }
        if (node.metrics.commandFrequency > 25) {
          vulnerabilities.push('WARNING: Excessive Terminal Query Rate (> 25/min) - Automated network recon or credential harvesting.');
        }
        if (vulnerabilities.length === 0) {
          vulnerabilities.push('NOMINAL: No anomalous behavioral vulnerabilities identified for this node.');
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        if (node.status === 'COMPROMISED') {
          doc.setTextColor(185, 28, 28);
        } else if (node.status === 'WARN') {
          doc.setTextColor(180, 83, 9);
        } else {
          doc.setTextColor(21, 128, 61);
        }

        vulnerabilities.forEach(v => {
          doc.text(`- ${v}`, 15, subY);
          subY += 4;
        });

        y += rowHeight + 3;
      });

      y += 2;

      // Check height for recommendations section
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 15;
      }

      // --- STRATEGIC REMEDIATION & ACTION ITEMS ---
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.rect(12, y, pageWidth - 24, 28, 'F');
      doc.setDrawColor(199, 210, 254);
      doc.rect(12, y, pageWidth - 24, 28, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 27, 75);
      doc.text('3. RECOMMENDED REMEDIATION ACTIONS', 16, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('1. Deploy WE-FORGE Canary Trap lures to compromised nodes (nexus.ghost.watch.local) to attract malicious pivots.', 16, y + 12);
      doc.text('2. Force 2FA biometric re-authentication for elevated warning endpoints (cobalt.ghost.watch.local).', 16, y + 17);
      doc.text('3. Restrict off-hours network access rules & isolate high-entropy query tunnels.', 16, y + 22);

      y += 33;

      // --- FOOTER & SIGNATURE ---
      if (y > pageHeight - 20) {
        doc.addPage();
        y = pageHeight - 20;
      }

      doc.setDrawColor(203, 213, 225);
      doc.line(12, y, pageWidth - 12, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('CONFIDENTIAL - GHOST-WATCH SOVEREIGN DEFENSE SYSTEM', 12, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(`HASH: SHA256-CERBERUS-${Math.floor(Math.random() * 899999 + 100000)}-AUDIT`, pageWidth - 80, y + 5);

      // Save PDF
      doc.save(`cerberus_vulnerability_report_${Date.now()}.pdf`);
      onAddConsoleLog('Cerberus Vulnerability Summary PDF generated and downloaded successfully.', 'success');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      onAddConsoleLog('Error generating PDF report. Check browser console.', 'error');
    }
  };

  const handleRunFullScan = () => {
    setIsScanning(true);
    onAddConsoleLog("Cerberus BSAU scanner initiated. Analyzing terminal node biometrics, volume entropies, and active session streams...", "info");

    setTimeout(() => {
      setNodes(prev => prev.map(node => {
        // Randomize threat values slightly, keeping status classifications
        const change = Math.floor(Math.random() * 15) - 7;
        const newLevel = Math.max(0, Math.min(100, node.threatLevel + change));
        
        let newStatus: BehavioralNode['status'] = 'SAFE';
        if (newLevel >= 80) newStatus = 'COMPROMISED';
        else if (newLevel >= 45) newStatus = 'WARN';

        return {
          ...node,
          threatLevel: newLevel,
          status: newStatus,
          lastScanned: 'Just now'
        };
      }));

      setIsScanning(false);
      setLastScanSummary("Behavioral Audit finished. Warnings active on node: cobalt, Critical alert outstanding on node: nexus.");
      onAddConsoleLog("SUCCESS: Cerberus BSAU complete. Insider leak indicators evaluated. Host anomalies logged.", "success");
    }, 2500);
  };

  const handleDeployTargetedCanary = (nodeName: string) => {
    onAddConsoleLog(`Drafting targeted WE-FORGE canary for node: [${nodeName}] due to elevated threat profile.`, 'info');
    onAutoAddLure(nodeName);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">

      {/* LEFT COLUMN: Node scan metrics cards (8 columns) */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-2 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-cyber-cyan" />
              <div>
                <h2 className="font-display font-medium text-gray-100">Cerberus BSAU Behavior Scanner</h2>
                <p className="text-[10px] text-gray-400 font-mono">HUMAN-ELEMENT PRECISION INSIDER ANOMALY AUDIT (LAE / NSITA)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadPDFReport}
                className="text-cyber-yellow hover:text-white transition-all border border-cyber-yellow/40 hover:border-cyber-yellow bg-cyber-yellow/10 hover:bg-cyber-yellow/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                title="Generate & Download Formatted Vulnerability PDF Summary"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>DOWNLOAD VULNERABILITY PDF</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadReport}
                className="text-cyber-cyan hover:text-white transition-all border border-cyber-cyan/40 hover:border-cyber-cyan bg-cyber-cyan/10 hover:bg-cyber-cyan/20 rounded px-2.5 py-1.5 text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                title="Download Insider Risk Audit Report JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT JSON</span>
              </button>
              <button
                onClick={handleRunFullScan}
                disabled={isScanning}
                className={`font-mono text-xs border border-cyber-cyan px-3 py-1.5 rounded transition-all flex items-center gap-2 ${
                  isScanning 
                    ? 'bg-cyber-yellow/10 border-cyber-yellow text-cyber-yellow cursor-wait animate-pulse' 
                    : 'bg-cyber-cyan/15 text-cyber-cyan hover:bg-cyber-cyan/25'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'SCANNING NODE BIOMETRICS...' : 'RUN FORENSIC BSAU ANOMALY AUDIT'}
              </button>
            </div>
          </div>

          {/* Node Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {nodes.map(node => (
              <div 
                key={node.name}
                className={`p-4 rounded border-2 bg-cyber-dark/40 flex flex-col gap-3 relative overflow-hidden transition-all ${
                  node.status === 'COMPROMISED' 
                    ? 'border-cyber-red bg-cyber-red/5' 
                    : node.status === 'WARN' 
                      ? 'border-cyber-yellow bg-cyber-yellow/5' 
                      : 'border-cyber-border'
                }`}
              >
                {/* Node Status Badge */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block uppercase">NODE ENDPOINT</span>
                    <h3 className="text-xs font-mono font-bold text-gray-200">{node.name}</h3>
                    <span className="text-[9px] text-gray-400 font-mono">IP: {node.ipAddress}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                    node.status === 'COMPROMISED' 
                      ? 'border-cyber-red text-cyber-red bg-cyber-red/10 animate-pulse' 
                      : node.status === 'WARN' 
                        ? 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10' 
                        : 'border-cyber-green-dim text-cyber-green bg-cyber-green/5'
                  }`}>
                    {node.status}
                  </span>
                </div>

                {/* Threat Index gauge */}
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-gray-500">THREAT INDEX:</span>
                  <div className="flex-1 bg-cyber-border h-1.5 rounded overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        node.status === 'COMPROMISED' ? 'bg-cyber-red' : node.status === 'WARN' ? 'bg-cyber-yellow' : 'bg-cyber-green'
                      }`}
                      style={{ width: `${node.threatLevel}%` }}
                    />
                  </div>
                  <span className={`font-bold ${
                    node.status === 'COMPROMISED' ? 'text-cyber-red' : node.status === 'WARN' ? 'text-cyber-yellow' : 'text-cyber-green'
                  }`}>
                    {node.threatLevel}/100
                  </span>
                </div>

                {/* Metric items */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px] text-gray-400 bg-cyber-dark/70 p-2 rounded border border-cyber-border/40">
                  <div className="flex justify-between border-r border-cyber-border/40 pr-1.5">
                    <span>Keystroke Delay:</span>
                    <span className={node.metrics.biometricDelayMs < 80 ? 'text-cyber-red font-bold' : 'text-gray-300'}>
                      {node.metrics.biometricDelayMs}ms
                    </span>
                  </div>
                  <div className="flex justify-between pl-1.5">
                    <span>Off-Hours Acc:</span>
                    <span className={node.metrics.accessOffHoursPct > 50 ? 'text-cyber-red font-bold' : 'text-gray-300'}>
                      {node.metrics.accessOffHoursPct}%
                    </span>
                  </div>
                  <div className="flex justify-between border-r border-cyber-border/40 pr-1.5 mt-1 border-t border-cyber-border/20 pt-1">
                    <span>Data Entropy:</span>
                    <span className={node.metrics.dataEntropy > 5.5 ? 'text-cyber-red font-bold' : 'text-gray-300'}>
                      {node.metrics.dataEntropy.toFixed(1)}H
                    </span>
                  </div>
                  <div className="flex justify-between pl-1.5 mt-1 border-t border-cyber-border/20 pt-1">
                    <span>Queries/min:</span>
                    <span className={node.metrics.commandFrequency > 25 ? 'text-cyber-red font-bold' : 'text-gray-300'}>
                      {node.metrics.commandFrequency.toFixed(1)}/m
                    </span>
                  </div>
                </div>

                {/* Deploy Targeted Canary Trap */}
                {node.status !== 'SAFE' && (
                  <button
                    onClick={() => handleDeployTargetedCanary(node.name)}
                    className="w-full mt-1.5 py-1 text-center font-mono text-[9px] font-bold uppercase rounded border border-cyber-yellow/60 hover:border-cyber-yellow hover:bg-cyber-yellow/10 text-cyber-yellow transition-all"
                  >
                    Deploy Targeted WE-FORGE Canary Lure
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Behavioral Unit Info & Doctrine (4 columns) */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
          <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
            <UserCheck className="w-5 h-5 text-cyber-yellow" />
            <h2 className="font-display font-medium text-gray-100">Behavioral Study Unit (BSAU)</h2>
          </div>

          <div className="flex-1 flex flex-col text-xs font-mono gap-4 overflow-y-auto max-h-[350px] scrollbar-thin">
            
            <div className="p-3 bg-cyber-dark/80 rounded border border-cyber-border flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-500 uppercase">BSAU LOG STATE</span>
              <p className="text-cyber-green leading-relaxed text-[11px]">
                {lastScanSummary}
              </p>
            </div>

            {/* Explanatory indicators */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Anomaly Weight Matrix</span>
              
              <div className="p-2 border border-cyber-border bg-cyber-dark/40 rounded flex flex-col gap-0.5">
                <span className="text-cyber-cyan font-bold text-[10px]">1. KEYSTROKE BIOMETRIC DELAY</span>
                <span className="text-[10px] text-gray-400 font-sans leading-normal">
                  Identifies typing cadence shift. Script or high-speed automation access results in biometric delay dropping below 100ms, signaling credential compromise.
                </span>
              </div>

              <div className="p-2 border border-cyber-border bg-cyber-dark/40 rounded flex flex-col gap-0.5">
                <span className="text-cyber-yellow font-bold text-[10px]">2. SHANNON QUERY DATA ENTROPY</span>
                <span className="text-[10px] text-gray-400 font-sans leading-normal">
                  Measures data chaos index. Exfiltration pivots pull highly unstructured file arrays, leading to sudden spikes in mathematical byte entropy (threshold above 5.5H is suspicious).
                </span>
              </div>

              <div className="p-2 border border-cyber-border bg-cyber-dark/40 rounded flex flex-col gap-0.5">
                <span className="text-cyber-red font-bold text-[10px]">3. ACCESS OFF-HOURS & ACTIONS</span>
                <span className="text-[10px] text-gray-400 font-sans leading-normal">
                  Probes lateral speed. state-sponsored actor pivots query massive directory matrices inside 5 minutes during unsanctioned system periods, trigger immediate warnings.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
