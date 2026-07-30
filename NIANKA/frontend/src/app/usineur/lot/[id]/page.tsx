"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Package, Download, FileText, AlertTriangle, Route } from 'lucide-react';
import { api, LotCertifie } from '@/lib/api';
import styles from './page.module.css';
import { PrintableCertificate } from './PrintableCertificate';
import { PrintableFullReport } from './PrintableFullReport';

export default function LotDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const lotId = params.id as string;
  const [lot, setLot] = useState<LotCertifie | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'certificate' | 'full_report' | null>(null);

  useEffect(() => {
    if (!lotId) return;
    // La fiche est adossée au lot certifié (double scan + verdict d'arbitrage)
    // attribué à cet usinier lors du scellement de la vente.
    api.etapes.getLotsCertifies()
      .then(list => {
        const certifie = list.find(l => l.bordereau_id === lotId || l.numero_bordereau === lotId);
        setLot(certifie ?? null);
      })
      .catch(() => setLot(null))
      .finally(() => setLoading(false));
  }, [lotId]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintMode(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = (mode: 'certificate' | 'full_report') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Chargement des données du lot...</div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>Erreur : Lot introuvable.</div>
        <button onClick={() => router.back()} className={styles.backButton}>Retour</button>
      </div>
    );
  }

  const korFinal = lot.kor_entrepot ?? lot.kor_initial;
  const humiditeFinale = lot.humidite_entrepot ?? lot.humidite_initiale;

  return (
    <div className={styles.pageWrapper}>
      <style jsx global>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>


      {/* Header avec Retour */}
      <div className={`${styles.header} print-hidden`}>
        <button onClick={() => router.back()} className={styles.headerBackButton}>
          <ArrowLeft size={20} color="#0F172A" />
        </button>
        <div>
          <h1 className={styles.title}>
            Fiche de Lot {lot.numero_bordereau}
          </h1>
          <div className={styles.subtitle}>
            <span className={styles.statusBadge} style={{
              backgroundColor: lot.verdict_conforme ? undefined : '#FEF2F2',
              color: lot.verdict_conforme ? undefined : '#991B1B',
            }}>
              {lot.verdict_conforme ? 'CONFORME' : 'ÉCART DÉTECTÉ'}
            </span>
            <span>• Scellé le {new Date(lot.scelle_a).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.mainGrid} print-hidden`}>

        {/* Colonne Principale */}
        <div className={styles.mainColumn}>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Package size={18} color="#1a6b0a" />
              Spécifications Physiques
            </h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Poids Total</div>
                <div className={styles.metricValue}>{lot.volume_tonnes} Tonnes</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Rendement en amandes (KOR)</div>
                <div className={styles.metricValue}>{korFinal != null ? `${korFinal} lbs` : '—'}</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Taux d&apos;humidité</div>
                <div className={styles.metricValue}>{humiditeFinale != null ? `${humiditeFinale} %` : '—'}</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Grade Classifié</div>
                <div className={styles.metricValue} style={{ color: '#1a6b0a' }}>{lot.grade_lot}</div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {lot.verdict_conforme ? <CheckCircle2 size={18} color="#1a6b0a" /> : <AlertTriangle size={18} color="#DC2626" />}
              Traçabilité & Qualité
            </h2>
            <div className={styles.complianceList}>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Origine Coopérative</span>
                <span className={styles.complianceValue} style={{ color: '#0F172A' }}>{lot.nom_cooperative || '—'}</span>
              </div>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Agent pisteur</span>
                <span className={styles.complianceValue} style={{ color: '#0F172A' }}>{lot.nom_agent || '—'}</span>
              </div>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Verdict d&apos;arbitrage IA</span>
                <span className={styles.complianceValue} style={{ color: lot.verdict_conforme ? '#10B981' : '#DC2626', fontWeight: 800 }}>
                  {lot.verdict_conforme ? `Conforme (écart ${lot.delta_kor} lbs)` : `Écart détecté (${lot.delta_kor} lbs)`}
                </span>
              </div>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Analyse IA</span>
                <span className={styles.complianceValue}>Complétée (Modèle MobileNetV3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale : Actions */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ marginBottom: '16px' }}>Actions sur le Lot</h3>

            <button onClick={() => handlePrint('certificate')} className={`${styles.actionButton} ${styles.primaryAction}`}>
              <Download size={18} /> Télécharger le Certificat
            </button>

            <button onClick={() => handlePrint('full_report')} className={`${styles.actionButton} ${styles.secondaryAction}`}>
              <FileText size={18} /> Voir le Rapport Complet
            </button>

            <Link href={`/lot/${lot.bordereau_id}/parcours`} className={`${styles.actionButton} ${styles.secondaryAction}`} style={{ textDecoration: 'none' }}>
              <Route size={18} /> Voir le Parcours Complet
            </Link>
          </div>
        </div>
      </div>

      {/* Hidden printable documents */}
      {printMode === 'certificate' && <PrintableCertificate lot={lot} />}
      {printMode === 'full_report' && <PrintableFullReport lot={lot} />}
    </div>
  );
}
