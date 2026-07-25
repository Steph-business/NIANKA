"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Factory, ArrowRight, Filter } from 'lucide-react';
import { api } from '@/lib/api';

export default function UsineurDashboard() {
  const [korMin, setKorMin] = useState('48');
  const [lots, setLots] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [lotsData, statsData] = await Promise.all([
          api.etapes.getLots().catch(() => []),
          api.etapes.getStats().catch(() => null),
        ]);
        setLots(lotsData || []);
        setStats(statsData);
      } catch (err) {
        console.warn('Notice usineur dashboard:', err);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      
      {/* Header Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Factory size={22} color="#1a6b0a" />
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Portail Usineur &amp; Acheteur Industriel
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Sélectionnez et achetez les lots d&apos;anacarde contrôlés par l&apos;IA selon votre rendement de décorticage (KOR).
        </p>
      </div>

      {/* KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>VOLUME DISPONIBLE</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '3px 10px', borderRadius: '12px' }}>Certifié IA</span>
          </div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>58 Tonnes</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>KOR MOYEN OFFRES</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '12px' }}>Qualité A+</span>
          </div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>51.9 lbs</div>
        </div>

        <div style={{ backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(26, 107, 10, 0.25)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>GARANTIE DÉCORTICAGE</div>
          <div style={{ fontSize: '18px', fontWeight: 900, marginTop: '8px' }}>Rendement Amande &gt; 28%</div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.85)', margin: '6px 0 0 0', fontWeight: 500 }}>Chaque lot inclut l&apos;analyse d&apos;humidité et d&apos;anomalies gravées.</p>
        </div>
      </div>

      {/* Available Lots for Purchase */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            LOTS DISPONIBLES À L&apos;ACHAT AVEC CERTIFICAT IA
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#64748B" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Filtre KOR Min:</span>
            <select value={korMin} onChange={e => setKorMin(e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: 700 }}>
              <option value="48">KOR &gt; 48 lbs</option>
              <option value="50">KOR &gt; 50 lbs</option>
              <option value="52">KOR &gt; 52 lbs</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>CODE LOT</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>COOPÉRATIVE ORIGINE</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>VOLUME</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>SCORE KOR</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>HUMIDITÉ</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {lots.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                  Aucun lot disponible pour le moment. Les lots certifiés par l&apos;entrepôt s&apos;afficheront ici.
                </td>
              </tr>
            ) : (
              lots.map((lot: any, idx: number) => (
                <tr key={idx} style={{ borderBottom: idx < lots.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>#{lot.id}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{lot.coop}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{lot.volume}</td>
                <td style={{ padding: '18px 16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '8px' }}>
                    {lot.kor}
                  </span>
                </td>
                <td style={{ padding: '18px 16px', fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>{lot.moisture}</td>
                <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                  <Link href="/user/analysis/result" style={{
                    padding: '8px 14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 2px 8px rgba(26, 107, 10, 0.2)',
                  }}>
                    Fiche &amp; Certificat <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
