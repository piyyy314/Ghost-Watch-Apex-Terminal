import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldX, Key, RotateCcw, Landmark, 
  Database, RefreshCw, FileWarning, EyeOff, Lock, Unlock, Download 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OmegaContingencyProps {
  isWiped: boolean;
  onSetIsWiped: (val: boolean) => void;
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
  onResetDatabase: () => void;
}

const MNEMONIC_WORDS = [
  "vortex", "neon", "carbon", "phantom", "nexus", "tactical", "sierra", "pulse", 
  "zenith", "echo", "quartz", "cobalt", "cipher", "orbit", "binary", "flux", 
  "omega", "hunter", "stealth", "grid", "shadow", "vertex", "ionic", "static"
];

export default function OmegaContingency({
  isWiped,
  onSetIsWiped,
  onAddConsoleLog,
  onResetDatabase
}: OmegaContingencyProps) {
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isStripping, setIsStripping] = useState(false);
  const [scrubFeedback, setScrubFeedback] = useState<string>('System idle. Sentinel status: Active.');
  const [showSeed, setShowSeed] = useState(false);

  const handleDownloadKeycard = () => {
    const fullSeed = MNEMONIC_WORDS.join(' ');
    const split1 = MNEMONIC_WORDS.slice(0, 12).join(' ');
    const split2 = MNEMONIC_WORDS.slice(12, 24).join(' ');

    const fileContent = `====================================================================
GHOST-WATCH SOVEREIGN PHYSICAL MNEMONIC SEGMENTS REPORT 
Classification: COSMIC-DIRECT // STANDALONE TRUST ROOT
Date Generated: ${new Date().toISOString()}
====================================================================

GEOGRAPHIC SPLIT-KEY DOCTRINE SUMMARY:
To prevent unauthorized reconstruction of the post-quantum connection 
terminal, the Cryo-Vault master root key is divided into separate 12-word
geographic sheets. Never store these files together in digital media.

-----------------
GEOGRAPHIC SEGMENT Split-1 ( Zurich, CHE )
-----------------
Vault Location: Alpha-Sovereign Storage Plate (Fireproof Plate)
Root Mnemonic Words [1..12]:
${split1}

-----------------
GEOGRAPHIC SEGMENT Split-2 ( Tel Aviv, ISR )
-----------------
Vault Location: Beta-Sovereign Cylindrical Storage Tube
Root Mnemonic Words [13..24]:
${split2}

-----------------
FULL ROOT SUMMARY:
-----------------
Full Mnemonic Seed Sequence:
${fullSeed}

====================================================================
WARNING: Decrypting files into raw local memory breaches tactical 
sovereign principles. Keep printed hardcopies in physical safes only.
====================================================================
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `omega_sovereign_splitkeys_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onAddConsoleLog('Sovereign bifurcated mnemonic key recovery templates downloaded.', 'success');
  };

  // Recovery challenges state
  const [recoveryInput, setRecoveryInput] = useState<string[]>(Array(6).fill(''));
  const [challengeIndices] = useState(() => {
    // Select 6 random indices to fill for restoring system
    const indices = new Set<number>();
    while (indices.size < 6) {
      indices.add(Math.floor(Math.random() * 24));
    }
    return Array.from(indices).sort((a,b)=>a-b);
  });
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState(false);

  const handleInitiatePurge = () => {
    setIsStripping(true);
    onAddConsoleLog("CRITICAL GHOST-WATCH COMMAND INITIATED: OMEGA CONTINGENCY ACTIVE DIRECTIVE.", "error");
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 4;
      setWipeProgress(progress);

      const purgeVectors = [
        "Unbinding hardware registers HB-9982-AX-2026...",
        "Scrubbing sub-orbital keycaps derived from ML-KEM-768...",
        "Purging LoRa Mesh-net out-of-band communication frequency registers...",
        "Scraping Citron Tree battle management center coordinate lists...",
        "Flushing active DNS canary beacons in ADB ledger...",
        "Scrambling Palantir ontology objects and relations...",
        "Overwriting active server memory pools with deep random noise offset..."
      ];
      const rIdx = Math.floor(Math.random() * purgeVectors.length);
      setScrubFeedback(purgeVectors[rIdx]);

      if (progress >= 100) {
        clearInterval(interval);
        onSetIsWiped(true);
        setIsStripping(false);
        onAddConsoleLog("CRITICAL: C2 TERMINAL WIPE COMPLETE. ALL VOLATILE ARCHITECTURE SCRUBBED.", "error");
        setScrubFeedback('Offline securely. Terminal Bindings Neutralized.');
      }
    }, 120);
  };

  const verifyRecoveryChallenge = () => {
    let hasError = false;
    challengeIndices.forEach((correctIdx, index) => {
      const enteredWord = recoveryInput[index]?.trim().toLowerCase();
      const expectedWord = MNEMONIC_WORDS[correctIdx];
      if (enteredWord !== expectedWord) {
        hasError = true;
      }
    });

    if (hasError) {
      setRestoreError(true);
      onAddConsoleLog("RECOVERY INCORRECT: Cryo-vault key verification mismatch. Lockout state retained.", "error");
    } else {
      setRestoreError(false);
      setRestoreSuccess(true);
      onAddConsoleLog("RECOVERY COMPLETE: Cryo-vault physical split-keys decrypted. Sovereign bindings restored.", "success");
      setTimeout(() => {
        // Reboot system
        onResetDatabase();
        onSetIsWiped(false);
        setWipeProgress(0);
        setRestoreSuccess(false);
        setRecoveryInput(Array(6).fill(''));
      }, 2500);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full relative">
      <AnimatePresence mode="wait">
        {!isWiped ? (
          /* UNWIPED MAIN PURGE PAGE (5 cols form, 7 cols warnings) */
          <>
            <motion.div 
              key="active-purge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="xl:col-span-5 flex flex-col gap-4"
            >
              <div className="p-5 rounded-lg border-2 border-cyber-red bg-cyber-panel/40 backdrop-blur-sm flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-cyber-border pb-3">
                  <AlertTriangle className="w-5 h-5 text-cyber-red animate-bounce" />
                  <h2 className="font-display font-medium text-gray-100 uppercase">Emergency Kill-Switch Action</h2>
                </div>

                <div className="p-3 bg-cyber-red/10 border border-cyber-red/40 rounded text-xs font-mono text-cyber-red leading-relaxed space-y-1.5">
                  <strong>🚨 DOCTRINE DIRECTIVE ALERT:</strong>
                  <p className="text-[10px] text-gray-300">
                    Executing the "Omega Contingency" triggers a complete, secure erasure of all volatile files, memory registries, ADB indices, and quantum cryptographic tunnels.
                  </p>
                  <p className="text-[10px] text-gray-300">
                    Preservation is retained only via physical paper/metal backups of your split-key seed offline.
                  </p>
                </div>

                {/* Progress bar info */}
                {isStripping && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-[11px] text-cyber-yellow">
                      <span>PURGING ACTIVE ENVIRONMENT MATRIX:</span>
                      <span>{wipeProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-cyber-border rounded overflow-hidden">
                      <div className="h-full bg-cyber-red animate-pulse" style={{ width: `${wipeProgress}%` }} />
                    </div>
                    <div className="text-[9px] text-cyber-red italic max-h-[40px] truncate">
                      {scrubFeedback}
                    </div>
                  </div>
                )}

                <button
                  disabled={isStripping}
                  onClick={handleInitiatePurge}
                  className={`w-full py-4 text-center font-display font-bold uppercase rounded border-2 text-sm tracking-widest transition-all ${
                    isStripping 
                      ? 'border-cyber-yellow bg-cyber-yellow/10 text-cyber-yellow cursor-wait' 
                      : 'border-cyber-red bg-cyber-red/15 hover:bg-cyber-red/30 text-cyber-red hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                  }`}
                >
                  {isStripping ? 'Executing Purge Loop...' : 'ACTIVATE CITRON OMEGA CONTINGENCY'}
                </button>
              </div>
            </motion.div>

            <motion.div 
              key="active-warnings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="xl:col-span-7 flex flex-col gap-4"
            >
              <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full min-h-[300px]">
                <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
                  <ShieldX className="w-5 h-5 text-cyber-yellow" />
                  <h2 className="font-display font-medium text-gray-100">Physical Anchor Split-Key Seed</h2>
                </div>

                <div className="flex-1 font-mono text-xs space-y-4">
                  <p className="text-gray-400 font-sans leading-relaxed">
                    To maintain sovereignty in compromised frameworks, access secrets are geographic bifurcated into two 12-word segments. The 24-word seed phrase remains the master root key of the Cryo-Vault.
                  </p>

                  <div className="p-3 bg-cyber-dark text-gray-400 rounded border border-cyber-border relative">
                    <div className="flex justify-between items-center mb-2 border-b border-cyber-border/40 pb-1.5">
                      <span className="text-[10px] text-cyber-yellow font-bold uppercase">Sovereign Mnemonic Keycard</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleDownloadKeycard}
                          className="text-[9px] border border-cyber-cyan/40 bg-cyber-cyan/5 hover:bg-cyber-cyan/20 text-cyber-cyan rounded px-2 py-0.5 hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Export Splitting Keycard Config"
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>EXPORT KEYCARD</span>
                        </button>
                        <button 
                          onClick={() => setShowSeed(p => !p)} 
                          className="text-[9px] border border-cyber-border rounded px-1.5 py-0.5 hover:text-white"
                        >
                          {showSeed ? 'HIDE FOR DECRYPTION' : 'DECRYPT & INSPECT'}
                        </button>
                      </div>
                    </div>

                    {showSeed ? (
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                        {MNEMONIC_WORDS.map((w, index) => (
                          <div key={index} className="p-1 px-1.5 border border-cyber-border/80 bg-cyber-panel rounded text-cyber-green">
                            <span className="text-gray-500 mr-1">{index+1}.</span>{w}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 gap-2 text-gray-500 italic">
                        <EyeOff className="w-6 h-6 opacity-40 text-cyber-yellow" />
                        <span>Mnemonic words encrypted to prevent browser shoulder-surfing</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px]">
                    <div className="p-3 border border-cyber-border bg-cyber-dark/40 rounded flex flex-col gap-1">
                      <span className="text-cyber-green font-bold">GEOGRAPHIC SEGMENT Split-1:</span>
                      <span className="text-gray-400 font-sans">
                        Words 1 through 12. Anchored inside deep physical fireproof plate Vault Location: Alpha-Sovereign, Zurich.
                      </span>
                    </div>
                    <div className="p-3 border border-cyber-border bg-cyber-dark/40 rounded flex flex-col gap-1">
                      <span className="text-cyber-cyan font-bold">GEOGRAPHIC SEGMENT Split-2:</span>
                      <span className="text-gray-400 font-sans">
                        Words 13 through 24. Anchored inside separate metal cylinder Vault Location: Beta-Sovereign, Tel Aviv.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          /* WIPED SCREEN TERMINAL RECONSTRUCTION (Sovereign Restore puzzle) */
          <motion.div 
            key="wiped-locked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="col-span-12 flex flex-col items-center justify-center min-h-[480px]"
          >
            <div className="w-full max-w-3xl p-6 rounded-lg border-2 border-cyber-red bg-cyber-dark/95 backdrop-blur-md shadow-[0_0_30px_rgba(244,63,94,0.15)] flex flex-col gap-5 scanline text-center">
              
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-cyber-red/10 border border-cyber-red/40 text-cyber-red animate-pulse">
                  <Lock className="w-10 h-10" />
                </div>
                <h1 className="font-display text-lg font-bold text-gray-100 uppercase tracking-widest mt-2">Sovereign Identity Offline</h1>
                <p className="text-xs font-mono text-gray-500 max-w-xl">
                  Node bindings uncoupled. To reconstruct the post-quantum C2 connection terminal, retrieve geographic metal split plate data and satisfy the mnemonic restore challenge.
                </p>
              </div>

              {/* Challenge cards entry */}
              <div className="p-4 bg-cyber-panel border-2 border-cyber-border rounded-lg text-left text-xs font-mono">
                <div className="text-cyber-yellow font-bold uppercase tracking-widest text-[10px] b-2 border-b border-cyber-border/40 pb-1.5 mb-3 flex items-center justify-between">
                  <span>Sovereign Word Challenge Verification Matrix</span>
                  <span>GEOMETHOD LOCK</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {challengeIndices.map((correctIdx, index) => (
                    <div key={correctIdx} className="p-2 border border-cyber-border/80 bg-cyber-dark/50 rounded flex flex-col gap-1">
                      <span className="text-[10px] text-gray-500">Mnemonic Word #{correctIdx + 1}:</span>
                      <input 
                        type="password"
                        value={recoveryInput[index]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRecoveryInput(prev => {
                            const updated = [...prev];
                            updated[index] = val;
                            return updated;
                          });
                        }}
                        placeholder="Enter word..."
                        className="bg-cyber-dark text-cyber-green border border-cyber-border rounded px-2 py-1 text-xs focus:outline-none focus:border-cyber-cyan"
                      />
                    </div>
                  ))}
                </div>

                {restoreError && (
                  <p className="text-cyber-red text-[11px] font-bold text-center mt-3">
                    ❌ CHALLENGE REJECTED: Cryptographic entropy checksum mismatch. Check geographical sheets and re-verify.
                  </p>
                )}

                {restoreSuccess && (
                  <p className="text-cyber-green text-[11px] font-bold text-center mt-3 animate-pulse flex items-center justify-center gap-1.5">
                    <Unlock className="w-4 h-4 animate-bounce" /> CHECK PASS: Cryptographic integrity aligned. Synchronizing system reboot sequences...
                  </p>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => {
                      // Help cheat tip
                      onAddConsoleLog(`Operational override: Recovery cheat tip words mapped index: ${challengeIndices.map(i => `${i+1}:${MNEMONIC_WORDS[i]}`).join(', ')}`, 'info');
                    }}
                    className="p-1 px-2.5 rounded border border-cyber-cyan/35 text-cyber-cyan hover:bg-cyber-cyan/10 text-[10px]"
                    title="Cheat Tip: prints correct words to log feed in help bar"
                  >
                    COGNITIVE BYPASS (LEAK SEED INDEX)
                  </button>

                  <button
                    disabled={restoreSuccess}
                    onClick={verifyRecoveryChallenge}
                    className="flex-1 py-1.5 bg-cyber-green/10 hover:bg-cyber-green/20 text-cyber-green border border-cyber-green rounded text-xs font-bold uppercase transition-all"
                  >
                    DECRYPT VAULT ENTROPY CELL
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
