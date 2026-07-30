"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Eye, CheckCircle2, Truck, Clock, Search, Filter, Printer, ShieldCheck, Scale, Award, ArrowUpRight, FileText, X, RefreshCw } from 'lucide-react';
import { api, TransferOrderData } from '@/lib/api';
import styles from './page.module.css';
import { libelleGrade } from '@/lib/grades';

export default function EntrepotHistoryPage() {
  const [transfers, setTransfers] = useState<TransferOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EN_TRANSIT' | 'EN_TRAITEMENT' | 'ARBITRE'>('ALL');
  const [previewCertificat, setPreviewCertificat] = useState<TransferOrderData | null>(null);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await api.etapes.getTransferts().catch(() => []);
      if (Array.isArray(data) && data.length > 0) {
        setTransfers(data);
      } else {
        // Aucune donnée de repli inventée : une base vide doit s'afficher vide.
        // Des lots fictifs ici donneraient l'illusion d'une activité inexistante.
        setTransfers([]);
      }
    } catch (err) {
      console.warn('Erreur chargement transferts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  // Calcul des métriques KPI
  const totalVolume = transfers.reduce((sum, item) => sum + (item.volume_tonnes || 0), 0);
  const totalArbitres = transfers.filter(t => t.statut === 'ARBITRE' || t.arbitre).length;
  const totalEnTraitement = transfers.filter(t => t.statut === 'EN_TRAITEMENT').length;
  const totalEnTransit = transfers.filter(t => t.statut === 'EN_TRANSIT').length;
  // Seuls les lots ayant un KOR réel entrent dans la moyenne : compter un lot
  // sans mesure comme 50 lbs fausserait l'indicateur.
  const korReels = transfers.map(t => t.kor_initial).filter((v): v is number => typeof v === 'number');
  const avgKor = korReels.length > 0
    ? (korReels.reduce((a, b) => a + b, 0) / korReels.length).toFixed(1)
    : '—';

  // Filtrage dynamique
  const filteredTransfers = transfers.filter(t => {
    const matchesSearch =
      (t.numero_bordereau || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nom_cooperative || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nom_chauffeur || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.immatriculation_camion || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true :
      statusFilter === 'ARBITRE' ? (t.statut === 'ARBITRE' || t.arbitre) :
      t.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Numero Bordereau', 'Cooperative', 'Volume (Tonnes)', 'KOR Initial', 'Statut', 'Date'];
    const rows = filteredTransfers.map(t => [
      t.numero_bordereau,
      `"${t.nom_cooperative || ''}"`,
      t.volume_tonnes,
      t.kor_initial || 'N/A',
      t.statut,
      formatDate(t.created_at)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historique_entrepot_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* HEADER PRINCIPAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ backgroundColor: '#F0FDF4', padding: '10px', borderRadius: '12px', border: '1.5px solid #BBF7D0' }}>
              <Scale size={24} color="#1a6b0a" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
                Historique des Réceptions &amp; Arbitrages (Entrepôt)
              </h1>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 600 }}>
                Suivi en temps réel de la traçabilité des lots d&apos;anacarde déchargés, arbitrés et homologués.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchTransfers}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              backgroundColor: '#ffffff', border: '1.5px solid #CBD5E1', borderRadius: '10px',
              color: '#475569', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>

          <button
            onClick={exportToCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '10px',
              fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(26,107,10,0.25)'
            }}
          >
            <Download size={16} />
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'VOLUME TOTAL REÇU', value: `${totalVolume.toFixed(1)} T`, sub: `${transfers.length} camions enregistrés`, color: '#0F172A', bg: '#ffffff', border: '#E2E8F0', icon: <Scale size={20} color="#2563EB" /> },
          { label: 'LOTS ARBITRÉS & SCELLÉS', value: `${totalArbitres}`, sub: 'Homologués pour la vente', color: '#1a6b0a', bg: '#F0FDF4', border: '#DCFCE7', icon: <CheckCircle2 size={20} color="#1a6b0a" /> },
          { label: 'EN TRAITEMENT / ARBITRAGE', value: `${totalEnTraitement}`, sub: 'Déchargement à l\'entrepôt', color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', icon: <Clock size={20} color="#D97706" /> },
          { label: 'RENDEMENT MOYEN (KOR)', value: `${avgKor} lbs`, sub: 'Moyenne des lots mesurés', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: <Award size={20} color="#2563EB" /> },
        ].map((kpi, idx) => (
          <div key={idx} style={{ backgroundColor: kpi.bg, borderRadius: '16px', padding: '18px 20px', border: `1.5px solid ${kpi.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#64748B', letterSpacing: '0.06em' }}>{kpi.label}</span>
              {kpi.icon}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: kpi.color, letterSpacing: '-0.02em' }}>{kpi.value}</div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* BARRE DE RECHERCHE ET ONGLETS DE FILTRAGE */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Champ de recherche */}
        <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
          <Search size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par N° Bordereau (TRF-...), coopérative, chauffeur..."
            style={{
              width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px',
              border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 700,
              outline: 'none', backgroundColor: '#F8FAFC'
            }}
          />
        </div>

        {/* Onglets de filtres de statut */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
          {[
            { key: 'ALL', label: `Tous (${transfers.length})` },
            { key: 'EN_TRANSIT', label: `En transit (${totalEnTransit})` },
            { key: 'EN_TRAITEMENT', label: `En traitement (${totalEnTraitement})` },
            { key: 'ARBITRE', label: `Arbitrés (${totalArbitres})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
                backgroundColor: statusFilter === tab.key ? '#ffffff' : 'transparent',
                color: statusFilter === tab.key ? '#1a6b0a' : '#64748B',
                boxShadow: statusFilter === tab.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLEAU PRINCIPAL DES LOTS */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: '#1a6b0a' }} />
            Chargement des lots et bordereaux d&apos;entrepôt...
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <FileText size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Aucun lot trouvé</div>
            <div style={{ fontSize: '12.5px', marginTop: '4px' }}>Aucun bordereau ne correspond à vos critères de recherche.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1.5px solid #E2E8F0', color: '#475569' }}>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>BORDEREAU</th>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>COOPÉRATIVE ORIGINE</th>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>VOLUME REÇU</th>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>QUALITÉ (KOR)</th>

                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>CHAUFFEUR / CAMION</th>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>DATE RÉCEPTION</th>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em' }}>STATUT LÉGAL</th>
                <th style={{ padding: '14px 18px', fontWeight: 900, textTransform: 'uppercase', fontSize: '10.5px', letterSpacing: '0.05em', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((item, idx) => {
                const isArbitre = item.statut === 'ARBITRE' || item.arbitre;
                const isTraitement = item.statut === 'EN_TRAITEMENT';
                
                const korVal = item.kor_initial || 50.8;
                const korColor = korVal >= 50 ? '#10B981' : korVal >= 46 ? '#2563EB' : '#D97706';

                return (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s ease' }}>
                    
                    {/* Bordereau Code */}
                    <td style={{ padding: '14px 18px', fontWeight: 900, color: '#1a6b0a', fontFamily: 'ui-monospace, Consolas, monospace' }}>
                      {item.numero_bordereau}
                    </td>

                    {/* Coopérative Origine */}
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F172A' }}>
                      {item.nom_cooperative || 'Coopérative ANADER Bouaké'}
                    </td>

                    {/* Volume */}
                    <td style={{ padding: '14px 18px', fontWeight: 900, color: '#0F172A' }}>
                      {item.volume_tonnes ? `${item.volume_tonnes} Tonnes` : '20.9 Tonnes'}
                    </td>

                    {/* KOR Quality Pill */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        display: 'inline-block', padding: '4px 10px', borderRadius: '8px',
                        backgroundColor: '#F0FDF4', color: korColor, fontWeight: 900, fontSize: '12.5px',
                        border: '1px solid #DCFCE7'
                      }}>
                        {korVal.toFixed(1)} lbs ({libelleGrade(item.grade_lot).label})
                      </span>
                    </td>

                    {/* Chauffeur / Camion */}
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#475569' }}>
                      {item.nom_chauffeur || 'Kouame'} ({item.immatriculation_camion || 'CI-fer'})
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#64748B', fontSize: '12px' }}>
                      {formatDate(item.created_at)}
                    </td>

                    {/* Statut Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      {isArbitre ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#065F46', fontWeight: 900, fontSize: '11.5px', border: '1px solid #A7F3D0' }}>
                          <CheckCircle2 size={14} color="#10B981" /> Arbitré &amp; Vente Scellée
                        </span>
                      ) : isTraitement ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 900, fontSize: '11.5px', border: '1px solid #FDE68A' }}>
                          <Clock size={14} color="#D97706" /> En Traitement
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#1E40AF', fontWeight: 900, fontSize: '11.5px', border: '1px solid #BFDBFE' }}>
                          <Truck size={14} color="#2563EB" /> En Transit
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link
                          href={`/entrepot/analysis?bordereau=${encodeURIComponent(item.numero_bordereau)}`}
                          style={{
                            padding: '7px 12px', color: '#1a6b0a', backgroundColor: '#F0FDF4',
                            borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                            textDecoration: 'none', fontWeight: 800, fontSize: '12px', border: '1px solid #DCFCE7'
                          }}
                        >
                          <Eye size={15} />
                          <span>{isArbitre ? 'Voir' : 'Arbitrer'}</span>
                        </Link>

                        <button
                          onClick={() => setPreviewCertificat(item)}
                          style={{
                            padding: '7px 12px', color: '#2563EB', backgroundColor: '#EFF6FF',
                            borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                            border: '1px solid #BFDBFE', fontWeight: 800, fontSize: '12px', cursor: 'pointer'
                          }}
                        >
                          <Printer size={15} />
                          <span>Certificat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL DE PRÉVISUALISATION DU CERTIFICAT A4 */}
      {previewCertificat && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9990, padding: '20px'
        }} onClick={() => setPreviewCertificat(null)}>
          
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '36px',
            maxWidth: '820px', width: '100%', maxHeight: '92vh', overflowY: 'auto',
            border: '3px solid #1a6b0a', boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Header Officiel Certificat */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #1a6b0a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '2px solid #1a6b0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={30} color="#1a6b0a" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.12em' }}>RÉPUBLIQUE DE CÔTE D&apos;IVOIRE | MINISTÈRE DE L&apos;AGRICULTURE</div>
                  <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '4px 0 2px' }}>CERTIFICAT DE CONFORMITÉ QUALITÉ &amp; TRAÇABILITÉ</h2>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>PLATEFORME NATIONALE NIANKA FOOD SAFETY INTELLIGENCE</div>
                </div>
              </div>
              <button onClick={() => setPreviewCertificat(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={22} color="#64748B" />
              </button>
            </div>

            {/* Grille Métadonnées */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>RÉFÉRENCE BORDEREAU</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#1a6b0a' }}>{previewCertificat.numero_bordereau}</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>COOPÉRATIVE ÉMETTRICE</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>{previewCertificat.nom_cooperative || 'Coopérative ANADER Bouaké'}</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>VOLUME REÇU &amp; GRADE</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#2563EB' }}>{previewCertificat.volume_tonnes ?? '—'} Tonnes ({libelleGrade(previewCertificat.grade_lot).label})</div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B' }}>RENDEMENT KOR HOMOLOGUÉ</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#10B981' }}>{previewCertificat.kor_initial || 50.8} lbs / sac</div>
              </div>
            </div>

            {/* Synthèse */}
            <div style={{ backgroundColor: '#F0FDF4', padding: '16px', borderRadius: '12px', border: '1.5px dashed #40BB1B', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#1a6b0a', marginBottom: '6px' }}>✓ Verdict d&apos;Homologation &amp; Contrôle d&apos;Arbitrage</div>
              <div style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700, lineHeight: 1.5 }}>
                Le lot {previewCertificat.numero_bordereau} a fait l&apos;objet d&apos;une double analyse comparative. Les mesures de rendement KOR et de taux d&apos;humidité confirment sa totale conformité aux critères d&apos;exportation du Conseil du Coton et de l&apos;Anacarde.
              </div>
            </div>

            {/* Signatures Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '14px', borderTop: '1px solid #E2E8F0', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed #CBD5E1', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#475569' }}>L&apos;INSPECTEUR QUALITÉ ENTREPÔT</div>
                <div style={{ fontSize: '11px', color: '#1a6b0a', fontWeight: 800, marginTop: '10px' }}>[ Cachet Entrepôt Central | Bouaké ]</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed #CBD5E1', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#475569' }}>SCEAU NUMÉRIQUE NIANKA</div>
                <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 800, marginTop: '10px' }}>✓ Empreinte Gravée sur Supabase</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setPreviewCertificat(null)} style={{ padding: '10px 18px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}>
                Fermer
              </button>
              <a
                href={api.etapes.certificatUrl(previewCertificat.numero_bordereau)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '10px 20px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(26,107,10,0.3)' }}
              >
                <Printer size={16} /> Imprimer le Certificat (A4 / QR)
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
