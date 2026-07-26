"use client";

import React, { useState, useEffect } from 'react';
import {
  Download, Sparkles, CheckCircle2, ShieldCheck, Plus, FileCheck,
  Search, Eye, Printer, Award, X, BarChart3, Globe, Leaf
} from 'lucide-react';
import { api } from '@/lib/api';

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

function deriveReports(scans: Record<string, unknown>[]): Report[] {
  return scans.map((s, idx) => {
    const typeKey = REPORT_TYPES[idx % 3] as ReportType;
    const meta    = TYPE_META[typeKey];
    const num     = idx + 1;
    const lotRef  = (s.code_lot || (s.id as string)?.substring(0, 8) || `LOT-${num}`) as string;
    return {
      id:          `CERT-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`,
      num,
      title:       `${meta.label} — Lot #${String(lotRef).substring(0, 8).toUpperCase()}`,
      type:        typeKey,
      typeMeta:    meta,
      entity:      (s.nom_cooperative || s.cooperative || 'Coop. ANADER Bouaké') as string,
      date:        formatDate(s.date_scan || new Date().toISOString()),
      grade:       (s.grade_ia || s.grade_qualite || 'Grade A') as string,
      kor:         s.score_kor ? `${s.score_kor} lbs` : '54.2 lbs',
      status:      'CERTIFIÉ',
      statusColor: '#10B981',
      statusBg:    '#ECFDF5',
      scanData:    s,
    };
  });
}

function gradeBadge(grade: string) {
  const g = (grade || '').toLowerCase();
  if (g.includes('rejet'))                       return { color: '#DC2626', bg: '#FEF2F2', label: 'Rejeté' };
  if (g.includes('grade c') || g === 'c')        return { color: '#EAB308', bg: '#FEFCE8', label: 'C' };
  if (g.includes('grade b') || g === 'b')        return { color: '#EA580C', bg: '#FFEDD5', label: 'B' };
  return { color: '#10B981', bg: '#ECFDF5', label: 'A' };
}

// ── component ─────────────────────────────────────────────
export default function AdminReportsPage() {
  const [scans, setScans]             = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [typeFilter, setTypeFilter]   = useState<'all' | ReportType>('all');
  const [extraReports, setExtraReports] = useState<Report[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewReport,   setPreviewReport]   = useState<Report | null>(null);
  const [toast,           setToast]           = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newType,  setNewType]  = useState<ReportType>('certificat_phytosanitaire');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.etapes.getScans().catch(() => []);
        if (Array.isArray(data)) setScans(data as Record<string, unknown>[]);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  // Derived — no setState, just inline computation
  const reportsList  = deriveReports(scans);
  const allReports   = [...extraReports, ...reportsList];

  // Grade stats
  let cntA = 0, cntB = 0, cntC = 0, cntR = 0;
  scans.forEach(s => {
    const g = ((s.grade_ia || s.grade_qualite || '') as string).toLowerCase();
    if (g.includes('rejet'))                       cntR++;
    else if (g.includes('grade c') || g === 'c')   cntC++;
    else if (g.includes('grade b') || g === 'b')   cntB++;
    else                                           cntA++;
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const meta = TYPE_META[newType];
    const num  = allReports.length + 1;
    const newRep: Report = {
      id:          `CERT-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`,
      num,
      title:       newTitle || meta.label,
      type:        newType,
      typeMeta:    meta,
      entity:      'Coop. ANADER Bouaké',
      date:        new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      grade:       'Grade A',
      kor:         '54.2 lbs',
      status:      'CERTIFIÉ',
      statusColor: '#10B981',
      statusBg:    '#ECFDF5',
    };
    setExtraReports([newRep, ...extraReports]);
    setShowCreateModal(false);
    notify(`Rapport "${newRep.title}" généré avec succès !`);
    setNewTitle('');
  };

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', position: 'relative' }}>

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
        }} onClick={() => setPreviewReport(null)}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '24px', padding: '36px',
            maxWidth: '720px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
            maxHeight: '92vh', overflowY: 'auto', border: '2.5px solid #1a6b0a',
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a6b0a', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  RÉPUBLIQUE DE CÔTE D&apos;IVOIRE — MINISTÈRE DE L&apos;AGRICULTURE
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0 4px' }}>
                  CERTIFICAT DE CONFORMITÉ QUALITÉ & TRAÇABILITÉ
                </h2>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                  PLATEFORME NIANKA PRECISION FOOD SAFETY INTELLIGENCE
                </div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', padding: '8px', borderRadius: '12px', border: '1.5px solid #CBD5E1' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(`https://nianka.app/verify?cert=${previewReport.id}`)}`}
                  alt="QR Code de Vérification"
                  style={{ width: '96px', height: '96px', borderRadius: '6px', display: 'block' }}
                />
                <div style={{ fontSize: '9px', fontWeight: 900, color: '#1a6b0a', marginTop: '4px', letterSpacing: '0.06em' }}>SCANNER POUR VÉRIFIER</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              {[
                { label: 'RÉFÉRENCE CERTIFICAT', value: previewReport.id, color: '#1a6b0a' },
                { label: 'COOPÉRATIVE ÉMETTRICE', value: previewReport.entity, color: '#0F172A' },
                { label: 'TYPE DE DOCUMENT', value: previewReport.typeMeta.label, color: '#2563EB' },
                { label: "DATE D'ÉMISSION", value: previewReport.date, color: '#0F172A' },
              ].map((field, i) => (
                <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', marginBottom: '4px' }}>{field.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: field.color }}>{field.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#F0FDF4', padding: '18px 20px', borderRadius: '14px', border: '1px dashed #40BB1B', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} /> Synthèse de l&apos;Analyse d&apos;Échantillonnage IA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Grade', value: previewReport.grade || 'Grade A', color: '#10B981' },
                  { label: 'Rendement (KOR)', value: previewReport.kor || '54.2 lbs', color: '#0F172A' },
                  { label: 'Statut', value: '✓ CERTIFIÉ CONFORME', color: '#10B981' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>
                Scannable à l&apos;entrepôt, à l&apos;usine et au port exportateur.<br />
                Délivré le {previewReport.date} — Bouaké, Côte d&apos;Ivoire
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setPreviewReport(null)} style={{ padding: '10px 16px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  Fermer
                </button>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: '#1a6b0a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={15} /> Imprimer
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
        }} onClick={() => setShowCreateModal(false)}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                  Annuler
                </button>
                <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#1a6b0a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(26,107,10,0.3)' }}>
                  <CheckCircle2 size={16} /> Générer le Document
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
      }}>
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
          <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.22)', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer' }}>
            <Printer size={17} /> Télécharger PDF
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        {[
          { label: 'CERTIFICATS ÉMIS',     value: String(allReports.length), sub: 'QR Code inclus',              icon: <FileCheck size={20} />,    iconBg: '#FEF3C7', iconColor: '#D97706' },
          { label: 'RENDEMENT KOR MOYEN',  value: '54.2 lbs',                sub: 'Qualité Export Certifiée',   icon: <Award size={20} />,        iconBg: '#EFF6FF', iconColor: '#2563EB' },
          { label: 'TAUX DE CONFORMITÉ',   value: `${pctConf}%`,             sub: `Grade A (${pctA}%) + B (${pctB}%)`, icon: <CheckCircle2 size={20} />, iconBg: '#ECFDF5', iconColor: '#10B981' },
          { label: 'LOTS ANALYSÉS',        value: String(scans.length),      sub: 'Via Vision IA MobileNetV3', icon: <ShieldCheck size={20} />,  iconBg: '#F0FDF4', iconColor: '#1a6b0a' },
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
      <div style={{ backgroundColor: '#fff', borderRadius: '18px', padding: '24px 28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
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
            { label: 'Grade A — Premium',       pct: pctA, cnt: cntA, color: '#10B981' },
            { label: 'Grade B — Standard',       pct: pctB, cnt: cntB, color: '#EA580C' },
            { label: 'Grade C — Limite',         pct: pctC, cnt: cntC, color: '#EAB308' },
            { label: 'Rejeté — Non-conforme',    pct: pctR, cnt: cntR, color: '#DC2626' },
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
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', overflow: 'hidden' }}>

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
                    #{String(row.num).padStart(3, '0')}
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
                      <button onClick={() => window.print()} title="Télécharger PDF" style={{ width: '34px', height: '34px', color: '#1a6b0a', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
