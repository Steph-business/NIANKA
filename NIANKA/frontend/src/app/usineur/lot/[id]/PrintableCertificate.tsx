"use client";

import React from 'react';
import { Award } from 'lucide-react';
import { api, LotCertifie } from '@/lib/api';

interface PrintableCertificateProps {
  lot: LotCertifie;
}

export const PrintableCertificate: React.FC<PrintableCertificateProps> = ({ lot }) => {
  const korFinal = lot.kor_entrepot ?? lot.kor_initial;
  const humiditeFinale = lot.humidite_entrepot ?? lot.humidite_initiale;
  const date = new Date(lot.scelle_a).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="printable-area" style={{
      backgroundColor: '#fff',
      padding: '36px',
      border: '2.5px solid #1a6b0a',
      fontFamily: 'sans-serif',
      color: '#0F172A',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a6b0a', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            NIANKA FICHE TECHNIQUE USINEUR
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0 4px' }}>
            FICHE DE DÉCORTICAGE & RENDEMENT
          </h2>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            PLATEFORME NIANKA PRECISION FOOD SAFETY INTELLIGENCE
          </div>
        </div>
        {/* Le QR Code officiel est gravé sur le certificat serveur, seul document faisant foi. */}
        <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #CBD5E1', maxWidth: '190px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.06em' }}>VÉRIFICATION OFFICIELLE</div>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '5px', wordBreak: 'break-all', lineHeight: 1.4 }}>
            {api.etapes.certificatUrl(lot.numero_bordereau)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'RÉFÉRENCE LOT', value: `#${lot.numero_bordereau}`, color: '#1a6b0a' },
          { label: 'ORIGINE COOPÉRATIVE', value: lot.nom_cooperative || '—', color: '#0F172A' },
          { label: 'AGENT PISTEUR', value: lot.nom_agent || '—', color: '#0F172A' },
          { label: "DATE D'ÉMISSION", value: date, color: '#0F172A' },
        ].map((field, i) => (
          <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', marginBottom: '4px' }}>{field.label}</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: field.color }}>{field.value}</div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: lot.verdict_conforme ? '#F0FDF4' : '#FEF2F2', padding: '18px 20px', borderRadius: '14px',
        border: `1px dashed ${lot.verdict_conforme ? '#40BB1B' : '#DC2626'}`, marginBottom: '20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 900, color: lot.verdict_conforme ? '#1a6b0a' : '#991B1B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={18} /> Spécifications Physiques & Qualité
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Grade Classifié', value: lot.grade_lot, color: '#10B981' },
            { label: 'Rendement (KOR)', value: korFinal != null ? `${korFinal} lbs` : '—', color: '#0F172A' },
            { label: 'Taux Humidité', value: humiditeFinale != null ? `${humiditeFinale}%` : '—', color: '#0F172A' },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 800, marginTop: '12px', color: lot.verdict_conforme ? '#166534' : '#991B1B' }}>
          {lot.verdict_conforme
            ? `✓ Arbitrage conforme écart KOR de ${lot.delta_kor} lbs entre la collecte et le déchargement.`
            : `⚠ Écart détecté par l'arbitrage IA ${lot.delta_kor} lbs entre la collecte et le déchargement.`}
        </div>
      </div>

      <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>
          Ce document certifie le résultat de l&apos;arbitrage IA réalisé à l&apos;entrepôt central pour le lot susmentionné.
          <br />
          Délivré le {date} Côte d&apos;Ivoire
        </div>
      </div>
    </div>
  );
};
