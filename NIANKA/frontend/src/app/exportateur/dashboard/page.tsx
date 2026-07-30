"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Download, Eye, X } from 'lucide-react';
import { api, LotCertifie, TraceabilityStats } from '@/lib/api';
import { CertificateSheet } from './CertificateSheet';
import { PrintableSingleCertificate } from './PrintableSingleCertificate';

export default function ExportateurDashboard() {
  const [lots, setLots] = useState<LotCertifie[]>([]);
  const [stats, setStats] = useState<TraceabilityStats | null>(null);
  const [printMode, setPrintMode] = useState<'all' | 'single' | null>(null);
  const [lotToPrint, setLotToPrint] = useState<LotCertifie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lots scellés à l'entrepôt central au profit de cet exportateur.
    Promise.all([
      api.etapes.getLotsCertifies().catch(() => [] as LotCertifie[]),
      api.etapes.getStats().catch(() => null),
    ]).then(([lotsData, statsData]) => {
      setLots(lotsData);
      setStats(statsData);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (printMode) {
      const handleAfterPrint = () => {
        setPrintMode(null);
        setLotToPrint(null);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      return () => window.removeEventListener('afterprint', handleAfterPrint);
    }
  }, [printMode]);

  const handlePrint = (mode: 'all' | 'single', lot?: LotCertifie) => {
    setPrintMode(mode);
    if (lot) setLotToPrint(lot);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      <style jsx global>{`
        @media print {
          .modal-backdrop-print {
            position: absolute !important;
            inset: 0 !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            z-index: 99999 !important;
          }
          .certificate-page {
            page-break-after: always;
          }
        }
      `}</style>

      
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

          <button onClick={() => handlePrint('all')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', backgroundColor: '#1a6b0a', color: '#ffffff',
            border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}
          className="print-hidden">
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
              <tr key={lot.arbitrage_id} style={{ borderBottom: idx < lots.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>
                  {lot.numero_bordereau}
                  <div style={{ fontSize: '10.5px', fontWeight: 500, color: '#64748B' }}>{lot.nom_cooperative || '—'}</div>
                </td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{lot.nom_entrepot || 'Entrepôt central'}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{lot.volume_tonnes} T</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  {(lot.kor_entrepot ?? lot.kor_initial)?.toFixed(1) ?? '—'} lbs
                </td>
                <td style={{ padding: '18px 16px' }}>
                  <span style={{
                    fontSize: '11.5px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px',
                    color: lot.verdict_conforme ? '#1a6b0a' : '#DC2626',
                    backgroundColor: lot.verdict_conforme ? '#F0FDF4' : '#FEF2F2',
                  }}>
                    {lot.verdict_conforme ? 'CONFORME EU/US' : `ÉCART ${lot.delta_kor} lbs`}
                  </span>
                </td>
                <td style={{ padding: '18px 16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <a
                    href={api.etapes.certificatUrl(lot.numero_bordereau)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                      borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 2px 8px rgba(26, 107, 10, 0.2)',
                    }}
                  >
                    <Download size={14} /> Certificat officiel
                  </a>
                  <button onClick={() => handlePrint('single', lot)} style={{
                    padding: '8px 14px', backgroundColor: '#ffffff', color: '#1a6b0a',
                    border: '1.5px solid #BBF7D0', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Eye size={14} /> Aperçu
                  </button>
                </td>
              </tr>
            ))}
            {lots.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '14px', fontWeight: 600, lineHeight: 1.7 }}>
                  {loading
                    ? 'Chargement de votre catalogue...'
                    : "Aucun lot ne vous a encore été attribué. Les lots apparaissent ici dès qu'un entrepôt central scelle une vente à votre nom."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Hidden components for printing */}
      {printMode === 'all' && <CertificateSheet lots={lots} />}
      {printMode === 'single' && lotToPrint && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9990, padding: '20px',
        }} onClick={() => setPrintMode(null)} className="modal-backdrop-print">
           <div style={{
            backgroundColor: '#fff', borderRadius: '24px', padding: '36px',
            maxWidth: '720px', width: '100%', boxShadow: '0 30px 60px rgba(0,0,0,0.25)',
            maxHeight: '92vh', overflowY: 'auto', border: '2.5px solid #1a6b0a',
          }} onClick={e => e.stopPropagation()}><PrintableSingleCertificate lot={lotToPrint} /></div>
        </div>
      )}

    </div>
  );
}
