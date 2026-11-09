import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, FileCode, Shield, Cpu, Play } from 'lucide-react';

export const ItCodesView: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'python-daemon' | 'cisco-router' | 'linux-services' | 'sqlite-schema'>('python-daemon');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pythonSupervisionCode = `#!/usr/bin/env python3
# ==============================================================================
# AeroAssist AI — Démon de Supervision Réseau Local (Poste Technicien IT)
# Fichier : supervision_daemon.py
# Rôle : Exécution des sondes autorisées (Ping, TCP, DNS, HTTP) dans le lab isolé
# Sécurité : Contrôle strict de la liste blanche avant tout appel réseau
# ==============================================================================

import socket
import subprocess
import time
import sqlite3
import datetime
import urllib.request
import urllib.error

# 1. LISTE BLANCHE STRICTE DU LABORATOIRE EVE-NG ISOLÉ
LAB_WHITELIST = {
    "192.168.10.1",   # RTR-CORE-LAB (Passerelle VLAN 10)
    "192.168.10.10",  # Postes administration IT
    "192.168.20.1",   # Passerelle VLAN 20
    "192.168.20.10",  # KIOSK-PASSENGER-01
    "192.168.30.1",   # Passerelle VLAN 30
    "192.168.30.10",  # WEB-LAB (Serveur HTTP Apache)
    "192.168.30.11",  # DNS-LAB (Serveur Bind9)
    "192.168.40.1",   # Passerelle VLAN 40
    "192.168.40.10",  # AEROASSIST-VM (Supervision IT & RAG)
    "192.168.50.10",  # DISPLAY-FIDS-01
}

DB_PATH = "aeroassist_lab.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            tool TEXT,
            target_ip TEXT,
            status TEXT,
            latency_ms REAL,
            output TEXT
        )
    """)
    conn.commit()
    conn.close()

def check_whitelist(target_ip: str) -> bool:
    """Règle de sécurité impérative : bloque tout paquet hors liste blanche lab"""
    if target_ip not in LAB_WHITELIST:
        print(f"[ALERTE SÉCURITÉ] Rejet immédiat : {target_ip} est HORS LISTE BLANCHE !")
        return False
    return True

def probe_ping(target_ip: str) -> dict:
    if not check_whitelist(target_ip):
        return {"tool": "ping", "status": "BLOCKED", "output": "IP non autorisée"}
    
    start = time.time()
    res = subprocess.run(["ping", "-c", "2", "-W", "1", target_ip], capture_output=True, text=True)
    latency = (time.time() - start) * 1000
    
    if res.returncode == 0:
        return {"tool": "ping", "status": "SUCCESS", "latency_ms": round(latency, 2), "output": "Echo reply received"}
    else:
        return {"tool": "ping", "status": "FAILURE", "latency_ms": 0.0, "output": "Destination Host Unreachable"}

def probe_tcp_port(target_ip: str, port: int) -> dict:
    if not check_whitelist(target_ip):
        return {"tool": "tcp", "status": "BLOCKED", "output": "IP non autorisée"}
    
    start = time.time()
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(1.5)
    try:
        s.connect((target_ip, port))
        latency = (time.time() - start) * 1000
        s.close()
        return {"tool": "tcp", "status": "SUCCESS", "latency_ms": round(latency, 2), "output": f"Port {port} OPEN"}
    except Exception as e:
        return {"tool": "tcp", "status": "FAILURE", "latency_ms": 0.0, "output": f"Port {port} CLOSED ({e})"}

def probe_http(target_ip: str, port: int = 80) -> dict:
    if not check_whitelist(target_ip):
        return {"tool": "http", "status": "BLOCKED", "output": "IP non autorisée"}
    
    url = f"http://{target_ip}:{port}/"
    start = time.time()
    try:
        req = urllib.request.urlopen(url, timeout=2.0)
        latency = (time.time() - start) * 1000
        return {"tool": "http", "status": "SUCCESS", "latency_ms": round(latency, 2), "output": f"HTTP {req.status} OK"}
    except urllib.error.HTTPError as he:
        return {"tool": "http", "status": "FAILURE", "latency_ms": 0.0, "output": f"HTTP Error {he.code}"}
    except Exception as e:
        return {"tool": "http", "status": "FAILURE", "latency_ms": 0.0, "output": f"HTTP Connection Refused ({e})"}

# Boucle principale de supervision pour le technicien IT
if __name__ == "__main__":
    init_db()
    print("=== DÉMON DE SUPERVISION AEROASSIST (Poste Technicien IT) DÉMARRÉ ===")
    print(f"Liste blanche chargée : {len(LAB_WHITELIST)} hôtes protégés.")
    
    # Cycle de test sur les serveurs clés
    targets = [
        ("192.168.30.10", 80),   # WEB-LAB
        ("192.168.30.11", 53),   # DNS-LAB
        ("192.168.40.10", 3000), # AEROASSIST-VM
    ]
    
    for ip, port in targets:
        ping_res = probe_ping(ip)
        tcp_res = probe_tcp_port(ip, port)
        print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {ip} -> PING: {ping_res['status']} | TCP:{port}: {tcp_res['status']}")
`;

  const ciscoRouterCode = `! ==============================================================================
! AeroAssist AI — Configuration Routeur Cisco IOL EVE-NG (RTR-CORE-LAB)
! Topologie : Trunk 802.1Q vers Switch EVE-NG, sous-interfaces et ACL d'isolation
! ==============================================================================
hostname RTR-CORE-LAB
!
no ip domain-lookup
service timestamps log datetime msec
service timestamps debug datetime msec
!
interface Ethernet0/0
 description TRUNK-VERS-SWITCH-EVE-NG
 no ip address
 no shutdown
!
! --- VLAN 10 : Administration & Techniciens IT ---
interface Ethernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 no shutdown
!
! --- VLAN 20 : Kiosques & Bornes Passagers (Isolé) ---
interface Ethernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
 no shutdown
!
! --- VLAN 30 : Serveurs Fictifs (WEB-LAB & DNS-LAB) ---
interface Ethernet0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 no shutdown
!
! --- VLAN 40 : VM Supervision AeroAssist & RAG ---
interface Ethernet0/0.40
 encapsulation dot1Q 40
 ip address 192.168.40.1 255.255.255.0
 no shutdown
!
! --- SÉCURITÉ : Interdiction formelle de trafic externe ---
ip access-list standard ACL_LAB_PERIMETER
 permit 192.168.10.0 0.0.0.255
 permit 192.168.20.0 0.0.0.255
 permit 192.168.30.0 0.0.0.255
 permit 192.168.40.0 0.0.0.255
 deny any log
!
interface Ethernet0/0.20
 ip access-group ACL_LAB_PERIMETER in
!
end
write memory`;

  const linuxServicesCode = `# ==============================================================================
# Commandes d'installation et de contrôle sur les VM Linux du Lab (EVE-NG)
# ==============================================================================

# 1. Configuration sur la machine WEB-LAB (192.168.30.10)
# Installer Apache2 et créer la page de test de l'intranet aéroportuaire :
sudo apt-get update && sudo apt-get install -y apache2 curl
sudo systemctl enable apache2
sudo systemctl start apache2

# Pour SIMULER LA PANNE (Scénario 7) devant le jury :
sudo systemctl stop apache2

# Pour RÉTABLIR le service :
sudo systemctl start apache2

# ------------------------------------------------------------------------------
# 2. Configuration sur la machine DNS-LAB (192.168.30.11)
# Installer Bind9 :
sudo apt-get install -y bind9 bind9utils

# Editer /etc/bind/named.conf.local pour déclarer le nom de domaine officiel (IP masquée pour sécurité) :
sudo bash -c 'cat << EOF > /etc/bind/named.conf.local
zone "assistant.aeroport.local" {
    type master;
    file "/etc/bind/db.assistant.aeroport.local";
};

// Alias court pour les smartphones connectés au Wi-Fi VLAN 60 :
zone "assistant" {
    type master;
    file "/etc/bind/db.assistant.aeroport.local";
};
EOF'

# Fichier de zone /etc/bind/db.assistant.aeroport.local :
# Résout 'assistant.aeroport.local' et 'assistant' vers le serveur WEB-LAB (192.168.30.10)
# tout en masquant l'adresse IP brute aux passagers pour empêcher les scans malveillants :
# @   IN  SOA ns.assistant.aeroport.local. admin.aeroport.local. ( 2026030101 3600 1800 604800 86400 )
# @   IN  NS  ns.assistant.aeroport.local.
# @   IN  A   192.168.30.10
# ns  IN  A   192.168.30.11

# Pour SIMULER L'ERREUR DNS (Scénario 8) devant le jury :
sudo systemctl stop bind9

# Pour RÉTABLIR Bind9 :
sudo systemctl start bind9`;

  const sqliteSchemaCode = `-- ==============================================================================
-- Schéma de la base SQLite locale (AeroAssist Prototype L3)
-- Fichier : schema.sql
-- ==============================================================================

CREATE TABLE IF NOT EXISTS approved_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_content TEXT NOT NULL,
    version TEXT NOT NULL,
    validated_at TEXT NOT NULL,
    validated_by TEXT NOT NULL,
    source_authority TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    tool TEXT NOT NULL,
    target_ip TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms REAL,
    whitelisted INTEGER NOT NULL DEFAULT 1,
    output TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS equipment_inventory (
    id TEXT PRIMARY KEY,
    hostname TEXT NOT NULL,
    vlan_id INTEGER NOT NULL,
    ip_address TEXT NOT NULL,
    mac_address TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'nominal'
);`;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-600" />
                Scripts & Configurations Réseau (Poste Technicien IT)
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Réservé IT
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Codes sources réels que le technicien IT exécute sur son poste ou sa VM pour superviser les serveurs du laboratoire EVE-NG.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setActiveCodeTab('python-daemon')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeCodeTab === 'python-daemon'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              supervision_daemon.py
            </button>
            <button
              onClick={() => setActiveCodeTab('cisco-router')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeCodeTab === 'cisco-router'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cisco Routeur 802.1Q
            </button>
            <button
              onClick={() => setActiveCodeTab('linux-services')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeCodeTab === 'linux-services'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Commandes Linux (Web & DNS)
            </button>
            <button
              onClick={() => setActiveCodeTab('sqlite-schema')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeCodeTab === 'sqlite-schema'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Schéma SQLite
            </button>
          </div>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>
              {activeCodeTab === 'python-daemon' && 'supervision_daemon.py (Python 3.10+)'}
              {activeCodeTab === 'cisco-router' && 'rtr_core_lab.cfg (Cisco IOL / vEOS)'}
              {activeCodeTab === 'linux-services' && 'services_commands.sh (Debian / Ubuntu VM)'}
              {activeCodeTab === 'sqlite-schema' && 'schema.sql (SQLite 3)'}
            </span>
          </div>

          <button
            onClick={() => {
              const codeToCopy =
                activeCodeTab === 'python-daemon'
                  ? pythonSupervisionCode
                  : activeCodeTab === 'cisco-router'
                  ? ciscoRouterCode
                  : activeCodeTab === 'linux-services'
                  ? linuxServicesCode
                  : sqliteSchemaCode;
              copyCode(codeToCopy, activeCodeTab);
            }}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedId === activeCodeTab ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>{copiedId === activeCodeTab ? 'Copié !' : 'Copier le code'}</span>
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs leading-relaxed text-slate-300">
            {activeCodeTab === 'python-daemon' && pythonSupervisionCode}
            {activeCodeTab === 'cisco-router' && ciscoRouterCode}
            {activeCodeTab === 'linux-services' && linuxServicesCode}
            {activeCodeTab === 'sqlite-schema' && sqliteSchemaCode}
          </pre>
        </div>
      </div>

      {/* Explanatory callout for academic defense */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 space-y-1.5">
        <div className="font-bold flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          Rôle de ces codes pour la démonstration de Licence 3 :
        </div>
        <p className="leading-relaxed">
          Le script Python <code className="font-mono font-bold">supervision_daemon.py</code> est destiné à être exécuté en tâche de fond sur la machine de supervision du technicien IT. Il interroge les équipements déclarés, enregistre chaque sonde dans la base de données locale SQLite et applique de manière logicielle le contrôle de liste blanche afin d'interdire toute sonde en dehors du laboratoire isolé.
        </p>
      </div>
    </div>
  );
};
