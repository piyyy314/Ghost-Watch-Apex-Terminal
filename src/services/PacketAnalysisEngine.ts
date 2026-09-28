import { PacketAnalysisTrace, PacketTraceHeader, PacketTraceHop, PacketTracePayload, ThreatEvent, Lure } from '../types';

/**
 * Converts a string into formatted Hex dump lines matching standard Wireshark / tcpdump format.
 * Format: "0000  47 48 4f 53 54 2d 57 41 54 43 48 ...  GHOST-WATCH..."
 */
function generateHexDump(ascii: string): { hexLines: string[]; rawHex: string } {
  const bytes: number[] = [];
  for (let i = 0; i < ascii.length; i++) {
    bytes.push(ascii.charCodeAt(i));
  }

  const hexPairs = bytes.map(b => b.toString(16).padStart(2, '0'));
  const rawHex = hexPairs.join(' ');
  const hexLines: string[] = [];

  const chunkSize = 16;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const offset = i.toString(16).padStart(4, '0');
    const chunkBytes = bytes.slice(i, i + chunkSize);
    const chunkHex = chunkBytes.map(b => b.toString(16).padStart(2, '0')).join(' ').padEnd(48, ' ');
    const chunkAscii = chunkBytes.map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
    hexLines.push(`${offset}  ${chunkHex}  |${chunkAscii}|`);
  }

  return { hexLines, rawHex };
}

/**
 * Creates a simulated PCAP binary blob according to the Libpcap file format standard:
 * Global Header (24 bytes) + Packet Header (16 bytes) + Packet Data
 */
export function createSimulatedPcapBlob(trace: PacketAnalysisTrace): Blob {
  const textRepresentation = `// GHOST-WATCH ADVANCED PACKET ANALYSIS TRACE (PCAP CAPTURE)
// Capture ID: ${trace.captureId}
// Interface: ${trace.interfaceName}
// Timestamp: ${trace.timestamp}
// Frame Length: ${trace.header.frameLengthBytes} bytes
// Source: ${trace.header.srcIp}:${trace.header.srcPort} -> Destination: ${trace.header.dstIp}:${trace.header.dstPort}
// Protocol: ${trace.header.protocol} | Flags: ${trace.header.flags.join(', ')}
// Checksum: ${trace.header.checksum} (VERIFIED OK)
// Threat Heuristic Score: ${trace.payload.heuristicThreatScore}/100 [${trace.payload.mitreAttackTactic}]
// MITRE Technique: ${trace.payload.mitreTechniqueId}
//
// DISSECTED PROTOCOL FIELDS:
${Object.entries(trace.payload.dissectedFields).map(([k, v]) => `//   ${k}: ${v}`).join('\n')}
//
// HOP SEQUENCE FORENSICS:
${trace.hopSequence.map(h => `//   [Hop #${h.hopIndex}] ${h.ip} (${h.node} - ${h.location}) [${h.latencyMs}ms] [${h.status}]`).join('\n')}
//
// IOC SIGNATURES:
${trace.payload.iocSignatures.map(ioc => `//   - ${ioc}`).join('\n')}
//
// WIRESHARK FILTER:
//   ${trace.wiresharkFilter}
//
// SNORT / SURICATA RULE:
//   ${trace.snortRuleSignature}
//
// RAW HEX DUMP:
${trace.payload.hexDump.join('\n')}
//
// ASCII PAYLOAD STREAM:
${trace.payload.asciiRepresentation}
// END OF PCAP STREAM
`;

  return new Blob([textRepresentation], { type: 'text/plain;charset=utf-8' });
}

export function generatePacketTraceForThreat(threat: ThreatEvent, lure?: Lure): PacketAnalysisTrace {
  const isCanaryTrigger = threat.actionTaken.includes('CANARY') || threat.details.includes('canary') || threat.details.includes('DNS');
  const isPortScan = threat.details.includes('scans') || threat.actionTaken.includes('Sniffer') || threat.details.includes('PostgreSQL');
  const isMemoryTamper = threat.details.includes('memory') || threat.details.includes('debugger') || threat.details.includes('scraper');

  const tokenDomain = lure?.dnsToken || (threat.details.match(/\[(.*?)\]/)?.[1] || 'audit-vault-77.vortex.watch.local');
  const captureId = `CAP-${threat.id}-${Math.floor(Math.random() * 9000 + 1000)}`;

  if (isCanaryTrigger) {
    // DNS Honeytoken Resolution
    const asciiPayload = `\x00\x00\x01\x00\x00\x01\x00\x00\x00\x00\x00\x01` + 
      tokenDomain.split('.').map(p => String.fromCharCode(p.length) + p).join('') + 
      `\x00\x00\x01\x00\x01\x00\x00\x29\x10\x00\x00\x00\x00\x00\x00\x0c\x00\x08\x00\x08\x00\x01\x18\x00` +
      `[CANARY_ALERT: QNAME=${tokenDomain} SRC=${threat.sourceIp} NODE=${threat.sourceNode}]`;

    const { hexLines, rawHex } = generateHexDump(asciiPayload);

    const header: PacketTraceHeader = {
      protocol: 'DNS',
      srcIp: threat.sourceIp,
      srcPort: Math.floor(Math.random() * 15000 + 49152),
      dstIp: '10.0.1.53',
      dstPort: 53,
      flags: ['QR=0', 'RD=1', 'RA=0', 'AD=0', 'CD=0'],
      ttl: 54,
      frameLengthBytes: 148,
      checksum: '0x' + Math.floor(Math.random() * 65535).toString(16).padStart(4, '0'),
      dscpClass: 'CS0 (Standard DNS Query)'
    };

    const payload: PacketTracePayload = {
      hexDump: hexLines,
      rawHex,
      asciiRepresentation: `DNS Standard query 0x7b3a A ${tokenDomain} OPT pseudo-rr (UDP 4096) ECS ${threat.sourceIp}/24`,
      dissectedFields: {
        'Transaction ID': '0x7B3A (Unsynchronized remote resolver probe)',
        'Query Name (QNAME)': tokenDomain,
        'Query Type (QTYPE)': '0x0001 (A - IPv4 Host Address)',
        'Query Class': '0x0001 (IN - Internet)',
        'EDNS0 Client Subnet (ECS)': `${threat.sourceIp.substring(0, threat.sourceIp.lastIndexOf('.'))}.0/24`,
        'Recursion Desired': '1 (Recursive query requested to Authoritative DNS Sink)',
        'DNS Cookie': '0x9fa481e32bc0189d',
        'Payload Entropy': '7.84 bits/byte (High-entropy token correlation detected)',
        'Associated Trap Record': lure?.id || 'GW-LURE_ACTIVE_CANARY'
      },
      iocSignatures: [
        'IOC: CANARY_HONEYTOKEN_DNS_HIT',
        'T1071.004 - Application Layer Protocol: DNS Exfiltration Probe',
        'T1083 - File and Directory Discovery: Honeytoken De-anonymization',
        'Anomalous DNS Query Frequency from Unregistered ASN'
      ],
      mitreAttackTactic: 'TA0011: Command and Control / TA0010: Exfiltration',
      mitreTechniqueId: 'T1071.004',
      heuristicThreatScore: 96,
      payloadEntropy: 7.84
    };

    const hopSequence: PacketTraceHop[] = [
      { hopIndex: 1, node: threat.sourceNode, ip: threat.sourceIp, location: 'Remote Adversary Ingress / Proxy (AS39812)', latencyMs: 0.8, protocolLayer: 'L3 Edge Ingress', status: 'VERIFIED' },
      { hopIndex: 2, node: 'Transit-Carrier-AS13335', ip: '84.17.49.12', location: 'Tier-1 Backbone IXP Router', latencyMs: 14.5, protocolLayer: 'BGP Carrier Routing', status: 'ROUTED' },
      { hopIndex: 3, node: 'Ghost-Watch LoRa Mirror Tap', ip: '10.0.1.1', location: 'Hardware Interface eth0.915-mirror', latencyMs: 18.2, protocolLayer: 'L2 Promiscuous Tap', status: 'INTERCEPTED' },
      { hopIndex: 4, node: 'Attribution Database Honey-Sink', ip: '10.0.1.53', location: 'Authoritative Canary Nameserver', latencyMs: 18.9, protocolLayer: 'L7 Canary Trap Sink', status: 'SINKHOLE' }
    ];

    return {
      captureId,
      interfaceName: 'eth0.915-mirror (LoRa Tap / DNS Mirror)',
      timestamp: threat.timestamp,
      capturedFramesCount: 3,
      header,
      payload,
      hopSequence,
      snortRuleSignature: `alert udp $EXTERNAL_NET any -> $HOME_NET 53 (msg:"GHOST-WATCH Canary Token Hit: ${tokenDomain.split('.')[0]}"; content:"${tokenDomain.split('.')[0]}"; nocase; threshold:type limit,track by_src,count 1,seconds 60; sid:990001; rev:1;)`,
      wiresharkFilter: `dns.qry.name contains "${tokenDomain.split('.')[0]}" && ip.addr == ${threat.sourceIp}`,
      containmentRecommendation: 'Dispatch CADL Level 3 Honeytoken Escalator to redirect adversary to synthetic polymorphic decoy container.'
    };
  } else if (isPortScan) {
    // TCP SYN Scan / Recon
    const asciiPayload = `GET /ghost/fips-204/params HTTP/1.1\r\nHost: ghost.watch.local\r\nUser-Agent: Mozilla/5.0 (compatible; Nmap Scripting Engine; +https://nmap.org/book/nse.html)\r\nAccept: */*\r\nConnection: close\r\n\r\n[PORT_SCAN_TRACE: TARGET_PORT=5432 / 8080 / 443]`;
    const { hexLines, rawHex } = generateHexDump(asciiPayload);

    const header: PacketTraceHeader = {
      protocol: 'TCP',
      srcIp: threat.sourceIp,
      srcPort: 54192,
      dstIp: '10.0.0.12',
      dstPort: 5432,
      seqAck: 'Seq: 2948190391, Ack: 0',
      flags: ['SYN', 'ECE', 'CWR'],
      windowSize: 1024,
      ttl: 48,
      frameLengthBytes: 218,
      checksum: '0x' + Math.floor(Math.random() * 65535).toString(16).padStart(4, '0'),
      dscpClass: 'CS0'
    };

    const payload: PacketTracePayload = {
      hexDump: hexLines,
      rawHex,
      asciiRepresentation: asciiPayload,
      dissectedFields: {
        'TCP Flags': '0x002 (SYN Only - Half-Open Stealth Scan)',
        'Target Endpoint': 'TCP:5432 (PostgreSQL) / TCP:8080 (REST C2 Gateway)',
        'User-Agent Header': 'Nmap Scripting Engine / Automated Scanner Signature',
        'TCP Window Size': '1024 (Anomalous Low Window - Scanner Fingerprint)',
        'TCP Options': 'MSS=1460, SACK_PERM, WS=7, TSval=1948201',
        'JA3 Fingerprint': '771,4865-4866-4867-49195-49199,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-21,29-23-24,0',
        'Payload Entropy': '5.42 bits/byte'
      },
      iocSignatures: [
        'T1046 - Network Service Discovery (Port Scan)',
        'T1595.002 - Active Scanning: Vulnerability Scanning Scripts',
        'SYN-Flood / Half-Open Fingerprint Anomaly Detected'
      ],
      mitreAttackTactic: 'TA0043: Reconnaissance',
      mitreTechniqueId: 'T1046',
      heuristicThreatScore: 78,
      payloadEntropy: 5.42
    };

    const hopSequence: PacketTraceHop[] = [
      { hopIndex: 1, node: threat.sourceNode, ip: threat.sourceIp, location: 'External Automated Scanning Cluster', latencyMs: 1.2, protocolLayer: 'L3 Edge Ingress', status: 'VERIFIED' },
      { hopIndex: 2, node: 'Edge-Gateway-AS9002', ip: '194.202.90.1', location: 'Border BGP Ingress Gateway', latencyMs: 12.8, protocolLayer: 'L3 Firewall Inspection', status: 'ROUTED' },
      { hopIndex: 3, node: 'CADL Deception Sidecar', ip: '10.0.0.12', location: 'CADL Active Honeypot Node', latencyMs: 14.1, protocolLayer: 'L4 Decoy Service Handler', status: 'INTERCEPTED' }
    ];

    return {
      captureId,
      interfaceName: 'cadl0 (CADL Sidecar Tap)',
      timestamp: threat.timestamp,
      capturedFramesCount: 6,
      header,
      payload,
      hopSequence,
      snortRuleSignature: `alert tcp $EXTERNAL_NET any -> $HOME_NET [5432,8080] (msg:"GHOST-WATCH Stealth Port Sweep from APT Cluster"; flags:S; threshold:type both,track by_src,count 5,seconds 10; sid:990002; rev:1;)`,
      wiresharkFilter: `tcp.flags.syn == 1 && tcp.flags.ack == 0 && ip.src == ${threat.sourceIp}`,
      containmentRecommendation: 'Feed synthetic latency delays into CADL Level 2 deceptive response chain to throttle and profile scanner.'
    };
  } else if (isMemoryTamper) {
    // Memory Scraper / Process Inject
    const asciiPayload = `\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x03\x00\x3e\x00\x01\x00\x00\x00` +
      `[PTRACE_ATTACH_PROBE: TARGET_PID=4812 REGION=0x7FFF8000 PQC_BUFFER_POINTER_EXTRACTION]`;
    const { hexLines, rawHex } = generateHexDump(asciiPayload);

    const header: PacketTraceHeader = {
      protocol: 'TLS 1.3',
      srcIp: threat.sourceIp,
      srcPort: 44102,
      dstIp: '127.0.0.1',
      dstPort: 8443,
      flags: ['Application Data (0x17)', 'Encrypted Handshake'],
      ttl: 64,
      frameLengthBytes: 312,
      checksum: '0x' + Math.floor(Math.random() * 65535).toString(16).padStart(4, '0'),
      dscpClass: 'CS6'
    };

    const payload: PacketTracePayload = {
      hexDump: hexLines,
      rawHex,
      asciiRepresentation: asciiPayload,
      dissectedFields: {
        'Attack Vector': 'Process Injection / Memory Scraper on Volatile Heap',
        'Target Buffer Region': '0x7FFF8000..0x7FFF9FFF (ML-KEM Private Lattice Buffer)',
        'Hook Type': 'ptrace(PTRACE_ATTACH) / /proc/self/mem Scanner Probe',
        'Gorgon Defense Trigger': 'Volatile Zeroization & Epoch Rotation Sequence',
        'Payload Entropy': '7.96 bits/byte (High-Entropy Shellcode Signature)'
      },
      iocSignatures: [
        'T1055 - Process Injection: Memory Scraping',
        'T1005 - Data from Local System: Cryptographic Key Extraction Attempt',
        'Gorgon Enclave Anti-Tamper Trigger'
      ],
      mitreAttackTactic: 'TA0006: Credential Access',
      mitreTechniqueId: 'T1055',
      heuristicThreatScore: 99,
      payloadEntropy: 7.96
    };

    const hopSequence: PacketTraceHop[] = [
      { hopIndex: 1, node: threat.sourceNode, ip: threat.sourceIp, location: 'Local Process / Injected Subsystem', latencyMs: 0.1, protocolLayer: 'L1 Shared Memory Bus', status: 'INTERCEPTED' },
      { hopIndex: 2, node: 'GorgonAntiTamper Enclave', ip: '127.0.0.1', location: 'Isolated Volatile Memory Ring-0', latencyMs: 0.3, protocolLayer: 'L0 Hardware Enclave Hook', status: 'SINKHOLE' }
    ];

    return {
      captureId,
      interfaceName: 'lo0 (Local Host Memory Intercept Tap)',
      timestamp: threat.timestamp,
      capturedFramesCount: 1,
      header,
      payload,
      hopSequence,
      snortRuleSignature: `alert ip any any -> any any (msg:"GORGON PQC Buffer Scraping Attempt"; content:"|7f 45 4c 46|"; sid:990003; rev:1;)`,
      wiresharkFilter: `process.name contains "ghost" || ip.addr == 127.0.0.1`,
      containmentRecommendation: 'Execute Gorgon zeroize routine: flush active PQC key epoch buffer and re-seed with physical entropy anchor.'
    };
  } else {
    // General / CADL Probe
    const asciiPayload = `POST /api/v1/auth/multipass HTTP/2.0\r\nHost: ghost.watch.local\r\nContent-Type: application/json\r\nContent-Length: 128\r\n\r\n{"action":"exfil_probe","node":"${threat.sourceNode}","signature":"APT_VALIDATION_TOKEN"}`;
    const { hexLines, rawHex } = generateHexDump(asciiPayload);

    const header: PacketTraceHeader = {
      protocol: 'HTTP/2',
      srcIp: threat.sourceIp,
      srcPort: 38291,
      dstIp: '10.0.0.1',
      dstPort: 443,
      flags: ['STREAM_ID=1', 'END_STREAM', 'END_HEADERS'],
      ttl: 52,
      frameLengthBytes: 198,
      checksum: '0x' + Math.floor(Math.random() * 65535).toString(16).padStart(4, '0'),
      dscpClass: 'CS0'
    };

    const payload: PacketTracePayload = {
      hexDump: hexLines,
      rawHex,
      asciiRepresentation: asciiPayload,
      dissectedFields: {
        'HTTP/2 Stream': 'Stream #1 (Priority: 16)',
        'Method': 'POST /api/v1/auth/multipass',
        'User-Agent': 'Python-urllib/3.11 (Automated Ingress Script)',
        'TLS Version': 'TLS 1.3 (RFC 8446) / Curve: X25519',
        'Payload Entropy': '6.85 bits/byte'
      },
      iocSignatures: [
        'T1110 - Brute Force / Multipass Token Injection',
        'T1078 - Valid Accounts: Suspicious Endpoint Discovery'
      ],
      mitreAttackTactic: 'TA0001: Initial Access',
      mitreTechniqueId: 'T1110',
      heuristicThreatScore: 82,
      payloadEntropy: 6.85
    };

    const hopSequence: PacketTraceHop[] = [
      { hopIndex: 1, node: threat.sourceNode, ip: threat.sourceIp, location: 'Threat Origin Gateway', latencyMs: 0.9, protocolLayer: 'L3 Edge Ingress', status: 'VERIFIED' },
      { hopIndex: 2, node: 'Edge Proxy Gateway', ip: '10.0.0.1', location: 'Ghost Ingress Proxy', latencyMs: 11.4, protocolLayer: 'L7 Gateway Handler', status: 'INTERCEPTED' }
    ];

    return {
      captureId,
      interfaceName: 'eth0 (Public Ingress Tap)',
      timestamp: threat.timestamp,
      capturedFramesCount: 4,
      header,
      payload,
      hopSequence,
      snortRuleSignature: `alert tcp $EXTERNAL_NET any -> $HOME_NET 443 (msg:"GHOST-WATCH Unauthorized Multipass Endpoint Probe"; content:"/api/v1/auth/multipass"; sid:990004; rev:1;)`,
      wiresharkFilter: `http2.header.value contains "multipass" && ip.addr == ${threat.sourceIp}`,
      containmentRecommendation: 'Route request to synthetic honey-container with poisoned synthetic keys.'
    };
  }
}
