import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, KeyRound, ShieldAlert, X, Check } from 'lucide-react';

interface RoleAuthModalProps {
  targetRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  targetRole,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    // Default academic demo codes
    if (targetRole === 'technician') {
      if (cleanCode === 'IT2026' || cleanCode === '2026' || cleanCode === 'ADMIN2026') {
        onSuccess('technician');
        setCode('');
        setError(null);
      } else {
        setError('Code technicien incorrect. Indice : le code de démonstration est IT2026.');
      }
    } else if (targetRole === 'admin') {
      if (cleanCode === 'ADMIN2026' || cleanCode === '2026') {
        onSuccess('admin');
        setCode('');
        setError(null);
      } else {
        setError('Code administrateur incorrect. Indice : le code de démonstration est ADMIN2026.');
      }
    } else if (targetRole === 'agent') {
      if (cleanCode === 'AGENT2026' || cleanCode === '2026' || cleanCode === 'IT2026' || cleanCode === 'ADMIN2026') {
        onSuccess('agent');
        setCode('');
        setError(null);
      } else {
        setError('Code agent incorrect. Indice : le code de démonstration est AGENT2026.');
      }
    }
  };

  const roleName =
    targetRole === 'technician'
      ? 'Technicien IT (Supervision Réseau)'
      : targetRole === 'admin'
      ? 'Administrateur Général'
      : 'Agent d’Information Aérogare';

  const defaultHint =
    targetRole === 'technician' ? 'IT2026' : targetRole === 'admin' ? 'ADMIN2026' : 'AGENT2026';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Contrôle d’Accès Restreint
              </h2>
              <p className="text-[11px] text-slate-500">
                Accès réservé au personnel autorisé
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Pour des raisons de sûreté aéroportuaire et de sécurité réseau, les passagers ne peuvent accéder qu’à <strong>l'Assistant</strong> et aux <strong>Étapes du Voyage</strong>. Veuillez saisir le code d'accès pour déverrouiller l’espace <strong>{roleName}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Code de sécurité / PIN :
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
                placeholder={`Ex: ${defaultHint}`}
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            {error && (
              <div className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
            <strong>Indice démonstration Licence 3 :</strong> Le code est <code className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">{defaultHint}</code> (ou <code className="font-mono">2026</code>).
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Valider l'Accès
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
