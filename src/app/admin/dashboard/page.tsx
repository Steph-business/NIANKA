"use client";

import React, { useState } from 'react';
import { Package, CheckCircle2, AlertTriangle, Info, MapPin, X, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');
  const [mapTab, setMapTab] = useState<'map' | 'list'>('map');
  const [showToast, setShowToast] = useState(true);

  const agents = [
    { name: 'Amadou Koné', lots: 45, status: 'EN LIGNE', sync: 'il y a 2m', online: true },
    { name: 'Fanta Diabaté', lots: 32, status: 'EN LIGNE', sync: 'il y a 14m', online: true },
    { name: 'Souleymane Traoré', lots: 12, status: 'HORS LIGNE', sync: 'il y a 2h', online: false },
  ];

  const daysData = [
    { day: 'Lun', height: 60, active: false },
    { day: 'Mar', height: 65, active: false },
    { day: 'Mer', height: 58, active: false },
    { day: 'Jeu', height: 75, active: false },
    { day: 'Ven', height: 95, active: true },
    { day: 'Sam', height: 70, active: false },
    { day: 'Dim', height: 68, active: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px', position: 'relative' }}>
      
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Aperçu de la Qualité
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Surveillance en temps réel de la filière anacarde.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* Card 1 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
              <Package size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '4px 10px', borderRadius: '20px' }}>
              +12% vs hier
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Total Lots Traités</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>1,284</div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: '#40BB1B' }}>
              <CheckCircle2 size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '20px' }}>
              Optimal
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Score KOR Moyen</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>52.4</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748B' }}>lbs</span>
            </div>
          </div>
        </div>

        {/* Card 3: Alert Card (Light Red) */}
        <div style={{
          backgroundColor: '#FEF2F2',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
          border: '1.5px solid #FCA5A5',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: '#ffffff', color: '#DC2626' }}>
              <AlertTriangle size={22} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '20px' }}>
              Action Requise
            </span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#B91C1C', marginBottom: '4px' }}>Alertes Critiques</div>
            <div style={{ fontSize: '34px', fontWeight: 900, color: '#991B1B', lineHeight: 1 }}>03</div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Quality Chart Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              TENDANCES DE QUALITÉ (KOR)
            </h2>
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '10px' }}>
              <button
                onClick={() => setChartPeriod('7d')}
                style={{
                  padding: '5px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: chartPeriod === '7d' ? '#1a6b0a' : 'transparent',
                  color: chartPeriod === '7d' ? '#ffffff' : '#64748B',
                  fontSize: '11.5px', fontWeight: 800,
                }}
              >
                7 Jours
              </button>
              <button
                onClick={() => setChartPeriod('30d')}
                style={{
                  padding: '5px 12px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: chartPeriod === '30d' ? '#1a6b0a' : 'transparent',
                  color: chartPeriod === '30d' ? '#ffffff' : '#64748B',
                  fontSize: '11.5px', fontWeight: 800,
                }}
              >
                30 Jours
              </button>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 12px' }}>
            {daysData.map((d, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{
                  width: '42px',
                  height: `${d.height}%`,
                  backgroundColor: d.active ? '#1a6b0a' : '#A7F3D0',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s',
                  boxShadow: d.active ? '0 4px 14px rgba(26, 107, 10, 0.3)' : 'none',
                }} />
                <span style={{ fontSize: '11.5px', fontWeight: d.active ? 800 : 600, color: d.active ? '#1a6b0a' : '#94A3B8' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Anomaly Detection Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            DÉTECTION D&apos;ANOMALIES AI
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Anomaly 1 */}
            <div style={{
              padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FEF2F2',
              borderLeft: '4px solid #EF4444', display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <AlertTriangle size={17} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#991B1B' }}>Taux d&apos;humidité élevé</div>
                <div style={{ fontSize: '11px', color: '#B91C1C', fontWeight: 500 }}>Coopérative Korhogo C1</div>
              </div>
            </div>

            {/* Anomaly 2 */}
            <div style={{
              padding: '12px 14px', borderRadius: '10px', backgroundColor: '#EFF6FF',
              borderLeft: '4px solid #3B82F6', display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <Info size={17} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E3A8A' }}>Température stockage +2°C</div>
                <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 500 }}>Entrepôt Bouaké Sud</div>
              </div>
            </div>

            {/* Anomaly 3 */}
            <div style={{
              padding: '12px 14px', borderRadius: '10px', backgroundColor: '#F0FDF4',
              borderLeft: '4px solid #10B981', display: 'flex', gap: '10px', alignItems: 'flex-start',
            }}>
              <TrendingUp size={17} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#065F46' }}>Prédiction : Récolte Exceptionnelle</div>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: 500 }}>Zone Odienné - Prévu Semaine 12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Cooperative Map Status Widget */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              STATUT DES COOPÉRATIVES
            </h2>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '8px' }}>
              <button onClick={() => setMapTab('map')} style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: mapTab === 'map' ? '#1a6b0a' : 'transparent', color: mapTab === 'map' ? '#fff' : '#64748B', fontSize: '11px', fontWeight: 700 }}>Carte</button>
              <button onClick={() => setMapTab('list')} style={{ padding: '4px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', backgroundColor: mapTab === 'list' ? '#1a6b0a' : 'transparent', color: mapTab === 'list' ? '#fff' : '#64748B', fontSize: '11px', fontWeight: 700 }}>Liste</button>
            </div>
          </div>

          <div style={{
            height: '220px',
            borderRadius: '12px',
            backgroundImage: 'url(/images/inspection.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,107,10,0.45) 0%, rgba(15,76,58,0.3) 100%)' }} />
            
            {/* Interactive Pins Overlays */}
            <div style={{ position: 'absolute', top: '35%', left: '42%', backgroundColor: '#10B981', color: '#fff', padding: '4px 10px', borderRadius: '16px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <MapPin size={12} /> Bouaké (Normal)
            </div>

            <div style={{ position: 'absolute', top: '20%', left: '55%', backgroundColor: '#EF4444', color: '#fff', padding: '4px 10px', borderRadius: '16px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <MapPin size={12} /> Korhogo (Humidité)
            </div>

            <div style={{ position: 'absolute', top: '65%', left: '38%', backgroundColor: '#10B981', color: '#fff', padding: '4px 10px', borderRadius: '16px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <MapPin size={12} /> Yamoussoukro (Optimal)
            </div>
          </div>
        </div>

        {/* Agent Performance Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
              PERFORMANCE DES AGENTS
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {agents.map((ag, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1a6b0a', color: '#fff', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ag.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{ag.name}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Dernière sync: {ag.sync}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{ag.lots} lots</div>
                    {ag.online ? (
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 6px', borderRadius: '10px' }}>EN LIGNE</span>
                    ) : (
                      <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '10px' }}>HORS LIGNE</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{
            marginTop: '18px', padding: '11px', backgroundColor: '#F8FAFC',
            color: '#1a6b0a', border: '1px solid #E2E8F0', borderRadius: '10px',
            fontSize: '12.5px', fontWeight: 800, cursor: 'pointer', textAlign: 'center',
          }}>
            Voir tous les agents
          </button>
        </div>
      </div>

      {/* Floating Bottom Toast Notification (Matching Screenshot 1) */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0F172A',
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
          zIndex: 50,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Info size={18} color="#40BB1B" />
          <div style={{ fontSize: '12.5px', fontWeight: 600 }}>
            <strong>Nouveau lot analysé</strong> — Lot #AC-8293 : KOR 55 (Excellent)
          </div>
          <button
            onClick={() => setShowToast(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, marginLeft: '8px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
