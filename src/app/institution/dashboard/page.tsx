"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building, Download } from 'lucide-react';
import { api } from '@/lib/api';

export default function InstitutionDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.etapes.getStats();
        setStats(data);
      } catch (err) {
        console.warn('Notice connexion stats institution:', err);
      }
    }
    loadStats();
  }, []);

  const totalVolume = `${stats?.tonnage_total_collecte || 0} Tonnes`;
  const korAverage = `${stats?.kor_moyen || 0} lbs`;
  const premiumPct = `${stats?.qualite_premium_pourcent || 0}%`;

  const regionalData = [
    { region: 'District du Bandama (Bouaké)', volume: totalVolume, kor: korAverage, gradeA: premiumPct, status: 'Zone Principale' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Building size={22} color="#1a6b0a" />
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Observatoire National de la Filière Anacarde
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Supervision institutionnelle, statistiques nationales de production et traçabilité globale (Ministère &amp; Conseil Coton-Anacarde).
        </p>
      </div>

      {/* National KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>PRODUCTION NATIONALE TOTAL</div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>{totalVolume}</div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '10px', marginTop: '8px', display: 'inline-block' }}>
            +8.5% vs Saison 2023
          </span>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>KOR MOYEN NATIONAL</div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#1a6b0a', marginTop: '12px', lineHeight: 1 }}>{korAverage}</div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '10px', marginTop: '8px', display: 'inline-block' }}>
            Standard Qualité Supérieure
          </span>
        </div>

        <div style={{ backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(26, 107, 10, 0.25)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>TAUX DE TRANSFORMATION LOCALE</div>
          <div style={{ fontSize: '34px', fontWeight: 900, marginTop: '8px', lineHeight: 1 }}>32%</div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0', fontWeight: 500 }}>Objectif Gouvernemental : 50% à l&apos;horizon 2026.</p>
        </div>
      </div>

      {/* Regional Production Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            BILAN RÉGIONAL DE QUALITÉ ET PRODUCTION
          </h2>

          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', backgroundColor: '#1a6b0a', color: '#ffffff',
            border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}>
            <Download size={15} /> Exporter Rapport Ministériel (PDF)
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>RÉGION / DISTRICT</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>VOLUME COLLECTÉ</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>KOR MOYEN</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>QUALITÉ GRADE A</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>STATUT RÉGION</th>
            </tr>
          </thead>
          <tbody>
            {regionalData.map((reg, idx) => (
              <tr key={idx} style={{ borderBottom: idx < regionalData.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>{reg.region}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{reg.volume}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#1a6b0a' }}>{reg.kor}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{reg.gradeA}</td>
                <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '8px' }}>
                    {reg.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
