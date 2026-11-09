import React, { useState } from 'react';
import { ApprovedDocument, UserRole } from '../types';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Flag, 
  CheckCircle, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Plus, 
  AlertCircle,
  Eye,
  X
} from 'lucide-react';

interface FaqViewProps {
  documents: ApprovedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<ApprovedDocument[]>>;
  currentRole: UserRole;
  selectedDocForModal: ApprovedDocument | null;
  setSelectedDocForModal: (doc: ApprovedDocument | null) => void;
}

export const FaqView: React.FC<FaqViewProps> = ({
  documents,
  setDocuments,
  currentRole,
  selectedDocForModal,
  setSelectedDocForModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Flag modal state (for Agent role)
  const [flaggingDoc, setFlaggingDoc] = useState<ApprovedDocument | null>(null);
  const [flagReasonInput, setFlagReasonInput] = useState('');

  // Add document modal state (for Admin role)
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'bagages' | 'enregistrement' | 'surete' | 'embarquement' | 'accessibilite'>('bagages');
  const [newContent, setNewContent] = useState('');
  const [newAuthority, setNewAuthority] = useState('');

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fullContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFlagDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flaggingDoc || !flagReasonInput.trim()) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === flaggingDoc.id
          ? {
              ...d,
              flaggedForReview: true,
              flagReason: flagReasonInput.trim(),
            }
          : d
      )
    );
    setFlaggingDoc(null);
    setFlagReasonInput('');
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDoc: ApprovedDocument = {
      id: `DOC-NEW-${Date.now().toString().slice(-4)}`,
      title: newTitle.trim(),
      category: newCategory,
      summary: newContent.slice(0, 120) + '...',
      fullContent: newContent.trim(),
      version: '1.0',
      validatedAt: new Date().toISOString().split('T')[0],
      validatedBy: 'Administrateur Lab (Validation L3)',
      sourceAuthority: newAuthority.trim() || 'Manuel d’Exploitation Interne',
      tags: [newCategory, 'procédure'],
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setIsAddingDoc(false);
    setNewTitle('');
    setNewContent('');
    setNewAuthority('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            Référentiel Documentaire & FAQ Approuvées
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Base officielle de connaissances utilisée par l'assistant passagers. Chaque réponse doit être rattachée à une procédure validée.
          </p>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setIsAddingDoc(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Procédure (Admin)
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par mot-clé, titre, ID ou contenu..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'bagages', label: 'Bagages' },
            { id: 'enregistrement', label: 'Enregistrement' },
            { id: 'surete', label: 'Sûreté' },
            { id: 'embarquement', label: 'Embarquement' },
            { id: 'accessibilite', label: 'PMR / UM' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                  {doc.id}
                </span>
                <span>v{doc.version} · {doc.validatedAt}</span>
              </div>

              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {doc.title}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                {doc.summary}
              </p>

              {doc.flaggedForReview && (
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Signalé par un agent :</span> {doc.flagReason}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="text-[11px] text-slate-500">
                <span className="font-medium">Autorité :</span> {doc.sourceAuthority}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setSelectedDocForModal(doc)}
                  className="inline-flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:underline text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Consulter le texte intégral
                </button>

                {(currentRole === 'agent' || currentRole === 'admin') && (
                  <button
                    onClick={() => setFlaggingDoc(doc)}
                    title="Signaler une réponse ou procédure à corriger"
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: View Full Document */}
      {selectedDocForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                  {selectedDocForModal.id} (Version {selectedDocForModal.version})
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedDocForModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div><strong>Source officielle :</strong> {selectedDocForModal.sourceAuthority}</div>
                <div><strong>Validé le :</strong> {selectedDocForModal.validatedAt} par {selectedDocForModal.validatedBy}</div>
              </div>

              <div className="whitespace-pre-line font-normal">
                {selectedDocForModal.fullContent}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedDocForModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Flag Document (Agent Role) */}
      {flaggingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-600" />
                Signaler une procédure à corriger (Rôle Agent)
              </h3>
              <button onClick={() => setFlaggingDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Procédure ciblée : <strong>{flaggingDoc.id}</strong> — {flaggingDoc.title}
            </p>

            <form onSubmit={handleFlagDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motif du signalement / Correction requise :
                </label>
                <textarea
                  rows={3}
                  value={flagReasonInput}
                  onChange={(e) => setFlagReasonInput(e.target.value)}
                  placeholder="Ex: Les horaires de fermeture de comptoir ont changé sur les vols régionaux..."
                  required
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFlaggingDoc(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded"
                >
                  Enregistrer le signalement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Document (Admin Role) */}
      {isAddingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ajouter une Procédure Validée (Rôle Admin)
              </h3>
              <button onClick={() => setIsAddingDoc(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titre de la procédure :
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Procédure d’embarquement prioritaire"
                  required
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catégorie :
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="bagages">Bagages</option>
                  <option value="enregistrement">Enregistrement</option>
                  <option value="surete">Sûreté</option>
                  <option value="embarquement">Embarquement</option>
                  <option value="accessibilite">PMR / UM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Autorité source :
                </label>
                <input
                  type="text"
                  value={newAuthority}
                  onChange={(e) => setNewAuthority(e.target.value)}
                  placeholder="Ex: Standard IATA / OACI"
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contenu textuel officiel :
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Texte officiel de la procédure..."
                  required
                  className="w-full p-2 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
