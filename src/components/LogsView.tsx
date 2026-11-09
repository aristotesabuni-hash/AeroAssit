import React, { useState } from 'react';
import { ProbeResult, AlertItem } from '../types';
import { 
  FileText, 
  Download, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Filter, 
  Clock, 
  Check,
  Calendar
} from 'lucide-react';

interface LogsViewProps {
  logs: ProbeResult[];
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ logs, alerts, onAcknowledgeAlert }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'alerts'>('alerts');
  const [logFilter, setLogFilter] = useState<'all' | 'SUCCESS' | 'FAILURE' | 'BLOCKED'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    const matchesStatus = logFilter === 'all' || l.status === logFilter;
    const matchesSearch =
      l.targetIp.includes(searchQuery) ||
      (l.targetHostname && l.targetHostname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      l.output.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.tool.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Export logs to standard RFC 4180 CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Horodatage', 'Outil', 'Cible_IP', 'Hote', 'Statut', 'Liste_Blanche', 'Latence_ms', 'Resultat'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      l.tool.toUpperCase(),
      l.targetIp,
      l.targetHostname || 'N/A',
      l.status,
      l.whitelisted ? 'OUI' : 'NON',
      l.latencyMs ? l.latencyMs.toFixed(1) : 'N/A',
      `"${l.output.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aeroassist_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Journaux d’Événements & Alertes de Supervision
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Traçabilité horodatée de toutes les sondes réseau exécutées sur le laboratoire EVE-NG isolé et gestion des alertes.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Exporter en CSV (Audit L3)
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'alerts'
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Alertes Système ({alerts.filter((a) => !a.resolved).length} actives)</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Historique des Sondes ({logs.length})</span>
        </button>
      </div>

      {/* View 1: Alerts List */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              Aucune alerte enregistrée. Tous les services du laboratoire sont nominaux.
            </div>
          ) : (
            alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  alt.severity === 'critical'
                    ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
                    : alt.severity === 'high'
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        alt.severity === 'critical'
                          ? 'bg-rose-600 text-white'
                          : alt.severity === 'high'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] tabular-nums">
                      {alt.timestamp}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Hôte : {alt.hostname}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {alt.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {alt.description}
                  </p>

                  <div className="pt-1 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                    💡 Recommandation technicien : {alt.recommendedAction}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {!alt.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alt.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Acquitter
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Acquittée
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View 2: Probes History Table */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer les journaux par IP, outil ou message..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'SUCCESS', 'FAILURE', 'BLOCKED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLogFilter(st)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    logFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st === 'all' ? 'Tous' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 border-y border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Horodatage</th>
                  <th className="py-2.5 px-3 font-semibold">Outil</th>
                  <th className="py-2.5 px-3 font-semibold">Cible</th>
                  <th className="py-2.5 px-3 font-semibold">Liste Blanche</th>
                  <th className="py-2.5 px-3 font-semibold">Statut</th>
                  <th className="py-2.5 px-3 font-semibold">Résultat de la sonde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap tabular-nums">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {log.tool}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 dark:text-white whitespace-nowrap">
                      {log.targetIp} {log.targetHostname ? `(${log.targetHostname})` : ''}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.whitelisted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                          AUTORISÉE
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-sans font-bold">
                          BLOQUÉE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {log.status === 'SUCCESS' ? (
                        <span className="text-emerald-600 font-bold">SUCCESS</span>
                      ) : log.status === 'BLOCKED' ? (
                        <span className="text-purple-600 font-bold">BLOCKED</span>
                      ) : (
                        <span className="text-rose-600 font-bold">FAILURE</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-sans truncate max-w-md">
                      {log.output}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
