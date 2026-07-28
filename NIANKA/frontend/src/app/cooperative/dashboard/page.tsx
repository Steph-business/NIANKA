"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, CheckCircle2, AlertTriangle, Info, MapPin, TrendingUp, Users, Radio, Navigation, Truck, ArrowRightLeft, X, FileCheck, Download, RefreshCw, ShieldCheck } from 'lucide-react';
import { api, ScanData, TransferOrderData, TraceabilityStats, UserProfile } from '@/lib/api';

export default function CooperativeDashboard() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedProof, setSelectedProof] = useState<TransferOrderData | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [statsData, setStatsData] = useState<TraceabilityStats | null>(null);
  const [scansData, setScansData] = useState<ScanData[]>([]);
  const [expeditedTransfers, setExpeditedTransfers] = useState<TransferOrderData[]>([]);
  const [entrepots, setEntrepots] = useState<UserProfile[]>([]);
  const [pisteurs, setPisteurs] = useState<UserProfile[]>([]);
  const [validatedScanIds, setValidatedScanIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transferError, setTransferError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [transferForm, setTransferForm] = useState({
    entrepotId: '',
    truck: '',
    driver: '',
    volume: '20',
  });

  // Scans sélectionnés pour l'expédition : c'est ce qui porte la traçabilité.
  const [selectedScanIds, setSelectedScanIds] = useState<string[]>([]);

  const toggleScanSelection = (scanId: string) => {
    setSelectedScanIds(prev =>
      prev.includes(scanId) ? prev.filter(id => id !== scanId) : [...prev, scanId]
    );
  };

  const loadData = async () => {
    const [stats, scans, transferts, listeEntrepots, listePisteurs] = await Promise.all([
      api.etapes.getStats().catch(() => null),
      api.etapes.getScans().catch(() => [] as ScanData[]),
      api.etapes.getTransferts().catch(() => [] as TransferOrderData[]),
      api.auth.listEntites('entrepot').catch(() => [] as UserProfile[]),
      api.auth.listPisteurs().catch(() => [] as UserProfile[]),
    ]);

    setStatsData(stats);
    setScansData(scans);
    setExpeditedTransfers(transferts);
    setEntrepots(listeEntrepots);
    setPisteurs(listePisteurs);

    if (listeEntrepots.length > 0) {
      setTransferForm(f => (f.entrepotId ? f : { ...f, entrepotId: listeEntrepots[0].id }));
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nianka_approved_lots');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setValidatedScanIds(new Set(parsed));
        } catch {
          /* préférence locale illisible : on repart d'un ensemble vide */
        }
      }
    }
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleValidateScan = async (scan: ScanData, lotCode: string) => {
    // Le poids réel est celui saisi par l'agent lors du scan (stocké en kg).
    const poidsKg = Number((scan.defauts as { weight_kg?: number } | null)?.weight_kg ?? 0);
    const poidsTonnes = poidsKg > 0 ? poidsKg / 1000 : 1;

    try {
      await api.etapes.createLot({
        nom_producteur: scan.nom_agent || 'Producteur Terrain',
        poids_tonnes: poidsTonnes,
        grade_qualite: scan.grade_ia || 'Grade A',
        kor_score: scan.score_kor ?? undefined,
        humidite: scan.humidite ?? undefined,
        gps_lat: scan.gps_lat ?? undefined,
        gps_long: scan.gps_long ?? undefined,
      });
      showNotification(`Lot ${lotCode} approuvé et enregistré (${poidsTonnes.toFixed(2)} T).`);
    } catch (err) {
      showNotification(err instanceof Error ? err.message : "Échec de l'approbation du lot.");
      return;
    }

    setValidatedScanIds(prev => {
      const updated = new Set(prev).add(lotCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nianka_approved_lots', JSON.stringify(Array.from(updated)));
      }
      return updated;
    });
    loadData();
  };

  const handleSendTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    if (selectedScanIds.length === 0) {
      setTransferError("Sélectionnez au moins un lot terrain à expédier : c'est lui qui porte la traçabilité du bordereau.");
      return;
    }
    if (!transferForm.entrepotId) {
      setTransferError("Aucun entrepôt central n'est enregistré. Créez un compte « Entrepôt » avant d'expédier.");
      return;
    }

    const volume = parseFloat(transferForm.volume);
    if (!volume || volume <= 0) {
      setTransferError('Renseignez un tonnage valide.');
      return;
    }

    const scanPrincipal = scansData.find(s => s.id === selectedScanIds[0]);

    setIsSending(true);
    try {
      await api.etapes.createTransfer({
        scan_initial_id: selectedScanIds[0],
        entrepot_id: transferForm.entrepotId,
        immatriculation_camion: transferForm.truck,
        nom_chauffeur: transferForm.driver,
        volume_tonnes: volume,
        grade_lot: scanPrincipal?.grade_ia || 'Grade A',
      });

      await loadData();
      setTransferSuccess(true);
      setSelectedScanIds([]);
      setTimeout(() => {
        setTransferSuccess(false);
        setShowTransferModal(false);
      }, 1800);
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Erreur lors de la création du bordereau.');
    } finally {
      setIsSending(false);
    }
  };

  /** Référence de lot stable, dérivée de l'identifiant du scan en base. */
  const formatLotId = (scanId: string, idx: number, scan?: ScanData): string => {
    const annee = scan?.date_scan ? new Date(scan.date_scan).getFullYear() : new Date().getFullYear();
    return `LOT-${annee}-${scanId.slice(0, 8).toUpperCase()}`;
  };

  // Helper function for Date Formatting
  const formatDate = (rawDate?: string | null): string => {
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

  // KPI calculés sur les données réelles de la coopérative
  const totalScansCount = statsData?.total_scans_count ?? scansData.length;
  const korValues = scansData.map(s => s.score_kor).filter((v): v is number => typeof v === 'number');
  const avgKorScore = statsData?.kor_moyen
    ? statsData.kor_moyen.toFixed(1)
    : (korValues.length ? (korValues.reduce((a, b) => a + b, 0) / korValues.length).toFixed(1) : '—');
  const criticalAlertsCount = scansData.filter(s => {
    const g = (s.grade_ia || '').toLowerCase();
    return g.includes('rejet') || g.includes('c');
  }).length;

  const initiales = (nom: string) =>
    nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0]?.toUpperCase() ?? '').join('') || '?';

  /** Points GPS réels des collectes, projetés sur la vignette cartographique. */
  const geoScans = (() => {
    const avecGps = scansData.filter(
      s => typeof s.gps_lat === 'number' && typeof s.gps_long === 'number'
    ).slice(0, 6);
    if (avecGps.length === 0) return [];

    const lats = avecGps.map(s => s.gps_lat as number);
    const longs = avecGps.map(s => s.gps_long as number);
    const spanLat = Math.max(...lats) - Math.min(...lats) || 1;
    const spanLong = Math.max(...longs) - Math.min(...longs) || 1;

    return avecGps.map(s => {
      const lat = s.gps_lat as number;
      const long = s.gps_long as number;
      return {
        id: s.id,
        lat,
        long,
        // Latitude croissante vers le nord => vers le haut de la vignette
        top: 15 + ((Math.max(...lats) - lat) / spanLat) * 65,
        left: 12 + ((long - Math.min(...longs)) / spanLong) * 70,
        label: s.nom_agent || 'Agent',
        initiales: initiales(s.nom_agent || 'Agent'),
      };
    });
  })();

  // Agents réellement rattachés à la coopérative, avec leur volume de collecte
  const agents = pisteurs.map(p => {
    const scansAgent = scansData.filter(s => s.agent_id === p.id);
    const dernier = scansAgent[0]?.date_scan;
    return {
      id: p.id,
      name: p.nom_complet,
      role: 'Agent de terrain (pisteur)',
      lots: scansAgent.length,
      online: Boolean(dernier && Date.now() - new Date(dernier).getTime() < 24 * 3600 * 1000),
      sync: dernier ? new Date(dernier).toLocaleString('fr-FR') : 'aucune collecte',
    };
  });

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
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
              Suivi des Agents &amp; Lots (Coopérative)
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
              Surveillance en temps réel des collectes et gestion des expéditions vers les entrepôts.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '12px 18px', backgroundColor: '#ffffff', color: '#1a6b0a',
              border: '1px solid #BBF7D0', borderRadius: '14px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'all 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#F0FDF4'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', backgroundColor: '#1a6b0a', color: '#ffffff',
              border: 'none', borderRadius: '14px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(26, 107, 10, 0.25)', transition: 'all 0.2s ease',
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 107, 10, 0.3)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26, 107, 10, 0.25)'; }}
          >
            <Truck size={17} />
            <span>Expédier vers un Entrepôt (Ordre de Transfert)</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px -4px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0', backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#1a6b0a', boxShadow: '0 2px 10px rgba(26, 107, 10, 0.1)' }}>
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

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px -4px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0', backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#10B981', boxShadow: '0 2px 10px rgba(16, 185, 129, 0.1)' }}>
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

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 30px -4px rgba(0,0,0,0.04), 0 4px 12px -2px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0', backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(217, 119, 6, 0.04) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', transform: 'translate(30%, -30%)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#D97706', boxShadow: '0 2px 10px rgba(217, 119, 6, 0.1)' }}>
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
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', padding: '28px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
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
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>IDENTIFICATION DU LOT</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center', letterSpacing: '0.05em' }}>PESÉE / POIDS</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center', letterSpacing: '0.05em' }}>HUMIDITÉ (%)</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>GRADE</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'center', letterSpacing: '0.05em' }}>RENDEMENT (KOR)</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>DATE &amp; HEURE</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'right', letterSpacing: '0.05em' }}>HOMOLOGATION</th>
              </tr>
            </thead>
            <tbody>
              {scansData.map((scan, idx) => {
                const lotCode = formatLotId(scan.id, idx, scan);
                const isValidated = validatedScanIds.has(lotCode);
                const badge = getGradeBadge(scan.grade_ia, isValidated);
                const timeFormatted = formatDate(scan.date_scan);
                const korScoreVal = scan.score_kor !== null && scan.score_kor !== undefined
                  ? `${scan.score_kor.toFixed(1)} lbs` : '—';
                const humidite = scan.humidite ?? null;
                const humidityVal = humidite !== null ? `${humidite.toFixed(1)}%` : '—';
                const poidsKg = Number((scan.defauts as { weight_kg?: number } | null)?.weight_kg ?? 0);
                const weightVal = poidsKg > 0 ? `${(poidsKg / 1000).toFixed(2)} T` : '—';
                const agentName = scan.nom_agent || 'Agent';
                const gpsLabel = scan.gps_lat !== null && scan.gps_lat !== undefined
                  && scan.gps_long !== null && scan.gps_long !== undefined
                  ? `${scan.gps_lat.toFixed(4)}, ${scan.gps_long.toFixed(4)}`
                  : 'GPS non transmis';

                return (
                  <tr key={scan.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 14px' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#1a6b0a' }}>{lotCode}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Agent : {agentName} • {gpsLabel}</div>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{weightVal}</div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Échantillon 500g</div>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 800,
                        color: humidite === null ? '#64748B' : humidite > 9 ? '#DC2626' : humidite > 8.5 ? '#EA580C' : '#10B981',
                        backgroundColor: humidite === null ? '#F1F5F9' : humidite > 9 ? '#FEF2F2' : humidite > 8.5 ? '#FFEDD5' : '#ECFDF5',
                        padding: '4px 10px', borderRadius: '8px',
                        border: `1px solid ${humidite === null ? '#E2E8F0' : humidite > 9 ? '#FCA5A5' : humidite > 8.5 ? '#FDBA74' : '#A7F3D0'}`,
                      }}>
                        {humidityVal}{humidite !== null ? (humidite <= 8.5 ? ' (Optimal)' : ' (Élevé)') : ''}
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
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', padding: '28px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
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
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0' }}>
              <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>RÉF BORDEREAU</th>
              <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>ENTREPÔT DESTINATION</th>
              <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>VOLUME &amp; CAMION</th>
              <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>STATUT RÉCEPTION</th>
              <th style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748B', textAlign: 'right', letterSpacing: '0.05em' }}>PREUVE DIGITALE</th>
            </tr>
          </thead>
          <tbody>
            {expeditedTransfers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '28px', textAlign: 'center', color: '#64748B', fontSize: '13.5px', fontWeight: 600 }}>
                  Aucune expédition enregistrée. Utilisez « Expédier vers un Entrepôt » après avoir approuvé un lot terrain.
                </td>
              </tr>
            ) : expeditedTransfers.map((trf, idx) => (
              <tr key={trf.id} style={{ borderBottom: idx < expeditedTransfers.length - 1 ? '1px solid #F1F5F9' : 'none', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 900, color: '#1a6b0a' }}>#{trf.numero_bordereau}</td>
                <td style={{ padding: '16px 16px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{trf.nom_entrepot || 'Entrepôt non désigné'}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>{formatDate(trf.created_at)}</div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{trf.volume_tonnes} T ({trf.grade_lot})</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>
                    {trf.immatriculation_camion} — Chauffeur : {trf.nom_chauffeur} • Agent : {trf.nom_agent || '—'}
                  </div>
                </td>
                <td style={{ padding: '16px 16px' }}>
                  {trf.arbitre ? (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={14} /> Arbitré &amp; vente scellée
                    </span>
                  ) : (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={14} /> En transit (camion en route)
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
                    <FileCheck size={14} /> Bordereau &amp; certificat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* GPS Map + Agents */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
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

            {geoScans.length === 0 ? (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '12.5px', fontWeight: 700, color: '#475569',
                textAlign: 'center', padding: '20px',
              }}>
                Aucune position GPS transmise pour l&apos;instant.<br />
                Les collectes géolocalisées de vos agents s&apos;afficheront ici.
              </div>
            ) : geoScans.map((pt) => (
              <div
                key={pt.id}
                title={`${pt.label} — ${pt.lat.toFixed(4)}, ${pt.long.toFixed(4)}`}
                style={{
                  position: 'absolute', top: `${pt.top}%`, left: `${pt.left}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#ffffff',
                  padding: '5px 11px', borderRadius: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)', border: '2px solid #1a6b0a',
                }}
              >
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F0FDF4',
                  color: '#1a6b0a', fontSize: '10px', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {pt.initiales}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>{pt.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '18px' }}>
              AGENTS SUR LE TERRAIN
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {agents.length === 0 ? (
                <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                  Aucun agent rattaché à votre coopérative. Les agents choisissent leur
                  coopérative à l&apos;inscription.
                </p>
              ) : agents.map((ag) => (
                <div key={ag.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      backgroundColor: ag.online ? '#F0FDF4' : '#F1F5F9',
                      color: ag.online ? '#1a6b0a' : '#64748B',
                      fontSize: '13px', fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${ag.online ? '#BBF7D0' : '#E2E8F0'}`,
                    }}>
                      {initiales(ag.name)}
                    </span>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{ag.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Dernière collecte : {ag.sync}</div>
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
                    LOTS TERRAIN À EXPÉDIER — le scan sélectionné porte la traçabilité du bordereau
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', maxHeight: '210px', overflowY: 'auto' }}>
                    {scansData.length === 0 ? (
                      <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, padding: '10px', lineHeight: 1.6 }}>
                        Aucun scan terrain disponible. Un agent doit d&apos;abord analyser un
                        échantillon depuis son application avant toute expédition.
                      </p>
                    ) : scansData.map(scan => {
                      const isChecked = selectedScanIds.includes(scan.id);
                      const poidsKg = Number((scan.defauts as { weight_kg?: number } | null)?.weight_kg ?? 0);
                      return (
                        <div
                          key={scan.id}
                          onClick={() => toggleScanSelection(scan.id)}
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
                            <div>
                              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>
                                LOT-{scan.id.slice(0, 8).toUpperCase()}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                                {scan.nom_agent || 'Agent'} • {formatDate(scan.date_scan)}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: 800, color: isChecked ? '#1a6b0a' : '#64748B', textAlign: 'right' }}>
                            {scan.grade_ia} • KOR {scan.score_kor?.toFixed(1) ?? '—'}
                            <div style={{ fontSize: '10px', fontWeight: 600 }}>
                              {poidsKg > 0 ? `${(poidsKg / 1000).toFixed(2)} T` : 'poids non saisi'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {selectedScanIds.length > 0 && (
                    <div style={{ fontSize: '12px', color: '#1a6b0a', fontWeight: 800, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} />
                      <span>{selectedScanIds.length} lot(s) sélectionné(s)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Entrepôt de destination</label>
                  <select
                    value={transferForm.entrepotId}
                    onChange={e => setTransferForm({ ...transferForm, entrepotId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                    required
                  >
                    {entrepots.length === 0 ? (
                      <option value="">Aucun entrepôt enregistré sur la plateforme</option>
                    ) : entrepots.map(e => (
                      <option key={e.id} value={e.id}>{e.nom_complet}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Tonnage (T)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={transferForm.volume}
                      onChange={e => setTransferForm({ ...transferForm, volume: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Camion</label>
                    <input
                      type="text"
                      value={transferForm.truck}
                      onChange={e => setTransferForm({ ...transferForm, truck: e.target.value })}
                      placeholder="Ex: CI-482-AB"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Chauffeur</label>
                    <input
                      type="text"
                      value={transferForm.driver}
                      onChange={e => setTransferForm({ ...transferForm, driver: e.target.value })}
                      placeholder="Ex: Koffi B."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                {transferError && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 14px',
                    borderRadius: '9px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5',
                    color: '#991B1B', fontSize: '12.5px', fontWeight: 700,
                  }}>
                    <AlertTriangle size={16} />
                    <span>{transferError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSending}
                  style={{
                    marginTop: '8px', padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                    cursor: isSending ? 'not-allowed' : 'pointer', opacity: isSending ? 0.65 : 1,
                    boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
                  }}
                >
                  {isSending ? 'Génération du bordereau...' : 'Générer le bordereau & expédier ➔'}
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
                    Bordereau de livraison #{selectedProof.numero_bordereau}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Preuve officielle d&apos;expédition vers l&apos;entrepôt central</span>
                </div>
              </div>
              <button onClick={() => setShowProofModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Coopérative expéditrice :</span>
                <strong style={{ color: '#0F172A' }}>{selectedProof.nom_cooperative || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Agent pisteur (bord champ) :</span>
                <strong style={{ color: '#0F172A' }}>{selectedProof.nom_agent || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Entrepôt de destination :</span>
                <strong style={{ color: '#1a6b0a' }}>{selectedProof.nom_entrepot || 'Non désigné'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Volume &amp; qualité :</span>
                <strong style={{ color: '#0F172A' }}>
                  {selectedProof.volume_tonnes} T ({selectedProof.grade_lot}) — KOR {selectedProof.kor_initial ?? '—'} lbs
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Transporteur &amp; chauffeur :</span>
                <strong style={{ color: '#0F172A' }}>
                  {selectedProof.immatriculation_camion} ({selectedProof.nom_chauffeur})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                <span style={{ color: '#64748B' }}>Statut :</span>
                <strong style={{ color: selectedProof.arbitre ? '#10B981' : '#2563EB' }}>
                  {selectedProof.arbitre ? 'Arbitré & vente scellée' : 'En transit'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={api.etapes.certificatUrl(selectedProof.numero_bordereau)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, padding: '12px', backgroundColor: '#1a6b0a', color: '#ffffff',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Download size={16} /> Ouvrir le certificat (QR Code)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
