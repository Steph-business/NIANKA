"use client";

import React from 'react';
import { LotCertifie, getCurrentUserProfile } from '@/lib/api';
import { Logo } from '@/components/Logo';

export const PrintableBonDeLivraison: React.FC<{ lot: LotCertifie }> = ({ lot }) => {
  const date = new Date(lot.scelle_a).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const destinataire = lot.nom_acheteur || getCurrentUserProfile()?.nom_complet || '—';

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
          <Logo style={{ height: '38px', marginBottom: '8px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '6px 0 4px' }}>
            BON DE LIVRAISON (DOUANE)
          </h2>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            DOCUMENT OFFICIEL DE TRANSFERT DE MARCHANDISE
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Référence: BL-{lot.numero_bordereau}</div>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Date: {date}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '6px' }}>EXPÉDITEUR (COOPÉRATIVE)</div>
          <div style={{ fontSize: '14px', fontWeight: 900 }}>{lot.nom_cooperative || '—'}</div>
          <div style={{ fontSize: '12px', color: '#475569' }}>Côte d&apos;Ivoire</div>
        </div>
        <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', marginBottom: '6px' }}>DESTINATAIRE (EXPORTATEUR)</div>
          <div style={{ fontSize: '14px', fontWeight: 900 }}>{destinataire}</div>
          <div style={{ fontSize: '12px', color: '#475569' }}>Port d&apos;Abidjan, Côte d&apos;Ivoire</div>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ backgroundColor: '#F1F5F9' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: '#475569' }}>DESCRIPTION</th>
            <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 800, color: '#475569' }}>QUANTITÉ</th>
            <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 800, color: '#475569' }}>GRADE QUALITÉ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '14px 12px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 900 }}>Noix de Cajou Brutes (Anacarde)</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Lot de Référence: {lot.numero_bordereau}</div>
            </td>
            <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 800, borderBottom: '1px solid #E2E8F0' }}>{lot.volume_tonnes} Tonnes</td>
            <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 900, color: '#1a6b0a', borderBottom: '1px solid #E2E8F0' }}>{lot.grade_lot || '—'}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '80px' }}>
        <div style={{ borderTop: '1.5px solid #0F172A', paddingTop: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Signature Expéditeur</div>
        </div>
        <div style={{ borderTop: '1.5px solid #0F172A', paddingTop: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Signature Destinataire</div>
        </div>
      </div>

      <div style={{ paddingTop: '32px', borderTop: '1px solid #E2E8F0', marginTop: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>
          Ce document atteste de la livraison des marchandises décrites ci-dessus.
          <br />
          Généré par la plateforme NIANKA {date}
        </div>
      </div>
    </div>
  );
};
