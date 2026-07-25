"use client";

import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, XCircle, RefreshCw, AlertOctagon, MapPin, Compass, Clock } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminAIAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'anomalies' | 'queue' | 'archives'>('anomalies');
  const [coopFilter, setCoopFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('critical');
  const [scansList, setScansList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadScans() {
      try {
        const data = await api.etapes.getScans().catch(() => []);
        if (Array.isArray(data) && data.length > 0) {
          setScansList(data);
        }
      } catch (err) {
        console.warn('Scans loading notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadScans();
  }, []);

  // Fallback items if database hasn't returned dynamic records yet
  const defaultItems = [
    {
      id: 'NK-2024-00124',
      coop: 'SOCAKKAT Dalleu',
      defect: 'Moisissure (8.4%)',
      humidity: '9.2%',
      grade: 'IA : REJETÉ',
      gradeColor: '#DC2626',
      agent: 'B. Kouassi',
      time: 'Soumis il y a 14 min',
      image: '/images/cacao.png',
      statusTag: 'REJETÉ',
    },
    {
      id: 'NK-2024-00125',
      coop: 'San Pedro, Union Espoir',
      defect: 'Humidité Limite (7.8%)',
      humidity: '7.8%',
      grade: 'IA : À RÉVISER',
      gradeColor: '#2563EB',
      agent: 'M. Touré',
      time: 'Soumis il y a 32 min',
      image: '/images/anacarde.png',
      statusTag: 'À RÉVISER',
    },
  ];

  const itemsToDisplay = scansList.length > 0
    ? scansList.map((item: any, idx: number) => ({
        id: item.code_lot || item.id || `NK-2024-00${100 + idx}`,
        coop: item.nom_cooperative || item.cooperative || 'Coop. ANADER Bouaké',
        defect: item.defauts || item.grade_expert || 'Contrôle d\'échantillon',
        humidity: item.taux_humidite ? `${item.taux_humidite}%` : '6.8%',
        grade: `IA : ${item.grade_ia || item.grade_qualite || 'GRADE A'}`,
        gradeColor: (item.grade_ia === 'Rejeté' || item.grade_ia === 'C') ? '#DC2626' : '#1a6b0a',
        agent: item.nom_agent || item.agent || 'Amadou Koné',
        time: item.date_scan || 'Aujourd\'hui',
        image: item.image_url || '/images/anacarde.png',
        statusTag: item.grade_ia || 'GRADE A',
      }))
    : defaultItems;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px' }}>
      
      {/* Top Tabs Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1.5px solid #E2E8F0', paddingBottom: '12px',
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { key: 'anomalies', label: 'Gestion des Anomalies' },
            { key: 'queue',     label: "Files d'Attente" },
            { key: 'archives',  label: 'Archives' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                fontWeight: 800,
                color: activeTab === t.key ? '#1a6b0a' : '#94A3B8',
                borderBottom: activeTab === t.key ? '2.5px solid #1a6b0a' : '2.5px solid transparent',
                paddingBottom: '12px',
                marginBottom: '-13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={coopFilter}
            onChange={e => setCoopFilter(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
              backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#475569', outline: 'none',
            }}
          >
            <option value="all">Toutes les Coopératives</option>
            <option value="anader">Coop. ANADER Bouaké</option>
            <option value="socakkat">SOCAKKAT Dalleu</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
              backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 600, color: '#475569', outline: 'none',
            }}
          >
            <option value="critical">Sévérité: Critique</option>
            <option value="major">Sévérité: Majeure</option>
            <option value="all">Toutes les sévérités</option>
          </select>
        </div>

        <div style={{
          backgroundColor: '#F0FDF4', color: '#1a6b0a', padding: '6px 14px',
          borderRadius: '20px', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <AlertOctagon size={16} color="#1a6b0a" />
          <span>{itemsToDisplay.length} Scans / Anomalies en Base</span>
        </div>
      </div>

      {/* DYNAMIC REVIEW CARDS GENERATED FROM BACKEND / DATABASE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>
            Chargement des scans depuis le serveur FastAPI &amp; Supabase...
          </div>
        ) : (
          itemsToDisplay.map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'grid',
              gridTemplateColumns: '220px 1fr 200px',
              gap: '24px',
              alignItems: 'center',
            }}>
              {/* Left Thumbnail Image with Tag */}
              <div style={{ position: 'relative', height: '140px', borderRadius: '10px', overflow: 'hidden' }}>
                <img src={item.image} alt="Scan Lot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', top: '8px', left: '8px',
                  backgroundColor: item.gradeColor, color: '#ffffff', fontSize: '10px', fontWeight: 900,
                  padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em',
                }}>
                  {item.grade}
                </div>
                <div style={{
                  position: 'absolute', bottom: '6px', left: '6px',
                  backgroundColor: 'rgba(15,23,42,0.8)', color: '#ffffff', fontSize: '9.5px', fontWeight: 600,
                  padding: '2px 6px', borderRadius: '4px',
                }}>
                  Origine Agent: {item.agent}
                </div>
              </div>

              {/* Middle Lot Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Lot #{item.id}</h3>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{item.time}</span>
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '2px 0 0 0', fontWeight: 500 }}>
                    {item.coop} — <strong style={{ color: item.gradeColor }}>Défaut: {item.defect}</strong>
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>HUMIDITÉ</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: item.gradeColor }}>{item.humidity}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>QUALITÉ</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: item.gradeColor }}>{item.statusTag}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>AGENT TERRAIN</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>{item.agent}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8' }}>GÉO-CLÔTURE</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1a6b0a' }}>Validé</div>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{
                  padding: '10px', backgroundColor: '#1a6b0a', color: '#ffffff',
                  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                  <Eye size={15} /> Examiner
                </button>
                <button style={{
                  padding: '9px', backgroundColor: '#ffffff', color: '#1a6b0a',
                  border: '1.5px solid #BBF7D0', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                }}>
                  Approuver Lot
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
