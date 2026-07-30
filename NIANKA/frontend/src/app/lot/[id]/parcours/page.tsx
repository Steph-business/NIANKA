"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Sprout, Truck, Warehouse, Award, ArrowLeft, Printer,
  MapPin, Droplets, Scale, CheckCircle2, AlertTriangle, User, Building2,
} from 'lucide-react';
import { api, LotCertifie } from '@/lib/api';
import { Logo } from '@/components/Logo';
import styles from './page.module.css';

function formatDate(raw?: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface StageProps {
  index: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  children: React.ReactNode;
}

const Stage: React.FC<StageProps> = ({ index, icon, title, subtitle, color, bg, children }) => (
  <div className={styles.stage} style={{ animationDelay: `${0.15 + index * 0.22}s`, position: 'relative', display: 'flex', gap: '20px', paddingBottom: '36px' }}>
    <div
      className={styles.stageIcon}
      style={{
        animationDelay: `${0.15 + index * 0.22}s`,
        width: '56px', height: '56px', borderRadius: '50%', backgroundColor: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        boxShadow: `0 4px 14px ${color}33`, zIndex: 1, border: '3px solid #fff',
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: '11px', fontWeight: 800, color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '2px' }}>
        ÉTAPE {index + 1}
      </div>
      <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>{title}</h3>
      <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 14px 0', fontWeight: 500 }}>{subtitle}</p>
      {children}
    </div>
  </div>
);

const Field: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span style={{ color: '#94A3B8' }}>{icon}</span>
    <span style={{ fontSize: '11.5px', color: '#94A3B8', fontWeight: 700 }}>{label}:</span>
    <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 800 }}>{value}</span>
  </div>
);

export default function ParcoursLotPage() {
  const params = useParams();
  const router = useRouter();
  const lotId = params.id as string;
  const [lot, setLot] = useState<LotCertifie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lotId) return;
    api.etapes.getLotsCertifies()
      .then(list => {
        const found = list.find(l => l.bordereau_id === lotId || l.numero_bordereau === lotId);
        setLot(found ?? null);
      })
      .catch(() => setLot(null))
      .finally(() => setLoading(false));
  }, [lotId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F5' }}>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Chargement du parcours de traçabilité...</p>
      </div>
    );
  }

  if (!lot) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F5', gap: '16px' }}>
        <p style={{ color: '#64748B', fontWeight: 600 }}>Lot introuvable ou non certifié pour le moment.</p>
        <button onClick={() => router.back()} style={{ padding: '10px 20px', backgroundColor: '#1a6b0a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
          Retour
        </button>
      </div>
    );
  }

  const conforme = lot.verdict_conforme;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F6F5', paddingBottom: '60px' }}>
      <style jsx global>{`
        @media print {
          body { background: #fff !important; }
        }
      `}</style>

      {/* Header */}
      <div className={styles.noPrint} style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E2E8F0', padding: '18px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.back()} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} color="#0F172A" />
          </button>
          <Logo style={{ height: '28px' }} />
        </div>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', backgroundColor: '#1a6b0a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>
          <Printer size={16} /> Imprimer / Exporter
        </button>
      </div>

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '40px 24px 0' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            PARCOURS DE TRAÇABILITÉ NIANKA
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Lot {lot.numero_bordereau}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', fontWeight: 500, margin: 0 }}>
            {lot.volume_tonnes} tonnes · Grade {lot.grade_lot} · De la collecte au champ jusqu&apos;à la vente scellée
          </p>
        </div>

        {/* Verdict Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 26px', borderRadius: '18px', marginBottom: '40px',
          backgroundColor: conforme ? '#F0FDF4' : '#FEF2F2',
          border: `1.5px solid ${conforme ? '#BBF7D0' : '#FCA5A5'}`,
        }}>
          {conforme ? <CheckCircle2 size={36} color="#10B981" /> : <AlertTriangle size={36} color="#DC2626" />}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: conforme ? '#166534' : '#991B1B' }}>
              {conforme ? 'Chaîne de traçabilité conforme' : 'Écart détecté durant le transport'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
              Écart KOR mesuré entre la collecte et l&apos;entrepôt : <strong>{lot.delta_kor} lbs</strong> vérifié automatiquement par double scan.
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          <div className={styles.timelineTrack}>
            <div className={styles.timelineFill} />
          </div>

          <Stage index={0} icon={<Sprout size={24} />} color="#1a6b0a" bg="#F0FDF4"
            title="Collecte Terrain" subtitle={formatDate(lot.date_collecte)}>
            {lot.image_scan_initial && (
              <img src={lot.image_scan_initial} alt="Photo collecte" style={{ width: '100%', maxWidth: '260px', height: '150px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Field icon={<User size={13} />} label="Agent" value={lot.nom_agent || '—'} />
              <Field icon={<Building2 size={13} />} label="Coopérative" value={lot.nom_cooperative || '—'} />
              <Field icon={<Scale size={13} />} label="KOR initial" value={lot.kor_initial != null ? `${lot.kor_initial} lbs` : '—'} />
              <Field icon={<Droplets size={13} />} label="Humidité" value={lot.humidite_initiale != null ? `${lot.humidite_initiale}%` : '—'} />
              {lot.gps_lat != null && lot.gps_long != null && (
                <Field icon={<MapPin size={13} />} label="Position" value={`${lot.gps_lat.toFixed(4)}, ${lot.gps_long.toFixed(4)}`} />
              )}
            </div>
          </Stage>

          <Stage index={1} icon={<Truck size={24} />} color="#2563EB" bg="#EFF6FF"
            title="Expédition vers l'Entrepôt" subtitle={formatDate(lot.date_expedition)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Field icon={<Truck size={13} />} label="Camion" value={lot.immatriculation_camion || '—'} />
              <Field icon={<User size={13} />} label="Chauffeur" value={lot.nom_chauffeur || '—'} />
              <Field icon={<Scale size={13} />} label="Volume transporté" value={`${lot.volume_tonnes} tonnes`} />
            </div>
          </Stage>

          <Stage index={2} icon={<Warehouse size={24} />} color="#EA580C" bg="#FFEDD5"
            title="Arbitrage à l'Entrepôt" subtitle={formatDate(lot.date_arbitrage)}>
            {lot.image_scan_entrepot && (
              <img src={lot.image_scan_entrepot} alt="Photo arbitrage" style={{ width: '100%', maxWidth: '260px', height: '150px', objectFit: 'cover', borderRadius: '10px', marginBottom: '14px' }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Field icon={<Building2 size={13} />} label="Entrepôt" value={lot.nom_entrepot || '—'} />
              <Field icon={<Scale size={13} />} label="KOR à l'arrivée" value={lot.kor_entrepot != null ? `${lot.kor_entrepot} lbs` : '—'} />
              <Field icon={<Droplets size={13} />} label="Humidité" value={lot.humidite_entrepot != null ? `${lot.humidite_entrepot}%` : '—'} />
              <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: 800, color: conforme ? '#166534' : '#991B1B' }}>
                {conforme ? `✓ Conforme écart de ${lot.delta_kor} lbs seulement` : `⚠ Écart de ${lot.delta_kor} lbs par rapport à la collecte`}
              </div>
            </div>
          </Stage>

          <Stage index={3} icon={<Award size={24} />} color="#1a6b0a" bg="#F0FDF4"
            title="Vente Scellée & Certifiée" subtitle={formatDate(lot.scelle_a)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Field icon={<User size={13} />} label="Acheteur" value={lot.nom_acheteur || '—'} />
              <Field icon={<CheckCircle2 size={13} />} label="Statut" value={lot.statut_vente || '—'} />
            </div>
            {lot.numero_bordereau && (
              <a href={api.etapes.certificatUrl(lot.numero_bordereau)} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '14px', padding: '9px 16px', backgroundColor: '#1a6b0a', color: '#fff', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, textDecoration: 'none' }}>
                <Award size={14} /> Voir le certificat officiel
              </a>
            )}
          </Stage>
        </div>

        <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#94A3B8', marginTop: '8px' }}>
          Traçabilité vérifiée automatiquement par la plateforme NIANKA double scan (collecte + arbitrage entrepôt).
        </div>
      </div>
    </div>
  );
}
