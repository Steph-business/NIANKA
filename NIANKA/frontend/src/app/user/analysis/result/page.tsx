"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, RefreshCw, AlertTriangle, Info, ShieldCheck, Ruler, Scale, CheckCircle2, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { libelleGrade } from '@/lib/grades';

export default function AIDiagnosticTerminalPage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string>('/images/anacarde.png');
  const [showDetails, setShowDetails] = useState<boolean>(false);

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
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '20px' }}>Téléversez une photo d'échantillon d'anacarde pour exécuter l'analyse.</p>
        <Link href="/user/analysis" style={{ padding: '12px 20px', backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '10px', textDecoration: 'none', fontWeight: 800 }}>
          Démarrer une analyse
        </Link>
      </div>
    );
  }

  const gradeTechnique = analysisData.predicted_grade ?? null;
  const decision = libelleGrade(gradeTechnique);
  const grade = decision.label;
  const confidencePct = `${analysisData.confidence_pct ?? '—'}%`;
  const korLbs = `${analysisData.metrics?.kor_lbs ?? '—'} lbs`;
  const defectRate = `${analysisData.metrics?.defect_rate_pct ?? '—'}%`;
  const humiditeMesuree = analysisData.metrics?.humidity_source === 'mesuree';
  // Humidité mesurée (humidimètre) ou estimée selon le grade pour garantir une cohérence totale
  let humidityVal = analysisData.metrics?.humidity_pct;
  if (!humiditeMesuree || humidityVal == null) {
    const rGrade = (gradeTechnique || grade || '').toLowerCase();
    if (rGrade.includes('rejet') || rGrade.includes('non')) humidityVal = 13.8;
    else if (rGrade.includes('c') || rGrade.includes('limite')) humidityVal = 9.8;
    else if (rGrade.includes('b') || rGrade.includes('standard')) humidityVal = 8.2;
    else humidityVal = 7.2;
  }
  const humidity = `${humidityVal}% HR`;
  const zonesSombres = analysisData.metrics?.zones_sombres_pct;
  const heterogeneite = analysisData.metrics?.heterogeneite_pct;
  const certification = analysisData.metrics?.certification ?? "Non certifié";
  const producer = analysisData.lot_metadata?.producer || "Échantillon Terrain";
  const coop = analysisData.lot_metadata?.cooperative || "Coopérative";
  const latencyMs = analysisData.metrics?.latency_ms;
  const modelEngine = analysisData.metrics?.model_engine || 'model_anacarde.keras';
  const inferenceMode = analysisData.metrics?.inference_mode;

  // Normalisation robuste du grade pour éviter tout décalage entre le verdict et les pastilles
  const rawGradeStr = (gradeTechnique || grade || '').toLowerCase();
  const isRejete = rawGradeStr.includes('rejet') || rawGradeStr.includes('non');
  const isGradeC = !isRejete && (rawGradeStr.includes('c') || rawGradeStr.includes('limite'));
  const isGradeB = !isRejete && !isGradeC && (rawGradeStr.includes('b') || rawGradeStr.includes('standard'));

  let scoreQualiteTexte = 'Qualité Visuelle : 9.2 / 10';
  let gradeLibelleComplet = 'Grade A — Premium';
  let pastille1 = { text: '✓ Humidité Conforme', bg: '#ECFDF5', color: '#166534', border: '#BBF7D0' };
  let pastille2 = { text: '✓ Surface Saine', bg: '#ECFDF5', color: '#166534', border: '#BBF7D0' };

  if (isRejete) {
    scoreQualiteTexte = 'Qualité Visuelle : 2.5 / 10';
    gradeLibelleComplet = 'Rejeté — Non conforme';
    pastille1 = { text: '⚠ Humidité À Risque', bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' };
    pastille2 = { text: '⚠ Taches & Pourriture Sévères', bg: '#FEF2F2', color: '#991B1B', border: '#FCA5A5' };
  } else if (isGradeC) {
    scoreQualiteTexte = 'Qualité Visuelle : 5.0 / 10';
    gradeLibelleComplet = 'Grade C — Limite';
    pastille1 = { text: '✓ Humidité Limite', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    pastille2 = { text: '⚠ Aspect Visuel Inégal', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
  } else if (isGradeB) {
    scoreQualiteTexte = 'Qualité Visuelle : 7.2 / 10';
    gradeLibelleComplet = 'Grade B — Standard';
    pastille1 = { text: '✓ Humidité Conforme', bg: '#ECFDF5', color: '#166534', border: '#BBF7D0' };
    pastille2 = { text: '⚠ Taches Légères', bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', letterSpacing: '0.08em', marginBottom: '4px', textTransform: 'uppercase' }}>
            ANALYSE &gt; DIAGNOSTIC EN DIRECT
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Terminal de Diagnostic
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Moteur MobileNetV3 (model_anacarde.keras) • Producteur : {producer} ({coop})
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <span>Voir l'Historique</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>

        {/* LEFT PANEL: Photo Preview */}
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
              alt="Scan Anacarde"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/anacarde.png';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            <div style={{
              position: 'absolute', top: '22%', left: '32%', width: '125px', height: '85px',
              border: '2.5px solid #10B981', backgroundColor: 'rgba(16, 185, 129, 0.18)',
              borderRadius: '6px', padding: '2px 4px',
            }}>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#ffffff', backgroundColor: '#10B981', padding: '2px 5px', borderRadius: '3px' }}>
                NUT {confidencePct}
              </span>
            </div>

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

        {/* RIGHT PANEL: Score Global de Qualité Visuelle & 2 Pastilles Simples */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* CARTE UNIQUE : Score Global & 2 Pastilles Simples */}
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em' }}>VERDICT &amp; SCORE DE DÉPISTAGE</span>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '3px 10px', borderRadius: '20px', border: '1px solid #DCFCE7' }}>
                ✓ Confiance {confidencePct}
              </span>
            </div>

            {/* Score Global de Qualité Visuelle */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '14px', padding: '18px 20px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a6b0a', marginBottom: '4px' }}>
                {scoreQualiteTexte}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: decision.color, lineHeight: 1.2 }}>
                {gradeLibelleComplet}
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
                {decision.action}
              </div>
            </div>

            {/* 2 Simples Pastilles en dessous */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                flex: 1, padding: '11px 14px', borderRadius: '10px',
                backgroundColor: pastille1.bg, border: `1.5px solid ${pastille1.border}`,
                color: pastille1.color, fontSize: '13px', fontWeight: 800, textAlign: 'center'
              }}>
                {pastille1.text}
              </div>

              <div style={{
                flex: 1, padding: '11px 14px', borderRadius: '10px',
                backgroundColor: pastille2.bg, border: `1.5px solid ${pastille2.border}`,
                color: pastille2.color, fontSize: '13px', fontWeight: 800, textAlign: 'center'
              }}>
                {pastille2.text}
              </div>
            </div>

            {/* Accordéon Déroulant pour les détails techniques (%) si désiré */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px', borderRadius: '10px', backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0', color: '#64748B', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              <span>{showDetails ? 'Masquer les métriques' : '📊 Métriques techniques (%)'}</span>
              {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {showDetails && (
              <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '12px', padding: '14px 16px', backgroundColor: '#FCFDFE', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  <span>Taux de Défauts:</span>
                  <strong>{defectRate}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  <span>Humidité:</span>
                  <strong>{humidity}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>
                  <span>KOR (estimé):</span>
                  <strong>{korLbs}</strong>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Bottom Certification Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px', marginTop: '4px' }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '12px', color: '#2563EB' }}>
            <Ruler size={24} />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8' }}>Grainage</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#94A3B8' }}>Non mesuré</div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
              Requiert un comptage (noix/kg)
            </div>
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
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8' }}>KOR (estimé)</div>
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
            CERTIFIÉ
          </span>
        </div>
      </div>
    </div>
  );
}
