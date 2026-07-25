"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Eye, Package } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminHistoryPage() {
  const [lots, setLots] = useState<any[]>([]);
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

  const defaultLots = [
    { code: 'NK-2024-00124', coop: 'SOCAKKAT Dalleu', datetime: '14 Mai 2024, 14:30', grade: 'REJETÉ', gradeColor: '#DC2626', gradeBg: '#FEF2F2', agent: 'B. Kouassi' },
    { code: 'NK-2024-00125', coop: 'Coop. Anacarde Korhogo', datetime: '14 Mai 2024, 13:15', grade: 'GRADE B', gradeColor: '#F59E0B', gradeBg: '#FEF3C7', agent: 'Fanta Diabaté' },
    { code: 'NK-2024-00126', coop: 'Coopérative Agrial Bouaké', datetime: '14 Mai 2024, 11:45', grade: 'GRADE A', gradeColor: '#1a6b0a', gradeBg: '#F0FDF4', agent: 'Amadou Koné' },
    { code: 'NK-2024-00127', coop: 'Coop. ANADER Yamoussoukro', datetime: '14 Mai 2024, 09:20', grade: 'GRADE A+', gradeColor: '#1a6b0a', gradeBg: '#F0FDF4', agent: 'Souleymane Traoré' },
  ];

  const displayLots = lots.length > 0 ? lots.map((item: any, idx: number) => ({
    code: item.code_lot || item.numero_lot || `NK-2024-00${124 + idx}`,
    coop: item.nom_cooperative || item.cooperative || 'Coop. ANADER Bouaké',
    datetime: item.date_creation || item.date_scan || 'Aujourd\'hui',
    grade: item.grade_qualite || item.grade || 'GRADE A',
    gradeColor: item.grade === 'REJETÉ' ? '#DC2626' : '#1a6b0a',
    gradeBg: item.grade === 'REJETÉ' ? '#FEF2F2' : '#F0FDF4',
    agent: item.nom_agent || item.agent || 'Amadou Koné',
  })) : defaultLots;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      {/* Header & Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Historique des Lots (Coopérative)
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500, maxWidth: '640px' }}>
            Supervisez et exportez l&apos;ensemble des lots d&apos;anacarde collectés par vos agents sur le terrain.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '10px', border: 'none',
            backgroundColor: '#1a6b0a', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}>
            <Download size={16} />
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        padding: '8px 0', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>
            Chargement des lots depuis la base de données...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                <th style={{ padding: '16px 24px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>CODE LOT</th>
                <th style={{ padding: '16px 24px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>COOPÉRATIVE</th>
                <th style={{ padding: '16px 24px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>AGENT PISTEUR</th>
                <th style={{ padding: '16px 24px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>DATE &amp; HEURE</th>
                <th style={{ padding: '16px 24px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>GRADE IA</th>
                <th style={{ padding: '16px 24px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {displayLots.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: idx < displayLots.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <td style={{ padding: '18px 24px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>#{row.code}</td>
                  <td style={{ padding: '18px 24px', fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{row.coop}</td>
                  <td style={{ padding: '18px 24px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{row.agent}</td>
                  <td style={{ padding: '18px 24px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{row.datetime}</td>
                  <td style={{ padding: '18px 24px' }}>
                    <span style={{
                      fontSize: '11.5px', fontWeight: 800, color: row.gradeColor,
                      backgroundColor: row.gradeBg, padding: '5px 12px', borderRadius: '12px',
                    }}>
                      {row.grade}
                    </span>
                  </td>
                  <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                    <Link href="/cooperative/analysis" style={{ padding: '8px', color: '#1a6b0a', backgroundColor: '#F0FDF4', borderRadius: '8px', display: 'inline-flex' }}>
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
