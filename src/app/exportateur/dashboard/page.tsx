"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Download } from 'lucide-react';
import { api, LotData, TraceabilityStats } from '@/lib/api';

export default function ExportateurDashboard() {
  const [lots, setLots] = useState<LotData[]>([]);
  const [stats, setStats] = useState<TraceabilityStats | null>(null);

  useEffect(() => {
    Promise.all([
      api.etapes.getLots(),
      api.etapes.getStats()
    ]).then(([lotsData, statsData]) => {
      // Pour l'exportateur, on peut afficher les lots de grade A (premium) comme expéditions potentielles/validées
      setLots(lotsData.filter(l => l.grade?.includes('A')));
      setStats(statsData);
    }).catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Globe size={22} color="#1a6b0a" />
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Portail Exportateur International (Conformité EU / US)
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Générez et téléchargez les certificats phytosanitaires et de qualité d&apos;exportation certifiés par l&apos;IA NIANKA.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>VOLUME CERTIFIÉ EXPORT</div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>
            {stats ? (stats.grades?.['Grade A'] || '0 Tonnes') : '...'}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>TAUX CONFORMITÉ EU / US</div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#1a6b0a', marginTop: '12px', lineHeight: 1 }}>
            {stats ? `${stats.qualite_premium_pourcent}%` : '...'}
          </div>
        </div>

        <div style={{ backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(26, 107, 10, 0.25)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>NORME QUALITÉ EU</div>
          <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '8px' }}>Zéro Contamination physique</div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.85)', margin: '6px 0 0 0', fontWeight: 500 }}>Traçabilité GPS &amp; Horodatage certifié inclus sur chaque conteneur.</p>
        </div>
      </div>

      {/* Export Shipments Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            EXPÉDITIONS INTERNATIONALES CERTIFIÉES
          </h2>

          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', backgroundColor: '#1a6b0a', color: '#ffffff',
            border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}>
            <Download size={15} /> Télécharger Tous les Certificats (PDF)
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>RÉF EXPÉDITION</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>DESTINATION PORT</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>VOLUME</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>RENDEMENT EN AMANDES (KOR)</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>STATUT DOUANE</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot, idx) => (
              <tr key={idx} style={{ borderBottom: idx < lots.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>#{lot.numero_lot || lot.id.substring(0,8)}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Port d&apos;Export</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{lot.poids_tonnes} T</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{lot.score_kor || '-'}</td>
                <td style={{ padding: '18px 16px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '8px' }}>
                    {lot.statut || 'VALIDE'}
                  </span>
                </td>
                <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                  <Link href={`/exportateur/lot/${lot.id}`} style={{
                    padding: '8px 14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 2px 8px rgba(26, 107, 10, 0.2)',
                  }}>
                    Certificat PDF <Download size={14} />
                  </Link>
                </td>
              </tr>
            ))}
            {lots.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '14px', fontWeight: 600 }}>
                  Aucune expédition d&apos;export certifiée trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
