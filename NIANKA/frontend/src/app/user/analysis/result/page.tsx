"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, RefreshCw, AlertTriangle, Info, ShieldCheck, Ruler, Scale } from 'lucide-react';

export default function AIDiagnosticTerminalPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string>('/images/anacarde.png');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('nianka_last_analysis');
      if (stored) {
        setAnalysisData(JSON.parse(stored));
      }
      const storedImg = localStorage.getItem('nianka_last_image');
      if (storedImg) {
        setImageSrc(storedImg);
      }
    } catch (e) {
      console.warn('Error reading last analysis:', e);
    }
  }, []);

  if (!analysisData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px' }}>
        <Info size={48} color="#94A3B8" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>Aucune analyse récente</h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Téléversez une photo d&apos;échantillon d&apos;anacarde pour exécuter l&apos;inférence IA.</p>
        <Link href="/user/analysis" style={{ padding: '12px 20px', backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontWeight: 800 }}>
          Démarrer une analyse IA
        </Link>
      </div>
    );
  }

  // `??` plutôt que `||` : une vraie confiance ou un vrai KOR à 0 ne doit pas
  // être écrasé par la valeur de repli (0 est une valeur falsy en JS).
  const grade = analysisData.predicted_grade ?? "—";
  const confidencePct = `${analysisData.confidence_pct ?? '—'}%`;
  const korLbs = `${analysisData.metrics?.kor_lbs ?? '—'} lbs`;
  const calibre = `${analysisData.metrics?.calibre_mm ?? '—'}mm`;
  const defectRate = `${analysisData.metrics?.defect_rate_pct ?? '—'}%`;
  const humidity = `${analysisData.metrics?.humidity_pct ?? '—'}% HR`;
  const certification = analysisData.metrics?.certification ?? "Non certifié";
  const certColor = analysisData.metrics?.certification_color ?? "#64748B";
  const producer = analysisData.lot_metadata?.producer || "Échantillon Terrain";
  const coop = analysisData.lot_metadata?.cooperative || "Coopérative";
  // Latence et moteur réellement mesurés côté serveur (le modèle est une
  // classification pure MobileNetV3 : la case verte ci-dessous est une mise
  // en avant purement illustrative de l'échantillon, pas une détection
  // d'objet localisée — seul le pourcentage de confiance affiché est réel).
  const latencyMs = analysisData.metrics?.latency_ms;
  const modelEngine = analysisData.metrics?.model_engine || 'model_anacarde.keras';
  const inferenceMode = analysisData.metrics?.inference_mode;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', letterSpacing: '0.08em', marginBottom: '4px', textTransform: 'uppercase' }}>
            ANALYSE &gt; DIAGNOSTIC IA EN DIRECT
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Terminal de Diagnostic IA
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Moteur MobileNetV3 (model_anacarde.keras) — Producteur: {producer} ({coop})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '12px',
            backgroundColor: '#F0FDF4', color: '#166534', border: '1.5px solid #DCFCE7',
            fontSize: '13px', fontWeight: 800
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
            <span>Transmission Automatique Coopérative OK</span>
          </div>

          <Link href="/user/analysis" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '11px 18px', borderRadius: '12px', border: '1.5px solid #CBD5E1',
            backgroundColor: '#ffffff', color: '#0F172A', fontSize: '13.5px', fontWeight: 800, textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}>
            <span>Nouvelle Analyse</span>
          </Link>

          <Link href="/user/history" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '11px 18px', borderRadius: '12px', backgroundColor: '#1a6b0a',
            color: '#ffffff', fontSize: '13.5px', fontWeight: 800, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}>
            <span>Voir l&apos;Historique</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        
        {/* LEFT PANEL: Bounding Box Image Preview */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          padding: '14px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ position: 'relative', width: '100%', height: '390px', borderRadius: '12px', overflow: 'hidden' }}>
            <img
              src={imageSrc || '/images/anacarde.png'}
              alt="Scan Anacarde IA"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/anacarde.png';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* AI Bounding Boxes Overlays */}
            <div style={{
              position: 'absolute', top: '22%', left: '32%', width: '125px', height: '85px',
              border: '2.5px solid #10B981', backgroundColor: 'rgba(16, 185, 129, 0.18)',
              borderRadius: '6px', padding: '2px 4px',
            }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#ffffff', backgroundColor: '#10B981', padding: '2px 5px', borderRadius: '3px' }}>
                NUT {confidencePct}
              </span>
            </div>

            {/* Dark Telemetry Floating Overlay */}
            <div style={{
              position: 'absolute', bottom: '16px', left: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#ffffff',
              fontSize: '11px',
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            }}>
              <div><span style={{ color: '#94A3B8' }}>LATENCY:</span> <strong>{latencyMs !== undefined ? `${latencyMs}ms` : '—'}</strong></div>
              <div><span style={{ color: '#94A3B8' }}>MODEL:</span> {modelEngine}{inferenceMode ? ` (${inferenceMode})` : ''}</div>
              <div><span style={{ color: '#94A3B8' }}>CONFIDENCE:</span> <strong style={{ color: '#40BB1B' }}>{confidencePct}</strong></div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Classification & Anomalies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card 1: Final Classification */}
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>CLASSIFICATION FINALE</span>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>CONFIANCE <strong style={{ color: '#1a6b0a' }}>{confidencePct}</strong></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '4px 0' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, color: certColor, lineHeight: 1 }}>{grade}</span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: certColor, letterSpacing: '0.06em' }}>PRÉDICTION IA</span>
            </div>

            <div style={{ height: '5px', width: '100%', backgroundColor: certColor, borderRadius: '3px' }} />
          </div>

          {/* Card 2: Quality Details */}
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 22px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>ANALYSE QUALITÉ & DÉFAUTS</span>

            <div style={{
              backgroundColor: '#F8FAFC', borderRadius: '10px',
              padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '7px', backgroundColor: '#E2E8F0', color: '#334155', borderRadius: '8px' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Taux de Défauts estimé</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>Basé sur la segmentation des défauts</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '6px' }}>
                {defectRate}
              </span>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC', borderRadius: '10px',
              padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '7px', backgroundColor: '#E2E8F0', color: '#334155', borderRadius: '8px' }}>
                  <Info size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Humidité estimée</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500 }}>Taux de dessiccation</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', backgroundColor: '#ffffff', padding: '4px 10px', borderRadius: '6px' }}>
                {humidity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom KPI & Certification Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px', marginTop: '4px' }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '12px', color: '#2563EB' }}>
            <Ruler size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8' }}>Calibre Moyen</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>{calibre}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '12px', color: '#2563EB' }}>
            <Scale size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8' }}>KOR (Kernel Output)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A' }}>{korLbs}</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '16px', padding: '20px 26px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 6px 24px rgba(26, 107, 10, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ShieldCheck size={32} color="#40BB1B" />
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Statut de Certification</div>
              <div style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff' }}>{certification}</div>
            </div>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: '8px' }}>
            VERIFIÉ IA
          </span>
        </div>
      </div>
    </div>
  );
}
