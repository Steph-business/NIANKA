"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Factory, ArrowRight, Filter, TrendingUp } from 'lucide-react';
import { api, LotCertifie, TraceabilityStats } from '@/lib/api';
import styles from './page.module.css';

export default function UsineurDashboard() {
  const [korMin, setKorMin] = useState(48);
  const [lots, setLots] = useState<LotCertifie[]>([]);
  const [stats, setStats] = useState<TraceabilityStats | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Les lots parviennent à l'usinier après scellement de la vente à
      // l'entrepôt central : ils portent le double scan et le verdict d'arbitrage.
      const [lotsData, statsData] = await Promise.all([
        api.etapes.getLotsCertifies().catch(() => [] as LotCertifie[]),
        api.etapes.getStats().catch(() => null),
      ]);
      setLots(lotsData);
      setStats(statsData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredLots = lots.filter(lot => (lot.kor_entrepot ?? lot.kor_initial ?? 0) >= korMin);

  const totalVolume = lots.reduce((acc, lot) => acc + (lot.volume_tonnes || 0), 0).toFixed(1);
  const korCertifies = lots
    .map(l => l.kor_entrepot ?? l.kor_initial)
    .filter((v): v is number => typeof v === 'number');
  const avgKor = korCertifies.length
    ? (korCertifies.reduce((a, b) => a + b, 0) / korCertifies.length).toFixed(1)
    : (stats?.kor_moyen ? Number(stats.kor_moyen).toFixed(1) : '—');

  const generateChartData = (lots: LotCertifie[], period: '7d' | '30d') => {
    const days = period === '7d' ? 7 : 30;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dailyData: { [key: string]: { totalKor: number; count: number } } = {};
    const labels: string[] = [];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyData[dateString] = { totalKor: 0, count: 0 };
      labels.push(days === 7 ? dayNames[date.getDay()] : `${date.getDate()}`.padStart(2, '0'));
    }

    lots.forEach(lot => {
      const kor = lot.kor_entrepot ?? lot.kor_initial;
      if (lot.scelle_a && typeof kor === 'number') {
        const lotDate = new Date(lot.scelle_a);
        if (lotDate <= today && lotDate > new Date(today.getTime() - days * 24 * 60 * 60 * 1000)) {
          const dateString = lotDate.toISOString().split('T')[0];
          if (dailyData[dateString]) {
            dailyData[dateString].totalKor += kor;
            dailyData[dateString].count += 1;
          }
        }
      }
    });

    const averages = Object.values(dailyData).map(data => data.count > 0 ? data.totalKor / data.count : 0);
    const maxAvg = Math.max(...averages, 40); // Use 40 as a baseline min
    const minAvg = Math.min(...averages.filter(a => a > 0), 55);

    return averages.map((avg, index) => {
      const height = maxAvg > minAvg ? ((avg - minAvg) / (maxAvg - minAvg)) * 80 + 20 : 50;
      return {
        day: labels[index],
        height: avg > 0 ? Math.max(10, height) : 0, // Ensure a minimum height for visibility
        value: avg > 0 ? avg.toFixed(1) : null,
      };
    });
  };

  const chartData = generateChartData(lots, chartPeriod);
  const maxKorDayIndex = chartData.reduce((maxIndex, item, currentIndex, arr) => item.height > arr[maxIndex].height ? currentIndex : maxIndex, 0);

  return (
    <div className={styles.pageWrapper}>
      
      {/* Header Title */}
      <div>
        <div className={styles.header}>
          <Factory size={22} color="#1a6b0a" />
          <h1 className={styles.title}>
            Portail Usineur &amp; Acheteur Industriel
          </h1>
        </div>
        <p className={styles.subtitle}>
          Sélectionnez et achetez les lots d&apos;anacarde contrôlés par l&apos;IA selon votre rendement de décorticage (KOR).
        </p>
      </div>

      {/* KPI Banner */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>VOLUME DISPONIBLE</span>
            <span className={styles.kpiBadge}>Certifié IA</span>
          </div>
          <div className={styles.kpiValue}>{totalVolume} Tonnes</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>KOR MOYEN OFFRES</span>
            <span className={styles.kpiBadge} style={{ color: '#10B981', backgroundColor: '#ECFDF5' }}>Qualité A+</span>
          </div>
          <div className={styles.kpiValue}>{avgKor} lbs</div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardPrimary}`}>
          <div className={styles.kpiLabelPrimary}>GARANTIE DÉCORTICAGE</div>
          <div className={styles.kpiValuePrimary}>Rendement Amande &gt; 28%</div>
          <p className={styles.kpiSubtextPrimary}>Chaque lot inclut l&apos;analyse d&apos;humidité et d&apos;anomalies gravées.</p>
        </div>
      </div>

      {/* Quality Trend Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>
            TENDANCES DE QUALITÉ (KOR)
          </h2>
          <div className={styles.chartPeriodSelector}>
            <button
              onClick={() => setChartPeriod('7d')}
              className={styles.chartPeriodButton}
              style={{
                backgroundColor: chartPeriod === '7d' ? '#1a6b0a' : 'transparent',
                color: chartPeriod === '7d' ? '#ffffff' : '#64748B',
              }}
            >
              7 Jours
            </button>
            <button
              onClick={() => setChartPeriod('30d')}
              className={styles.chartPeriodButton}
              style={{
                backgroundColor: chartPeriod === '30d' ? '#1a6b0a' : 'transparent',
                color: chartPeriod === '30d' ? '#ffffff' : '#64748B',
              }}
            >
              30 Jours
            </button>
          </div>
        </div>
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
                  borderRadius: '6px 6px 0 0', transition: 'all 0.3s',
                  boxShadow: isActive ? '0 4px 14px rgba(26, 107, 10, 0.3)' : 'none',
                }} />
                <span style={{ fontSize: '11.5px', fontWeight: isActive ? 800 : 600, color: isActive ? '#1a6b0a' : '#94A3B8' }}>{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Lots for Purchase */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>
            LOTS DISPONIBLES À L&apos;ACHAT AVEC CERTIFICAT IA
          </h2>

          <div className={styles.filterGroup}>
            <Filter size={15} color="#64748B" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Filtre KOR Min:</span>
            <select value={korMin} onChange={e => setKorMin(Number(e.target.value))} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: 700 }}>
              <option value={48}>KOR &gt; 48 lbs</option>
              <option value={50}>KOR &gt; 50 lbs</option>
              <option value={52}>KOR &gt; 52 lbs</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>CODE LOT</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>COOPÉRATIVE ORIGINE</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>VOLUME</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>RENDEMENT (KOR)</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em' }}>HUMIDITÉ</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredLots.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748B', lineHeight: 1.7 }}>
                  {loading
                    ? 'Chargement de votre catalogue...'
                    : lots.length === 0
                      ? "Aucun lot ne vous a encore été attribué. Les lots apparaissent ici dès qu'un entrepôt central scelle une vente à votre nom."
                      : `Aucun lot avec un KOR supérieur à ${korMin} lbs.`}
                </td>
              </tr>
            ) : (
              filteredLots.map((lot, idx) => {
                const kor = lot.kor_entrepot ?? lot.kor_initial ?? 0;
                const humidite = lot.humidite_entrepot ?? lot.humidite_initiale ?? 0;
                return (
                <tr key={lot.arbitrage_id} style={{ borderBottom: idx < filteredLots.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>
                  {lot.numero_bordereau}
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: lot.verdict_conforme ? '#10B981' : '#DC2626' }}>
                    {lot.verdict_conforme ? '✓ Arbitrage conforme' : `⚠ Écart ${lot.delta_kor} lbs`}
                  </div>
                </td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  {lot.nom_cooperative || '—'}
                  <div style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748B' }}>Agent : {lot.nom_agent || '—'}</div>
                </td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{lot.volume_tonnes} T</td>
                <td style={{ padding: '18px 16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '8px' }}>
                    {kor.toFixed(1)} lbs
                  </span>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px' }}>
                    bord champ {lot.kor_initial?.toFixed(1) ?? '—'}
                  </div>
                </td>
                <td style={{ padding: '18px 16px', fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>{humidite.toFixed(1)}%</td>
                <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                  <Link href={`/usineur/lot/${lot.bordereau_id}`} style={{
                    padding: '8px 14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 2px 8px rgba(26, 107, 10, 0.2)',
                  }}>
                    Fiche &amp; Certificat <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
              );
              }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
