import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Play, Pause, Zap, Flame, Terminal as LogIcon, Target, Battery, RefreshCw, Crosshair, Download 
} from 'lucide-react';
import { AirInterceptObject } from '../types';

interface AegisDefenseSimulatorProps {
  onAddConsoleLog: (text: string, type?: 'info' | 'warn' | 'error' | 'success') => void;
}

export default function AegisDefenseSimulator({ onAddConsoleLog }: AegisDefenseSimulatorProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [threats, setThreats] = useState<AirInterceptObject[]>([
    { id: '1', name: 'CRED_SPRAY_BALLISTIC', type: 'brute_force', altitude: 95, speed: 0.8, defenseTier: 'None', interceptStatus: 'descending', xPos: 240 },
    { id: '2', name: 'EXFIL_PIVOT_APT37', type: 'Exfiltration', altitude: 75, speed: 1.2, defenseTier: 'None', interceptStatus: 'descending', xPos: 380 },
    { id: '3', name: 'MAL_SCAN_AUTO', type: 'recon', altitude: 45, speed: 0.5, defenseTier: 'None', interceptStatus: 'descending', xPos: 140 }
  ]);

  const [batteryPower, setBatteryPower] = useState(100);
  const [radarAngle, setRadarAngle] = useState(0);
  const [totalIntercepts, setTotalIntercepts] = useState(24);
  const [totalEscapes, setTotalEscapes] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDownloadAirspace = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      tacticalMetrics: {
        radarOperationalState: isPlaying ? 'SWEEPING' : 'HOLD',
        batteryPowerPercent: batteryPower,
        totalNeutralizedThreats: totalIntercepts,
        totalBarrierBreaches: totalEscapes,
      },
      currentAirspaceThreats: threats
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aegis_airspace_telemetry_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onAddConsoleLog('Citron Tree BMC tactical airspace telemetry state downloaded.', 'success');
  };
  
  // Keep the latest threats in a ref to avoid stale closure or side-effects in state updaters
  const threatsRef = useRef<AirInterceptObject[]>(threats);
  useEffect(() => {
    threatsRef.current = threats;
  }, [threats]);

  // Rotate custom radar sweep angle
  useEffect(() => {
    let animationId: number;
    const rotate = () => {
      setRadarAngle(prev => (prev + 2.5) % 360);
      animationId = requestAnimationFrame(rotate);
    };
    if (isPlaying) {
      animationId = requestAnimationFrame(rotate);
    }
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  // Main threat state updating loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentThreats = threatsRef.current;
      let escapedCount = 0;
      const logsToEmit: Array<{ text: string; type: 'info' | 'warn' | 'error' | 'success' }> = [];

      let updated = currentThreats.map(threat => {
        if (threat.interceptStatus === 'descending') {
          const nextAltitude = threat.altitude - threat.speed;
          
          // Check terminal threshold (breach)
          if (nextAltitude <= 5) {
            logsToEmit.push({
              text: `🚨 ALERT: Threat [${threat.name}] breached terminal barrier! Initiating emergency sanitization...`,
              type: 'error'
            });
            escapedCount += 1;
            return { ...threat, altitude: 0, interceptStatus: 'breached' as const };
          }
          return { ...threat, altitude: nextAltitude };
        }
        return threat;
      });

      // Decay dead objects and spawn new ones
      updated = updated.filter(threat => threat.interceptStatus !== 'destroyed' && threat.interceptStatus !== 'breached');

      // Spawn probability
      if (updated.length < 4 && Math.random() < 0.2) {
        const names = ['LATERAL_PIVOT_X', 'XMAS_PORT_PROB', 'ROOTKIT_VECTOR_SEC', 'APT39_BALLISTIC_TUNNEL', 'MALWARE_LUNCH_BEACON'];
        const types: AirInterceptObject['type'][] = ['Exfiltration', ' lateral_movement', 'recon', 'brute_force'];
        const randIdx = Math.floor(Math.random() * names.length);
        const randTypeIdx = Math.floor(Math.random() * types.length);

        const newThreat: AirInterceptObject = {
          id: String(Date.now() + Math.random()),
          name: names[randIdx],
          type: types[randTypeIdx],
          altitude: 95,
          speed: Math.random() * 0.8 + 0.4,
          defenseTier: 'None',
          interceptStatus: 'descending',
          xPos: Math.random() * 400 + 100
        };
        updated.push(newThreat);
        logsToEmit.push({
          text: `Green Pine Network Radar locks onto descending vector: ${newThreat.name}`,
          type: 'warn'
        });
      }

      // Emit logs outside render phase
      logsToEmit.forEach(log => {
        onAddConsoleLog(log.text, log.type);
      });

      // Increment escapes if any breached
      if (escapedCount > 0) {
        setTotalEscapes(e => e + escapedCount);
      }

      // Update threats
      setThreats(updated);

      // Slowly recharge battery power
      setBatteryPower(p => Math.min(100, p + 0.5));
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, onAddConsoleLog]);

  // Handle active weapons intercepts
  const handleIntercept = (threatId: string, weaponType: 'Arrow 3' | 'David\'s Sling' | 'Iron Dome' | 'Iron Beam') => {
    let powerCost = 15;
    if (weaponType === 'Iron Beam') powerCost = 30;

    if (batteryPower < powerCost) {
      onAddConsoleLog(`Weapons Fault: Low Aegis Power to arm weapon [${weaponType}]`, 'error');
      return;
    }

    setBatteryPower(p => Math.max(0, p - powerCost));
    onAddConsoleLog(`Battel Management System launches kinetic interceptor [${weaponType}] against target id ${threatId}...`, 'info');

    // Trigger state changes and logging directly on event click, not from within callback
    setTotalIntercepts(i => i + 1);
    onAddConsoleLog(`SUCCESS: Intercept confirmed by [${weaponType}]. Sub-orbital threat neutralized.`, 'success');

    setThreats(prev => prev.map(t => {
      if (t.id === threatId) {
        return { ...t, interceptStatus: 'destroyed' as const, defenseTier: weaponType };
      }
      return t;
    }));
  };

  // Canvas manual rendering fallback/animation details
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Concentric circles (Israeli Aegis Defense Areas)
    const centerX = canvas.width / 2;
    const centerY = canvas.height - 30;
    const maxRadius = centerY - 20;

    ctx.strokeStyle = '#16223a';
    ctx.lineWidth = 1;

    // Outer Grid (Arrow-3 sub-orbital protection)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius, Math.PI, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(7, 225, 249, 0.02)';
    ctx.fill();

    // Mid Radar Ring (David's Sling tracking zone)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.65, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // Inner Radar Ring (Iron Dome Deception canopy)
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxRadius * 0.35, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // Draw Citadel (Citron Tree BMC Central Hub)
    ctx.fillStyle = '#05f3a1';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, Math.PI, 2 * Math.PI);
    ctx.fill();

    // Radar Scanning Beam Arc
    const radarRad = (radarAngle * Math.PI) / 180;
    ctx.save();
    ctx.translate(centerX, centerY);
    const grad = ctx.createConicGradient(-Math.PI / 2, 0, 0);
    // Draw sector
    ctx.fillStyle = 'rgba(5, 243, 161, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, -radarRad - 0.5, -radarRad);
    ctx.lineTo(0, 0);
    ctx.fill();
    ctx.restore();

    // Render active threat lines and markers
    threats.forEach(t => {
      // Coordinate conversions:
      // xPos goes from 0-600. altitude goes from 0-100 where 100 is far sub-orbit, 0 is Citadel
      const tRadius = (t.altitude / 100) * maxRadius;
      const angleRatio = t.xPos / 600; // 0 to 1
      const theta = Math.PI + angleRatio * Math.PI; // Map onto semi-circular arc

      const tx = centerX + tRadius * Math.cos(theta);
      const ty = centerY + tRadius * Math.sin(theta);

      // Trailing lines
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(tx, ty);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
      ctx.stroke();

      // Threat marker
      ctx.fillStyle = t.interceptStatus === 'destroyed' ? '#05f3a1' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(tx, ty, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Threat text
      ctx.fillStyle = '#c8d2e6';
      ctx.font = '9px monospace';
      ctx.fillText(`${t.name} (Alt: ${Math.floor(t.altitude)}%)`, tx + 8, ty);
    });

    // Altitude lines
    ctx.strokeStyle = '#232d3f';
    ctx.fillStyle = '#475569';
    ctx.font = '8px monospace';
    // Sub-orbital text markers
    ctx.fillText("Arrow-3 Exo-atmospheric Zone (Alt 75%-100%)", 10, 40);
    ctx.fillText("David's Sling Lateral Tracking Zone (Alt 35%-75%)", 10, 110);
    ctx.fillText("Iron Dome Deception Canopy (Alt 5%-35%)", 10, 175);
    ctx.fillText("Citron Tree / Core DBMS (Alt 0%)", centerX - 75, centerY - 15);

  }, [threats, radarAngle]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 h-full">

      {/* LEFT COLUMN: Citron Tree air defense HUD radar (8 columns) */}
      <div className="xl:col-span-8 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between border-b border-cyber-border/60 pb-3 mb-2">
            <div className="flex items-center gap-3">
              <Crosshair className="w-5 h-5 text-cyber-green animate-pulse" />
              <div>
                <h2 className="font-display font-medium text-gray-100">Israeli Aegis Intercept Airspace HUD</h2>
                <p className="text-[10px] text-gray-400 font-mono">BATTLE MANAGEMENT CENTER (BMC) GREEN PINE RADAR FEED</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-cyber-dark hover:bg-cyber-dark/80 text-cyber-cyan border border-cyber-border rounded p-1 text-xs"
                title={isPlaying ? 'Pause radar' : 'Play radar'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleDownloadAirspace}
                className="text-cyber-green hover:text-white transition-all border border-cyber-green/40 hover:border-cyber-green bg-cyber-green/10 hover:bg-cyber-green/20 rounded px-2.5 py-1 text-[10px] flex items-center gap-1.5 font-mono cursor-pointer"
                title="Download Airspace Telemetry report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT TELEMETRY</span>
              </button>
              <span className="px-2 py-0.5 rounded border border-cyber-green-dim bg-cyber-green/5 text-cyber-green text-[10px] uppercase font-mono animate-pulse">
                CITRON TREE COMMITTED
              </span>
            </div>
          </div>

          <div className="flex-1 bg-cyber-dark rounded border border-cyber-border flex items-center justify-center relative min-h-[300px]">
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={260}
              className="w-full max-w-full block select-none bg-cyber-dark"
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive intercept panel controls & metrics (4 columns) */}
      <div className="xl:col-span-4 flex flex-col gap-4">
        <div className="p-5 rounded-lg border-2 border-cyber-border bg-cyber-panel/60 backdrop-blur-sm flex flex-col gap-4 h-full">
          <div className="flex items-center gap-3 border-b border-cyber-border/60 pb-3">
            <Shield className="w-5 h-5 text-cyber-cyan" />
            <h2 className="font-display font-medium text-gray-100">BMC Weapon Array Matrix</h2>
          </div>

          <div className="flex-1 flex flex-col gap-4 font-mono text-xs max-h-[350px] overflow-y-auto scrollbar-thin">
            
            {/* Battery & Stat display */}
            <div className="p-3 bg-cyber-dark rounded border border-cyber-border space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500">AEGIS BATTERY CELL:</span>
                <span className={batteryPower > 30 ? "text-cyber-green font-bold" : "text-cyber-red font-bold animate-pulse"}>
                  {Math.floor(batteryPower)}%
                </span>
              </div>
              <div className="w-full bg-cyber-border h-2 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${batteryPower > 30 ? 'bg-cyber-green' : 'bg-cyber-red'}`} 
                  style={{ width: `${batteryPower}%` }} 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9px] text-gray-400 mt-2">
                <div>
                  <span>NEUTRALIZED SCRIPTS:</span>
                  <div className="text-cyber-cyan text-sm font-bold">{totalIntercepts}</div>
                </div>
                <div>
                  <span>BARRIER BREACHED:</span>
                  <div className="text-cyber-red text-sm font-bold">{totalEscapes}</div>
                </div>
              </div>
            </div>

            {/* Locked target actions */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Active Radar Locks ({threats.length})</span>
              
              {threats.length === 0 ? (
                <div className="p-3 text-center border border-dashed border-cyber-border rounded text-gray-500 italic">
                  Airspace crystal clear. Green Pine sweeping...
                </div>
              ) : (
                <div className="space-y-2">
                  {threats.map(t => {
                    // Match to appropriate altitude tier
                    let optimalWeapon: 'Arrow 3' | 'David\'s Sling' | 'Iron Dome' | 'Iron Beam' = 'Arrow 3';
                    if (t.altitude < 35) optimalWeapon = 'Iron Beam';
                    else if (t.altitude < 75) optimalWeapon = 'Iron Dome';
                    else if (t.altitude < 95) optimalWeapon = "David's Sling";

                    return (
                      <div key={t.id} className="p-2.5 bg-cyber-dark/80 rounded border border-cyber-border flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-cyber-yellow font-bold">{t.name}</span>
                          <span className="text-gray-400">Alt: {Math.floor(t.altitude)}%</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] text-gray-500">RECOMMENDED: {optimalWeapon}</span>
                          <button
                            onClick={() => handleIntercept(t.id, optimalWeapon)}
                            className="bg-cyber-cyan/15 hover:bg-cyber-cyan/35 border border-cyber-cyan text-cyber-cyan px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all"
                          >
                            DISPATCH TIER
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tactical doctrine reminder */}
            <div className="p-2.5 border border-cyber-border/40 bg-cyber-dark/40 rounded text-[9px] text-gray-500 leading-snug">
              <span className="text-cyber-cyan font-bold block mb-0.5 uppercase">Israeli Battle Management Dogma:</span>
              Deterrence through active defense warning grids. David's Sling captures exfiltrations via automated honeypot redirects, and Iron Dome neutralizes low-tier port crawlers at lightning intervals.
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
