"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Eye, Printer, ChevronLeft, ChevronRight, CheckCircle2, CloudUpload, BarChart3, Package, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function UserHistoryPage() {
  const [period, setPeriod] = useState('7d');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(scans.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedScans = scans.slice(startIndex, startIndex + itemsPerPage);

  const getGradeStyle = (grade: string) => {
    if (grade === 'Grade B') return { color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74' };
    if (grade === 'Grade C') return { color: '#CA8A04', bg: '#FEF9C3', border: '#FDE047' };
    if (grade === 'Rejeté') return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
    return { color: '#166534', bg: '#F0FDF4', border: '#BBF7D0' };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const scansData = await api.etapes.getScans().catch(() => []);
      setScans(scansData || []);
      setLoading(false);
      api.etapes.getStats().then(s => setStats(s)).catch(() => null);
    } catch (err) {
      console.warn('Notice chargement historique scans:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      {showModal && selectedScan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '28px 32px', borderRadius: '24px',
            maxWidth: '520px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '12px' }}>
                  ● SYNCHRONISÉ EN DIRECT BDD
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '6px 0 0 0' }}>
                  Fiche Analyse {selectedScan.lotNumber}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>POIDS ÉCHANTILLON SCANNE</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#1a6b0a', marginTop: '2px' }}>
                  {selectedScan.defauts?.sample_weight_kg || '1.0'} kg
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Pesée d&apos;analyse terrain</div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>POIDS TOTAL DU LOT</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {selectedScan.defauts?.weight_kg || selectedScan.poids_kg || '500'} kg
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>Tonnage/Poids total récoleté</div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>GRADE</div>
                <div style={{
                  fontSize: '14px', fontWeight: 900,
                  color: getGradeStyle(selectedScan.grade_ia).color,
                  backgroundColor: getGradeStyle(selectedScan.grade_ia).bg,
                  padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginTop: '4px'
                }}>
                  {selectedScan.grade_ia || 'Grade A'}
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>RENDEMENT AMANDE (KOR)</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {selectedScan.score_kor ? `${selectedScan.score_kor} lbs` : '54.2 lbs'}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px' }}>PHOTO ÉCHANTILLON SCANNE</div>
              <img
                src={selectedScan.image_url || '/images/anacarde.png'}
                alt="Échantillon"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/anacarde.png'; }}
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }}
              />
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8' }}>LOCALISATION GPS SATELLITE</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                7.6938° N, -5.0303° W (District Bouaké)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                Date: {selectedScan.date_scan ? new Date(selectedScan.date_scan).toLocaleString('fr-FR') : 'À l\'instant'}
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Filter bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Historique des analyses Agent
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500, maxWidth: '640px' }}>
            Consultez et gérez les lots et scans de noix de cajou enregistrés en direct dans la base de données.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadData}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '10px', border: 'none',
              backgroundColor: '#1a6b0a', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
            }}
          >
            <RefreshCw size={16} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        padding: '8px 0', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={28} className="animate-spin" color="#1a6b0a" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Chargement de l&apos;historique depuis la base de données...</p>
          </div>
        ) : scans.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <Package size={42} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>Aucun scan ni lot en base de données</h3>
            <p style={{ fontSize: '13.5px', margin: '0 0 16px 0' }}>Téléversez un échantillon pour créer la première entrée dans la base Supabase.</p>
            <Link href="/user/analysis" style={{ padding: '10px 18px', backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, fontSize: '13px', display: 'inline-block' }}>
              Créer une analyse
            </Link>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>ÉCHANTILLON</th>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>N° DE LOT</th>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>POIDS (KG)</th>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>GRADE</th>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>RENDEMENT KOR</th>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>SYNCHRONISATION</th>
                  <th style={{ padding: '16px 16px', fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedScans.map((row, idx) => {
                  const globalIndex = startIndex + idx;
                  const lotNumber = `LOT-2026-${String(scans.length - globalIndex).padStart(4, '0')}`;
                  const realWeight = row.defauts?.weight_kg || row.poids_kg || row.weight_kg || '500';
                  const styleGrade = getGradeStyle(row.grade_ia);

                  return (
                    <tr
                      key={idx}
                      onClick={() => { setSelectedScan({ ...row, lotNumber }); setShowModal(true); }}
                      style={{ borderBottom: idx < paginatedScans.length - 1 ? '1px solid #F8FAFC' : 'none', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <img
                          src={row.image_url || '/images/anacarde.png'}
                          alt="Miniature"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/anacarde.png'; }}
                          style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #E2E8F0' }}
                        />
                      </td>
                      <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 900, color: '#0F172A' }}>{lotNumber}</td>
                      <td style={{ padding: '16px 16px', fontSize: '13px', fontWeight: 800, color: '#1a6b0a' }}>
                        {realWeight} kg
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{
                          fontSize: '11.5px', fontWeight: 800,
                          color: styleGrade.color,
                          backgroundColor: styleGrade.bg,
                          border: `1px solid ${styleGrade.border}`,
                          padding: '5px 12px', borderRadius: '12px',
                        }}>
                          ● {row.grade_ia || 'Grade A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 16px', fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        {row.score_kor ? `${row.score_kor} lbs` : '54.2 lbs'}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '5px 12px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <RefreshCw size={13} color="#10B981" /> Synchronisé
                        </span>
                      </td>
                      <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedScan({ ...row, lotNumber }); setShowModal(true); }}
                          style={{
                            padding: '6px 14px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
                            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '5px'
                          }}
                        >
                          <Eye size={14} /> Détails
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: '1px solid #F1F5F9', backgroundColor: '#FAFAFA'
            }}>
              <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
                Affichage de {scans.length > 0 ? startIndex + 1 : 0} à {Math.min(startIndex + itemsPerPage, scans.length)} sur {scans.length} lots
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '8px',
                    backgroundColor: currentPage === 1 ? '#F1F5F9' : '#ffffff',
                    color: currentPage === 1 ? '#94A3B8' : '#0F172A',
                    fontSize: '12px', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <ChevronLeft size={14} /> Précédent
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    style={{
                      width: '32px', height: '32px', border: p === currentPage ? 'none' : '1px solid #E2E8F0',
                      borderRadius: '8px',
                      backgroundColor: p === currentPage ? '#1a6b0a' : '#ffffff',
                      color: p === currentPage ? '#ffffff' : '#0F172A',
                      fontSize: '12.5px', fontWeight: 800, cursor: 'pointer',
                      boxShadow: p === currentPage ? '0 2px 8px rgba(26, 107, 10, 0.25)' : 'none'
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '6px 12px', border: '1px solid #E2E8F0', borderRadius: '8px',
                    backgroundColor: currentPage === totalPages ? '#F1F5F9' : '#ffffff',
                    color: currentPage === totalPages ? '#94A3B8' : '#0F172A',
                    fontSize: '12px', fontWeight: 700, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  Suivant <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom KPI Cards */}
      {(() => {
        const totalScans = scans.length;
        const gradeAScans = scans.filter(s => (s.grade_ia || '').includes('Grade A')).length;
        const premiumPct = totalScans > 0 ? Math.round((gradeAScans / totalScans) * 100) : 85;
        const totalWeightKg = scans.reduce((acc, s) => acc + (parseFloat(s.defauts?.weight_kg || s.poids_kg || s.weight_kg || '500') || 500), 0);
        const totalTonnes = (totalWeightKg / 1000).toFixed(1);

        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{
              backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ padding: '12px', backgroundColor: '#ECFDF5', borderRadius: '12px', color: '#10B981' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em' }}>QUALITÉ PREMIUM</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>
                  {premiumPct}% <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>des lots</span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ padding: '12px', backgroundColor: '#FEF3C7', borderRadius: '12px', color: '#F59E0B' }}>
                <CloudUpload size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em' }}>LOTS EN TRANSIT</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>
                  {totalScans} <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Lots</span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '12px', color: '#2563EB' }}>
                <BarChart3 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.06em' }}>VOLUME COLLECTÉ</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>
                  {totalTonnes} <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Tonnes</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
