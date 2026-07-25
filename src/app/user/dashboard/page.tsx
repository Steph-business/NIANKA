"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, CheckCircle2, RefreshCw, ArrowUpRight, Microscope } from 'lucide-react';
import { api } from '@/lib/api';

export default function UserDashboardPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [scansData, statsData] = await Promise.all([
          api.etapes.getScans().catch(() => []),
          api.etapes.getStats().catch(() => null),
        ]);
        setScans(scansData || []);
        setStats(statsData);
      } catch (err) {
        console.warn('Notice chargement dashboard agent:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalLots = stats?.total_lots_count || scans.length || 0;
  const korMoyen = stats?.kor_moyen ? `${stats.kor_moyen} lbs` : "0.0 lbs";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      {/* Header Title + CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Résumé de l&apos;activité Agent
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Supervision et suivi en temps réel des analyses d&apos;échantillons de terrain.
          </p>
        </div>

        <Link
          href="/user/analysis"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: '#1a6b0a',
            color: '#ffffff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
            transition: 'all 0.2s',
          }}
        >
          <Plus size={18} strokeWidth={3} />
          <span>Nouvelle Analyse</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
              <Package size={22} />
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Scans / Analyses Effectués</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{totalLots}</div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#40BB1B' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Qualité Moyenne (KOR)</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{korMoyen}</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F8FAFC', color: '#64748B' }}>
              <RefreshCw size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '20px' }}>
              ● En cours
            </span>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8' }}>Synchronisés BDD</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A' }}>{scans.length}</div>
            </div>
            <div style={{ borderLeft: '1px solid #F1F5F9', paddingLeft: '20px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8' }}>Rejetés / Alertes</div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: scans.filter(s => s.grade_ia === 'Rejeté').length > 0 ? '#EF4444' : '#10B981' }}>
                {scans.filter(s => s.grade_ia === 'Rejeté').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            DERNIÈRES ANALYSES
          </h2>
          <Link href="/user/history" style={{ fontSize: '13px', fontWeight: 800, color: '#1a6b0a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Voir tout l&apos;historique</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" color="#1a6b0a" style={{ margin: '0 auto 8px auto', display: 'block' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, margin: 0 }}>Chargement des données en direct...</p>
          </div>
        ) : scans.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            <Microscope size={38} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Aucune analyse enregistrée</h3>
            <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>Réalisez une analyse d&apos;échantillon d&apos;anacarde avec l&apos;IA pour l&apos;afficher ici en direct.</p>
            <Link href="/user/analysis" style={{ padding: '10px 18px', backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '13px', display: 'inline-block' }}>
              Démarrer une analyse IA
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #F1F5F9' }}>
                <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>ID SCAN</th>
                <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>DATE & HEURE</th>
                <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>GRADE IA</th>
                <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8' }}>SCORE KOR</th>
                <th style={{ padding: '14px 12px', fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', textAlign: 'right' }}>STATUT</th>
              </tr>
            </thead>
            <tbody>
              {scans.slice(0, 5).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: idx < Math.min(scans.length, 5) - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <td style={{ padding: '16px 12px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>#{item.id?.substring(0, 8) || `SCAN-${idx + 1}`}</td>
                  <td style={{ padding: '16px 12px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>{item.date_scan ? new Date(item.date_scan).toLocaleString('fr-FR') : 'À l\'instant'}</td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      color: item.grade_ia === 'Rejeté' ? '#EF4444' : '#1a6b0a',
                      backgroundColor: item.grade_ia === 'Rejeté' ? '#FEF2F2' : '#F0FDF4',
                      padding: '4px 12px',
                      borderRadius: '8px',
                    }}>
                      {item.grade_ia || 'Grade A'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 12px', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>{item.score_kor ? `${item.score_kor} lbs` : '54.2 lbs'}</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 800, color: '#10B981',
                      backgroundColor: '#ECFDF5', padding: '5px 14px', borderRadius: '20px',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}>
                      ● Synchronisé
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Coverage Map widget */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
              ZONE DE COUVERTURE & DERNÈRE ANALYSE REÇUE
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 600 }}>
              {scans.length > 0
                ? `Dernier scan: ${scans[0].grade_ia} (${scans[0].score_kor || 54.2} lbs KOR) à Bouaké Nord`
                : "Suivi géolocalisé en direct de vos collectes terrain."}
            </p>
          </div>

          <div style={{
            height: '140px',
            marginTop: '16px',
            borderRadius: '12px',
            backgroundImage: 'url(/images/anacarde.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,107,10,0.75) 0%, rgba(15,76,58,0.6) 100%)' }} />
            <div style={{
              position: 'absolute', bottom: '12px', left: '12px',
              backgroundColor: '#1a6b0a', color: '#ffffff',
              fontSize: '10.5px', fontWeight: 800, padding: '5px 12px',
              borderRadius: '20px', letterSpacing: '0.05em',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              ● COUVERTURE SATELLITE GPS ACTIVE
            </div>
          </div>
        </div>

        {/* Ready Card */}
        <div style={{
          backgroundColor: '#1a6b0a',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 6px 24px rgba(26, 107, 10, 0.3)',
        }}>
          <div>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Microscope size={24} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 8px 0', lineHeight: 1.25 }}>
              Prêt pour l&apos;Analyse ?
            </h3>
            <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              Calibrez vos capteurs avant de démarrer une nouvelle session de collecte de noix.
            </p>
          </div>

          <button style={{
            marginTop: '20px',
            padding: '13px',
            backgroundColor: '#ffffff',
            color: '#1a6b0a',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}>
            Calibrer le Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
