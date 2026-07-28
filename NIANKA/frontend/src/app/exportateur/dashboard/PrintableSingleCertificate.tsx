"use client";

import React from 'react';
import { Award } from 'lucide-react';
import { api, LotCertifie } from '@/lib/api';

interface PrintableCertificateProps {
  lot: LotCertifie;
}

export const PrintableSingleCertificate: React.FC<PrintableCertificateProps> = ({ lot }) => {
  const lotId = lot.numero_bordereau;
  const kor = (lot.kor_entrepot ?? lot.kor_initial)?.toFixed(1) ?? '—';
  const grade = lot.grade_lot;
  const date = new Date(lot.scelle_a).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="printable-area" style={{
      backgroundColor: '#fff',
      padding: '36px',
      border: '2.5px solid #1a6b0a',
      fontFamily: 'sans-serif',
      color: '#0F172A',
      maxWidth: '720px',
      margin: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a6b0a', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            RÉPUBLIQUE DE CÔTE D&apos;IVOIRE — MINISTÈRE DE L&apos;AGRICULTURE
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0 4px' }}>
            CERTIFICAT DE CONFORMITÉ QUALITÉ & TRAÇABILITÉ
          </h2>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            PLATEFORME NIANKA PRECISION FOOD SAFETY INTELLIGENCE
          </div>
        </div>
        {/* Le QR Code officiel figure sur le certificat serveur, seul document faisant foi. */}
        <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #CBD5E1', maxWidth: '190px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.06em' }}>VÉRIFICATION OFFICIELLE</div>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '5px', wordBreak: 'break-all', lineHeight: 1.4 }}>
            {api.etapes.certificatUrl(lot.numero_bordereau)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'RÉFÉRENCE EXPÉDITION', value: `#${lotId}`, color: '#1a6b0a' },
          { label: "COOPÉRATIVE D'ORIGINE", value: lot.nom_cooperative || '—', color: '#0F172A' },
          { label: 'ENTREPÔT ARBITRE', value: lot.nom_entrepot || '—', color: '#2563EB' },
          { label: 'DATE DE SCELLEMENT', value: date, color: '#0F172A' },
        ].map((field, i) => (
          <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', marginBottom: '4px' }}>{field.label}</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: field.color }}>{field.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#F0FDF4', padding: '18px 20px', borderRadius: '14px', border: '1px dashed #40BB1B', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={18} /> Synthèse de l&apos;Analyse d&apos;Échantillonnage IA
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Grade Export', value: grade, color: '#10B981' },
            { label: 'KOR arbitré', value: `${kor} lbs`, color: '#0F172A' },
            { label: 'Volume', value: `${lot.volume_tonnes} T`, color: '#0F172A' },
            { label: 'KOR bord champ', value: `${lot.kor_initial?.toFixed(1) ?? '—'} lbs`, color: '#475569' },
            { label: 'Écart constaté', value: `${lot.delta_kor} lbs`, color: lot.verdict_conforme ? '#10B981' : '#DC2626' },
            { label: 'Agent pisteur', value: lot.nom_agent || '—', color: '#0F172A' },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>
          Ce document certifie que le lot susmentionné a été inspecté et est conforme aux normes de qualité pour l'exportation.
          <br />
          Délivré le {date} — Bouaké, Côte d&apos;Ivoire
        </div>
      </div>
    </div>
  );
};