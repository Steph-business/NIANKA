"use client";

import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { LotCertifie } from '@/lib/api';

interface PrintableFullReportProps {
  lot: LotCertifie;
}

export const PrintableFullReport: React.FC<PrintableFullReportProps> = ({ lot }) => {
  const korFinal = lot.kor_entrepot ?? lot.kor_initial;
  const date = new Date(lot.scelle_a).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="printable-area" style={{
      backgroundColor: '#fff',
      padding: '36px',
      border: '1.5px solid #475569',
      fontFamily: 'sans-serif',
      color: '#0F172A',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            NIANKA — RAPPORT DE TRAÇABILITÉ COMPLET
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '6px 0 4px' }}>
            RAPPORT COMPLET DU LOT #{lot.numero_bordereau}
          </h2>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            DOCUMENT DE TRAÇABILITÉ DE LA COLLECTE À L&apos;ENTREPÔT
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Date du rapport: {date}</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>Synthèse du Lot</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '13px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Coopérative</div>
            <div style={{ fontWeight: 800, color: '#0F172A' }}>{lot.nom_cooperative || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Volume</div>
            <div style={{ fontWeight: 800, color: '#0F172A' }}>{lot.volume_tonnes} Tonnes</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Grade Final</div>
            <div style={{ fontWeight: 800, color: '#1a6b0a' }}>{lot.grade_lot}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>KOR Final</div>
            <div style={{ fontWeight: 800, color: '#1a6b0a' }}>{korFinal != null ? `${korFinal} lbs` : '—'}</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lot.verdict_conforme ? <ShieldCheck size={18} color="#1a6b0a" /> : <AlertTriangle size={18} color="#DC2626" />}
          Comparaison & Arbitrage IA
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '6px' }}>1. SCAN INITIAL ({(lot.nom_agent || 'AGENT').toUpperCase()})</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A' }}>
              {lot.kor_initial != null ? `${lot.kor_initial} lbs` : '—'}
            </div>
            <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
              Humidité: {lot.humidite_initiale != null ? `${lot.humidite_initiale}%` : '—'}
            </div>
          </div>
          <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '16px', border: '1.5px solid #BBF7D0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', marginBottom: '6px' }}>2. SCAN FINAL (ARBITRAGE {lot.nom_entrepot || 'ENTREPÔT'})</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#1a6b0a' }}>
              {lot.kor_entrepot != null ? `${lot.kor_entrepot} lbs` : '—'}
            </div>
            <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
              Humidité: {lot.humidite_entrepot != null ? `${lot.humidite_entrepot}%` : '—'}
            </div>
          </div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '10px', textAlign: 'center', color: lot.verdict_conforme ? '#166534' : '#991B1B' }}>
          {lot.verdict_conforme
            ? `✓ Verdict de conformité : écart de ${lot.delta_kor} lbs, aucune dégradation significative détectée durant le transport.`
            : `⚠ Écart détecté : ${lot.delta_kor} lbs entre la collecte et le déchargement — dégradation constatée durant le transport.`}
        </div>
      </div>

      <div style={{ paddingTop: '24px', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>
          Ce rapport complet atteste de la traçabilité et de la qualité du lot depuis sa collecte jusqu&apos;à sa validation à l&apos;entrepôt.
          <br />
          Généré par la plateforme NIANKA — {date}
        </div>
      </div>
    </div>
  );
};
