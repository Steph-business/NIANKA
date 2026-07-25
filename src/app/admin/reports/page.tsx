"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, FileText, Sparkles, ArrowUpRight, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminReportsPage() {
  const [cooperative, setCooperative] = useState('all');
  const [period, setPeriod] = useState('30d');
  const [reportsList, setReportsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await api.rapports.list().catch(() => []);
        if (Array.isArray(data) && data.length > 0) {
          setReportsList(data);
        }
      } catch (err) {
        console.warn('Reports notice:', err);
      }
    }
    loadReports();
  }, []);

  const recentReports = [
    { id: 'REP-2024-0512', entity: 'Coopérative Agrial', date: '12 Mai 2024', status: 'VALIDÉ', statusColor: '#10B981', statusBg: '#ECFDF5' },
    { id: 'REP-2024-0510', entity: 'Sodieal Union', date: '10 Mai 2024', status: 'VALIDÉ', statusColor: '#10B981', statusBg: '#ECFDF5' },
    { id: 'REP-2024-0430', entity: 'Global Mensuel', date: '30 Avr 2024', status: 'ARCHIVÉ', statusColor: '#3B82F6', statusBg: '#EFF6FF' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      
      {/* Top Action Bar & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Rapports &amp; Analyses
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Consultez les métriques clés de conformité et téléchargez vos bilans certifiés.
          </p>
        </div>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 20px', backgroundColor: '#1a6b0a', color: '#ffffff',
          border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
        }}>
          <Download size={17} />
          <span>Télécharger le rapport PDF</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
            COOPÉRATIVE
          </label>
          <select
            value={cooperative}
            onChange={e => setCooperative(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
              backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#475569', outline: 'none', minWidth: '220px',
            }}
          >
            <option value="all">Toutes les coopératives</option>
            <option value="agrial">Coopérative Agrial</option>
            <option value="sodieal">Sodieal Union</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
            PÉRIODE
          </label>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
              backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#475569', outline: 'none', minWidth: '180px',
            }}
          >
            <option value="30d">Derniers 30 jours</option>
            <option value="90d">Derniers 90 jours</option>
            <option value="year">Année 2024</option>
          </select>
        </div>
      </div>

      {/* Upper Section (Quality Trend & Donut Distribution) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Quality Trend Line Chart Card */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: '0 0 2px 0' }}>Évolution de la Qualité</h2>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Taux de conformité Grade A sur les 6 derniers mois</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a6b0a' }}>● 2024</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>● 2023</span>
            </div>
          </div>

          {/* SVG Line Chart Representation */}
          <div style={{ height: '180px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0,120 Q80,100 160,70 T320,40 T500,20" fill="none" stroke="#1a6b0a" strokeWidth="3.5" />
              <path d="M0,135 Q80,120 160,100 T320,80 T500,60" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 10px 0', fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
            <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Juin</span>
          </div>
        </div>

        {/* Grade Distribution Donut Chart */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            DISTRIBUTION DES GRADES
          </h2>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '16px 0' }}>
            <div style={{
              width: '130px', height: '130px', borderRadius: '50%',
              background: 'conic-gradient(#1a6b0a 0% 64%, #3B82F6 64% 82%, #EF4444 82% 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#ffffff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: '#1a6b0a', lineHeight: 1 }}>82%</span>
                <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748B' }}>Conforme</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1a6b0a' }} />
                Grade A (Premium)
              </span>
              <strong style={{ color: '#0F172A' }}>64%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                Grade B (Standard)
              </span>
              <strong style={{ color: '#0F172A' }}>18%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#334155' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                Grade C (Non-conforme)
              </span>
              <strong style={{ color: '#0F172A' }}>18%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section (Defect Frequencies & IA Summary Card) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Defect Frequencies */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Fréquence des Défauts</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', backgroundColor: '#F8FAFC', padding: '4px 10px', borderRadius: '6px' }}>Données agrégées</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Contamination physique', val: '24%', color: '#EF4444' },
              { label: 'Défaut de calibrage',    val: '42%', color: '#1a6b0a' },
              { label: 'Altération chromatique', val: '15%', color: '#10B981' },
              { label: 'Humidité excessive',    val: '19%', color: '#3B82F6' },
            ].map((def, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  <span>{def.label}</span>
                  <span style={{ color: def.color }}>{def.val}</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: def.val, height: '100%', backgroundColor: def.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Card (Dark Green #1a6b0a) */}
        <div style={{
          backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 6px 24px rgba(26, 107, 10, 0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Sparkles size={20} color="#40BB1B" />
              <h3 style={{ fontSize: '16px', fontWeight: 900, margin: 0, color: '#ffffff' }}>Résumé de l&apos;IA</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 500, margin: '0 0 20px 0' }}>
              Les analyses récentes montrent une amélioration de 12% de la qualité premium (Grade A) chez la Coopérative Agrial. Les défauts de calibrage restent le levier d&apos;optimisation principal pour le trimestre à venir.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '12px 14px' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#40BB1B', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
              RECOMMANDATION
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
              Révision des protocoles de séchage.
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section (Recently Generated Reports) */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            Rapports Générés Récemment
          </h2>
          <Link href="/admin/history" style={{ fontSize: '13px', fontWeight: 800, color: '#1a6b0a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Voir tout l&apos;historique</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9' }}>
              <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>RAPPORT ID</th>
              <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>ENTITÉ</th>
              <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>DATE DE GÉNÉRATION</th>
              <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>STATUT</th>
              <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {recentReports.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: idx < recentReports.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '16px 12px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>{row.id}</td>
                <td style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{row.entity}</td>
                <td style={{ padding: '16px 12px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{row.date}</td>
                <td style={{ padding: '16px 12px' }}>
                  <span style={{
                    fontSize: '11.5px', fontWeight: 800, color: row.statusColor,
                    backgroundColor: row.statusBg, padding: '4px 12px', borderRadius: '12px',
                  }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                  <button style={{ padding: '8px', color: '#1a6b0a', backgroundColor: '#F0FDF4', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
