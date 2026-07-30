"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Warehouse, Truck, ArrowRightLeft, CheckCircle2, PackageCheck, ShieldCheck, MapPin, Clock, FileCheck, Download, X, Camera, Sparkles, Scale } from 'lucide-react';
import { api, LotCertifie, TraceabilityStats, TransferOrderData } from '@/lib/api';
import { libelleGrade } from '@/lib/grades';

export default function EntrepotDashboard() {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferOrderData | null>(null);
  const [statsData, setStatsData] = useState<TraceabilityStats | null>(null);
  const [transfers, setTransfers] = useState<TransferOrderData[]>([]);
  const [certifies, setCertifies] = useState<LotCertifie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [stats, bordereaux, lotsCertifies] = await Promise.all([
        api.etapes.getStats().catch(() => null),
        api.etapes.getTransferts().catch(() => [] as TransferOrderData[]),
        api.etapes.getLotsCertifies().catch(() => [] as LotCertifie[]),
      ]);
      setStatsData(stats);
      setTransfers(bordereaux);
      setCertifies(lotsCertifies);
      setLoading(false);
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const enTransit = transfers.filter(t => !t.arbitre);
  const tonnageEnTransit = enTransit.reduce((acc, t) => acc + (t.volume_tonnes || 0), 0);
  const tonnageScelle = certifies.reduce((acc, c) => acc + (c.volume_tonnes || 0), 0);

  const handleConfirmReceiptClick = (t: TransferOrderData) => {
    setSelectedTransfer(t);
    setShowReceiptModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      
      {/* Header Title & Arbitrage Scan Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
            <Warehouse size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Entrepôt Central Point de Rencontre &amp; Arbitrage
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
              Contrôle au déchargement, pesage et arbitrage neutre avant vente.
            </p>
          </div>
        </div>

        {/* DEDICATED ENTREPOT ARBITRAGE SCAN ROUTE */}
        <Link
          href="/entrepot/analysis"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 18px', backgroundColor: '#1a6b0a', color: '#ffffff',
            border: 'none', borderRadius: '12px', fontSize: '13.5px', fontWeight: 800,
            textDecoration: 'none', boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}
        >
          <Camera size={18} />
          <span>Scan d&apos;Arbitrage Officiel IA (Déchargement)</span>
        </Link>
      </div>

      {/* Arbitrage Banner Alert */}
      <div style={{
        backgroundColor: '#F0FDF4', borderRadius: '16px', padding: '18px 24px',
        border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#1a6b0a', color: '#ffffff' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#064E3B' }}>
              IA NIANKA : Arbitre Neutre Certifié au Déchargement
            </div>
            <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>
              Au déchargement des sacs, l&apos;IA re-scanne les lots pour certifier le KOR final et sceller le contrat d&apos;achat entre la Coopérative et l&apos;Usineur / Exportateur.
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>STOCK CENTRAL</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '3px 10px', borderRadius: '12px' }}>Disponible</span>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
              {(tonnageEnTransit + tonnageScelle).toFixed(1)}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#64748B' }}>T</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>EN TRANSIT</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '12px' }}>
              {enTransit.length} camion{enTransit.length > 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
              {tonnageEnTransit.toFixed(1)}
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#64748B' }}>T</span>
          </div>
        </div>

        <div style={{ backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(26, 107, 10, 0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>VENTES SCELLÉES</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.18)', padding: '3px 10px', borderRadius: '12px' }}>
              {certifies.length} vente{certifies.length > 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '34px', fontWeight: 900, lineHeight: 1 }}>{tonnageScelle.toFixed(1)}</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>T</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.9)', margin: '8px 0 0 0', fontWeight: 500 }}>
            KOR moyen certifié : {statsData?.kor_moyen ?? '—'} lbs
          </p>
        </div>
      </div>

      {/* Section 1: Incoming Transfers / Shipments from Cooperatives */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              LOTS EN PROVENANCE DES COOPÉRATIVES
            </h2>
            <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '2px 0 0 0' }}>Suivi de l&apos;acheminement et preuve de réception numérique</p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>RÉF TRANSFERT</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>COOPÉRATIVE EXPÉDITRICE</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>VOLUME &amp; CAMION</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>KOR MOYEN</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>STATUT TRANSPORT</th>
              <th style={{ padding: '14px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {transfers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '13.5px', fontWeight: 600, lineHeight: 1.7 }}>
                  {loading
                    ? 'Chargement des arrivages...'
                    : "Aucun camion annoncé. Les bordereaux apparaissent ici dès qu'une coopérative expédie un lot vers votre entrepôt."}
                </td>
              </tr>
            ) : transfers.map((t, idx) => {
              const isArbitred = Boolean(t.arbitre || t.statut === 'ARBITRE' || t.statut === 'VENDU');
              const isInTreatment = Boolean(t.statut === 'EN_TRAITEMENT' || t.statut === 'RECU' || t.statut === 'En traitement');

              return (
                <tr key={t.id} style={{ borderBottom: idx < transfers.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                  <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>{t.numero_bordereau}</td>
                  <td style={{ padding: '18px 16px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{t.nom_cooperative || '—'}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Expédié : {new Date(t.created_at).toLocaleString('fr-FR')} • Agent : {t.nom_agent || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '18px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{t.volume_tonnes} T ({libelleGrade(t.grade_lot).label})</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>{t.immatriculation_camion} ({t.nom_chauffeur})</div>
                  </td>
                  <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#10B981' }}>
                    {t.kor_initial !== null && t.kor_initial !== undefined ? `${t.kor_initial.toFixed(1)} lbs` : '—'}
                    <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>bord champ</div>
                  </td>
                  <td style={{ padding: '18px 16px' }}>
                    {isArbitred ? (
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={14} /> Arbitré &amp; vente scellée
                      </span>
                    ) : isInTreatment ? (
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#D97706', backgroundColor: '#FEF3C7', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> En traitement
                      </span>
                    ) : (
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={14} /> En transit
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                    {!isArbitred ? (
                      <Link
                        href={`/entrepot/analysis?bordereau=${encodeURIComponent(t.numero_bordereau)}`}
                        style={{
                          padding: '8px 14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                          borderRadius: '8px', fontSize: '12px', fontWeight: 800, textDecoration: 'none',
                          boxShadow: '0 2px 8px rgba(26, 107, 10, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <PackageCheck size={14} /> {isInTreatment ? "Continuer l'arbitrage" : "Réceptionner & arbitrer"}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleConfirmReceiptClick(t)}
                        style={{
                          padding: '6px 12px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
                          border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <FileCheck size={14} /> Certificat (Approuvé)
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}


          </tbody>
        </table>
      </div>

      {/* Confirmation & Proof Modal */}
      {showReceiptModal && selectedTransfer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }} className="modal-backdrop-print">
          <div className="printable-area" style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px',
            maxWidth: '540px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={22} color="#1a6b0a" />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Scan d&apos;Arbitrage &amp; Preuve de Vente
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Contrôle de déchargement certifié par l&apos;IA NIANKA</span>
                </div>
              </div>
              <button onClick={() => setShowReceiptModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} className="print-hidden">
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Réf bordereau :</span>
                <strong style={{ color: '#1a6b0a' }}>{selectedTransfer.numero_bordereau}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Coopérative vendeuse :</span>
                <strong style={{ color: '#0F172A' }}>{selectedTransfer.nom_cooperative || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Agent pisteur :</span>
                <strong style={{ color: '#0F172A' }}>{selectedTransfer.nom_agent || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Volume &amp; camion :</span>
                <strong style={{ color: '#0F172A' }}>
                  {selectedTransfer.volume_tonnes} T {selectedTransfer.immatriculation_camion} ({selectedTransfer.nom_chauffeur})
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>KOR bord champ :</span>
                <strong style={{ color: '#10B981' }}>
                  {selectedTransfer.kor_initial !== null && selectedTransfer.kor_initial !== undefined
                    ? `${selectedTransfer.kor_initial.toFixed(1)} lbs` : '—'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }} className="print-hidden">
              {!selectedTransfer.arbitre ? (
                <Link
                  href={`/entrepot/analysis?bordereau=${encodeURIComponent(selectedTransfer.numero_bordereau)}`}
                  style={{
                    flex: 1, padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <CheckCircle2 size={18} /> Lancer le scan d&apos;arbitrage ➔
                </Link>
              ) : (
                <a
                  href={api.etapes.certificatUrl(selectedTransfer.numero_bordereau)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '12px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <Download size={16} /> Ouvrir le certificat d&apos;arbitrage
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
