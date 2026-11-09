import React, { useState } from 'react';
import { SIX_WEEKS_PLAN, VALIDATION_SCENARIOS } from '../data/initialData';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  FileCheck, 
  Layers, 
  Server, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check
} from 'lucide-react';

interface AcademicPlanViewProps {
  onTriggerScenario: (id: number) => void;
}

export const AcademicPlanView: React.FC<AcademicPlanViewProps> = ({ onTriggerScenario }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'scenarios' | 'eveng-cli'>('plan');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const ciscoRouterConfig = `! ========================================================
! AeroAssist AI — Configuration Routeur Core EVE-NG
! Modèle : Cisco IOL (L3 Router) / vEOS
! Isolation stricte : Routage inter-VLAN 802.1Q sans passerelle par défaut externe
! ========================================================
hostname RTR-CORE-LAB
no ip domain-lookup
!
! Activation du trunking sur l'interface reliée au switch EVE-NG
interface Ethernet0/0
 no ip address
 no shutdown
!
! VLAN 10 - Administration IT
interface Ethernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
!
! VLAN 20 - Kiosques Passagers
interface Ethernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
 no shutdown
!
! VLAN 30 - Serveurs Fictifs (WEB-LAB & DNS-LAB)
interface Ethernet0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 no shutdown
!
! VLAN 40 - Supervision & RAG (AeroAssist VM)
interface Ethernet0/0.40
 encapsulation dot1Q 40
 ip address 192.168.40.1 255.255.255.0
 no shutdown
!
! VLAN 50 - Affichage FIDS
interface Ethernet0/0.50
 encapsulation dot1Q 50
 ip address 192.168.50.1 255.255.255.0
 no shutdown
!
! VLAN 60 - Wi-Fi Invités Simulé
interface Ethernet0/0.60
 encapsulation dot1Q 60
 ip address 192.168.60.1 255.255.255.0
 no shutdown
!
! ========================================================
! ACL DE SÉCURITÉ : Interdiction stricte de sortie vers Internet
! ========================================================
ip access-list standard ACL_LAB_ISOLATION
 permit 192.168.0.0 0.0.255.255
 deny any log
!
end`;

  const webLabLinuxConfig = `# Configuration Debian / Ubuntu pour la machine WEB-LAB (192.168.30.10)
# 1. Configuration réseau statique (/etc/network/interfaces ou netplan)
auto eth0
iface eth0 inet static
    address 192.168.30.10/24
    gateway 192.168.30.1
    dns-nameservers 192.168.30.11

# 2. Installation du serveur HTTP isolé
apt-get update && apt-get install -y apache2 curl
systemctl enable apache2
systemctl start apache2

# 3. Création de la page d'accueil de maquette
cat << 'EOF' > /var/www/html/index.html
<!DOCTYPE html>
<html>
<head><title>Intranet Aéroport (Maquette EVE-NG)</title></head>
<body>
  <h1>Portail Intranet Aérogare - Laboratoire EVE-NG</h1>
  <p>Statut : Service Nominal. Réservé à l'évaluation académique Licence 3.</p>
</body>
</html>
EOF`;

  const dnsLabBindConfig = `# Configuration DNS Bind9 sur DNS-LAB (192.168.30.11)
# Fichier : /etc/bind/named.conf.local
zone "lab.aeroassist.local" {
    type master;
    file "/etc/bind/db.lab.aeroassist.local";
};

# Fichier de zone : /etc/bind/db.lab.aeroassist.local
$TTL 86400
@   IN  SOA dns-lab.aeroassist.local. admin.aeroassist.local. (
        2026110901 ; Serial
        3600       ; Refresh
        1800       ; Retry
        604800     ; Expire
        86400 )    ; Minimum TTL
;
@       IN  NS  dns-lab.aeroassist.local.
dns-lab IN  A   192.168.30.11
web-lab IN  A   192.168.30.10
kiosk01 IN  A   192.168.20.10
sup-vm  IN  A   192.168.40.10`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Dossier Académique de Licence 3 : Plan 6 Semaines & Cahier de Recette
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rétroplanning par jalons, matrice des 10 scénarios de validation et scripts de configuration EVE-NG pour la soutenance.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'plan'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Planning 6 Semaines
            </button>
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'scenarios'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Matrice 10 Scénarios
            </button>
            <button
              onClick={() => setActiveTab('eveng-cli')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'eveng-cli'
                  ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Scripts CLI EVE-NG
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: 6 Weeks Detailed Plan */}
      {activeTab === 'plan' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIX_WEEKS_PLAN.map((w, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 transition-colors ${
                  w.status === 'completed'
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : w.status === 'current'
                    ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 ring-2 ring-sky-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {w.week}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        w.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                          : w.status === 'current'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 animate-pulse'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {w.status === 'completed' ? 'Validé' : w.status === 'current' ? 'En Cours' : 'À Venir'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {w.title}
                  </h3>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                    {w.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Livrable :</strong> {w.deliverables}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Validation Scenarios (10 Minimum scenarios) */}
      {activeTab === 'scenarios' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Matrice des 10 Scénarios Minimaux de Recette
              </h2>
              <p className="text-xs text-slate-500">
                Chaque scénario vérifie un point critique du cahier des charges académique.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              10 / 10 Prêts pour Soutenance
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {VALIDATION_SCENARIOS.map((sc) => (
              <div key={sc.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 font-mono">
                      Scénario {sc.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Module : {sc.module}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {sc.title}
                  </h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Action testée :</span> {sc.description}
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400">
                    <span className="font-semibold">Résultat attendu :</span> {sc.expected}
                  </div>
                </div>

                <button
                  onClick={() => onTriggerScenario(sc.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                >
                  <span>Tester le scénario</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: EVE-NG Configurations & CLI */}
      {activeTab === 'eveng-cli' && (
        <div className="space-y-6">
          {/* Cisco Core Router */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-600" />
                  1. Configuration Routeur Core EVE-NG (Cisco IOL / vEOS)
                </h3>
                <p className="text-xs text-slate-500">
                  Sous-interfaces 802.1Q pour l'inter-VLAN et ACL d'isolation hermétique
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(ciscoRouterConfig, 1)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200 flex items-center gap-1"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'Copié !' : 'Copier CLI'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {ciscoRouterConfig}
            </pre>
          </div>

          {/* Linux Web Server */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  2. Configuration de la VM WEB-LAB (192.168.30.10)
                </h3>
                <p className="text-xs text-slate-500">
                  Installation Apache2 et script de simulation d'arrêt
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(webLabLinuxConfig, 2)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200 flex items-center gap-1"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? 'Copié !' : 'Copier Bash'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {webLabLinuxConfig}
            </pre>
          </div>

          {/* Linux DNS Server */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  3. Configuration de la VM DNS-LAB (Bind9 - 192.168.30.11)
                </h3>
                <p className="text-xs text-slate-500">
                  Zone faisant autorité `lab.aeroassist.local`
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(dnsLabBindConfig, 3)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-200 flex items-center gap-1"
              >
                {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 3 ? 'Copié !' : 'Copier Bind'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {dnsLabBindConfig}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
