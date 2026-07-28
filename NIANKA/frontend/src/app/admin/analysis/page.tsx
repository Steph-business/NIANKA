"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, CheckCircle2, AlertOctagon, MapPin, X, Check, ShieldCheck, Microscope } from 'lucide-react';
import { api, ScanData } from '@/lib/api';
import styles from './page.module.css';

type Onglet = 'anomalies' | 'queue' | 'archives';

interface Defauts {
  defect_rate_pct?: number;
  calibre_mm?: number;
  weight_kg?: number;
  sample_weight_kg?: number;
  producteur?: string;
  cooperative_saisie?: string;
}

/** Palette de grade conforme à la charte NIANKA. */
function styleGrade(grade: string, approuve: boolean) {
  if (approuve) {
    return { label: 'Approuvé', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', badge: 'APPROUVÉ' };
  }
  const g = (grade || '').toLowerCase();
  if (g.includes('rejet')) return { label: 'Rejeté', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', badge: 'REJETÉ' };
  if (g.includes('c')) return { label: 'Grade C', color: '#EAB308', bg: '#FEFCE8', border: '#FEF08A', badge: 'GRADE C' };
  if (g.includes('b')) return { label: 'Grade B', color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74', badge: 'GRADE B' };
  return { label: 'Grade A', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', badge: 'GRADE A' };
}

function tempsRelatif(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 1440) return `il y a ${Math.floor(minutes / 60)} h`;
  return d.toLocaleString('fr-FR');
}

/** Résumé lisible des défauts relevés par le modèle. */
function resumeDefauts(scan: ScanData): string {
  const d = (scan.defauts ?? {}) as Defauts;
  const parts: string[] = [];
  if (typeof d.defect_rate_pct === 'number') parts.push(`taux de défaut ${d.defect_rate_pct}%`);
  if (typeof scan.humidite === 'number' && scan.humidite > 9) parts.push(`humidité élevée ${scan.humidite}%`);
  if (typeof d.calibre_mm === 'number') parts.push(`calibre ${d.calibre_mm} mm`);
  return parts.length ? parts.join(' · ') : 'Aucune anomalie relevée';
}

export default function AdminAIAnalysisPage() {
  const [scans, setScans] = useState<ScanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<ScanData | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>('anomalies');
  const [approuves, setApprouves] = useState<Set<string>>(new Set());
  const [enCours, setEnCours] = useState<string | null>(null);

  const notifier = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const charger = useCallback(async () => {
    const data = await api.etapes.getScans().catch(() => [] as ScanData[]);
    setScans(data.filter(s => s.etape === 'collecte_terrain'));
    setLoading(false);
  }, []);

  useEffect(() => {
    charger();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nianka_approved_lots');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setApprouves(new Set(parsed));
        } catch {
          /* préférence locale illisible */
        }
      }
    }
  }, [charger]);

  /** Homologue le scan : crée le lot correspondant côté serveur. */
  const approuver = async (scan: ScanData) => {
    setEnCours(scan.id);
    const d = (scan.defauts ?? {}) as Defauts;
    const poidsKg = Number(d.weight_kg ?? 0);

    try {
      await api.etapes.createLot({
        nom_producteur: d.producteur || scan.nom_agent || undefined,
        poids_tonnes: poidsKg > 0 ? poidsKg / 1000 : 1,
        grade_qualite: scan.grade_ia,
        kor_score: scan.score_kor ?? undefined,
        humidite: scan.humidite ?? undefined,
        gps_lat: scan.gps_lat ?? undefined,
        gps_long: scan.gps_long ?? undefined,
      });

      setApprouves(prev => {
        const maj = new Set(prev).add(scan.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nianka_approved_lots', JSON.stringify(Array.from(maj)));
        }
        return maj;
      });
      notifier(`Lot LOT-${scan.id.slice(0, 8).toUpperCase()} homologué et enregistré.`);
      setSelection(null);
    } catch (err) {
      notifier(err instanceof Error ? err.message : "Échec de l'homologation.");
    } finally {
      setEnCours(null);
    }
  };

  const estAnomalie = (s: ScanData) => {
    const g = (s.grade_ia || '').toLowerCase();
    return g.includes('rejet') || g.includes('b') || g.includes('c') || (s.humidite ?? 0) > 9;
  };

  const visibles = scans.filter(s => {
    if (onglet === 'archives') return approuves.has(s.id);
    if (approuves.has(s.id)) return false;
    return onglet === 'anomalies' ? estAnomalie(s) : true;
  });

  const messageVide =
    onglet === 'archives'
      ? "Aucun lot homologué pour l'instant."
      : onglet === 'anomalies'
        ? "Aucune anomalie détectée. Tous les lots analysés respectent les seuils de qualité."
        : "Aucune analyse terrain en attente. Les scans de vos agents apparaîtront ici automatiquement.";

  const gpsLabel = (s: ScanData) =>
    typeof s.gps_lat === 'number' && typeof s.gps_long === 'number'
      ? `${s.gps_lat.toFixed(4)}, ${s.gps_long.toFixed(4)}`
      : 'Non transmis';

  return (
    <div className={styles.pageWrapper}>
      {toast && (
        <div className={styles.toastNotification}>
          <CheckCircle2 size={20} />
          <span>{toast}</span>
        </div>
      )}

      {selection && (() => {
        const approuve = approuves.has(selection.id);
        const st = styleGrade(selection.grade_ia, approuve);
        const d = (selection.defauts ?? {}) as Defauts;
        return (
          <div className={styles.modalOverlay} onClick={() => setSelection(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div>
                  <span
                    className={styles.modalBadge}
                    style={{ color: st.color, backgroundColor: st.bg, borderColor: st.border, borderStyle: 'solid', borderWidth: '1px' }}
                  >
                    ● {st.label}
                  </span>
                  <h2 className={styles.modalTitle}>
                    Fiche échantillon #LOT-{selection.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <p className={styles.modalSubtitle}>
                    Agent {selection.nom_agent ?? '—'} — {tempsRelatif(selection.date_scan)}
                    {d.producteur ? ` — producteur ${d.producteur}` : ''}
                  </p>
                </div>
                <button className={styles.modalClose} onClick={() => setSelection(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalImageWrap}>
                {/* Image de scan : data-URL ou URL Supabase, servie telle quelle. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selection.image_url}
                  alt="Échantillon scanné"
                  className={styles.modalImage}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className={styles.modalImageTag}>
                  <ShieldCheck size={16} color="#10B981" />
                  Confiance IA {(selection.score_confiance * 100).toFixed(1)}%
                </div>
              </div>

              <div className={styles.modalMetricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Taux humidité</div>
                  <div className={styles.metricValue} style={{ color: st.color }}>
                    {selection.humidite !== null && selection.humidite !== undefined ? `${selection.humidite.toFixed(1)}%` : '—'}
                  </div>
                  <div className={styles.metricHint}>Seuil max : 9.0%</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Défauts détectés</div>
                  <div className={styles.metricValue} style={{ fontSize: '15px' }}>{resumeDefauts(selection)}</div>
                  <div className={styles.metricHint}>Contrôle IA visuel</div>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricLabel}>Rendement (KOR)</div>
                  <div className={styles.metricValue} style={{ color: '#1a6b0a' }}>
                    {selection.score_kor !== null && selection.score_kor !== undefined ? `${selection.score_kor.toFixed(1)} lbs` : '—'}
                  </div>
                  <div className={styles.metricHint}>Qualité exportateur</div>
                </div>
              </div>

              <div className={styles.modalDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Agent terrain responsable :</span>
                  <span className={styles.detailValue}>{selection.nom_agent ?? '—'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Poids du lot :</span>
                  <span className={styles.detailValue}>
                    {d.weight_kg ? `${d.weight_kg} kg (échantillon ${d.sample_weight_kg ?? '—'} kg)` : '—'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Géolocalisation GPS :</span>
                  <span className={styles.detailHighlight}>
                    <MapPin size={14} /> {gpsLabel(selection)}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date d&apos;analyse :</span>
                  <span className={styles.detailValue}>{new Date(selection.date_scan).toLocaleString('fr-FR')}</span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button className={`${styles.buttonBase} ${styles.buttonSecondary}`} onClick={() => setSelection(null)}>
                  Fermer
                </button>
                {!approuve && (
                  <button
                    className={`${styles.buttonBase} ${styles.buttonPrimary}`}
                    onClick={() => approuver(selection)}
                    disabled={enCours === selection.id}
                  >
                    <Check size={16} /> {enCours === selection.id ? 'Homologation...' : 'Approuver ce lot'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <section className={styles.topBar}>
        <div className={styles.tabButtonGroup}>
          {([
            { key: 'anomalies', label: 'Gestion des anomalies' },
            { key: 'queue', label: 'File d’attente' },
            { key: 'archives', label: 'Archives' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setOnglet(tab.key)}
              className={`${styles.tabButton} ${onglet === tab.key ? styles.tabButtonActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.summaryBadge}>
          <AlertOctagon size={16} color="#1a6b0a" />
          {visibles.length} lot{visibles.length > 1 ? 's' : ''}
          {onglet === 'archives' ? ' homologué(s)' : ' en attente d’approbation'}
        </div>
      </section>

      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.loadingState}>Chargement des analyses terrain...</div>
        ) : visibles.length === 0 ? (
          <div className={styles.loadingState} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '46px 20px' }}>
            <Microscope size={38} color="#CBD5E1" />
            <span style={{ maxWidth: '460px', lineHeight: 1.6 }}>{messageVide}</span>
          </div>
        ) : (
          visibles.map(scan => {
            const approuve = approuves.has(scan.id);
            const st = styleGrade(scan.grade_ia, approuve);
            const d = (scan.defauts ?? {}) as Defauts;
            return (
              <article
                key={scan.id}
                className={`${styles.itemCard} ${approuve ? styles.itemCardApproved : ''}`}
                onClick={() => setSelection(scan)}
              >
                <div className={styles.itemThumbnail}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scan.image_url}
                    alt="Échantillon scanné"
                    className={styles.itemImage}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className={styles.itemGradeBanner} style={{ backgroundColor: st.color }}>
                    IA : {st.badge}
                  </div>
                  <div className={styles.itemThumbnailFooter}>Origine agent : {scan.nom_agent ?? '—'}</div>
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>Lot #LOT-{scan.id.slice(0, 8).toUpperCase()}</h3>
                    <span className={styles.itemSubtitle}>{tempsRelatif(scan.date_scan)}</span>
                  </div>
                  <p className={styles.itemSubtitle}>
                    {d.producteur ? `Producteur ${d.producteur} — ` : ''}
                    <strong style={{ color: st.color }}>{resumeDefauts(scan)}</strong>
                  </p>
                  <div className={styles.itemMeta}>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Humidité</span>
                      <span className={styles.metaValue} style={{ color: st.color }}>
                        {scan.humidite !== null && scan.humidite !== undefined ? `${scan.humidite.toFixed(1)}%` : '—'}
                      </span>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Qualité</span>
                      <span className={styles.metaValue} style={{ color: st.color }}>{st.badge}</span>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Rendement</span>
                      <span className={styles.metaValue}>
                        {scan.score_kor !== null && scan.score_kor !== undefined ? `${scan.score_kor.toFixed(1)} lbs` : '—'}
                      </span>
                    </div>
                    <div className={styles.metaBlock}>
                      <span className={styles.metaLabel}>Géolocalisation</span>
                      <span
                        className={styles.metaValue}
                        style={{ color: gpsLabel(scan) === 'Non transmis' ? '#94A3B8' : '#1a6b0a', fontSize: '12px' }}
                      >
                        {gpsLabel(scan)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.actionPanel}>
                  <button
                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                    onClick={(e) => { e.stopPropagation(); setSelection(scan); }}
                  >
                    <Eye size={15} /> Examiner
                  </button>
                  <button
                    className={`${styles.actionButton} ${styles.actionButtonSecondary} ${approuve ? styles.actionButtonDisabled : ''}`}
                    onClick={(e) => { e.stopPropagation(); approuver(scan); }}
                    disabled={approuve || enCours === scan.id}
                  >
                    {approuve
                      ? <><Check size={14} /> Lot approuvé</>
                      : enCours === scan.id ? 'Homologation...' : 'Approuver le lot'}
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
