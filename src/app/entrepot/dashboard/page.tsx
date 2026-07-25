"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Warehouse, Truck, ArrowRightLeft, CheckCircle2, PackageCheck, ShieldCheck, MapPin, Clock, FileCheck, Download, X, Camera, Sparkles, Scale } from 'lucide-react';
import { api } from '@/lib/api';

export default function EntrepotDashboard() {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await api.etapes.getStats();
        setStatsData(stats);
      } catch (err) {
        console.warn('Notice chargement entrepot stats:', err);
      }
    }
    loadData();
  }, []);

  const [transfers, setTransfers] = useState([
    {
      id: 'TRF-2024-08',
      origin: 'Coop. ANADER Bouaké',
      volume: '20 Tonnes',
      truck: 'Camion CI-482-AB',
      driver: 'Koffi B.',
      kor: '54.2 lbs',
      eta: 'Arrivée aujourd&apos;hui 14:00',
      status: 'EN TRANSIT',
      statusType: 'in_transit',
      dateExp: '24 Mai 2024, 11:30',
    },
    {
      id: 'TRF-2024-09',
      origin: 'Coop. Korhogo C1',
      volume: '35 Tonnes',
      truck: 'Camion CI-912-XY',
      driver: 'Touré S.',
      kor: '52.0 lbs',
      eta: 'Reçu ce matin 09:30',
      status: 'REÇU (Magasin B)',
      statusType: 'received',
      dateExp: '24 Mai 2024, 07:00',
    },
    {
      id: 'TRF-2024-10',
      origin: 'Agri-Sassandra Union',
      volume: '15 Tonnes',
      truck: 'Camion CI-304-ZA',
      driver: 'Yao M.',
      kor: '49.8 lbs',
      eta: 'En préparation à la coopérative',
      status: 'PRÉPARATION',
      statusType: 'preparing',
      dateExp: '24 Mai 2024, 09:15',
    },
  ]);

  const handleConfirmReceiptClick = (t: any) => {
    setSelectedTransfer(t);
    setShowReceiptModal(true);
  };

  const handleValidateReceipt = () => {
    if (!selectedTransfer) return;
    setTransfers(prev =>
      prev.map(item =>
        item.id === selectedTransfer.id
          ? { ...item, status: 'REÇU (Magasin A)', statusType: 'received', eta: 'Reçu & Confirmé à l&apos;instant' }
          : item
      )
    );
    setShowReceiptModal(false);
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
              Entrepôt Central — Point de Rencontre &amp; Arbitrage IA
            </h1>
            <p style={{ fontSize: '13.5px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
              Contrôle de qualité officiel au déchargement, pesage et arbitrage neutre par l&apos;IA NIANKA avant vente.
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
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>STOCK CENTRAL EN MAGASIN</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '3px 10px', borderRadius: '12px' }}>Disponible</span>
          </div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>245 Tonnes</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B' }}>CONVOIS EN ROUTE (TRANSIT)</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: '12px' }}>3 Camions</span>
          </div>
          <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', marginTop: '12px', lineHeight: 1 }}>70 Tonnes</div>
        </div>

        <div style={{ backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(26, 107, 10, 0.25)' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>TRANSACTIONS SCELLÉES PAR IA</div>
          <div style={{ fontSize: '20px', fontWeight: 900, marginTop: '8px' }}>180 Tonnes Vendues</div>
          <p style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.9)', margin: '6px 0 0 0', fontWeight: 500 }}>Ventes coopératives-usines certifiées conformes aux normes nationales.</p>
        </div>
      </div>

      {/* Section 1: Incoming Transfers / Shipments from Cooperatives */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              TRANSFERTS &amp; DÉPLACEMENTS EN TRANSIT (DEPUIS COOPÉRATIVES)
            </h2>
            <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: '2px 0 0 0' }}>Suivez en direct l&apos;acheminement et générez la preuve de réception numérique</p>
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
            {transfers.map((t, idx) => (
              <tr key={idx} style={{ borderBottom: idx < transfers.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                <td style={{ padding: '18px 16px', fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>#{t.id}</td>
                <td style={{ padding: '18px 16px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{t.origin}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Expédié: {t.dateExp}</div>
                </td>
                <td style={{ padding: '18px 16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{t.volume}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{t.truck} ({t.driver})</div>
                </td>
                <td style={{ padding: '18px 16px', fontSize: '13px', fontWeight: 800, color: '#10B981' }}>{t.kor}</td>
                <td style={{ padding: '18px 16px' }}>
                  {t.statusType === 'in_transit' && (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={14} /> {t.status}
                    </span>
                  )}
                  {t.statusType === 'received' && (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} /> {t.status}
                    </span>
                  )}
                  {t.statusType === 'preparing' && (
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#F59E0B', backgroundColor: '#FEF3C7', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      ● {t.status}
                    </span>
                  )}
                </td>
                <td style={{ padding: '18px 16px', textAlign: 'right' }}>
                  {t.statusType === 'in_transit' ? (
                    <button
                      onClick={() => handleConfirmReceiptClick(t)}
                      style={{
                        padding: '8px 14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                        border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(26, 107, 10, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <PackageCheck size={14} /> Confirmer &amp; Scan Arbitrage
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConfirmReceiptClick(t)}
                      style={{
                        padding: '6px 12px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
                        border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      <FileCheck size={14} /> Preuve Signée PDF
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation & Proof Modal */}
      {showReceiptModal && selectedTransfer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
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
              <button onClick={() => setShowReceiptModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '18px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Réf Transfert:</span>
                <strong style={{ color: '#1a6b0a' }}>#{selectedTransfer.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Coopérative Vendeuse:</span>
                <strong style={{ color: '#0F172A' }}>{selectedTransfer.origin}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Volume &amp; Camion:</span>
                <strong style={{ color: '#0F172A' }}>{selectedTransfer.volume} — {selectedTransfer.truck} ({selectedTransfer.driver})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Arbitrage Qualité KOR (IA):</span>
                <strong style={{ color: '#10B981' }}>{selectedTransfer.kor} (Certifié Conforme Vente)</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedTransfer.statusType === 'in_transit' ? (
                <button
                  onClick={handleValidateReceipt}
                  style={{
                    flex: 1, padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <CheckCircle2 size={18} /> Valider la Réception &amp; Sceller la Vente ➔
                </button>
              ) : (
                <button
                  onClick={() => setShowReceiptModal(false)}
                  style={{
                    flex: 1, padding: '12px', backgroundColor: '#1a6b0a', color: '#ffffff',
                    border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  <Download size={16} /> Télécharger le Rapport d&apos;Arbitrage PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
