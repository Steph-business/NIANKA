"use client";

import React from 'react';
import Link from 'next/link';
import { Globe, Download } from 'lucide-react';

export default function ExportateurDashboard() {
  const exportShipments = [
    { id: 'EXP-2024-0089', destination: 'Port de Rotterdam (UE)', volume: '120 Tonnes', kor: '53.5 lbs', cert: 'Conforme Export EU', status: 'VALIDE (Prêt Embarquement)' },
    { id: 'EXP-2024-0090', destination: 'Port de Hamburg (UE)', volume: '80 Tonnes', kor: '52.0 lbs', cert: 'Conforme Export EU', status: 'VALIDE (En Douane)' },
    { id: 'EXP-2024-0091', destination: 'Port de New York (US)', volume: '150 Tonnes', kor: '54.0 lbs', cert: 'Conforme USDA / FDA', status: 'VALIDE (Embarqué)' },
  ];

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
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>350 Tonnes</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>TAUX CONFORMITÉ EU / US</div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#1a6b0a', marginTop: '12px', lineHeight: 1 }}>99.4%</div>
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
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>SCORE KOR</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>STATUT DOUANE</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {exportShipments.map((exp, idx) => (
              <tr key={idx} style={{ borderBottom: idx < exportShipments.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>#{exp.id}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{exp.destination}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{exp.volume}</td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{exp.kor}</td>
                <td style={{ padding: '18px 16px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '8px' }}>
                    {exp.status}
                  </span>
                </td>
                <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                  <Link href="/user/analysis/result" style={{
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
