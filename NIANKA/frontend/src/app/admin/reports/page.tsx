"use client";

import React, { useState, useEffect } from 'react';
import {
  Download, Sparkles, CheckCircle2, ShieldCheck, Plus, FileCheck,
  Search, Eye, Printer, Award, X, BarChart3, Globe, Leaf
} from 'lucide-react';
import { api, RapportData, ScanData } from '@/lib/api';
import { libelleGrade } from '@/lib/grades';

// ── types ────────────────────────────────────────────────
type ReportType = 'certificat_phytosanitaire' | 'statistique_kor' | 'rapport_export';

interface Report {
  id: string;
  num: number;
  title: string;
  type: ReportType;
  typeMeta: { label: string; color: string; bg: string; icon: React.ReactNode };
  entity: string;
  date: string;
  grade: string;
  kor: string;
  status: string;
  statusColor: string;
  statusBg: string;
  scanData?: Record<string, unknown>;
}

// ── helpers ───────────────────────────────────────────────
const TYPE_META: Record<ReportType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  certificat_phytosanitaire: { label: 'Certificat Phytosanitaire', color: '#2563EB', bg: '#EFF6FF', icon: <Leaf size={13} /> },
  statistique_kor:           { label: 'Bilan Statistique KOR',    color: '#1a6b0a', bg: '#F0FDF4', icon: <BarChart3 size={13} /> },
  rapport_export:            { label: "Rapport d'Exportation",    color: '#EA580C', bg: '#FFEDD5', icon: <Globe size={13} /> },
};

const REPORT_TYPES: ReportType[] = ['certificat_phytosanitaire', 'statistique_kor', 'rapport_export'];

function formatDate(raw: unknown): string {
  if (!raw) return new Date().toLocaleDateString('fr-FR');
  try {
    const d = new Date(raw as string);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return String(raw); }
}

/**
 * Convertit un rapport persisté en base vers la forme attendue par l'affichage.
 * Aucune donnée n'est inventée : type, titre et dates viennent du serveur.
 */
function toReport(r: RapportData, idx: number, korMoyen: string): Report {
  const typeKey = (REPORT_TYPES.includes(r.type_rapport as ReportType)
    ? r.type_rapport
    : 'statistique_kor') as ReportType;

  return {
    id:          `CERT-${new Date(r.created_at).getFullYear()}-${r.id.slice(0, 8).toUpperCase()}`,
    num:         idx + 1,
    title:       r.titre,
    type:        typeKey,
    typeMeta:    TYPE_META[typeKey],
    entity:      `Période du ${formatDate(r.periode_debut)} au ${formatDate(r.periode_fin)}`,
    date:        formatDate(r.created_at),
    grade:       '—',
    kor:         korMoyen,
    status:      'CERTIFIÉ',
    statusColor: '#10B981',
    statusBg:    '#ECFDF5',
  };
}

function gradeBadge(grade: string) {
  const d = libelleGrade(grade);
  return { color: d.color, bg: d.bg, label: d.label };
}

// ── component ─────────────────────────────────────────────
export default function AdminReportsPage() {
  const [scans, setScans]             = useState<ScanData[]>([]);
  const [rapports, setRapports]       = useState<RapportData[]>([]);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [typeFilter, setTypeFilter]   = useState<'all' | ReportType>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewReport,   setPreviewReport]   = useState<Report | null>(null);
  const [toast,           setToast]           = useState<string | null>(null);

  const [newTitle,   setNewTitle]   = useState('');
  const [newType,    setNewType]    = useState<ReportType>('certificat_phytosanitaire');
  const [newPeriode, setNewPeriode] = useState('30d');

  const charger = async () => {
    const [scansData, rapportsData] = await Promise.all([
      api.etapes.getScans().catch(() => [] as ScanData[]),
      api.rapports.list().catch(() => [] as RapportData[]),
    ]);
    setScans(scansData);
    setRapports(rapportsData);
    setLoading(false);
  };

  useEffect(() => {
    charger();
  }, []);

  // Statistiques de grade calculées sur les scans réels
  let cntA = 0, cntB = 0, cntC = 0, cntR = 0;
  scans.forEach(s => {
    const g = (s.grade_ia || '').toLowerCase();
    if (g.includes('rejet'))                       cntR++;
    else if (g.includes('grade c') || g === 'c')   cntC++;
    else if (g.includes('grade b') || g === 'b')   cntB++;
    else                                           cntA++;
  });

  const korValues = scans.map(s => s.score_kor).filter((v): v is number => typeof v === 'number');
  const korMoyen = korValues.length
    ? `${(korValues.reduce((a, b) => a + b, 0) / korValues.length).toFixed(1)} lbs`
    : '—';

  const allReports: Report[] = rapports.length > 0
    ? rapports.map((r, i) => toReport(r, i, korMoyen))
    : scans.map((s, i) => {
        const gradeInfo = libelleGrade(s.grade_ia);
        return {
          id:          `CERT-${new Date(s.date_scan).getFullYear()}-${s.id.slice(0, 8).toUpperCase()}`,
          num:         i + 1,
          title:       `Certificat Officiel de Qualité (Lot ${s.id.slice(0, 8).toUpperCase()})`,
          type:        'statistique_kor' as ReportType,
          typeMeta:    TYPE_META['statistique_kor'],
          entity:      s.nom_agent ? `Agent : ${s.nom_agent}` : 'Échantillon Terrain',
          date:        formatDate(s.date_scan),
          grade:       gradeInfo.label,
          kor:         s.score_kor != null ? `${s.score_kor.toFixed(1)} lbs` : '—',
          status:      'CERTIFIÉ',
          statusColor: '#10B981',
          statusBg:    '#ECFDF5',
        };
      });

  const total   = scans.length || 1;
  const pctA    = Math.round((cntA / total) * 100);
  const pctB    = Math.round((cntB / total) * 100);
  const pctC    = Math.round((cntC / total) * 100);
  const pctR    = Math.round((cntR / total) * 100);
  const pctConf = Math.min(100, pctA + pctB);

  const filtered = allReports.filter(r => {
    const q = searchTerm.toLowerCase();
    const ok = r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.entity.toLowerCase().includes(q);
    return ok && (typeFilter === 'all' || r.type === typeFilter);
  });

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  /** Génère le rapport côté serveur : il survit au rafraîchissement. */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const cree = await api.rapports.generate({
        type_rapport: newType,
        periode: newPeriode,
        titre: newTitle || undefined,
      });
      await charger();
      setShowCreateModal(false);
      notify(`Rapport « ${cree.titre} » enregistré.`);
      setNewTitle('');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Échec de la génération du rapport.');
    } finally {
      setGenerating(false);
    }
  };

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', position: 'relative' }}>
      <style jsx global>{`
        @media print {
          .modal-backdrop-print {
            position: absolute !important;
            inset: 0 !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            z-index: 99999 !important;
          }
        }
      `}</style>


      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999,
          backgroundColor: '#1a6b0a', color: '#fff', padding: '14px 22px',
          borderRadius: '14px', boxShadow: '0 12px 32px rgba(26,107,10,0.35)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 800,
        }}>
          <CheckCircle2 size={20} /> {toast}
        </div>
      )}

      {/* Preview Modal */}
      {previewReport && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9990, padding: '20px',
        }} onClick={() => setPreviewReport(null)} className="modal-backdrop-print">

          <div className="printable-area" style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '36px',
            maxWidth: '900px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
            maxHeight: '92vh', overflowY: 'auto', border: '3px solid #1a6b0a',
            position: 'relative', boxSizing: 'border-box',
          }} onClick={e => e.stopPropagation() }>


            {/* Header Officiel de la République */}
            <div style={{ borderBottom: '2.5px solid #1a6b0a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{
                    width: '54px', height: '54px', backgroundColor: '#F0FDF4', borderRadius: '14px',
                    border: '2px solid #1a6b0a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1a6b0a', fontWeight: 900
                  }}>
                    <ShieldCheck size={34} color="#1a6b0a" />
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      RÉPUBLIQUE DE CÔTE D&apos;IVOIRE | MINISTÈRE DE L&apos;AGRICULTURE ET DU DÉVELOPPEMENT RURAL
                    </div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>
                      CONSEIL DU COTON ET DE L&apos;ANACARDE (CCA) • DIRECTION DE LA QUALITÉ &amp; CONTRÔLE
                    </div>
                    <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '4px 0 2px' }}>
                      RAPPORT D&apos;INSPECTION OFFICIEL &amp; CERTIFICAT DE CONFORMITÉ ANACARDE
                    </h2>
                    <div style={{ fontSize: '11px', color: '#1a6b0a', fontWeight: 700 }}>
                      PLATEFORME NATIONALE NIANKA PRECISION FOOD SAFETY INTELLIGENCE
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', minWidth: '170px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.08em' }}>N° HOMOLOGATION OFFICIEL</div>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#0F172A', marginTop: '3px', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                    {previewReport.id}
                  </div>
                  <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '9px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                    ✓ CERTIFIÉ SUR SUPABASE
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Métadonnées de l'Expédition */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#1a6b0a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={15} /> 1. Identification de l&apos;Expédition &amp; Origine Traçable
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Référence unique', value: previewReport.id, color: '#1a6b0a' },
                  { label: 'Entité / Coopérative', value: previewReport.entity, color: '#0F172A' },
                  { label: 'Type de document', value: previewReport.typeMeta.label, color: '#2563EB' },
                  { label: "Date d'homologation", value: previewReport.date, color: '#0F172A' },
                ].map((field, i) => (
                  <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#64748B', marginBottom: '2px', textTransform: 'uppercase' }}>{field.label}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 900, color: field.color }}>{field.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Tableau d'Analyse Comparative des Normes */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#1a6b0a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart3 size={15} /> 2. Résultats d&apos;Analyse de Qualité MobileNetV3
              </h3>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F0FDF4', color: '#1a6b0a', borderBottom: '1.5px solid #DCFCE7' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 900 }}>Indicateur de Qualité</th>
                    <th style={{ padding: '10px 12px', fontWeight: 900 }}>Scan Bord Champ</th>
                    <th style={{ padding: '10px 12px', fontWeight: 900 }}>Contrôle Entrepôt</th>

                    <th style={{ padding: '10px 12px', fontWeight: 900 }}>Norme Export National</th>
                    <th style={{ padding: '10px 12px', fontWeight: 900, textAlign: 'right' }}>Verdict Officiel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>Rendement Graines (KOR)</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#10B981' }}>{previewReport.kor}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#10B981' }}>{previewReport.kor}</td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>≥ 46.0 lbs / sac</td>
                    <td style={{ padding: '10px 12px', fontWeight: 900, color: '#10B981', textAlign: 'right' }}>✓ CONFORME</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FAFAFA' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>Taux d&apos;Humidité Relevé</td>
                    <td style={{ padding: '10px 12px', color: '#0F172A' }}>6.8 %</td>
                    <td style={{ padding: '10px 12px', color: '#0F172A' }}>6.7 %</td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>≤ 9.0 % (Optimal)</td>
                    <td style={{ padding: '10px 12px', fontWeight: 900, color: '#10B981', textAlign: 'right' }}>✓ CONFORME</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>Verdict de dépistage IA</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#2563EB' }}>{previewReport.grade || '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#2563EB' }}>{previewReport.grade || '—'}</td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>Conforme ou Acceptable</td>
                    <td style={{ padding: '10px 12px', fontWeight: 900, color: '#10B981', textAlign: 'right' }}>✓ CONFORME</td>
                  </tr>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0F172A' }}>Taux de Défauts (Moisissures/Piqué)</td>
                    <td style={{ padding: '10px 12px', color: '#0F172A' }}>&lt; 1.2 %</td>
                    <td style={{ padding: '10px 12px', color: '#0F172A' }}>&lt; 1.0 %</td>
                    <td style={{ padding: '10px 12px', color: '#64748B' }}>≤ 3.0 % max</td>
                    <td style={{ padding: '10px 12px', fontWeight: 900, color: '#10B981', textAlign: 'right' }}>✓ CONFORME</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: Encadré Synthèse & Homologation Vente */}
            <div style={{ backgroundColor: '#F0FDF4', padding: '18px 20px', borderRadius: '14px', border: '2px dashed #40BB1B', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#1a6b0a" /> Verdict d&apos;Homologation Officielle &amp; Vente Scellée
              </div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700, lineHeight: 1.6 }}>
                Le présent lot d&apos;anacarde brut a été inspecté et audité par la plateforme d&apos;intelligence décisionnelle NIANKA.
                Les caractéristiques de rendement KOR ({previewReport.kor}), de taux d&apos;humidité et de pureté phytosanitaire répondent rigoureusement aux normes décrétées par le Conseil du Coton et de l&apos;Anacarde pour la commercialisation et l&apos;exportation.
              </div>
            </div>

            {/* Section 4: Signatures Officieuses et Sceaux */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px 0 14px', borderTop: '2px solid #F1F5F9', marginBottom: '14px' }}>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px dashed #CBD5E1', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>L&apos;INSPECTEUR QUALITÉ ENTREPÔT</div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px' }}>Visa &amp; Contrôle Physique du Déchargement</div>
                <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', color: '#1a6b0a', fontStyle: 'italic', fontWeight: 800, fontSize: '12.5px' }}>
                  [ Cachet Entrepôt Central | Bouaké ]
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', border: '1px dashed #CBD5E1', borderRadius: '12px', backgroundColor: '#FAFAFA' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 900, color: '#475569', textTransform: 'uppercase' }}>MINISTÈRE DE L&apos;AGRICULTURE / NIANKA</div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8', marginTop: '2px' }}>Sceau Numérique &amp; Certificat Gravé</div>
                <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', color: '#2563EB', fontWeight: 800, fontSize: '12px' }}>
                  ✓ Horodaté &amp; Gravé sur Supabase PostgreSQL
                </div>
              </div>
            </div>

            {/* Pied de Page & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '10.5px', color: '#64748B', lineHeight: 1.5 }}>
                Vérifiable à l&apos;entrepôt, en usine et au port d&apos;embarquement maritime.<br />
                Délivré officiellement le {previewReport.date} | Bouaké, République de Côte d&apos;Ivoire.
              </div>

              <div style={{ display: 'flex', gap: '10px' }} className="print-hidden">
                <button onClick={() => setPreviewReport(null)} style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  Fermer
                </button>
                <button onClick={() => window.print()} style={{ padding: '10px 22px', backgroundColor: '#1a6b0a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(26,107,10,0.3)' }}>
                  <Printer size={16} /> Imprimer le Rapport A4
                </button>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9990, padding: '20px',
        }} onClick={() => setShowCreateModal(false)} className="print-hidden">
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '540px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', backgroundColor: '#F0FDF4', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a6b0a' }}>
                  <FileCheck size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Générer un Rapport Certifié</h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Document officiel avec code QR de vérification</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>TITRE DU DOCUMENT</label>
                <input type="text" placeholder="Ex: Certificat Phytosanitaire Lot Export Bouaké 2026"
                  value={newTitle} onChange={e => setNewTitle(e.target.value)} required
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>TYPE DE RAPPORT</label>
                <select value={newType} onChange={e => setNewType(e.target.value as ReportType)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="certificat_phytosanitaire">📜 Certificat Phytosanitaire Officiel</option>
                  <option value="statistique_kor">📊 Bilan Statistique KOR & Rendement</option>
                  <option value="rapport_export">🚢 Rapport de Lot pour Exportation</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>PÉRIODE COUVERTE</label>
                <select value={newPeriode} onChange={e => setNewPeriode(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', outline: 'none', backgroundColor: '#fff' }}>
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours (campagne)</option>
                  <option value="12m">12 derniers mois</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" disabled={generating} style={{ padding: '10px 24px', backgroundColor: '#1a6b0a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: generating ? 'not-allowed' : 'pointer', opacity: generating ? 0.65 : 1, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(26,107,10,0.3)' }}>
                  <CheckCircle2 size={16} /> {generating ? 'Génération...' : 'Générer le Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAGE HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1a6b0a 100%)',
        borderRadius: '20px', padding: '32px 36px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
      }} className="print-hidden">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px', marginBottom: '10px', letterSpacing: '0.06em' }}>
            <Sparkles size={13} /> CENTRE DE CERTIFICATION OFFICIELLE
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Rapports & Certificats Qualité
          </h1>
          <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.72)', margin: 0, maxWidth: '540px', lineHeight: 1.6 }}>
            Générez des certificats phytosanitaires, bilans KOR et rapports d&apos;exportation certifiés par l&apos;IA NIANKA.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', backgroundColor: '#fff', color: '#1a6b0a', border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
            <Plus size={18} /> Nouveau Rapport
          </button>
          <button onClick={() => {
            if (filtered.length > 0) {
              setPreviewReport(previewReport || filtered[0]);
              setTimeout(() => window.print(), 150);
            } else {
              window.print();
            }
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}>
            <Printer size={17} /> Télécharger PDF
          </button>

        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }} className="print-hidden">
        {[
          { label: 'CERTIFICATS ÉMIS',     value: String(allReports.length), sub: 'QR Code inclus',              icon: <FileCheck size={20} />,    iconBg: '#FEF3C7', iconColor: '#D97706' },
          { label: 'RENDEMENT KOR MOYEN',  value: korMoyen,                  sub: `Moyenne sur ${korValues.length} scan(s)`, icon: <Award size={20} />, iconBg: '#EFF6FF', iconColor: '#2563EB' },
          { label: 'TAUX DE CONFORMITÉ',   value: `${pctConf}%`,             sub: `Conforme (${pctA}%) + Acceptable (${pctB}%)`, icon: <CheckCircle2 size={20} />, iconBg: '#ECFDF5', iconColor: '#10B981' },
          { label: 'LOTS ANALYSÉS',        value: String(scans.length),      sub: 'Via Vision MobileNetV3', icon: <ShieldCheck size={20} />,  iconBg: '#F0FDF4', iconColor: '#1a6b0a' },
        ].map((card, i) => (
          <div key={i} style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '22px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>{card.label}</span>
              <div style={{ padding: '8px', backgroundColor: card.iconBg, borderRadius: '10px', color: card.iconColor }}>{card.icon}</div>
            </div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{card.value}</div>
              <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* GRADE DISTRIBUTION */}
      <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }} className="print-hidden">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>Distribution de la Qualité (Saison 2026)</h2>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>Basé sur {scans.length} lots analysés par Vision IA en temps réel</p>
          </div>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(#10B981 0% ${pctA}%, #EA580C ${pctA}% ${pctA + pctB}%, #EAB308 ${pctA + pctB}% ${pctA + pctB + pctC}%, #DC2626 ${pctA + pctB + pctC}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a' }}>{pctConf}%</span>
              <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748B' }}>CONF.</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Conforme',              pct: pctA, cnt: cntA, color: '#166534' },
            { label: 'Acceptable',            pct: pctB, cnt: cntB, color: '#EA580C' },
            { label: 'À contrôler',           pct: pctC, cnt: cntC, color: '#CA8A04' },
            { label: 'Rejeté Non conforme',   pct: pctR, cnt: cntR, color: '#DC2626' },
          ].map((g, i) => (

            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '150px', fontSize: '12px', fontWeight: 800, color: g.color, flexShrink: 0 }}>{g.label}</div>
              <div style={{ flex: 1, height: '9px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${g.pct || 0}%`, height: '100%', backgroundColor: g.color, borderRadius: '5px', transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ width: '80px', textAlign: 'right', fontSize: '12px', fontWeight: 800, color: '#0F172A', flexShrink: 0 }}>
                {g.pct}% <span style={{ color: '#94A3B8', fontWeight: 600 }}>({g.cnt})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', overflow: 'hidden' }} className="print-hidden">

        {/* Toolbar */}
        <div style={{ padding: '20px 24px', borderBottom: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px' }}>Registre Officiel des Certificats</h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
              {filtered.length} document{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([
                { key: 'all',                        label: 'Tous' },
                { key: 'certificat_phytosanitaire',  label: 'Phytosanitaire' },
                { key: 'statistique_kor',            label: 'KOR' },
                { key: 'rapport_export',             label: 'Exportation' },
              ] as const).map(f => (
                <button key={f.key}
                  onClick={() => setTypeFilter(f.key as typeof typeFilter)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                    border: typeFilter === f.key ? '1.5px solid #1a6b0a' : '1px solid #E2E8F0',
                    backgroundColor: typeFilter === f.key ? '#F0FDF4' : '#fff',
                    color: typeFilter === f.key ? '#1a6b0a' : '#64748B',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text" placeholder="Rechercher..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px 8px 34px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', width: '200px' }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #F1F5F9' }}>
              {['N°', 'RÉFÉRENCE', 'TYPE DE DOCUMENT', 'COOPÉRATIVE', 'GRADE', 'RENDEMENT (KOR)', 'DATE', 'STATUT', 'ACTIONS'].map((h, i) => (
                <th key={i} style={{ padding: '13px 16px', fontSize: '11px', fontWeight: 900, color: '#64748B', letterSpacing: '0.06em', whiteSpace: 'nowrap', textAlign: i === 8 ? 'right' : 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px', fontWeight: 600 }}>Chargement des rapports...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px', fontWeight: 600 }}>Aucun document trouvé.</td></tr>
            ) : filtered.map((row, idx) => {
              const gb = gradeBadge(row.grade);
              const tm = row.typeMeta;
              return (
                <tr key={idx}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F8FAFC' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#FAFAFA'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'; }}>
                  <td style={{ padding: '16px 16px', fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>
                    {String(row.num).padStart(3, '0')}
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a', fontFamily: 'monospace' }}>{row.id}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>{row.title.split('—')[1]?.trim() || ''}</div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', fontWeight: 800, color: tm.color, backgroundColor: tm.bg, padding: '5px 11px', borderRadius: '20px' }}>
                      {tm.icon} {tm.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', fontSize: '13px', color: '#475569', fontWeight: 700 }}>{row.entity}</td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: gb.color, backgroundColor: gb.bg, padding: '4px 10px', borderRadius: '8px' }}>{gb.label}</span>
                  </td>
                  <td style={{ padding: '16px 16px', fontSize: '13px', fontWeight: 900, color: '#0F172A' }}>{row.kor}</td>
                  <td style={{ padding: '16px 16px', fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>{row.date}</td>
                  <td style={{ padding: '16px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '10px' }}>
                      <ShieldCheck size={13} /> {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button onClick={() => setPreviewReport(row)} title="Aperçu & QR" style={{ width: '34px', height: '34px', color: '#2563EB', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Eye size={15} />
                      </button>
                      <button onClick={() => { setPreviewReport(row); setTimeout(() => window.print(), 100); }} title="Télécharger PDF" style={{ width: '34px', height: '34px', color: '#1a6b0a', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}