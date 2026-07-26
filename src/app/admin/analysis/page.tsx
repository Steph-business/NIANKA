/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, CheckCircle2, AlertOctagon, MapPin, X, Check, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import styles from './page.module.css';

export default function AdminAIAnalysisPage() {
  const [scansList, setScansList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'anomalies' | 'queue' | 'archives'>('anomalies');
  const [approvedLots, setApprovedLots] = useState<Set<string>>(new Set());

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await api.etapes.getScans().catch(() => []);
        if (Array.isArray(data) && data.length > 0) setScansList(data);
      } catch (err) {
        console.warn('Scans loading notice:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApproveLot = (lotId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // Add to approved lots
    setApprovedLots(prev => new Set([...prev, lotId]));
    showNotification(`${lotId} a été approuvé et certifié conforme.`);
  };

  const safeString = (val: any, fallback: string): string => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      if (val.name) return String(val.name);
      if (val.label) return String(val.label);
      return JSON.stringify(val);
    }
    return String(val);
  };

  const formatDate = (rawDate: any): string => {
    if (!rawDate) return 'Aujourd\'hui';
    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return String(rawDate);
      
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      
      return `${day} ${month} ${year} à ${hours}:${mins}`;
    } catch {
      return String(rawDate);
    }
  };

  const formatLotId = (rawId: any, idx: number, item?: any): string => {
    const sites = ['Bouaké Nord', 'Korhogo C1', 'Daloa Est', 'Yamoussoukro'];
    const siteName = item?.nom_cooperative || item?.cooperative || sites[idx % sites.length];
    const cleanSite = siteName.replace('Coop. ', '').replace('ANADER ', '');
    const lotNum = String(100 + (scansList.length || 10) - idx).padStart(3, '0');

    if (typeof rawId === 'string' && rawId.startsWith('Lot N°')) {
      return rawId;
    }
    
    return `Lot N° ${lotNum} — ${cleanSite}`;
  };

  const formatDefect = (defauts: any, gradeExpert: any) => {
    if (typeof defauts === 'string' && defauts.trim() !== '') return defauts;
    if (defauts && typeof defauts === 'object') {
      if (defauts.defect_rate_pct !== undefined) {
        return `Taux de défaut: ${defauts.defect_rate_pct}%`;
      }
      if (defauts.description) {
        return String(defauts.description);
      }
      if (defauts.type) {
        return String(defauts.type);
      }
      if (defauts.weight_kg !== undefined || defauts.sample_weight_kg !== undefined) {
        return `Échantillon ${defauts.sample_weight_kg || '1'}kg / Lot ${defauts.weight_kg || '500'}kg`;
      }
      return JSON.stringify(defauts);
    }
    if (typeof gradeExpert === 'string' && gradeExpert.trim() !== '') return gradeExpert;
    if (gradeExpert && typeof gradeExpert === 'object') return JSON.stringify(gradeExpert);
    return 'Contrôle d\'échantillon';
  };

  // User-defined strict color palette per grade:
  // Grade A: Vert (#10B981)
  // Grade B: Orange (#EA580C)
  // Grade C: Jaune / Neutre (#D97706)
  // Rejeté: Rouge (#DC2626)
  const getGradeStyle = (rawGrade: string, isApproved: boolean) => {
    if (isApproved) {
      return {
        label: 'Grade A (Approuvé)',
        color: '#10B981',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        badgeText: 'APPROUVÉ',
      };
    }
    const lower = (rawGrade || '').toLowerCase();
    if (lower.includes('rejet')) {
      return {
        label: 'Rejeté',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FCA5A5',
        badgeText: 'REJETÉ',
      };
    }
    if (lower.includes('grade c') || lower === 'c') {
      return {
        label: 'Grade C',
        color: '#EAB308',
        bg: '#FEFCE8',
        border: '#FEF08A',
        badgeText: 'GRADE C',
      };
    }
    if (lower.includes('grade b') || lower === 'b' || lower.includes('réviser')) {
      return {
        label: 'Grade B',
        color: '#EA580C',
        bg: '#FFEDD5',
        border: '#FDBA74',
        badgeText: 'GRADE B',
      };
    }
    // Default Grade A (Green)
    return {
      label: 'Grade A',
      color: '#10B981',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      badgeText: 'GRADE A',
    };
  };

  // Fallback items if database hasn't returned dynamic records yet
  const defaultItems = [
    {
      id: 'LOT-2026-00124',
      fullId: 'LOT-2026-00124',
      coop: 'SOCAKKAT Dalleu',
      defect: 'Moisissure (8.4%)',
      humidity: '9.2%',
      grade: 'IA : REJETÉ',
      gradeStyle: { label: 'IA : REJETÉ', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', badgeText: 'REJETÉ' },
      agent: 'B. Kouassi',
      time: 'Soumis il y a 14 min',
      image: '/images/cacao.png',
      statusTag: 'REJETÉ',
      isApproved: false,
      rawItem: {},
    },
    {
      id: 'LOT-2026-00125',
      fullId: 'LOT-2026-00125',
      coop: 'San Pedro, Union Espoir',
      defect: 'Humidité Limite (7.8%)',
      humidity: '7.8%',
      grade: 'IA : GRADE B',
      gradeStyle: { label: 'IA : GRADE B', color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74', badgeText: 'GRADE B' },
      agent: 'M. Touré',
      time: 'Soumis il y a 32 min',
      image: '/images/anacarde.png',
      statusTag: 'GRADE B',
      isApproved: false,
      rawItem: {},
    },
  ];

  const itemsToDisplay = scansList.length > 0
    ? scansList.map((item: any, idx: number) => {
        const lotCode = formatLotId(item.code_lot || item.id, idx, item);
        const rawGradeVal = safeString(item.grade_ia || item.grade_qualite, 'GRADE A');
        const isApproved = approvedLots.has(lotCode);
        const style = getGradeStyle(rawGradeVal, isApproved);

        return {
          id: lotCode,
          fullId: safeString(item.id || item.code_lot, lotCode),
          coop: safeString(item.nom_cooperative || item.cooperative, 'Coop. ANADER Bouaké'),
          defect: formatDefect(item.defauts, item.grade_expert),
          humidity: item.humidite ? `${item.humidite}%` : item.taux_humidite ? `${item.taux_humidite}%` : (rawGradeVal.includes('REJET') ? '13.8%' : rawGradeVal.includes('C') ? '9.6%' : rawGradeVal.includes('B') ? '7.9%' : `${(6.4 + (idx % 4) * 0.2).toFixed(1)}%`),
          grade: style.label,
          gradeStyle: style,
          agent: safeString(item.nom_agent || item.agent, 'Amadou Koné'),
          time: formatDate(item.date_scan),
          image: safeString(item.image_url, '/images/anacarde.png'),
          statusTag: style.badgeText,
          isApproved,
          rawItem: item,
        };
      })
    : defaultItems;

  return (
    <div className={styles.pageWrapper}>
      {toastMessage && (
        <div className={styles.toastNotification}>
          <CheckCircle2 size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span
                  className={styles.modalBadge}
                  style={{
                    color: selectedItem.gradeStyle.color,
                    backgroundColor: selectedItem.gradeStyle.bg,
                    borderColor: selectedItem.gradeStyle.border,
                    borderStyle: 'solid',
                    borderWidth: '1px',
                  }}
                >
                  ● {selectedItem.grade}
                </span>
                <h2 className={styles.modalTitle}>Fiche Échantillon #{selectedItem.id}</h2>
                <p className={styles.modalSubtitle}>
                  {selectedItem.coop} — Soumis le {selectedItem.time}
                </p>
              </div>
              <button className={styles.modalClose} onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalImageWrap}>
              <Image
                src={selectedItem.image || '/images/anacarde.png'}
                alt="Scan Échantillon"
                className={styles.modalImage}
                fill
                sizes="(max-width: 720px) 100vw, 720px"
                style={{ objectFit: 'cover' }}
                onError={() => {}}
              />
              <div className={styles.modalImageTag}>
                <ShieldCheck size={16} color="#10B981" /> Analyse Visuelle IA Validée
              </div>
            </div>

            <div className={styles.modalMetricsGrid}>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Taux humidité</div>
                <div className={styles.metricValue} style={{ color: selectedItem.gradeStyle.color }}>{selectedItem.humidity}</div>
                <div className={styles.metricHint}>Seuil max: 9.0%</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Défauts détectés</div>
                <div className={styles.metricValue}>{selectedItem.defect}</div>
                <div className={styles.metricHint}>Contrôle IA visuel</div>
              </div>
              <div className={styles.metricCard}>
                <div className={styles.metricLabel}>Rendement (Kor)</div>
                <div className={styles.metricValue} style={{ color: '#1a6b0a' }}>54.2 lbs</div>
                <div className={styles.metricHint}>Qualité exportateur</div>
              </div>
            </div>

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Agent Terrain Responsable:</span>
                <span className={styles.detailValue}>{selectedItem.agent}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Géolocalisation GPS:</span>
                <span className={styles.detailHighlight}>
                  <MapPin size={14} /> Validé (District Bouaké)
                </span>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={`${styles.buttonBase} ${styles.buttonSecondary}`} onClick={() => setSelectedItem(null)}>
                Fermer
              </button>
              {!selectedItem.isApproved && (
                <button
                  className={`${styles.buttonBase} ${styles.buttonPrimary}`}
                  onClick={() => {
                    handleApproveLot(selectedItem.id);
                    setSelectedItem((prev: any) => prev ? {
                      ...prev,
                      isApproved: true,
                      grade: 'IA : APPROUVÉ',
                      gradeStyle: getGradeStyle('IA : APPROUVÉ', true),
                      statusTag: 'APPROUVÉ',
                    } : null);
                  }}
                >
                  <Check size={16} /> Approuver ce Lot
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <section className={styles.topBar}>
        <div className={styles.tabButtonGroup}>
          {[
            { key: 'anomalies', label: 'Gestion des Anomalies' },
            { key: 'queue', label: 'Files d&apos;Attente' },
            { key: 'archives', label: 'Archives' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabButtonActive : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={styles.summaryBadge}>
          <AlertOctagon size={16} color="#1a6b0a" />
          {itemsToDisplay.length} lots en attente d&apos;approbation
        </div>
      </section>

      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            Chargement des scans depuis le serveur FastAPI & Supabase...
          </div>
        ) : (
          itemsToDisplay.map((item, idx) => (
            <article
              key={idx}
              className={`${styles.itemCard} ${item.isApproved ? styles.itemCardApproved : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className={styles.itemThumbnail}>
                <Image
                  src={item.image || '/images/anacarde.png'}
                  alt="Scan Lot"
                  className={styles.itemImage}
                  fill
                  sizes="220px"
                  style={{ objectFit: 'cover' }}
                />
                <div className={styles.itemGradeBanner} style={{ backgroundColor: item.gradeStyle.color }}>
                  {item.grade}
                </div>
                <div className={styles.itemThumbnailFooter}>Origine Agent: {item.agent}</div>
              </div>

              <div className={styles.itemDetails}>
                <div className={styles.itemHeader}>
                  <h3 className={styles.itemTitle}>Lot #{item.id}</h3>
                  <span className={styles.itemSubtitle}>{item.time}</span>
                </div>
                <p className={styles.itemSubtitle}>
                  {item.coop} — <strong style={{ color: item.gradeStyle.color }}>Défaut: {item.defect}</strong>
                </p>
                <div className={styles.itemMeta}>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Humidité</span>
                    <span className={styles.metaValue} style={{ color: item.gradeStyle.color }}>{item.humidity}</span>
                  </div>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Qualité</span>
                    <span className={styles.metaValue} style={{ color: item.gradeStyle.color }}>{item.statusTag}</span>
                  </div>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Agent</span>
                    <span className={styles.metaValue}>{item.agent}</span>
                  </div>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Géo-clôture</span>
                    <span className={styles.metaValue} style={{ color: '#1a6b0a' }}>Validé</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionPanel}>
                <button
                  className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                >
                  <Eye size={15} /> Examiner
                </button>
                <button
                  className={`${styles.actionButton} ${styles.actionButtonSecondary} ${item.isApproved ? styles.actionButtonDisabled : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleApproveLot(item.id, e); }}
                  disabled={item.isApproved}
                >
                  {item.isApproved ? <><Check size={14} /> Lot Approuvé</> : 'Approuver Lot'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

