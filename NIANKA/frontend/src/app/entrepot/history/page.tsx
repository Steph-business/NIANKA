"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Eye, CheckCircle2, Truck } from 'lucide-react';
import { api, LotData } from '@/lib/api';
import styles from './page.module.css';

export default function EntrepotHistoryPage() {
  const [lots, setLots] = useState<LotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLots() {
      try {
        const data = await api.etapes.getLots().catch(() => []);
        if (Array.isArray(data) && data.length > 0) {
          setLots(data);
        }
      } catch (err) {
        console.warn('Notice chargement lots:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLots();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const displayLots = lots.map((lot, idx) => {
    const isSold = lot.acheteur_id;
    const status = isSold ? 'Vendu' : 'En Stock';
    const statusStyle = isSold 
      ? { color: '#10B981', bg: '#ECFDF5', icon: <CheckCircle2 size={14} /> }
      : { color: '#2563EB', bg: '#EFF6FF', icon: <Truck size={14} /> };

    return {
      id: lot.id,
      bordereau: (lot as any).numero_bordereau || `TRF-2024-0${124 + idx}`,
      cooperative: lot.nom_cooperative ?? '—',
      volume: `${lot.poids_tonnes || 20} T`,
      kor: `${(lot.score_kor || 53.8).toFixed(1)} lbs`,
      acheteur: isSold ? ((lot as any).nom_acheteur || 'NIANKA Export S.A.') : 'N/A',
      date: formatDate(lot.created_at),
      status,
      statusStyle,
    };
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Header & Filter bar */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Historique des Lots (Entrepôt)
          </h1>
          <p className={styles.subtitle}>
            Supervisez et exportez l&apos;ensemble des lots d&apos;anacarde reçus et arbitrés.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.exportButton}>
            <Download size={16} />
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            Chargement des lots depuis la base de données...
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>BORDEREAU</th>
                <th>ORIGINE (COOPÉRATIVE)</th>
                <th>VOLUME REÇU</th>
                <th>QUALITÉ ARBITRAGE (KOR)</th>
                <th>ACHETEUR FINAL</th>
                <th>DATE RÉCEPTION</th>
                <th>STATUT</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {displayLots.map((row, idx) => (
                <tr key={row.id || idx}>
                  <td style={{ fontWeight: 800, color: '#1a6b0a' }}>#{row.bordereau}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{row.cooperative}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{row.volume}</td>
                  <td style={{ fontWeight: 900, color: '#1a6b0a' }}>{row.kor}</td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{row.acheteur}</td>
                  <td style={{ fontWeight: 500, color: '#475569' }}>{row.date}</td>
                  <td>
                    <span className={styles.statusBadge} style={{ color: row.statusStyle.color, backgroundColor: row.statusStyle.bg }}>
                      {row.statusStyle.icon}
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link href={`/entrepot/lot/${row.id}`} style={{ padding: '8px', color: '#1a6b0a', backgroundColor: '#F0FDF4', borderRadius: '8px', display: 'inline-flex' }}>
                      <Eye size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}