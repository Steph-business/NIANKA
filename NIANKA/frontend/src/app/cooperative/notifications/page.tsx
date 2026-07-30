"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Truck, Check, Sparkles, RefreshCw } from 'lucide-react';
import { api, NotificationItem } from '@/lib/api';
import { libelleGrade } from '@/lib/grades';

/** Habillage visuel dérivé du type de notification renvoyé par l'API. */
const STYLE_PAR_TYPE: Record<string, { titre: string; icon: typeof Bell; color: string; bg: string }> = {
  scan: { titre: 'Nouveau lot terrain scanné', icon: Sparkles, color: '#1a6b0a', bg: '#F0FDF4' },
  transit: { titre: 'Expédition vers l’entrepôt', icon: Truck, color: '#2563EB', bg: '#EFF6FF' },
  arbitrage: { titre: 'Arbitrage & vente scellée', icon: CheckCircle2, color: '#1a6b0a', bg: '#F0FDF4' },
  vente: { titre: 'Lot certifié transmis', icon: CheckCircle2, color: '#1a6b0a', bg: '#F0FDF4' },
  alert: { titre: 'Alerte qualité', icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2' },
};

const STYLE_DEFAUT = { titre: 'Information', icon: Info, color: '#64748B', bg: '#F1F5F9' };

function tempsRelatif(iso?: string | null): string {
  if (!iso) return 'à l’instant';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  return new Date(iso).toLocaleString('fr-FR');
}

export default function CooperativeNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const charger = useCallback(async () => {
    const data = await api.notifications.list().catch(() => [] as NotificationItem[]);
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 10000);
    return () => clearInterval(interval);
  }, [charger]);

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, lu: true })));
    await api.notifications.markAllRead().catch(() => null);
    charger();
  };

  const ouvrirNotification = async (n: NotificationItem) => {
    if (n.lu) return;
    setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, lu: true } : x)));
    await api.notifications.markRead(n.id).catch(() => null);
  };

  const nonLues = notifications.filter(n => !n.lu).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
              <Bell size={22} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Centre de Notifications &amp; Alertes
              {nonLues > 0 && (
                <span style={{
                  marginLeft: '10px', fontSize: '12px', fontWeight: 900, color: '#ffffff',
                  backgroundColor: '#EF4444', padding: '3px 10px', borderRadius: '12px', verticalAlign: 'middle',
                }}>
                  {nonLues}
                </span>
              )}
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Collectes de vos agents, départs de camions et verdicts d&apos;arbitrage, en temps réel.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={charger}
            style={{
              padding: '10px 16px', backgroundColor: '#ffffff', color: '#64748B',
              border: '1.5px solid #E2E8F0', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <RefreshCw size={16} /> Actualiser
          </button>
          <button
            onClick={markAllAsRead}
            disabled={nonLues === 0}
            style={{
              padding: '10px 16px', backgroundColor: '#ffffff', color: '#1a6b0a',
              border: '1.5px solid #BBF7D0', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800,
              cursor: nonLues === 0 ? 'default' : 'pointer', opacity: nonLues === 0 ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Check size={16} /> Tout marquer comme lu
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '14px', padding: '38px',
            textAlign: 'center', color: '#64748B', fontSize: '13.5px', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)', lineHeight: 1.7,
          }}>
            {loading
              ? 'Chargement des notifications...'
              : 'Aucune notification. Les collectes de vos agents et les verdicts d’arbitrage apparaîtront ici automatiquement.'}
          </div>
        ) : notifications.map(n => {
          const style = STYLE_PAR_TYPE[n.type || ''] || STYLE_DEFAUT;
          const Icon = style.icon;
          return (
            <div
              key={n.id}
              onClick={() => ouvrirNotification(n)}
              style={{
                backgroundColor: n.lu ? '#ffffff' : '#FCFEFC', borderRadius: '14px', padding: '18px 22px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', borderLeft: `4px solid ${style.color}`,
                cursor: n.lu ? 'default' : 'pointer', gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: style.bg, color: style.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{style.titre}</h3>
                    {!n.lu && (
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffffff', backgroundColor: '#EF4444', padding: '2px 6px', borderRadius: '10px' }}>
                        NOUVEAU
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#475569', margin: '4px 0 0 0', fontWeight: 500, lineHeight: 1.55 }}>
                    {n.contenu}
                  </p>
                  {n.scan && (
                    <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11.5px', fontWeight: 700, color: '#1a6b0a' }}>
                      <span>{libelleGrade(n.scan.grade_ia).label}</span>
                      <span>KOR {n.scan.score_kor ?? '—'} lbs</span>
                      <span>Humidité {n.scan.humidite ?? '—'}%</span>
                    </div>
                  )}
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                {tempsRelatif(n.cree_le)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
