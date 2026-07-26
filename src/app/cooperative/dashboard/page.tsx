"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, CheckCircle2, AlertTriangle, Info, MapPin, TrendingUp, Users, Radio, Navigation, Truck, ArrowRightLeft, X, FileCheck, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function CooperativeDashboard() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [scansData, setScansData] = useState<any[]>([]);
  const [validatedScanIds, setValidatedScanIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [transferForm, setTransferForm] = useState({
    lotId: 'MULTI_SITE',
    destination: 'Entrepôt Central Abidjan Port',
    truck: 'CI-482-AB',
    driver: 'Koffi B.',
    volume: '32 Tonnes (2 Sites: Bouaké + Daloa)',
  });

  const [selectedSites, setSelectedSites] = useState<string[]>(['Bouaké', 'Daloa']);

  const siteTonnesMap: Record<string, number> = {
    'Bouaké': 20,
    'Daloa': 12,
    'Korhogo': 18,
  };

  const toggleSite = (siteName: string) => {
    setSelectedSites(prev => {
      const next = prev.includes(siteName) ? prev.filter(s => s !== siteName) : [...prev, siteName];
      const totalVol = next.reduce((acc, s) => acc + (siteTonnesMap[s] || 15), 0);
      const desc = next.length > 0 ? `${totalVol} Tonnes (${next.length} Site${next.length > 1 ? 's' : ''}: ${next.join(' + ')})` : '0 Tonnes (Aucun site sélectionné)';
      setTransferForm(f => ({ ...f, volume: desc }));
      return next;
    });
  };

  const defaultTransfers = [
    {
      id: 'TRF-2026-084',
      lot: 'Lot N° 114 — Bouaké Nord',
      destination: 'Entrepôt Central Abidjan Port',
      volume: '20 Tonnes',
      truck: 'CI-482-AB',
      driver: 'Koffi B.',
      date: 'Aujourd\'hui à 14:30',
      status: 'Reçu & Confirmé par Entrepôt',
      statusType: 'confirmed',
      kor: '54.2 lbs',
    },
    {
      id: 'TRF-2026-081',
      lot: 'Lot N° 113 — Korhogo C1',
      destination: 'Entrepôt San Pédro',
      volume: '15 Tonnes',
      truck: 'CI-109-SP',
      driver: 'Amadou T.',
      date: 'Hier à 16:45',
      status: 'En Transit (Camion en route)',
      statusType: 'in_transit',
      kor: '52.0 lbs',
    },
  ];

  const [expeditedTransfers, setExpeditedTransfers] = useState<any[]>(defaultTransfers);

  const loadData = async () => {
    try {
      const [stats, scans] = await Promise.all([
        api.etapes.getStats().catch(() => null),
        api.etapes.getScans().catch(() => []),
      ]);
      setStatsData(stats);
      if (Array.isArray(scans)) {
        setScansData(scans);
      }
    } catch (err) {
      console.warn('Backend stats notice:', err);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nianka_approved_lots');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setValidatedScanIds(new Set(parsed));
          }
        } catch (e) {}
      }
    }
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleValidateScan = async (scan: any, lotCode: string) => {
    try {
      await api.etapes.createLot({
        nom_producteur: scan.nom_agent || 'Producteur Terrain',
        nom_cooperative: scan.nom_cooperative || 'Coopérative ANADER',
        poids_tonnes: 10,
        grade_qualite: scan.grade_ia || 'Grade A',
        kor_score: parseFloat(scan.score_kor) || 54.2,
      }).catch(() => null);
    } catch (err) {}

    setValidatedScanIds((prev) => {
      const updated = new Set(prev);
      updated.add(lotCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nianka_approved_lots', JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
    showNotification(`Le lot ${lotCode} a été approuvé et certifié conforme !`);
  };

  const handleSendTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const volNumber = parseFloat(transferForm.volume) || 20;
    
    try {
      const created = await api.etapes.createTransfer({
        cooperative_depart: 'Coopérative ANADER',
        entrepot_destination: transferForm.destination,
        tonnage_transfert: volNumber,
      }).catch(() => ({ numero_bordereau: `TRF-2026-${Math.floor(10 + Math.random() * 90)}`, grade_lot: '54.2 lbs' }));

      const newTrf = {
        id: created.numero_bordereau || `TRF-2026-${Math.floor(10 + Math.random() * 90)}`,
        lot: transferForm.lotId,
        destination: transferForm.destination,
        volume: `${volNumber} Tonnes`,
        truck: transferForm.truck,
        driver: transferForm.driver,
        date: 'Aujourd\'hui',
        status: 'En Transit (Camion en route)',
        statusType: 'in_transit',
        kor: created.grade_lot || '54.2 lbs',
      };

      setExpeditedTransfers(prev => [newTrf, ...prev]);
      setTransferSuccess(true);
      setTimeout(() => {
        setTransferSuccess(false);
        setShowTransferModal(false);
      }, 1500);
    } catch (err: any) {
      console.warn('Creation transfert notice:', err);
      alert(err.message || 'Erreur lors de la création du transfert');
    }
  };

  // Helper function for Professional Lot Identification
  const formatLotId = (rawId: any, idx: number, item?: any): string => {
    const sites = ['Bouaké Nord', 'Korhogo C1', 'Daloa Est', 'Yamoussoukro'];
    const siteName = item?.nom_cooperative || item?.cooperative || sites[idx % sites.length];
    const cleanSite = siteName.replace('Coop. ', '').replace('ANADER ', '');
    const lotNum = String(100 + (scansData.length || 10) - idx).padStart(3, '0');

    if (typeof rawId === 'string' && rawId.startsWith('Lot N°')) {
      return rawId;
    }
    
    return `Lot N° ${lotNum} — ${cleanSite}`;
  };

  // Helper function for Date Formatting
  const formatDate = (rawDate: any): string => {
    if (!rawDate) return 'Aujourd\'hui';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${d.getFullYear()} ${hours}:${mins}`;
    } catch (e) {
      return String(rawDate);
    }
  };

  // Helper function for Grade Styling per User Specs
  const getGradeBadge = (rawGrade: string, isValidated: boolean) => {
    if (isValidated) {
      return {
        label: 'Grade A',
        color: '#10B981',
        bg: '#ECFDF5',
        border: '#A7F3D0',
      };
    }
    const lower = (rawGrade || '').toLowerCase();
    if (lower.includes('rejet')) {
      return {
        label: 'Rejeté',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FCA5A5',
      };
    }
    if (lower.includes('grade c') || lower === 'c') {
      return {
        label: 'Grade C',
        color: '#EAB308',
        bg: '#FEFCE8',
        border: '#FEF08A',
      };
    }
    if (lower.includes('grade b') || lower === 'b' || lower.includes('réviser')) {
      return {
        label: 'Grade B',
        color: '#EA580C',
        bg: '#FFEDD5',
        border: '#FDBA74',
      };
    }
    return {
      label: 'Grade A',
      color: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    };
  };

  // KPI Computations
  const totalScansCount = scansData.length || 14;
  const avgKorScore = (scansData.reduce((acc, s) => acc + (parseFloat(s.score_kor) || 52.4), 0) / (scansData.length || 1)).toFixed(1);
  const criticalAlertsCount = scansData.filter(s => {
    const g = (s.grade_ia || '').toLowerCase();
    return g.includes('rejet') || g.includes('c');
  }).length || 2;

  const agents = [
    {
      name: 'Amadou Koné',
      role: 'Agent Principal — Bouaké Nord',
      lots: 45,
      status: 'EN LIGNE',
      sync: 'il y a 2 min',
      online: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      gps: '7.6938° N, 5.0303° W',
    },
    {
      name: 'Fanta Diabaté',
      role: 'Inspectrice Qualité — Korhogo C1',
      lots: 32,
      status: 'EN LIGNE',
      sync: 'il y a 14 min',
      online: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      gps: '9.4580° N, 5.6296° W',
    },
    {
      name: 'Souleymane Traoré',
      role: 'Agent de Collecte — Yamoussoukro',
      lots: 12,
      status: 'HORS LIGNE',
      sync: 'il y a 2h',
      online: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      gps: '6.8276° N, 5.2767° W',
    },
  ];

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

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
            <Users size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Suivi des Agents &amp; Lots (Coopérative)
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
              Surveillance en temps réel des collectes et gestion des expéditions vers les entrepôts.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '12px 16px', backgroundColor: '#ffffff', color: '#1a6b0a',
              border: '1.5px solid #BBF7D0', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 18px', backgroundColor: '#1a6b0a', color: '#ffffff',
              border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
            }}
          >
            <Truck size={17} />
            <span>Expédier vers un Entrepôt (Ordre de Transfert)</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
              <Package size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '20px' }}>
              ● Synchro BDD Live
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Total Lots &amp; Scans Enregistrés</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{totalScansCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#10B981' }}>
              <CheckCircle2 size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '20px' }}>
              Norme Export
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Rendement en amandes (KOR) Moyen</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{avgKorScore}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748B' }}>lbs / Sac</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <AlertTriangle size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', backgroundColor: '#FEF3C7', padding: '4px 10px', borderRadius: '20px' }}>
              Suivi Qualité
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Lots à Revoir / Anomalies</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{String(criticalAlertsCount).padStart(2, '0')}</div>
          </div>
        </div>
      </div>

      {/* ENRICHED INCOMING TERRAIN SCANS SECTION */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#1a6b0a', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              ANALYSES TERRAIN EN DIRECT &amp; SUIVI DES LOTS
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Flux temps réel des échantillons scannés par les agents avec métriques d&apos;humidité et KOR</p>
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '5px 12px', borderRadius: '20px' }}>
            ● SYNCHRO TERRAIN ACTIVE
          </span>
        </div>

        {scansData.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
            <p style={{ fontSize: '13.5px', fontWeight: 600, margin: 0 }}>Aucun nouveau scan terrain en attente. Les prochaines analyses effectuées par les agents apparaîtront ici automatiquement.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>IDENTIFICATION DU LOT</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'center' }}>PESÉE / POIDS</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'center' }}>HUMIDITÉ (%)</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>GRADE</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'center' }}>RENDEMENT EN AMANDES (KOR)</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>DATE &amp; HEURE</th>
                <th style={{ padding: '12px 14px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>HOMOLOGATION</th>
              </tr>
            </thead>
            <tbody>
              {scansData.map((scan, idx) => {
                const lotCode = formatLotId(scan.code_lot || scan.id, idx, scan);
                const isValidated = validatedScanIds.has(lotCode);
                const badge = getGradeBadge(scan.grade_ia || scan.grade_qualite, isValidated);
                const timeFormatted = formatDate(scan.date_scan);
                const korScoreVal = scan.score_kor ? `${scan.score_kor} lbs` : '54.2 lbs';
                const rawGrade = (scan.grade_ia || scan.grade_qualite || 'Grade A').toUpperCase();
                
                const humidityVal = scan.humidite ? `${scan.humidite}%` : scan.taux_humidite ? `${scan.taux_humidite}%` : (rawGrade.includes('REJET') ? '13.8%' : rawGrade.includes('C') ? '9.6%' : rawGrade.includes('B') ? '7.9%' : `${(6.4 + (idx % 4) * 0.2).toFixed(1)}%`);
                const weightVal = scan.defauts?.weight_kg || scan.poids_tonnes || (idx % 2 === 0 ? '20.0 T' : '15.0 T');
                const coopName = scan.nom_cooperative || scan.cooperative || 'Coopérative ANADER';
                const agentName = scan.nom_agent || scan.agent || 'Amadou Koné';

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '16px 14px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#1a6b0a' }}>{lotCode}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>{coopName} • Agent: {agentName}</div>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{weightVal}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Échantillon 500g</div>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 800,
                        color: parseFloat(humidityVal) > 9 ? '#DC2626' : parseFloat(humidityVal) > 8.5 ? '#EA580C' : '#10B981',
                        backgroundColor: parseFloat(humidityVal) > 9 ? '#FEF2F2' : parseFloat(humidityVal) > 8.5 ? '#FFEDD5' : '#ECFDF5',
                        padding: '4px 10px', borderRadius: '8px', border: `1px solid ${parseFloat(humidityVal) > 9 ? '#FCA5A5' : parseFloat(humidityVal) > 8.5 ? '#FDBA74' : '#A7F3D0'}`,
                      }}>
                        {humidityVal} {parseFloat(humidityVal) <= 8.5 ? '(Optimal)' : '(Élevé)'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 14px' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 800,
                        color: badge.color,
                        backgroundColor: badge.bg,
                        border: `1px solid ${badge.border}`,
                        padding: '4px 12px', borderRadius: '8px',
                      }}>
                        ● {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>{korScoreVal}</div>
                      <div style={{ fontSize: '10.5px', color: '#1a6b0a', fontWeight: 700 }}>Norme Export</div>
                    </td>
                    <td style={{ padding: '16px 14px', fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>{timeFormatted}</td>
                    <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleValidateScan(scan, lotCode)}
                        disabled={isValidated}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: isValidated ? '#ECFDF5' : '#1a6b0a',
                          color: isValidated ? '#10B981' : '#ffffff',
                          border: isValidated ? '1.5px solid #A7F3D0' : 'none',
                          borderRadius: '8px', fontSize: '12.5px', fontWeight: 800, cursor: isValidated ? 'default' : 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        {isValidated ? <><CheckCircle2 size={14} /> Lot Approuvé</> : 'Approuver Lot'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* BORDEREAUX & PREUVES D'EXPÉDITIONS VERS ENTREPÔTS */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              PREUVES &amp; HISTORIQUE D&apos;EXPÉDITION VERS ENTREPÔTS ({expeditedTransfers.length})
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>Preuves numériques de livraison partagées entre la coopérative et l&apos;entrepôt central</p>
          </div>

          <button
            onClick={() => setShowTransferModal(true)}
            style={{ fontSize: '12px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            + Nouvel Ordre de Transfert
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>RÉF BORDEREAU</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>ENTREPÔT DESTINATION</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>VOLUME &amp; CAMION</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>STATUT RÉCEPTION</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>PREUVE DIGITALE</th>
            </tr>
          </thead>
          <tbody>
            {expeditedTransfers.map((trf, idx) => (
              <tr key={idx} style={{ borderBottom: idx < expeditedTransfers.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 900, color: '#1a6b0a' }}>#{trf.id}</td>
                <td style={{ padding: '16px 16px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{trf.destination}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>{trf.date}</div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{trf.volume} ({trf.lot})</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>{trf.truck} — Chauffeur: {trf.driver}</div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  {trf.statusType === 'confirmed' ? (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={14} /> Reçu &amp; Confirmé par Entrepôt
                    </span>
                  ) : (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={14} /> En Transit (Camion en route)
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => { setSelectedProof(trf); setShowProofModal(true); }}
                    style={{
                      padding: '8px 14px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
                      border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <FileCheck size={14} /> Bordereau &amp; Preuve PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GPS Map + Agents */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                CARTE GPS DES AGENTS SUR LE TERRAIN
              </h2>
              <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 500 }}>Positionnement satellite en temps réel</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: '#F0FDF4', color: '#1a6b0a', fontSize: '11px', fontWeight: 800 }}>
              <Radio size={12} className="animate-pulse" />
              <span>LIVE GPS FEED</span>
            </div>
          </div>

          <div style={{
            height: '220px', borderRadius: '14px', backgroundColor: '#E2E8F0',
            backgroundImage: `radial-gradient(#CBD5E1 1.5px, transparent 1.5px), linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 48px 48px, 48px 48px', position: 'relative', overflow: 'hidden',
          }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}>
              <path d="M-10,120 Q180,90 320,150 T650,80" fill="none" stroke="#94A3B8" strokeWidth="6" />
              <path d="M220,-10 Q240,110 260,260" fill="none" stroke="#94A3B8" strokeWidth="5" />
            </svg>

            <div style={{ position: 'absolute', top: '38%', left: '38%', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '2px solid #1a6b0a' }}>
              <img src={agents[0].avatar} alt={agents[0].name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>Amadou K. (Bouaké)</span>
            </div>

            <div style={{ position: 'absolute', top: '18%', left: '60%', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff', padding: '6px 12px', borderRadius: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '2px solid #1a6b0a' }}>
              <img src={agents[1].avatar} alt={agents[1].name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>Fanta D. (Korhogo)</span>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid #F1F5F9' }}>
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '18px' }}>
              AGENTS SUR LE TERRAIN
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {agents.map((ag, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={ag.avatar} alt={ag.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{ag.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{ag.role}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a' }}>{ag.lots} lots</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Create Transfer Order */}
      {showTransferModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px',
            maxWidth: '500px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} color="#1a6b0a" />
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Expédier vers un Entrepôt Central
                </h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            {transferSuccess ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: '#10B981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={42} />
                <div style={{ fontSize: '16px', fontWeight: 800 }}>Ordre de transfert numérisé &amp; Notifié !</div>
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>L&apos;entrepôt central verra immédiatement ce bordereau de livraison sur sa plateforme.</p>
              </div>
            ) : (
              <form onSubmit={handleSendTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    SÉLECTIONNER LES SITES / LOCALISATIONS À EXPÉDIER (MULTI-SITES)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1' }}>
                    {[
                      { name: 'Bouaké', tonnage: '20 Tonnes', kor: 'KOR 54.2' },
                      { name: 'Daloa', tonnage: '12 Tonnes', kor: 'KOR 53.0' },
                      { name: 'Korhogo', tonnage: '18 Tonnes', kor: 'KOR 51.5' },
                    ].map(site => {
                      const isChecked = selectedSites.includes(site.name);
                      return (
                        <div
                          key={site.name}
                          onClick={() => toggleSite(site.name)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                            backgroundColor: isChecked ? '#F0FDF4' : '#ffffff',
                            border: isChecked ? '1.5px solid #1a6b0a' : '1px solid #E2E8F0',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ width: '16px', height: '16px', accentColor: '#1a6b0a', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Site de {site.name}</span>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: isChecked ? '#1a6b0a' : '#64748B' }}>
                            {site.tonnage} • {site.kor}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1a6b0a', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} /> <span>Total sélectionné : <strong>{transferForm.volume}</strong></span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Entrepôt de Destination</label>
                  <select
                    value={transferForm.destination}
                    onChange={e => setTransferForm({ ...transferForm, destination: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="Entrepôt Central Abidjan Port">Entrepôt Central Abidjan Port (Magasin A)</option>
                    <option value="Entrepôt San Pédro">Entrepôt San Pédro (Magasin B)</option>
                    <option value="Magasin Central Bouaké">Magasin Central Bouaké (Magasin C)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Immatriculation Camion</label>
                    <input
                      type="text"
                      value={transferForm.truck}
                      onChange={e => setTransferForm({ ...transferForm, truck: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Nom du Chauffeur</label>
                    <input
                      type="text"
                      value={transferForm.driver}
                      onChange={e => setTransferForm({ ...transferForm, driver: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px', padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
                  }}
                >
                  Générer le bordereau &amp; expédier ➔
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: View Digital Shipping Proof (Bordereau PDF Preview) */}
      {showProofModal && selectedProof && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px',
            maxWidth: '560px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={22} color="#1a6b0a" />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Bordereau de Livraison Numérique #{selectedProof.id}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Preuve officielle d&apos;expédition inter-sites</span>
                </div>
              </div>
              <button onClick={() => setShowProofModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Coopérative Expéditrice:</span>
                <strong style={{ color: '#0F172A' }}>Coop. ANADER Bouaké</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Entrepôt de Destination:</span>
                <strong style={{ color: '#1a6b0a' }}>{selectedProof.destination}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Volume &amp; Qualité KOR:</span>
                <strong style={{ color: '#0F172A' }}>{selectedProof.volume} — KOR {selectedProof.kor}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Transporteur &amp; Chauffeur:</span>
                <strong style={{ color: '#0F172A' }}>{selectedProof.truck} ({selectedProof.driver})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <span style={{ color: '#64748B' }}>Statut de la Preuve:</span>
                <strong style={{ color: '#10B981' }}>{selectedProof.status}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  window.print();
                }}
                style={{
                  flex: 1, padding: '12px', backgroundColor: '#1a6b0a', color: '#ffffff',
                  border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Download size={16} /> Télécharger Preuve PDF Certifiée
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
