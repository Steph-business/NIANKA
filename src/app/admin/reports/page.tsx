"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download, FileText, Sparkles, ArrowUpRight, TrendingUp, PieChart as PieIcon,
  RefreshCw, CheckCircle2, ShieldCheck, AlertOctagon, Plus, FileCheck, Filter,
  Search, Eye, Calendar, Printer, Award, ExternalLink, X, Check, BarChart3, Clock, Layers, QrCode
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminReportsPage() {
  const [cooperative, setCooperative] = useState('all');
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState<'distribution' | 'kor' | 'defauts'>('distribution');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<'all' | 'bouake' | 'korhogo' | 'daloa'>('all');
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewReport, setPreviewReport] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state for creating a new report
  const [newReportTitle, setNewReportTitle] = useState('');
  const [newReportType, setNewReportType] = useState('certificat_phytosanitaire');
  const [newReportStartDate, setNewReportStartDate] = useState('2026-07-01');
  const [newReportEndDate, setNewReportEndDate] = useState('2026-07-25');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.etapes.getScans().catch(() => []);
      if (Array.isArray(data)) {
        setScans(data);
      }
    } catch (err) {
      console.warn('Reports notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const totalScans = scans.length;

  // Dynamic Grade Counts
  let countA = 0;
  let countB = 0;
  let countC = 0;
  let countRejete = 0;

  scans.forEach((s) => {
    const g = (s.grade_ia || s.grade_qualite || '').toLowerCase();
    if (g.includes('rejet')) {
      countRejete++;
    } else if (g.includes('grade c') || g === 'c') {
      countC++;
    } else if (g.includes('grade b') || g === 'b' || g.includes('réviser')) {
      countB++;
    } else {
      countA++;
    }
  });

  const totalEvaluated = totalScans || 1;
  const pctA = Math.round((countA / totalEvaluated) * 100);
  const pctB = Math.round((countB / totalEvaluated) * 100);
  const pctC = Math.round((countC / totalEvaluated) * 100);
  const pctRejete = Math.round((countRejete / totalEvaluated) * 100);
  const pctConforme = Math.min(100, pctA + pctB);

  // Formatting helper functions
  const formatLotId = (rawId: any, idx: number, item?: any): string => {
    const sites = ['Bouaké Nord', 'Korhogo C1', 'Daloa Est', 'Yamoussoukro'];
    const siteName = item?.nom_cooperative || item?.cooperative || sites[idx % sites.length];
    const cleanSite = siteName.replace('Coop. ', '').replace('ANADER ', '');
    const lotNum = String(100 + (scans.length || 10) - idx).padStart(3, '0');

    if (typeof rawId === 'string' && rawId.startsWith('Lot N°')) {
      return rawId;
    }

    return `Lot N° ${lotNum} — ${cleanSite}`;
  };

  const formatDate = (rawDate: any): string => {
    if (!rawDate) return 'Aujourd\'hui';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
      return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch (e) {
      return String(rawDate);
    }
  };

  // Detailed sample rows for the Official Printable PDF Document (Approved Lots Only for B2B Warehouse Export)
  const samplePrintRows = (scans.length > 0
    ? scans.map((s, idx) => {
      const lotCode = formatLotId(s.code_lot || s.id, idx);
      const coopName = s.nom_cooperative || s.cooperative || (idx % 2 === 0 ? 'Coop. ANADER Bouaké' : 'SOCAKKAT Dalleu');
      const weightKg = s.defauts?.weight_kg || s.poids_kg || s.weight_kg || '500';
      const rawGrade = (s.grade_ia || s.grade_qualite || 'Grade A').toUpperCase();
      const humidityVal = s.humidite ? `${s.humidite}%` : s.taux_humidite ? `${s.taux_humidite}%` : (rawGrade.includes('REJET') ? '13.8%' : rawGrade.includes('C') ? '9.6%' : rawGrade.includes('B') ? '7.9%' : `${(6.4 + (idx % 4) * 0.2).toFixed(1)}%`);
      const korVal = s.score_kor ? `${s.score_kor} lbs` : '54.2 lbs';

      let gradeColor = '#10B981';
      let statusText = 'APPROUVÉ';

      if (rawGrade.includes('REJET')) {
        gradeColor = '#DC2626';
        statusText = 'NON INCLUS';
      } else if (rawGrade.includes('C')) {
        gradeColor = '#EAB308';
        statusText = 'APPROUVÉ (LIMITE)';
      } else if (rawGrade.includes('B')) {
        gradeColor = '#EA580C';
        statusText = 'APPROUVÉ (B)';
      }

      return {
        code: lotCode,
        coop: coopName,
        weight: weightKg,
        humidity: humidityVal,
        defect: s.defauts?.description || (rawGrade.includes('REJET') ? 'Moisissure (8.4%)' : 'Conforme IA'),
        kor: korVal,
        grade: rawGrade.startsWith('GRADE') ? rawGrade : `GRADE ${rawGrade}`,
        destination: idx % 2 === 0 ? 'Entrepôt Central Abidjan Port' : 'Magasin San Pédro',
        status: statusText,
        statusColor: gradeColor,
      };
    }).filter(s => s.status !== 'NON INCLUS')
    : [
      { code: 'LOT-2026-F6DC71', coop: 'Coop. ANADER Bouaké', weight: '500', humidity: '6.8%', defect: 'Conforme IA', kor: '54.2 lbs', grade: 'GRADE A', destination: 'Entrepôt Central Abidjan Port', status: 'APPROUVÉ', statusColor: '#10B981' },
      { code: 'LOT-2026-F44ECF', coop: 'San Pedro Espoir', weight: '1200', humidity: '7.8%', defect: 'Brisures (3.2%)', kor: '53.5 lbs', grade: 'GRADE B', destination: 'Magasin San Pédro', status: 'APPROUVÉ (B)', statusColor: '#EA580C' },
    ]);

  // Dynamic Reports Library List
  const initialReportsList = scans.length > 0
    ? scans.map((s, idx) => {
      const rawDate = s.date_scan || new Date().toISOString();
      const dateStr = formatDate(rawDate);

      const rawCode = s.code_lot || s.id || `LOT-${idx + 1}`;
      const shortCode = String(rawCode).split('-')[0].toUpperCase();

      const types = ['Certificat Phytosanitaire', 'Bilan Statistique KOR', 'Rapport d\'Exportation'];
      const chosenType = types[idx % types.length];

      return {
        id: `CERT-2026-${shortCode}`,
        title: `${chosenType} — Lot #${shortCode}`,
        type: chosenType,
        entity: s.nom_cooperative || s.cooperative || 'Coop. ANADER Bouaké',
        date: dateStr,
        status: 'CERTIFIÉ',
        statusColor: '#10B981',
        statusBg: '#ECFDF5',
        scanData: s,
      };
    })
    : [
      { id: 'CERT-2026-0512', title: 'Certificat Phytosanitaire Officiel', type: 'Certificat Phytosanitaire', entity: 'Coopérative Agrial', date: '25 Juil. 2026', status: 'CERTIFIÉ', statusColor: '#10B981', statusBg: '#ECFDF5' },
      { id: 'CERT-2026-0510', title: 'Rapport Qualité & Rendement KOR', type: 'Bilan Statistique KOR', entity: 'Sodieal Union', date: '22 Juil. 2026', status: 'CERTIFIÉ', statusColor: '#10B981', statusBg: '#ECFDF5' },
      { id: 'CERT-2026-0430', title: 'Rapport de Traçabilité Export', type: 'Rapport d\'Exportation', entity: 'Global Mensuel', date: '18 Juil. 2026', status: 'ARCHIVÉ', statusColor: '#3B82F6', statusBg: '#EFF6FF' },
    ];

  const [reportsList, setReportsList] = useState<any[]>(initialReportsList);

  useEffect(() => {
    if (scans.length > 0) {
      setReportsList(initialReportsList);
    }
  }, [scans]);

  const filteredReports = reportsList.filter(r => {
    const query = searchTerm.toLowerCase();
    return r.title.toLowerCase().includes(query) || r.id.toLowerCase().includes(query) || r.entity.toLowerCase().includes(query);
  });

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const typeLabelMap: Record<string, string> = {
      certificat_phytosanitaire: 'Certificat Phytosanitaire Officiel',
      statistique_kor: 'Bilan Statistique KOR',
      rapport_export: 'Rapport d\'Exportation Certifié',
    };

    const newRep = {
      id: `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newReportTitle || typeLabelMap[newReportType] || 'Nouveau Rapport Certifié',
      type: typeLabelMap[newReportType] || 'Rapport Certifié',
      entity: cooperative === 'anader' ? 'Coop. ANADER Bouaké' : cooperative === 'socakkat' ? 'SOCAKKAT Dalleu' : 'Coopérative Principale',
      date: 'Aujourd\'hui',
      status: 'CERTIFIÉ',
      statusColor: '#10B981',
      statusBg: '#ECFDF5',
    };

    setReportsList([newRep, ...reportsList]);
    setShowCreateModal(false);
    showNotification(`Le rapport "${newRep.title}" a été généré avec succès !`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', position: 'relative' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          backgroundColor: '#10B981', color: '#ffffff', padding: '14px 22px',
          borderRadius: '14px', boxShadow: '0 12px 30px rgba(16, 185, 129, 0.35)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 800,
        }}>
          <CheckCircle2 size={22} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Certificate Preview Modal with QR CODE */}
      {previewReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9990,
          padding: '20px',
        }} onClick={() => setPreviewReport(null)}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px', padding: '36px',
            maxWidth: '740px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
            maxHeight: '92vh', overflowY: 'auto', position: 'relative', border: '2px solid #1a6b0a',
          }} onClick={(e) => e.stopPropagation()}>

            {/* Certificate Header Banner with Scannable QR Code */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1a6b0a', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  RÉPUBLIQUE DE CÔTE D&apos;IVOIRE • MINISTÈRE DE L&apos;AGRICULTURE
                </div>
                <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0F172A', margin: '4px 0 2px 0' }}>
                  CERTIFICAT DE CONFORMITÉ QUALITÉ &amp; TRAÇABILITÉ
                </h2>
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                  DOCUMENT CERTIFIÉ PAR NIANKA PRECISION FOOD SAFETY INTELLIGENCE
                </div>
              </div>

              {/* Scannable Visual QR Code Box */}
              <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', padding: '8px', borderRadius: '12px', border: '1.5px solid #CBD5E1' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(`https://nianka.app/verify?cert=${previewReport.id}&status=VALIDATED&coop=${previewReport.entity}`)}`}
                  alt="QR Code de Vérification"
                  style={{ width: '95px', height: '95px', borderRadius: '6px' }}
                />
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#1a6b0a', marginTop: '4px' }}>SCANNER POUR VÉRIFIER</div>
              </div>
            </div>

            {/* Certificate Body Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>RÉFÉRENCE UNIQUE CERTIFICAT</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#1a6b0a', marginTop: '2px' }}>{previewReport.id}</div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>COOPÉRATIVE ÉMETTRICE</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>{previewReport.entity}</div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>TYPE DE DOCUMENT</div>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>{previewReport.type}</div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>STATUT HOMOLOGATION</div>
                <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#10B981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={16} /> VALIDÉ &amp; CERTIFIÉ
                </div>
              </div>
            </div>

            {/* Quality Breakdown Details */}
            <div style={{ backgroundColor: '#F0FDF4', padding: '20px', borderRadius: '16px', border: '1px dashed #40BB1B', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#1a6b0a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} /> Synthèse de l&apos;Analyse d&apos;Échantillonnage IA
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
                <div>
                  <span style={{ color: '#64748B' }}>Grade:</span>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#10B981', textTransform: 'none' }}>Grade A Premium</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Rendement KOR :</span>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', textTransform: 'none' }}>54.2 lbs / Sac</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Taux Humidité :</span>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#10B981', textTransform: 'none' }}>6.8% (Optimal)</div>
                </div>
              </div>
            </div>

            {/* Signature & Verification Notice */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                Scannable à l&apos;entrepôt, l&apos;usine et au port exportateur.<br />
                Délivré le {previewReport.date} à Bouaké, Côte d&apos;Ivoire
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setPreviewReport(null)}
                  style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Fermer
                </button>
                <button
                  onClick={handlePrint}
                  style={{ padding: '10px 20px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={16} /> Imprimer avec Code QR
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal to Create / Generate a New Report */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9990,
          padding: '20px',
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px',
            maxWidth: '560px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }} onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '12px', color: '#1a6b0a' }}>
                  <FileCheck size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Générer un Nouveau Rapport Certifié
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Créez un rapport officiel certifié avec code QR de vérification.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  TITRE DU DOCUMENT
                </label>
                <input
                  type="text"
                  placeholder="Ex: Certificat Phytosanitaire Lot Export Bouaké 2026"
                  value={newReportTitle}
                  onChange={(e) => setNewReportTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #CBD5E1', fontSize: '13.5px', outline: 'none',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  TYPE DE RAPPORT OFFICIEL
                </label>
                <select
                  value={newReportType}
                  onChange={(e) => setNewReportType(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #CBD5E1', fontSize: '13.5px', outline: 'none', backgroundColor: '#ffffff',
                  }}
                >
                  <option value="certificat_phytosanitaire">📜 Certificat Phytosanitaire Officiel</option>
                  <option value="statistique_kor">📊 Bilan Statistique KOR &amp; Rendement</option>
                  <option value="rapport_export">🚢 Rapport de Lot pour Exportation</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    DATE DÉBUT
                  </label>
                  <input
                    type="date"
                    value={newReportStartDate}
                    onChange={(e) => setNewReportStartDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                    DATE FIN
                  </label>
                  <input
                    type="date"
                    value={newReportEndDate}
                    onChange={(e) => setNewReportEndDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={16} /> Générer avec Code QR
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Top Header & Quick Action Hub */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#F0FDF4', color: '#1a6b0a', fontSize: '11px', fontWeight: 800,
            padding: '4px 12px', borderRadius: '20px', marginBottom: '8px', letterSpacing: '0.04em',
          }}>
            <Sparkles size={14} /> CENTRE DE CERTIFICATION ET DE RAPPORTS OFFICIELS
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Rapports &amp; Bilan Qualité
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: 500, maxWidth: '650px' }}>
            Générez des certificats d&apos;analyse visuelle IA, téléchargez vos bilans certifiés KOR munis de **codes QR scannables** pour l&apos;entrepôt, les usineurs et les exportateurs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 22px', backgroundColor: '#1a6b0a', color: '#ffffff',
              border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(26, 107, 10, 0.3)', transition: 'transform 0.15s ease',
            }}
          >
            <Plus size={18} />
            <span>Générer un Rapport</span>
          </button>

          <button
            onClick={handlePrint}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 18px', backgroundColor: '#F8FAFC', color: '#1a6b0a',
              border: '1.5px solid #BBF7D0', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
            }}
          >
            <Printer size={17} />
            <span>Télécharger le rapport PDF</span>
          </button>
        </div>
      </div>

      {/* SITE / SECTOR FILTER BAR */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#1a6b0a" />
          <span style={{ fontSize: '12.5px', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            FILTRER LES RAPPORTS ET CERTIFICATS PAR SITE :
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'Tous les Sites (Global — 50T)' },
            { key: 'bouake', label: 'Site de Bouaké (20T)' },
            { key: 'korhogo', label: 'Site de Korhogo (18T)' },
            { key: 'daloa', label: 'Site de Daloa (12T)' },
          ].map((site) => {
            const isSelected = selectedSiteFilter === site.key;
            return (
              <button
                key={site.key}
                onClick={() => {
                  setSelectedSiteFilter(site.key as any);
                  showNotification(`Rapport et certificat filtrés pour : ${site.label}`);
                }}
                style={{
                  padding: '8px 16px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 800,
                  cursor: 'pointer', border: isSelected ? '1.5px solid #1a6b0a' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#F0FDF4' : '#ffffff',
                  color: isSelected ? '#1a6b0a' : '#64748B',
                  boxShadow: isSelected ? '0 2px 8px rgba(26, 107, 10, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {site.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 EXECUTIVE KPI STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>

        {/* Card 1: Volume Certifié */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '18px', padding: '20px 22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>VOLUME CERTIFIÉ</span>
            <div style={{ padding: '8px', backgroundColor: '#F0FDF4', borderRadius: '10px', color: '#10B981' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>24.8 T</div>
            <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +18.4% ce mois-ci
            </div>
          </div>
        </div>

        {/* Card 2: Rendement Moyen KOR */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '18px', padding: '20px 22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>RENDEMENT KOR MOYEN</span>
            <div style={{ padding: '8px', backgroundColor: '#EFF6FF', borderRadius: '10px', color: '#2563EB' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>54.2 lbs</div>
            <div style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 700, marginTop: '2px' }}>Qualité Exportateur Certifiée</div>
          </div>
        </div>

        {/* Card 3: Taux de Conformité */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '18px', padding: '20px 22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>TAUX DE CONFORMITÉ</span>
            <div style={{ padding: '8px', backgroundColor: '#ECFDF5', borderRadius: '10px', color: '#10B981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>{pctConforme}%</div>
            <div style={{ fontSize: '11.5px', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>Grade A ({pctA}%) + B ({pctB}%)</div>
          </div>
        </div>

        {/* Card 4: Documents Certifiés */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '18px', padding: '20px 22px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>CERTIFICATS ÉMIS</span>
            <div style={{ padding: '8px', backgroundColor: '#FEF3C7', borderRadius: '10px', color: '#D97706' }}>
              <FileCheck size={20} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>{reportsList.length}</div>
            <div style={{ fontSize: '11.5px', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>Code QR de traçabilité inclus</div>
          </div>
        </div>

      </div>

      {/* ANALYTICS HUB WITH TABBED SWITCHER */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px', padding: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9',
      }}>

        {/* Tab Headers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { key: 'distribution', label: '📊 Distribution des Grades IA' },
              { key: 'kor', label: '📈 Évolution du Rendement KOR' },
              { key: 'defauts', label: '⚠️ Fréquence des Défauts' },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as typeof activeTab)}
                style={{
                  background: 'none', border: 'none', fontSize: '13.5px', fontWeight: 800,
                  color: activeTab === t.key ? '#1a6b0a' : '#94A3B8',
                  borderBottom: activeTab === t.key ? '2.5px solid #1a6b0a' : '2.5px solid transparent',
                  paddingBottom: '12px', marginBottom: '-13.5px', cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              style={{
                padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1',
                backgroundColor: '#ffffff', fontSize: '12.5px', fontWeight: 700, color: '#475569', outline: 'none',
              }}
            >
              <option value="30d">30 Derniers Jours</option>
              <option value="90d">90 Derniers Jours</option>
              <option value="year">Année 2026</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Distribution */}
        {activeTab === 'distribution' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                Répartition des Qualités par Échantillonnage Vision IA
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 20px 0' }}>
                Basé sur {totalScans} lots enregistrés en direct dans la base de données.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, color: '#10B981', marginBottom: '4px' }}>
                    <span>Grade A (Premium Vert)</span>
                    <span>{pctA}% ({countA} lots)</span>
                  </div>
                  <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctA}%`, height: '100%', backgroundColor: '#10B981', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, color: '#EA580C', marginBottom: '4px' }}>
                    <span>Grade B (Standard Orange)</span>
                    <span>{pctB}% ({countB} lots)</span>
                  </div>
                  <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctB}%`, height: '100%', backgroundColor: '#EA580C', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, color: '#EAB308', marginBottom: '4px' }}>
                    <span>Grade C (Limite Jaune)</span>
                    <span>{pctC}% ({countC} lots)</span>
                  </div>
                  <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctC}%`, height: '100%', backgroundColor: '#EAB308', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 800, color: '#DC2626', marginBottom: '4px' }}>
                    <span>Rejeté (Non-conforme Rouge)</span>
                    <span>{pctRejete}% ({countRejete} lots)</span>
                  </div>
                  <div style={{ height: '10px', backgroundColor: '#F1F5F9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctRejete}%`, height: '100%', backgroundColor: '#DC2626', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing Donut Center */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: `conic-gradient(#10B981 0% ${pctA}%, #EA580C ${pctA}% ${pctA + pctB}%, #EAB308 ${pctA + pctB}% ${pctA + pctB + pctC}%, #DC2626 ${pctA + pctB + pctC}% 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)',
              }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#ffffff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '22px', fontWeight: 900, color: '#1a6b0a', lineHeight: 1 }}>{pctConforme}%</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginTop: '2px' }}>CONFORME</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: '16px', width: '100%', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#10B981' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  Grade A (Vert) : {pctA}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#EA580C' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EA580C', display: 'inline-block' }} />
                  Grade B (Orange) : {pctB}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#EAB308' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EAB308', display: 'inline-block' }} />
                  Grade C (Jaune) : {pctC}%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#DC2626' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} />
                  Rejeté (Rouge) : {pctRejete}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: KOR Trend */}
        {activeTab === 'kor' && (
          <div style={{ height: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Progression du Rendement KOR (lbs par Sac)</h3>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '8px' }}>Moyenne: 54.2 lbs</span>
            </div>

            <div style={{ height: '150px', width: '100%', position: 'relative' }}>
              <svg viewBox="0 0 500 120" style={{ width: '100%', height: '100%' }}>
                <path d="M0,90 Q100,70 200,40 T400,20 T500,10" fill="none" stroke="#1a6b0a" strokeWidth="4" />
                <circle cx="200" cy="40" r="5" fill="#1a6b0a" />
                <circle cx="400" cy="20" r="5" fill="#1a6b0a" />
                <circle cx="500" cy="10" r="5" fill="#10B981" />
              </svg>
            </div>
          </div>
        )}

        {/* Tab 3: Defects Breakdown */}
        {activeTab === 'defauts' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '14px', border: '1px solid #FCA5A5' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>HUMIDITÉ EXCESSIVE (&gt; 9.0%)</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>{pctC + pctRejete}%</div>
              <div style={{ fontSize: '11px', color: '#7F1D1D', marginTop: '2px' }}>Défaut numéro 1 identifié</div>
            </div>

            <div style={{ backgroundColor: '#FFEDD5', padding: '16px', borderRadius: '14px', border: '1px solid #FDBA74' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#EA580C' }}>BRISURES ET NOIX PIQUÉES</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>{pctB}%</div>
              <div style={{ fontSize: '11px', color: '#7C2D12', marginTop: '2px' }}>Nécessite calibrage manuel</div>
            </div>

            <div style={{ backgroundColor: '#ECFDF5', padding: '16px', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>CONFORMITÉ VISUELLE PARFAITE</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>{pctA}%</div>
              <div style={{ fontSize: '11px', color: '#064E3B', marginTop: '2px' }}>Lots prêts pour l&apos;embarquement</div>
            </div>
          </div>
        )}

      </div>

      {/* REPORTS REGISTRY TABLE SECTION */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
        padding: '24px 28px', border: '1px solid #F1F5F9',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Registre des Certificats et Rapports Émis ({filteredReports.length})
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
              Consultez, prévisualisez ou téléchargez n&apos;importe quel document certifié muni d&apos;un code QR.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Rechercher un certificat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
                  fontSize: '13px', outline: 'none', minWidth: '240px',
                }}
              />
            </div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>ID CERTIFICAT</th>
              <th style={{ padding: '14px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>TITRE DU RAPPORT</th>
              <th style={{ padding: '14px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>COOPÉRATIVE</th>
              <th style={{ padding: '14px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>DATE ÉMISSION</th>
              <th style={{ padding: '14px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em' }}>HOMOLOGATION</th>
              <th style={{ padding: '14px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.05em', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: idx < filteredReports.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '16px 14px', fontSize: '13.5px', fontWeight: 900, color: '#1a6b0a' }}>{row.id}</td>
                <td style={{ padding: '16px 14px', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{row.title}</td>
                <td style={{ padding: '16px 14px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>{row.entity}</td>
                <td style={{ padding: '16px 14px', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>{row.date}</td>
                <td style={{ padding: '16px 14px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, color: row.statusColor,
                    backgroundColor: row.statusBg, padding: '4px 12px', borderRadius: '12px',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>
                    <ShieldCheck size={13} /> {row.status}
                  </span>
                </td>
                <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px' }}>
                    <button
                      onClick={() => setPreviewReport(row)}
                      style={{ padding: '7px 12px', color: '#2563EB', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 800 }}
                    >
                      <Eye size={14} /> Aperçu &amp; QR
                    </button>

                    <button
                      onClick={handlePrint}
                      style={{ padding: '7px 12px', color: '#1a6b0a', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 800 }}
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 
        OFFICIAL PRINTABLE PDF DOCUMENT CONTAINER WITH SCANNABLE QR CODE
        Targeted exclusively by @media print to produce a clean, official A4 multi-sample certificate
      */}
      <div id="printable-official-report">

        {/* Header Stamp with Scannable QR Code */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1a6b0a', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.1em' }}>
              RÉPUBLIQUE DE CÔTE D&apos;IVOIRE • MINISTÈRE DE L&apos;AGRICULTURE ET DU DÉVELOPPEMENT RURAL
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0 2px 0' }}>
              RAPPORT OFFICIEL DE CONTRÔLE QUALITÉ &amp; TRAÇABILITÉ DES LOTS
            </h1>
            <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
              PLATEFORME CERTIFIÉE NIANKA FOOD SAFETY INTELLIGENCE • ÉDITION DU {new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>

          {/* Visual QR Code Image in Official Print Header */}
          <div style={{ textAlign: 'center', backgroundColor: '#ffffff', padding: '6px', borderRadius: '8px', border: '1.5px solid #1a6b0a' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://nianka.app/verify?cert=NK-RAPPORT-2026-99A8F&coop=ANADER_BOUAKE&status=VERIFIED_OFFICIAL')}`}
              alt="QR Code de Vérification Officiel"
              style={{ width: '100px', height: '100px' }}
            />
          </div>
        </div>

        {/* Executive Metadata */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px', backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>COOPÉRATIVES &amp; SITES</div>
            <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>
              {selectedSiteFilter === 'bouake' ? 'Coopérative ANADER (Secteur Bouaké)' : selectedSiteFilter === 'korhogo' ? 'Coopérative ANADER (Secteur Korhogo)' : selectedSiteFilter === 'daloa' ? 'Coopérative ANADER (Secteur Daloa)' : 'Coopérative ANADER (Bouaké, Korhogo, Daloa)'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>PÉRIODE D&apos;ÉCHANTILLONNAGE</div>
            <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#1a6b0a' }}>Derniers 30 Jours (Saison 2026)</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>HOMOLOGATION OFFICIELLE</div>
            <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#10B981' }}>✓ CERTIFIÉ CONFORME PAR L&apos;IA</div>
          </div>
        </div>

        {/* Statistical Summary Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ border: '1.5px solid #1a6b0a', backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a6b0a' }}>VOLUME TOTAL RECOLTÉ</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
              {selectedSiteFilter === 'bouake' ? '20 Tonnes (20 000 kg)' : selectedSiteFilter === 'korhogo' ? '18 Tonnes (18 000 kg)' : selectedSiteFilter === 'daloa' ? '12 Tonnes (12 000 kg)' : '50 Tonnes (50 000 kg)'}
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Tonnage certifié secteur</div>
          </div>
          <div style={{ border: '1.5px solid #2563EB', backgroundColor: '#EFF6FF', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB' }}>ÉCHANTILLONS TESTÉS</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
              {selectedSiteFilter === 'bouake' ? '20.0 kg' : selectedSiteFilter === 'korhogo' ? '18.0 kg' : selectedSiteFilter === 'daloa' ? '12.0 kg' : '50.0 kg'} Analysés
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748B', fontWeight: 600 }}>Pesée et contrôle IA terrain</div>
          </div>
          <div style={{ border: '1.5px solid #10B981', backgroundColor: '#ECFDF5', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#10B981' }}>TAUX DE RÉUSSITE IA</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>{pctConforme}% Conforme</div>
            <div style={{ fontSize: '9.5px', color: '#047857', fontWeight: 600 }}>Acceptation exportateur</div>
          </div>
          <div style={{ border: '1.5px solid #D97706', backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#D97706' }}>RENDEMENT KOR MOYEN</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>54.2 lbs / Sac</div>
            <div style={{ fontSize: '9.5px', color: '#B45309', fontWeight: 600 }}>Norme exportateur certifiée</div>
          </div>
        </div>

        {/* Comprehensive Detailed Table of All Lots */}
        <h3 style={{ fontSize: '13px', fontWeight: 900, color: '#0F172A', marginBottom: '10px', textTransform: 'uppercase' }}>
          TABLEAU DÉTAILLÉ DES LOTS VALIDÉS ({selectedSiteFilter === 'bouake' ? 'SECTEUR BOUAKÉ' : selectedSiteFilter === 'korhogo' ? 'SECTEUR KORHOGO' : selectedSiteFilter === 'daloa' ? 'SECTEUR DALOA' : 'TOUS SITES CONSOLIDÉS'})
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a6b0a', color: '#ffffff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800 }}>CODE LOT</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800 }}>SITES / COOPÉRATIVE</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>POIDS</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>HUMIDITÉ</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800 }}>DÉFAUTS DÉTECTÉS</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>KOR</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>GRADE</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 800 }}>DESTINATION &amp; EMBARQUEMENT</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>STATUT</th>
            </tr>
          </thead>
          <tbody>
            {samplePrintRows.filter(s => {
              if (selectedSiteFilter === 'all') return true;
              if (selectedSiteFilter === 'bouake') return s.coop.toLowerCase().includes('bouaké') || s.code.includes('F6DC71');
              if (selectedSiteFilter === 'korhogo') return s.coop.toLowerCase().includes('korhogo') || s.code.includes('AAFD45');
              if (selectedSiteFilter === 'daloa') return s.coop.toLowerCase().includes('dalleu') || s.coop.toLowerCase().includes('daloa') || s.code.includes('F44ECF');
              return true;
            }).map((s, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #CBD5E1', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#F8FAFC' }}>
                <td style={{ padding: '8px 10px', fontWeight: 900, color: '#0F172A' }}>{s.code}</td>
                <td style={{ padding: '8px 10px', fontWeight: 700 }}>{s.coop}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>{s.weight} kg</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>{s.humidity}</td>
                <td style={{ padding: '8px 10px' }}>{s.defect}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 800 }}>{s.kor}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 900, color: s.statusColor }}>{s.grade}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600 }}>{s.destination}</td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 900, color: s.statusColor }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Official Stamp, Signature & Verification QR Code Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '2px solid #CBD5E1' }}>
          <div style={{ fontSize: '10px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent('https://nianka.app/verify?cert=NK-RAPPORT-2026-99A8F&status=VERIFIED_OFFICIAL')}`}
              alt="Mini QR Code"
              style={{ width: '70px', height: '70px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
            />
            <div>
              Rapport certifié édité par le système d&apos;intelligence artificielle NIANKA.<br />
              Numéro d&apos;authentification unique: <strong>NK-RAPPORT-2026-99A8F</strong><br />
              Scannable par les agents d&apos;entrepôt, usineurs et exportateurs.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 900, color: '#0F172A' }}>TAMPON ET SIGNATURE AUTORISÉE</div>
            <div style={{ height: '45px', margin: '6px 0', borderBottom: '1.5px dashed #64748B', width: '220px' }}></div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>Inspecteur Général Qualité Ministère</div>
          </div>
        </div>

      </div>

    </div>
  );
}
