import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, User, Wrench, Shield, Compass, BookOpen, Activity, FileText, CalendarCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  onRequestRoleChange: (role: UserRole) => void;
  alertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  onRequestRoleChange,
  alertsCount,
}) => {
  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    passenger: {
      label: 'Passager / Borne Kiosque',
      icon: <User className="w-3.5 h-3.5" />,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    agent: {
      label: 'Agent d’Information',
      icon: <Compass className="w-3.5 h-3.5" />,
      color: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    },
    technician: {
      label: 'Technicien IT (Lab)',
      icon: <Wrench className="w-3.5 h-3.5" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    admin: {
      label: 'Administrateur',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    },
  };

  // STRICT ROLE-BASED ACCESS CONTROL FOR NAVIGATION TABS
  const getNavItemsForRole = () => {
    if (currentRole === 'passenger') {
      // Le passager ne voit STRICTEMENT que 2 parties : Assistant et Étapes du voyage
      return [
        { id: 'passenger', label: 'Assistant Passagers', icon: <Compass className="w-4 h-4" /> },
        { id: 'journey', label: 'Étapes du Voyage', icon: <ShieldCheck className="w-4 h-4" /> },
      ];
    }

    if (currentRole === 'agent') {
      // L'agent voit l'assistant, le guide et la base FAQ pour signalement
      return [
        { id: 'passenger', label: 'Assistant Passagers', icon: <Compass className="w-4 h-4" /> },
        { id: 'journey', label: 'Étapes du Voyage', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'faq', label: 'Base FAQ & Procédures', icon: <BookOpen className="w-4 h-4" /> },
      ];
    }

    if (currentRole === 'technician') {
      // Le technicien IT voit la supervision, les journaux/alertes, les codes/scripts et le test assistant
      return [
        { id: 'supervision', label: 'Supervision Réseau EVE-NG', icon: <Wrench className="w-4 h-4" />, alert: alertsCount > 0 },
        { id: 'logs', label: 'Journaux & Alertes', icon: <FileText className="w-4 h-4" /> },
        { id: 'codes', label: 'Codes & Scripts IT', icon: <Wrench className="w-4 h-4" /> },
        { id: 'passenger', label: 'Assistant Passagers (Test)', icon: <Compass className="w-4 h-4" /> },
      ];
    }

    // Administrateur : accès à toutes les vues
    return [
      { id: 'dashboard', label: 'Vue Générale', icon: <Activity className="w-4 h-4" /> },
      { id: 'passenger', label: 'Assistant Passagers', icon: <Compass className="w-4 h-4" /> },
      { id: 'journey', label: 'Étapes du Voyage', icon: <ShieldCheck className="w-4 h-4" /> },
      { id: 'faq', label: 'Base FAQ', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'supervision', label: 'Supervision Réseau', icon: <Wrench className="w-4 h-4" />, alert: alertsCount > 0 },
      { id: 'logs', label: 'Journaux & Alertes', icon: <FileText className="w-4 h-4" /> },
      { id: 'codes', label: 'Codes IT', icon: <Wrench className="w-4 h-4" /> },
      { id: 'academic', label: 'Plan 6 Semaines', icon: <CalendarCheck className="w-4 h-4" /> },
    ];
  };

  const navItems = getNavItemsForRole();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Wordmark */}
          <button
            onClick={() => setCurrentTab(currentRole === 'passenger' ? 'passenger' : 'dashboard')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              AA
            </span>
            <span>AeroAssist AI</span>
          </button>

          {/* Zone 2: Navigation Links (Restricted strictly per role) */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-sky-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.alert && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Security & Role Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {currentRole === 'passenger' ? (
              // Le passager a un bouton discret pour déverrouiller l'accès technicien via code PIN
              <button
                onClick={() => onRequestRoleChange('technician')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Accès Technicien IT</span>
              </button>
            ) : (
              // Quand on est en mode IT ou Admin, on peut rebasculer ou verrouiller vers le passager
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRequestRoleChange('passenger')}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <User className="w-3 h-3" />
                  <span>Verrouiller Kiosque</span>
                </button>

                <div className="relative">
                  <select
                    value={currentRole}
                    onChange={(e) => onRequestRoleChange(e.target.value as UserRole)}
                    className="text-xs font-medium pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="technician">Technicien IT (Lab)</option>
                    <option value="agent">Agent d'Information</option>
                    <option value="admin">Administrateur</option>
                    <option value="passenger">Passager / Visiteur</option>
                  </select>
                </div>
              </div>
            )}

            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border ${roleLabels[currentRole].color}`}>
              {roleLabels[currentRole].icon}
              <span className="font-medium whitespace-nowrap">{roleLabels[currentRole].label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-slate-800 gap-1 bg-slate-50 dark:bg-slate-900 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
              currentTab === item.id
                ? 'bg-sky-600 text-white font-medium'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
