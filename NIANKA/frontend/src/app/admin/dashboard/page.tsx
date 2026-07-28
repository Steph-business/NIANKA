"use client";

import React, { useEffect, useState } from 'react';
import { Package, CheckCircle2, AlertTriangle, Info, MapPin, X, TrendingUp, List, Map as MapIcon } from 'lucide-react';
import { api, TraceabilityStats, ScanData, UserProfile } from '@/lib/api';

interface Defauts {
  defect_rate_pct?: number;
  cooperative_saisie?: string;
}

function tempsRelatif(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 1440) return `il y a ${Math.floor(minutes / 60)} h`;
  return d.toLocaleDateString('fr-FR');
}

const initiales = (nom: string) =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0]?.toUpperCase() ?? '').join('') || '?';

/** Tendance KOR calculée sur les scans bord champ réels, groupés par jour. */
function tendanceKor(scans: ScanData[], periode: '7d' | '30d') {
  const jours = periode === '7d' ? 7 : 30;
  const aujourdHui = new Date();
  aujourdHui.setHours(23, 59, 59, 999);
  const debutFenetre = new Date(aujourdHui.getTime() - jours * 24 * 60 * 60 * 1000);

  const nomsJours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const labels: string[] = [];
  for (let i = jours - 1; i >= 0; i--) {
    const d = new Date(aujourdHui);
    d.setDate(aujourdHui.getDate() - i);
    labels.push(jours === 7 ? nomsJours[d.getDay()] : String(d.getDate()).padStart(2, '0'));
  }

  const paniers = Array.from({ length: jours }, () => ({ total: 0, count: 0 }));
  scans.forEach(s => {
    if (typeof s.score_kor !== 'number' || !s.date_scan) return;
    const d = new Date(s.date_scan);
    if (d > aujourdHui || d <= debutFenetre) return;
    const decalage = Math.floor((aujourdHui.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
    const idx = jours - 1 - decalage;
    if (idx < 0 || idx >= jours) return;
    paniers[idx].total += s.score_kor;
    paniers[idx].count += 1;
  });

  const moyennes = paniers.map(p => (p.count > 0 ? p.total / p.count : 0));
  const avecDonnees = moyennes.filter(m => m > 0);
  const max = Math.max(...avecDonnees, 40);
  const min = Math.min(...avecDonnees, 55);

  return moyennes.map((m, idx) => ({
    day: labels[idx],
    height: m > 0 ? Math.max(10, max > min ? ((m - min) / (max - min)) * 80 + 20 : 50) : 0,
    value: m > 0 ? m.toFixed(1) : null,
  }));
}

export default function AdminDashboard() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');
  const [mapTab, setMapTab] = useState<'map' | 'list'>('map');
  const [stats, setStats] = useState<TraceabilityStats | null>(null);
  const [scans, setScans] = useState<ScanData[]>([]);
  const [pisteurs, setPisteurs] = useState<UserProfile[]>([]);
  const [dernierScan, setDernierScan] = useState<ScanData | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    Promise.all([
      api.etapes.getStats().catch(() => null),
      api.etapes.getScans().catch(() => [] as ScanData[]),
      api.auth.listPisteurs().catch(() => [] as UserProfile[]),
    ]).then(([statsData, scansData, pisteursData]) => {
      setStats(statsData);
      setScans(scansData);
      setPisteurs(pisteursData);

      const terrain = scansData.filter(s => s.etape === 'collecte_terrain');
      if (terrain.length > 0) {
        setDernierScan(terrain[0]);
        setShowToast(true);
      }
    });
  }, []);

  const scansTerrain = scans.filter(s => s.etape === 'collecte_terrain');

  // Lots à revoir : rejetés, humidité élevée ou grade B/C
  const anomalies = scansTerrain
    .filter(s => {
      const g = (s.grade_ia || '').toLowerCase();
      return g.includes('rejet') || g.includes('grade b') || g.includes('grade c') || (s.humidite ?? 0) > 9;
    })
    .sort((a, b) => new Date(b.date_scan).getTime() - new Date(a.date_scan).getTime());

  const meilleurLot = scansTerrain
    .filter(s => (s.grade_ia || '').toLowerCase().includes('grade a'))
    .sort((a, b) => (b.score_kor ?? 0) - (a.score_kor ?? 0))[0];

  const chartData = tendanceKor(scansTerrain, chartPeriod);
  const maxKorDayIndex = chartData.reduce(
    (maxIdx, item, i, arr) => (item.height > arr[maxIdx].height ? i : maxIdx), 0
  );

  // Performance des agents, calculée sur les scans terrain récents
  const performanceAgents = pisteurs
    .map(p => {
      const scansAgent = scansTerrain.filter(s => s.agent_id === p.id);
      const dernier = scansAgent[0]?.date_scan;
      return {
        id: p.id,
        name: p.nom_complet,
        lots: scansAgent.length,
        online: Boolean(dernier && Date.now() - new Date(dernier).getTime() < 24 * 3600 * 1000),
        sync: dernier ? tempsRelatif(dernier) : 'aucune collecte',
      };
    })
    .sort((a, b) => b.lots - a.lots)
    .slice(0, 5);

  // Positions GPS réelles des scans terrain, projetées sur la vignette
  const geoScans = (() => {
    const avecGps = scansTerrain.filter(
      s => typeof s.gps_lat === 'number' && typeof s.gps_long === 'number'
    ).slice(0, 8);
    if (avecGps.length === 0) return [];

    const lats = avecGps.map(s => s.gps_lat as number);
    const longs = avecGps.map(s => s.gps_long as number);
    const spanLat = Math.max(...lats) - Math.min(...lats) || 1;
    const spanLong = Math.max(...longs) - Math.min(...longs) || 1;

    return avecGps.map(s => {
      const lat = s.gps_lat as number;
      const long = s.gps_long as number;
      const d = (s.defauts ?? {}) as Defauts;
      const alerte = (s.grade_ia || '').toLowerCase().includes('rejet') || (s.humidite ?? 0) > 9;
      return {
        id: s.id,
        lat, long, alerte,
        top: 12 + ((Math.max(...lats) - lat) / spanLat) * 72,
        left: 10 + ((long - Math.min(...longs)) / spanLong) * 76,
        label: s.nom_agent || 'Agent',
        sub: d.cooperative_saisie || '',
        heure: tempsRelatif(s.date_scan),
      };
    });
  })();

  const alertesCritiques = anomalies.length;
  const totalLots = (stats?.lots_en_transit ?? 0) + (stats?.lots_scelles ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', position: 'relative' }}>

      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Aperçu de la Qualité
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Surveillance en temps réel de la filière anacarde.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
              <Package size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '20px' }}>
              Cumul filière
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Total Lots Traités</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{stats ? totalLots : '...'}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#40BB1B' }}>
              <CheckCircle2 size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '20px' }}>
              {stats && stats.kor_moyen >= 50 ? 'Optimal' : 'À surveiller'}
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Rendement en amandes (KOR) Moyen</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{stats ? stats.kor_moyen : '...'}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748B' }}>lbs</span>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: alertesCritiques > 0 ? '#FEF2F2' : '#F0FDF4',
          borderRadius: '16px', padding: '24px',
          boxShadow: alertesCritiques > 0 ? '0 4px 20px rgba(239, 68, 68, 0.08)' : '0 4px 20px rgba(0,0,0,0.03)',
          border: alertesCritiques > 0 ? '1.5px solid #FCA5A5' : '1.5px solid #BBF7D0',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#ffffff', color: alertesCritiques > 0 ? '#DC2626' : '#1a6b0a' }}>
              <AlertTriangle size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: alertesCritiques > 0 ? '#DC2626' : '#1a6b0a', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '20px' }}>
              {alertesCritiques > 0 ? 'Action Requise' : 'Rien à signaler'}
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: alertesCritiques > 0 ? '#B91C1C' : '#166534', marginBottom: '4px' }}>Alertes Critiques</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: alertesCritiques > 0 ? '#991B1B' : '#065F46', lineHeight: 1 }}>
              {String(alertesCritiques).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* Quality Chart Card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              TENDANCES DE QUALITÉ (KOR)
            </h2>
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '10px' }}>
              {(['7d', '30d'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  style={{
                    padding: '5px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    backgroundColor: chartPeriod === p ? '#1a6b0a' : 'transparent',
                    color: chartPeriod === p ? '#ffffff' : '#64748B',
                    fontSize: '11.5px', fontWeight: 800,
                  }}
                >
                  {p === '7d' ? '7 Jours' : '30 Jours'}
                </button>
              ))}
            </div>
          </div>

          {scansTerrain.length === 0 ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px', fontWeight: 600 }}>
              Aucun scan terrain sur cette période.
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 12px' }}>
              {chartData.map((d, idx) => {
                const isActive = idx === maxKorDayIndex && d.height > 0;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, position: 'relative' }}>
                    {isActive && <div style={{ fontSize: '11px', fontWeight: 900, color: '#1a6b0a', position: 'absolute', top: '-20px' }}>{d.value} lbs</div>}
                    <div style={{
                      width: chartPeriod === '7d' ? '42px' : '20px',
                      height: `${d.height}%`,
                      backgroundColor: isActive ? '#1a6b0a' : '#A7F3D0',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s',
                      boxShadow: isActive ? '0 4px 14px rgba(26, 107, 10, 0.3)' : 'none',
                    }} />
                    <span style={{ fontSize: '11.5px', fontWeight: isActive ? 800 : 600, color: isActive ? '#1a6b0a' : '#94A3B8' }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Anomaly Detection Card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            DÉTECTION D&apos;ANOMALIES IA
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {anomalies.length === 0 && !meilleurLot && (
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                Aucune anomalie détectée. Tous les lots récents respectent les standards de qualité.
              </p>
            )}

            {anomalies.slice(0, 2).map(scan => {
              const d = (scan.defauts ?? {}) as Defauts;
              const rejete = (scan.grade_ia || '').toLowerCase().includes('rejet');
              const humiditeElevee = (scan.humidite ?? 0) > 9;
              const titre = rejete
                ? 'Lot rejeté par l’IA'
                : humiditeElevee
                  ? `Taux d’humidité élevé (${scan.humidite?.toFixed(1)}%)`
                  : `Qualité sous les standards (${scan.grade_ia})`;
              const sousTitre = [d.cooperative_saisie, scan.nom_agent].filter(Boolean).join(' — ') || 'Origine non précisée';

              return (
                <div key={scan.id} style={{
                  padding: '12px 14px', borderRadius: '10px', backgroundColor: rejete ? '#FEF2F2' : '#FFF7ED',
                  borderLeft: `4px solid ${rejete ? '#EF4444' : '#F59E0B'}`, display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <AlertTriangle size={17} color={rejete ? '#DC2626' : '#D97706'} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: rejete ? '#991B1B' : '#92400E' }}>{titre}</div>
                    <div style={{ fontSize: '11px', color: rejete ? '#B91C1C' : '#B45309', fontWeight: 500 }}>{sousTitre} · {tempsRelatif(scan.date_scan)}</div>
                  </div>
                </div>
              );
            })}

            {meilleurLot && anomalies.length < 3 && (
              <div style={{
                padding: '12px 14px', borderRadius: '10px', backgroundColor: '#F0FDF4',
                borderLeft: '4px solid #10B981', display: 'flex', gap: '10px', alignItems: 'flex-start',
              }}>
                <TrendingUp size={17} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>
                    Meilleur lot : {meilleurLot.score_kor?.toFixed(1)} lbs ({meilleurLot.grade_ia})
                  </div>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 500 }}>
                    {meilleurLot.nom_agent || 'Agent'} · {tempsRelatif(meilleurLot.date_scan)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

        {/* Cooperative Map Status Widget */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              GÉOLOCALISATION DES COLLECTES
            </h2>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '8px' }}>
              <button onClick={() => setMapTab('map')} style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: mapTab === 'map' ? '#1a6b0a' : 'transparent', color: mapTab === 'map' ? '#fff' : '#64748B', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapIcon size={12} /> Carte
              </button>
              <button onClick={() => setMapTab('list')} style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: mapTab === 'list' ? '#1a6b0a' : 'transparent', color: mapTab === 'list' ? '#fff' : '#64748B', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <List size={12} /> Liste
              </button>
            </div>
          </div>

          {geoScans.length === 0 ? (
            <div style={{
              height: '220px', borderRadius: '12px', backgroundColor: '#F8FAFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94A3B8', fontSize: '13px', fontWeight: 600, textAlign: 'center', padding: '20px',
            }}>
              Aucune position GPS transmise pour l&apos;instant.
            </div>
          ) : mapTab === 'map' ? (
            <div style={{
              height: '220px', borderRadius: '12px', backgroundColor: '#E2E8F0',
              backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px', position: 'relative', overflow: 'hidden',
            }}>
              {geoScans.map(pt => (
                <div
                  key={pt.id}
                  title={`${pt.label} — ${pt.lat.toFixed(4)}, ${pt.long.toFixed(4)}`}
                  style={{
                    position: 'absolute', top: `${pt.top}%`, left: `${pt.left}%`, transform: 'translate(-50%, -50%)',
                    backgroundColor: pt.alerte ? '#EF4444' : '#10B981', color: '#fff', padding: '4px 10px', borderRadius: '16px',
                    fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
                  }}
                >
                  <MapPin size={12} /> {pt.label}{pt.sub ? ` (${pt.sub})` : ''}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {geoScans.map(pt => (
                <div key={pt.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '10px', backgroundColor: '#F8FAFC',
                  borderLeft: `3px solid ${pt.alerte ? '#EF4444' : '#10B981'}`,
                }}>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{pt.label}{pt.sub ? ` — ${pt.sub}` : ''}</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>{pt.lat.toFixed(4)}, {pt.long.toFixed(4)} · {pt.heure}</div>
                  </div>
                  {pt.alerte && <AlertTriangle size={15} color="#EF4444" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Performance Card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
              PERFORMANCE DES AGENTS
            </h2>

            {performanceAgents.length === 0 ? (
              <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0, lineHeight: 1.6 }}>
                Aucun agent de terrain enregistré.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {performanceAgents.map(ag => (
                  <div key={ag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a6b0a', color: '#fff', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {initiales(ag.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{ag.name}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Dernière collecte : {ag.sync}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{ag.lots} lot{ag.lots > 1 ? 's' : ''}</div>
                      {ag.online ? (
                        <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '10px' }}>EN LIGNE</span>
                      ) : (
                        <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '10px' }}>HORS LIGNE</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Toast Notification — dernier scan terrain réel */}
      {showToast && dernierScan && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0F172A', color: '#ffffff',
          padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)', zIndex: 50, border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Info size={18} color="#40BB1B" />
          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
            <strong>Nouveau lot analysé</strong> — LOT-{dernierScan.id.slice(0, 8).toUpperCase()} :
            KOR {dernierScan.score_kor?.toFixed(1) ?? '—'} ({dernierScan.grade_ia})
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, marginLeft: '8px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
