import React from 'react';
import { NetworkEquipment, ApprovedDocument, AlertItem, UserRole } from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Compass, 
  Wrench, 
  BookOpen, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Info
} from 'lucide-react';

interface DashboardViewProps {
  equipments: NetworkEquipment[];
  documents: ApprovedDocument[];
  alerts: AlertItem[];
  currentRole: UserRole;
  onNavigate: (tab: string) => void;
  onTriggerScenario: (scenarioId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  equipments,
  documents,
  alerts,
  currentRole,
  onNavigate,
  onTriggerScenario,
}) => {
  const nominalEquipments = equipments.filter((e) => e.status === 'nominal').length;
  const criticalEquipments = equipments.filter((e) => e.status === 'critical' || e.status === 'offline').length;
  const activeAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Academic Mission & Isolation Banner */}
      <div className="rounded-xl bg-slate-900 text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Projet Académique Licence 3 — 6 Semaines
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AeroAssist AI : Assistant Passagers & Supervision Réseau EVE-NG
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Maquette pédagogique composée de deux modules cloisonnés : un assistant passagers fondé sur une base documentaire validée avec citations de sources, et une console de supervision pour équipements fictifs dans un laboratoire EVE-NG strictement isolé.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Laboratoire EVE-NG 100% Isolé
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              Base Documentaire Validée (Anti-Hallucination)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              Aucun accès au réseau réel ni au contrôle aérien
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module Passagers */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Procédures Validées
            </span>
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {documents.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              Documents approuvés (0 non-vérifié)
            </span>
          </div>
          <button
            onClick={() => onNavigate('faq')}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700"
          >
            Consulter le référentiel <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Hôtes EVE-NG Actifs */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Équipements EVE-NG
            </span>
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {nominalEquipments}/{equipments.length}
              </span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                nominaux
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              VLANs 10, 20, 30, 40, 50, 60
            </span>
          </div>
          <button
            onClick={() => onNavigate('supervision')}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
          >
            Voir la topologie <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Alertes Réseau */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alertes en Cours
            </span>
            <AlertTriangle className={`w-5 h-5 ${activeAlerts > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-3xl font-bold tabular-nums ${activeAlerts > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {activeAlerts}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              {activeAlerts > 0 ? 'Action technicien recommandée' : 'Aucune défaillance non résolue'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('logs')}
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700"
          >
            Examiner les alertes <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Sécurité Liste Blanche */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filtre Liste Blanche
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
              ACTIF & STRICT
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
              14 adresses lab autorisées max
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Rejet 100% des IPs externes
          </div>
        </div>
      </div>

      {/* Two Modules Highlighting */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1 : Passagers */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Module 1 : Assistant Passagers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Borne d'information interactive multilingue
                </p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              FR · EN · SW
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Répond aux interrogations des passagers concernant les bagages, l'enregistrement, les contrôles de sûreté et l'embarquement. Se fonde exclusivement sur des documents officiels validés et refuse catégoriquement d'inventer des informations de vol en temps réel.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 text-xs space-y-1.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Sources affichées :</strong> Chaque réponse mentionne l’ID et le titre du document source.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Garde-fou temps réel :</strong> Affiche « Information non confirmée » si la donnée manque.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Défense anti-injection :</strong> Les documents et questions sont des données non fiables.</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('passenger')}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Tester l'Assistant Passagers <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('journey')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Guide du Voyageur
            </button>
          </div>
        </div>

        {/* Module 2 : Supervision IT */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Module 2 : Supervision IT EVE-NG
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Banc de test réseau et diagnostic assisté
                </p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Lab Isolé
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Permet au technicien de tester les équipements fictifs (WEB-LAB, DNS-LAB, Routeur 802.1Q) via Ping, TCP, DNS, HTTP. Bloque tout appel hors liste blanche et guide le technicien sans jamais modifier la configuration automatiquement.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 text-xs space-y-1.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Isolation stricte :</strong> Seules les adresses 192.168.x.x du lab sont autorisées.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Budget d'outils :</strong> Diagnostic limité à 5 invocations de sondes maximum.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Human-in-the-loop :</strong> Préconisations de réparation sans modification directe.</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('supervision')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              Console de Supervision <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('logs')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Journal Horodaté
            </button>
          </div>
        </div>
      </div>

      {/* Academic Demonstration Quick Scenarios (Direct access for jury / evaluation) */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Banc de Démonstration : 10 Scénarios Clés de Recette (Licence 3)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cliquez sur un scénario pour l'injecter immédiatement et vérifier la conformité du cahier des charges
            </p>
          </div>
          <button
            onClick={() => onNavigate('academic')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            Planning & CLI EVE-NG <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => onTriggerScenario(1)}
            className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-400">Scénario 1</span>
              <span className="text-[11px] text-slate-500">Module Passager</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              Question générale bagages
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Réponse fondée sur DOC-BAG-2026-v2.1 avec citation
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario(3)}
            className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Scénario 3</span>
              <span className="text-[11px] text-slate-500">Anti-Hallucination</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              Question horaire / porte en temps réel
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Alerte « Information non confirmée » sans invention
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario(6)}
            className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Scénario 6</span>
              <span className="text-[11px] text-slate-500">Supervision IT</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              Sonde nominale sur WEB-LAB
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Vérification HTTP 200 et latence &lt; 2ms
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario(7)}
            className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">Scénario 7</span>
              <span className="text-[11px] text-slate-500">Incident Simulé</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              Panne volontaire WEB-LAB (Port 80)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Détection arrêt, alerte critique et diagnostic assisté
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario(9)}
            className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400">Scénario 9</span>
              <span className="text-[11px] text-slate-500">Sécurité Réseau</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              Sonde vers IP hors liste blanche (8.8.8.8)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Blocage immédiat par le filtre de sécurité du lab
            </div>
          </button>

          <button
            onClick={() => onTriggerScenario(10)}
            className="p-3 text-left rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 dark:text-red-400">Scénario 10</span>
              <span className="text-[11px] text-slate-500">Sécurité IA</span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
              Injection de consignes (Prompt Injection)
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              Neutralisation et traitement comme donnée brute
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
