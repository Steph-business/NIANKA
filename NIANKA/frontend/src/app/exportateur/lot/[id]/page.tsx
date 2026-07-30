"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Package, Download, FileText, Globe, Award, AlertTriangle, Route } from 'lucide-react';
import { api, LotCertifie } from '@/lib/api';
import styles from './page.module.css';
import { PrintableBonDeLivraison } from './PrintableBonDeLivraison';

const PrintableCertificate: React.FC<{ lot: LotCertifie }> = ({ lot }) => {
  const korFinal = lot.kor_entrepot ?? lot.kor_initial;
  const date = new Date(lot.scelle_a).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="printable-area" style={{
      backgroundColor: '#fff',
      padding: '36px',
      border: '2.5px solid #1a6b0a',
      fontFamily: 'sans-serif',
      color: '#0F172A',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #1a6b0a', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            RÉPUBLIQUE DE CÔTE D&apos;IVOIRE MINISTÈRE DE L&apos;AGRICULTURE
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0 4px' }}>
            CERTIFICAT PHYTOSANITAIRE D&apos;EXPORTATION
          </h2>
          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
            PLATEFORME NIANKA PRECISION FOOD SAFETY INTELLIGENCE
          </div>
        </div>
        {/* Le QR Code officiel est gravé sur le certificat serveur, seul document faisant foi. */}
        <div style={{ textAlign: 'center', backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #CBD5E1', maxWidth: '190px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, color: '#1a6b0a', letterSpacing: '0.06em' }}>VÉRIFICATION OFFICIELLE</div>
          <div style={{ fontSize: '10px', color: '#475569', marginTop: '5px', wordBreak: 'break-all', lineHeight: 1.4 }}>
            {api.etapes.certificatUrl(lot.numero_bordereau)}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'RÉFÉRENCE EXPÉDITION', value: `#${lot.numero_bordereau}`, color: '#1a6b0a' },
          { label: 'COOPÉRATIVE D\'ORIGINE', value: lot.nom_cooperative || '—', color: '#0F172A' },
          { label: 'ENTREPÔT ARBITRE', value: lot.nom_entrepot || '—', color: '#2563EB' },
          { label: "DATE D'ÉMISSION", value: date, color: '#0F172A' },
        ].map((field, i) => (
          <div key={i} style={{ backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', marginBottom: '4px' }}>{field.label}</div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: field.color }}>{field.value}</div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: lot.verdict_conforme ? '#F0FDF4' : '#FEF2F2', padding: '18px 20px', borderRadius: '14px',
        border: `1px dashed ${lot.verdict_conforme ? '#40BB1B' : '#DC2626'}`, marginBottom: '20px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 900, color: lot.verdict_conforme ? '#1a6b0a' : '#991B1B', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={18} /> Synthèse de l&apos;Analyse d&apos;Échantillonnage IA
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Grade Export', value: lot.grade_lot, color: '#10B981' },
            { label: 'KOR arbitré', value: korFinal != null ? `${korFinal} lbs` : '—', color: '#0F172A' },
            { label: 'Volume', value: `${lot.volume_tonnes} T`, color: '#0F172A' },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: '16px', borderTop: '1px solid #E2E8F0', marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.6 }}>
          Ce document certifie le résultat de l&apos;arbitrage IA réalisé à l&apos;entrepôt central pour le lot susmentionné, en vue de son exportation internationale.
          <br />
          Délivré le {date} Côte d&apos;Ivoire
        </div>
      </div>
    </div>
  );
};
export default function LotDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const lotId = params.id as string;
  const [lot, setLot] = useState<LotCertifie | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState<'certificate' | 'delivery_note' | null>(null);

  useEffect(() => {
    if (!lotId) return;
    // Dossier d'exportation adossé au lot certifié attribué à cet exportateur.
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

  const handlePrint = (mode: 'certificate' | 'delivery_note') => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Chargement des données d&apos;exportation...</div>
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
            Dossier d&apos;Exportation {lot.numero_bordereau}
            <Globe size={22} color="#1a6b0a" />
          </h1>
          <div className={styles.subtitle}>
            <span className={styles.statusBadge} style={{
              backgroundColor: lot.verdict_conforme ? undefined : '#FEF2F2',
              color: lot.verdict_conforme ? undefined : '#991B1B',
            }}>
              {lot.verdict_conforme ? 'CONFORME' : 'ÉCART DÉTECTÉ'}
            </span>
            <span>• Certifié le {new Date(lot.scelle_a).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      <div className={`${styles.mainGrid} print-hidden`}>

        {/* Colonne Principale */}
        <div className={styles.mainColumn}>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <Package size={18} color="#1a6b0a" />
              Volume et Qualité
            </h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Volume Certifié</div>
                <div className={styles.metricValue}>{lot.volume_tonnes} Tonnes</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Rendement en amandes (KOR)</div>
                <div className={styles.metricValue}>{korFinal != null ? `${korFinal} lbs` : '—'}</div>
              </div>
              <div className={styles.metricBox}>
                <div className={styles.metricLabel}>Grade Export</div>
                <div className={styles.metricValue} style={{ color: '#1a6b0a' }}>{lot.grade_lot}</div>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {lot.verdict_conforme ? <CheckCircle2 size={18} color="#1a6b0a" /> : <AlertTriangle size={18} color="#DC2626" />}
              Conformité & Traçabilité
            </h2>
            <div className={styles.complianceList}>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Coopérative d&apos;origine</span>
                <span className={styles.complianceValue} style={{ color: '#0F172A' }}>{lot.nom_cooperative || '—'}</span>
              </div>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Entrepôt arbitre</span>
                <span className={styles.complianceValue} style={{ color: '#0F172A' }}>{lot.nom_entrepot || '—'}</span>
              </div>
              <div className={styles.complianceItem}>
                <span className={styles.complianceLabel}>Verdict d&apos;arbitrage IA</span>
                <span className={styles.complianceValue} style={{ color: lot.verdict_conforme ? '#10B981' : '#DC2626', fontWeight: 800 }}>
                  {lot.verdict_conforme ? `Conforme (écart ${lot.delta_kor} lbs)` : `Écart détecté (${lot.delta_kor} lbs)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale : Actions */}
        <div className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle} style={{ marginBottom: '16px' }}>Documents d&apos;Exportation</h3>

            <button onClick={() => handlePrint('certificate')} className={`${styles.actionButton} ${styles.primaryAction}`}>
              <Download size={18} /> Certificat Phytosanitaire
            </button>

            <button onClick={() => handlePrint('delivery_note')} className={`${styles.actionButton} ${styles.secondaryAction}`}>
              <FileText size={18} /> Bon de Livraison (Douane)
            </button>

            <Link href={`/lot/${lot.bordereau_id}/parcours`} className={`${styles.actionButton} ${styles.secondaryAction}`} style={{ textDecoration: 'none' }}>
              <Route size={18} /> Voir le Parcours Complet
            </Link>
          </div>
        </div>
      </div>

      {/* Hidden printable documents */}
      {printMode === 'certificate' && <PrintableCertificate lot={lot} />}
      {printMode === 'delivery_note' && <PrintableBonDeLivraison lot={lot} />}
    </div>
  );
}
