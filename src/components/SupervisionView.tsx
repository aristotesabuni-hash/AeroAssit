import React, { useState } from 'react';
import { NetworkEquipment, VlanDefinition, ProbeResult, AlertItem } from '../types';
import { LAB_WHITELIST_IPS } from '../data/initialData';
import { 
  Server, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Terminal, 
  RefreshCw, 
  Power, 
  Wrench,
  Search,
  Sliders,
  Clock,
  Layers
} from 'lucide-react';

interface SupervisionViewProps {
  equipments: NetworkEquipment[];
  setEquipments: React.Dispatch<React.SetStateAction<NetworkEquipment[]>>;
  vlans: VlanDefinition[];
  onAddLog: (log: ProbeResult) => void;
  onAddAlert: (alert: AlertItem) => void;
  alerts: AlertItem[];
}

export const SupervisionView: React.FC<SupervisionViewProps> = ({
  equipments,
  setEquipments,
  vlans,
  onAddLog,
  onAddAlert,
  alerts,
}) => {
  // Selected equipment for manual probe & diagnostic
  const [selectedEqId, setSelectedEqId] = useState<string>('eq-web-01');
  const [selectedTool, setSelectedTool] = useState<'ping' | 'tcp' | 'dns' | 'http' | 'logs'>('ping');
  const [customIp, setCustomIp] = useState<string>('');
  const [customPort, setCustomPort] = useState<number>(80);
  const [isRunningProbe, setIsRunningProbe] = useState<boolean>(false);
  const [probeTerminalOutput, setProbeTerminalOutput] = useState<string[]>([]);
  
  // Diagnostic session (max 5 tool calls limit)
  const [diagnosticCallsCount, setDiagnosticCallsCount] = useState<number>(0);
  const MAX_DIAGNOSTIC_CALLS = 5;
  const [diagnosticReport, setDiagnosticReport] = useState<{
    status: 'idle' | 'running' | 'completed';
    target: string;
    steps: { tool: string; result: string; ok: boolean }[];
    verdict?: string;
    recommendation?: string;
  }>({
    status: 'idle',
    target: '',
    steps: [],
  });

  const selectedEquipment = equipments.find((e) => e.id === selectedEqId) || equipments[0];

  // Helper to log in terminal
  const appendTerminal = (line: string) => {
    setProbeTerminalOutput((prev) => [...prev, `[${new Date().toLocaleTimeString('fr-FR')}] ${line}`]);
  };

  // Run single probe (Ping, TCP, DNS, HTTP, Logs)
  const executeProbe = (targetIpInput?: string, toolInput?: 'ping' | 'tcp' | 'dns' | 'http' | 'logs', portInput?: number) => {
    const targetIp = (targetIpInput || customIp || selectedEquipment.ip).trim();
    const tool = toolInput || selectedTool;
    const port = portInput || customPort;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    setIsRunningProbe(true);
    appendTerminal(`Exécution de la sonde [${tool.toUpperCase()}] vers ${targetIp}...`);

    // 1. SAFETY RULE : STRICT WHITELIST CHECK (Academic Scenario 9)
    const isWhitelisted = LAB_WHITELIST_IPS.includes(targetIp);
    if (!isWhitelisted) {
      setTimeout(() => {
        const errorMsg = `BLOCAGE SÉCURITÉ : L'adresse cible ${targetIp} N'EST PAS DANS LA LISTE BLANCHE du laboratoire EVE-NG isolé ! Tout paquet vers un réseau externe ou non autorisé est formellement bloqué par la politique de sécurité.`;
        appendTerminal(`⛔ ${errorMsg}`);

        const blockedLog: ProbeResult = {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          targetIp,
          tool,
          status: 'BLOCKED',
          whitelisted: false,
          output: errorMsg,
          reason: 'Violation de la liste blanche de sécurité du laboratoire isolé.',
        };
        onAddLog(blockedLog);

        onAddAlert({
          id: `alt-${Date.now()}`,
          timestamp: nowStr,
          equipmentId: 'unknown',
          hostname: targetIp,
          severity: 'high',
          title: 'Tentative de sonde hors liste blanche interceptée',
          description: `Une sonde ${tool} a été dirigée vers l'adresse ${targetIp} hors périmètre lab. Rejet immédiat.`,
          acknowledged: false,
          resolved: false,
          recommendedAction: 'Vérifier la provenance de la commande et maintenir le filtrage strict.',
        });

        setIsRunningProbe(false);
      }, 400);
      return;
    }

    // 2. Execute Probe on Whitelisted Lab Node
    const eq = equipments.find((e) => e.ip === targetIp) || selectedEquipment;

    setTimeout(() => {
      let status: 'SUCCESS' | 'FAILURE' = 'SUCCESS';
      let latencyMs = Math.floor(Math.random() * 3) + 1.2;
      let output = '';

      if (tool === 'ping') {
        if (eq.status === 'offline') {
          status = 'FAILURE';
          output = `PING ${targetIp} : Host unreachable (100% packet loss, 4 packets transmitted, 0 received)`;
          appendTerminal(`❌ ${output}`);
        } else {
          output = `PING ${targetIp} : 4 packets transmitted, 4 received, 0% packet loss, time ${latencyMs.toFixed(1)}ms`;
          appendTerminal(`✅ ${output}`);
        }
      } else if (tool === 'tcp') {
        const isOpen = eq.openPorts.includes(port) && eq.status !== 'offline';
        if (isOpen) {
          output = `TCP ${targetIp}:${port} : Port OPEN (SYN-ACK received in ${latencyMs.toFixed(1)}ms)`;
          appendTerminal(`✅ ${output}`);
        } else {
          status = 'FAILURE';
          output = `TCP ${targetIp}:${port} : Port CLOSED / Connection Refused (RST packet received)`;
          appendTerminal(`❌ ${output}`);
        }
      } else if (tool === 'dns') {
        if (eq.hostname === 'DNS-LAB' && eq.status === 'critical') {
          status = 'FAILURE';
          output = `DNS Query -> lab.aeroassist.local via ${targetIp}:53 : SERVFAIL / Timeout (No answer from DNS server)`;
          appendTerminal(`❌ ${output}`);
        } else {
          output = `DNS Query -> lab.aeroassist.local via ${targetIp}:53 : OK (Answer: 192.168.30.10, TTL: 300s)`;
          appendTerminal(`✅ ${output}`);
        }
      } else if (tool === 'http') {
        if (eq.hostname === 'WEB-LAB' && (eq.status === 'critical' || !eq.openPorts.includes(80))) {
          status = 'FAILURE';
          output = `HTTP GET http://${targetIp}/ : 503 Service Unavailable / Connection reset by peer`;
          appendTerminal(`❌ ${output}`);
        } else {
          output = `HTTP GET http://${targetIp}/ : HTTP/1.1 200 OK (Content-Length: 4096, Server: Apache/2.4 Lab EVE-NG)`;
          appendTerminal(`✅ ${output}`);
        }
      } else if (tool === 'logs') {
        output = `System journal of ${eq.hostname} (${targetIp}): Last 3 entries inspectés. Aucune anomalie de kernel.`;
        appendTerminal(`📄 ${output}`);
      }

      const log: ProbeResult = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        targetIp,
        targetHostname: eq.hostname,
        tool,
        port: tool === 'tcp' ? port : undefined,
        status,
        latencyMs,
        whitelisted: true,
        output,
      };
      onAddLog(log);
      setIsRunningProbe(false);
    }, 500);
  };

  // Launch Automated 5-Step Diagnostic Session
  const startGuidedDiagnostic = (targetEq: NetworkEquipment) => {
    setDiagnosticCallsCount(0);
    setDiagnosticReport({
      status: 'running',
      target: targetEq.hostname,
      steps: [],
    });
    appendTerminal(`=== Début de la session de diagnostic assisté sur ${targetEq.hostname} (${targetEq.ip}) ===`);

    const steps: { tool: string; result: string; ok: boolean }[] = [];
    let count = 0;

    // Step 1: Ping
    count++;
    const pingOk = targetEq.status !== 'offline';
    steps.push({
      tool: 'Sonde 1/5 : ICMP Ping',
      result: pingOk ? `Hôte joignable (Latence: 1.6ms)` : `Hôte injoignable (100% perte)`,
      ok: pingOk,
    });
    appendTerminal(`[Diagnostic 1/5] Ping : ${pingOk ? 'OK' : 'ÉCHEC'}`);

    // Step 2: TCP Port 80 ou 53
    count++;
    const checkPort = targetEq.hostname === 'DNS-LAB' ? 53 : 80;
    const tcpOk = targetEq.openPorts.includes(checkPort) && targetEq.status !== 'offline';
    steps.push({
      tool: `Sonde 2/5 : TCP Socket ${checkPort}`,
      result: tcpOk ? `Port ${checkPort} ouvert` : `Port ${checkPort} FERMÉ / Connection refused`,
      ok: tcpOk,
    });
    appendTerminal(`[Diagnostic 2/5] TCP Port ${checkPort} : ${tcpOk ? 'OK' : 'FERMÉ'}`);

    // Step 3: Service-level query (HTTP or DNS)
    count++;
    const serviceOk = targetEq.status === 'nominal';
    const serviceName = targetEq.hostname === 'DNS-LAB' ? 'DNS Resolution' : 'HTTP GET';
    steps.push({
      tool: `Sonde 3/5 : ${serviceName}`,
      result: serviceOk ? `Code 200 OK / Réponse faisant autorité` : `Code 503 / SERVFAIL`,
      ok: serviceOk,
    });
    appendTerminal(`[Diagnostic 3/5] ${serviceName} : ${serviceOk ? 'OK' : 'ÉCHEC'}`);

    // Step 4: Host log check
    count++;
    steps.push({
      tool: 'Sonde 4/5 : Analyse du journal système',
      result: serviceOk
        ? 'Journaux nominaux (processus actif)'
        : `Anomalie détectée : Processus ${targetEq.hostname === 'DNS-LAB' ? 'named' : 'apache2'} arrêté inopinément`,
      ok: serviceOk,
    });
    appendTerminal(`[Diagnostic 4/5] Journaux système inspectés.`);

    // Finalize report without exceeding 5 calls
    setDiagnosticCallsCount(count);

    let verdict = 'Équipement pleinement opérationnel.';
    let recommendation = 'Aucune intervention requise.';

    if (!pingOk) {
      verdict = 'Équipement physiquement inaccessible ou interface réseau désactivée dans EVE-NG.';
      recommendation = `TECHNICIEN : Vérifier la connectivité de la VM ${targetEq.hostname} sur le VLAN ${targetEq.vlan} et exécuter la commande 'ip link set dev eth0 up' sur la console EVE-NG. (Aucune modification automatique effectuée).`;
    } else if (!tcpOk || !serviceOk) {
      if (targetEq.hostname === 'WEB-LAB') {
        verdict = 'Service web HTTP arrêté sur la machine virtuelle de maquette.';
        recommendation = `TECHNICIEN : Connectez-vous en SSH (ou console EVE-NG) sur WEB-LAB (192.168.30.10) et lancez 'systemctl status apache2' puis 'systemctl restart apache2'. Contrôlez ensuite le port 80. (Validation humaine obligatoire).`;
      } else if (targetEq.hostname === 'DNS-LAB') {
        verdict = 'Démon de résolution de noms Bind9 indisponible ou zone altérée.';
        recommendation = `TECHNICIEN : Contrôler le service sur DNS-LAB (192.168.30.11) avec 'systemctl restart bind9' et vérifier '/etc/bind/named.conf.local'. (Validation humaine obligatoire).`;
      }
    }

    setDiagnosticReport({
      status: 'completed',
      target: targetEq.hostname,
      steps,
      verdict,
      recommendation,
    });
    appendTerminal(`=== Diagnostic terminé (${count}/5 outils consommés). Recommandation transmise au technicien. ===`);
  };

  // Incident Simulation Handlers (for academic demo)
  const triggerWebFailure = () => {
    setEquipments((prev) =>
      prev.map((e) =>
        e.id === 'eq-web-01'
          ? {
              ...e,
              status: 'critical',
              openPorts: [22], // port 80 closed!
              httpStatus: 503,
              isSimulatedFailure: true,
            }
          : e
      )
    );
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    onAddAlert({
      id: `alt-web-fail-${Date.now()}`,
      timestamp: nowStr,
      equipmentId: 'eq-web-01',
      hostname: 'WEB-LAB',
      severity: 'critical',
      title: 'Panne simulée : Service HTTP arrêté sur WEB-LAB',
      description: 'Le port 80 ne répond plus sur 192.168.30.10 (VLAN 30). Les kiosques ne peuvent plus charger le portail web.',
      acknowledged: false,
      resolved: false,
      recommendedAction: 'Redémarrer le serveur HTTP Apache/Nginx dans la VM EVE-NG.',
    });
    appendTerminal(`⚡ SIMULATION INCIDENT : Panne déclenchée sur WEB-LAB (Port 80 fermé).`);
  };

  const triggerDnsFailure = () => {
    setEquipments((prev) =>
      prev.map((e) =>
        e.id === 'eq-dns-01'
          ? {
              ...e,
              status: 'critical',
              openPorts: [22], // port 53 closed!
              dnsResolves: false,
              isSimulatedFailure: true,
            }
          : e
      )
    );
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    onAddAlert({
      id: `alt-dns-fail-${Date.now()}`,
      timestamp: nowStr,
      equipmentId: 'eq-dns-01',
      hostname: 'DNS-LAB',
      severity: 'high',
      title: 'Panne simulée : Résolution DNS en échec sur DNS-LAB',
      description: 'Le serveur 192.168.30.11 ne répond plus aux requêtes UDP/TCP 53. Résolution interne interrompue.',
      acknowledged: false,
      resolved: false,
      recommendedAction: 'Vérifier le statut du service Bind9 sur DNS-LAB.',
    });
    appendTerminal(`⚡ SIMULATION INCIDENT : Panne déclenchée sur DNS-LAB (Résolution en panne).`);
  };

  const restoreAllNominal = () => {
    setEquipments((prev) =>
      prev.map((e) => ({
        ...e,
        status: 'nominal',
        openPorts: e.hostname === 'WEB-LAB' ? [80, 22] : e.hostname === 'DNS-LAB' ? [53, 22] : e.openPorts,
        dnsResolves: true,
        httpStatus: e.hostname === 'WEB-LAB' ? 200 : e.httpStatus,
        isSimulatedFailure: false,
      }))
    );
    appendTerminal(`🔄 RÉTABLISSEMENT : Tous les équipements EVE-NG sont revenus à l'état nominal.`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header & Lab Safety Warning */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Console de Supervision Réseau EVE-NG
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Lab Isolé
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervision stricte des équipements fictifs du laboratoire. Aucun paquet n'est envoyé vers Internet ou un réseau opérationnel.
          </p>
        </div>

        {/* Academic Incident Triggers for Demonstration */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={triggerWebFailure}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors flex items-center gap-1.5"
          >
            <Power className="w-3.5 h-3.5" />
            Couper WEB-LAB (Scénario 7)
          </button>
          <button
            onClick={triggerDnsFailure}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Altérer DNS-LAB (Scénario 8)
          </button>
          <button
            onClick={restoreAllNominal}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rétablir Nominal
          </button>
        </div>
      </div>

      {/* VLAN Architecture Map */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-sky-600" />
            Topologie des 6 VLANs Définis dans EVE-NG
          </div>
          <span className="text-[11px] text-slate-500">
            Passerelle Core : 192.168.x.1 sur chaque sous-réseau
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {vlans.map((v) => (
            <div
              key={v.id}
              className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">VLAN {v.id}</span>
                <span className="text-[10px] text-slate-500 font-mono">{v.equipmentCount} hôte(s)</span>
              </div>
              <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 truncate">
                {v.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                {v.subnet}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Equipment Inventory & Interactive Diagnostic Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Equipment Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-600" />
              Équipements Fictifs du Laboratoire
            </h2>
            <span className="text-xs text-slate-500">
              Cliquez pour sélectionner la cible
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Hôte / Rôle</th>
                  <th className="py-2.5 px-3 font-semibold">Adresse IP & VLAN</th>
                  <th className="py-2.5 px-3 font-semibold">Ports Ouverts</th>
                  <th className="py-2.5 px-3 font-semibold">Statut</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {equipments.map((eq) => {
                  const isSelected = eq.id === selectedEqId;
                  return (
                    <tr
                      key={eq.id}
                      onClick={() => setSelectedEqId(eq.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-sky-50/70 dark:bg-sky-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {eq.hostname}
                          {eq.isSimulatedFailure && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {eq.role}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                          {eq.ip}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {eq.vlanName}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {eq.openPorts.length > 0 ? (
                            eq.openPorts.map((p) => (
                              <span
                                key={p}
                                className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-700 dark:text-slate-300"
                              >
                                :{p}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">Aucun</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {eq.status === 'nominal' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Nominal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            Incident
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEqId(eq.id);
                            startGuidedDiagnostic(eq);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                        >
                          Diagnostiquer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Interactive Diagnostic Terminal & Whitelist Tester (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-600" />
              Sonde Manuelle & Filtre Liste Blanche
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Outils : 5 max / session
            </span>
          </div>

          {/* Target IP selector */}
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Cible sélectionnée :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customIp || selectedEquipment.ip}
                  onChange={(e) => setCustomIp(e.target.value)}
                  placeholder="Ex: 192.168.30.10"
                  className="flex-1 px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => setCustomIp('8.8.8.8')}
                  title="Injecter une IP externe non autorisée"
                  className="px-2 py-1.5 text-[10px] font-semibold bg-rose-100 text-rose-800 rounded border border-rose-300 hover:bg-rose-200 whitespace-nowrap"
                >
                  Test 8.8.8.8 (Scénario 9)
                </button>
              </div>
            </div>

            {/* Tool Selection */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ping', 'tcp', 'dns', 'http', 'logs'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTool(t)}
                  className={`px-2.5 py-1 rounded text-xs font-medium uppercase tracking-wider transition-colors ${
                    selectedTool === t
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
              {selectedTool === 'tcp' && (
                <input
                  type="number"
                  value={customPort}
                  onChange={(e) => setCustomPort(Number(e.target.value))}
                  placeholder="Port"
                  className="w-16 px-1.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              )}
            </div>

            <button
              onClick={() => executeProbe()}
              disabled={isRunningProbe}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              {isRunningProbe ? 'Exécution de la sonde...' : `Exécuter la sonde ${selectedTool.toUpperCase()}`}
            </button>
          </div>

          {/* Terminal Console View */}
          <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] h-48 overflow-y-auto space-y-1 border border-slate-800">
            <div className="text-slate-500">
              # AeroAssist Supervision CLI — EVE-NG Isolated Lab
            </div>
            <div className="text-slate-500">
              # Whitelist enforcement: ACTIVE (Rejet immédiat des IPs externes)
            </div>
            {probeTerminalOutput.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-tight">
                {line}
              </div>
            ))}
          </div>

          {/* Guided Diagnostic Report (Human-in-the-loop) */}
          {diagnosticReport.status === 'completed' && (
            <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 dark:text-indigo-200">
                  Rapport de Diagnostic : {diagnosticReport.target}
                </span>
                <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300">
                  {diagnosticCallsCount}/5 sondes
                </span>
              </div>

              <div className="space-y-1">
                {diagnosticReport.steps.map((st, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 dark:text-slate-300">{st.tool}</span>
                    <span className={st.ok ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-700 dark:text-rose-400 font-semibold'}>
                      {st.result}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-indigo-200/80 dark:border-indigo-800/80">
                <div className="font-semibold text-indigo-950 dark:text-indigo-200">
                  Verdict :
                </div>
                <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                  {diagnosticReport.verdict}
                </div>
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200">
                <div className="font-bold text-[11px] flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" />
                  Action Requise du Technicien (Human-in-the-loop) :
                </div>
                <div className="text-[11px] mt-1 leading-relaxed">
                  {diagnosticReport.recommendation}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
