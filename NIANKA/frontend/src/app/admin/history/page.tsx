"use client";

import React, { useEffect, useState } from 'react';
import { Download, Package } from 'lucide-react';
import { api, LotData } from '@/lib/api';

/** Palette de grade conforme à la charte NIANKA. */
function styleGrade(grade?: string) {
  const g = (grade || '').toLowerCase();
  if (g.includes('rejet')) return { color: '#DC2626', bg: '#FEF2F2' };
  if (g.includes('c')) return { color: '#D97706', bg: '#FEF3C7' };
  if (g.includes('b')) return { color: '#EA580C', bg: '#FFEDD5' };
  return { color: '#1a6b0a', bg: '#F0FDF4' };
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('fr-FR');
}

function styleStatut(statut?: string) {
  const s = (statut || '').toUpperCase();
  if (s === 'VENDU') return { label: 'Vendu', color: '#1a6b0a', bg: '#F0FDF4' };
  if (s === 'EN_TRANSIT') return { label: 'En transit', color: '#2563EB', bg: '#EFF6FF' };
  return { label: 'En stock', color: '#64748B', bg: '#F1F5F9' };
}

export default function AdminHistoryPage() {
  const [lots, setLots] = useState<LotData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.etapes.getLots()
      .then(setLots)
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, []);

  const exporterCsv = () => {
    const entetes = ['Code lot', 'Cooperative', 'Grade', 'Poids (T)', 'KOR (lbs)', 'Humidite (%)', 'Statut', 'GPS', 'Date'];
    const lignes = lots.map(l => [
      l.numero_lot ?? '',
      l.nom_cooperative ?? '',
      l.grade ?? '',
      l.poids_tonnes ?? '',
      l.score_kor ?? '',
      l.humidite ?? '',
      l.statut ?? '',
      l.gps_lat !== undefined && l.gps_long !== undefined ? `${l.gps_lat} ${l.gps_long}` : '',
      l.created_at ?? '',
    ]);

    const csv = [entetes, ...lignes]
      .map(ligne => ligne.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');

    // BOM UTF-8 pour qu'Excel affiche correctement les accents
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nianka_lots_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Historique des Lots
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500, maxWidth: '640px' }}>
            Lots homologués à partir des analyses terrain, avec leur rendement, leur qualité et leur statut commercial.
          </p>
        </div>

        <button
          onClick={exporterCsv}
          disabled={lots.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '10px', border: 'none',
            backgroundColor: '#1a6b0a', color: '#ffffff', fontSize: '13px', fontWeight: 800,
            cursor: lots.length === 0 ? 'not-allowed' : 'pointer',
            opacity: lots.length === 0 ? 0.5 : 1,
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}
        >
          <Download size={16} />
          <span>Exporter en CSV ({lots.length})</span>
        </button>
      </div>

      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        padding: '8px 0', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>
            Chargement des lots...
          </div>
        ) : lots.length === 0 ? (
          <div style={{
            padding: '46px 30px', textAlign: 'center', color: '#64748B',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
          }}>
            <Package size={38} color="#CBD5E1" />
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>Aucun lot homologué</div>
            <p style={{ fontSize: '13px', margin: 0, maxWidth: '440px', lineHeight: 1.6 }}>
              Les lots apparaissent ici après approbation d&apos;une analyse terrain
              depuis le tableau de bord de la coopérative.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                {['CODE LOT', 'COOPÉRATIVE', 'POIDS', 'RENDEMENT (KOR)', 'HUMIDITÉ', 'GRADE', 'STATUT', 'DATE'].map(h => (
                  <th key={h} style={{ padding: '16px 20px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lots.map((lot, idx) => {
                const g = styleGrade(lot.grade);
                const s = styleStatut(lot.statut);
                return (
                  <tr key={lot.id ?? idx} style={{ borderBottom: idx < lots.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                    <td style={{ padding: '18px 20px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>
                      #{lot.numero_lot ?? '—'}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                      {lot.nom_cooperative ?? '—'}
                      {lot.gps_lat !== undefined && lot.gps_long !== undefined && (
                        <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500 }}>
                          {lot.gps_lat.toFixed(4)}, {lot.gps_long.toFixed(4)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '13px', color: '#0F172A', fontWeight: 700 }}>
                      {lot.poids_tonnes !== undefined ? `${lot.poids_tonnes.toFixed(2)} T` : '—'}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '13px', color: '#0F172A', fontWeight: 800 }}>
                      {lot.score_kor !== undefined ? `${lot.score_kor.toFixed(1)} lbs` : '—'}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                      {lot.humidite !== undefined ? `${lot.humidite.toFixed(1)} %` : '—'}
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 800, color: g.color,
                        backgroundColor: g.bg, padding: '5px 12px', borderRadius: '12px',
                      }}>
                        {lot.grade ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{
                        fontSize: '11.5px', fontWeight: 800, color: s.color,
                        backgroundColor: s.bg, padding: '5px 12px', borderRadius: '12px',
                      }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: '12.5px', color: '#475569', fontWeight: 500 }}>
                      {formatDate(lot.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
