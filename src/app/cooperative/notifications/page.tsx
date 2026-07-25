"use client";

import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, Truck, Check, Sparkles } from 'lucide-react';

export default function CooperativeNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Transfert #TRF-2024-08 Reçu & Confirmé',
      message: 'L\'Entrepôt Central Abidjan Port a validé la réception du camion CI-482-AB (20 Tonnes).',
      time: 'il y a 10 min',
      read: false,
      type: 'success',
      icon: CheckCircle2,
      color: '#1a6b0a',
      bg: '#F0FDF4',
    },
    {
      id: 2,
      title: 'Alerte Humidité Élevée sur Lot #CAS-2024-012',
      message: 'Agent Fanta Diabaté a scanné un sac avec 8.4% d\'humidité à Korhogo. Action requise.',
      time: 'il y a 45 min',
      read: false,
      type: 'warning',
      icon: AlertTriangle,
      color: '#EF4444',
      bg: '#FEF2F2',
    },
    {
      id: 3,
      title: 'Camion CI-912-XY en Transit vers Entrepôt San Pédro',
      message: 'L\'ordre de déplacement #TRF-2024-09 a été généré avec succès.',
      time: 'il y a 2h',
      read: true,
      type: 'info',
      icon: Truck,
      color: '#2563EB',
      bg: '#EFF6FF',
    },
    {
      id: 4,
      title: 'Rapport Bilan Mensuel Généré',
      message: 'Le rapport certifié d\'analyse de Mai 2024 est disponible au téléchargement.',
      time: 'Hier 16:30',
      read: true,
      type: 'info',
      icon: Sparkles,
      color: '#1a6b0a',
      bg: '#F0FDF4',
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Suivez les alertes de qualité, les arrivées de camions et les confirmations en temps réel.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          style={{
            padding: '10px 16px', backgroundColor: '#ffffff', color: '#1a6b0a',
            border: '1.5px solid #BBF7D0', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <Check size={16} /> Tout marquer comme lu
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              style={{
                backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 22px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', borderLeft: `4px solid ${n.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: n.bg, color: n.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>{n.title}</h3>
                    {!n.read && (
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#ffffff', backgroundColor: '#EF4444', padding: '2px 6px', borderRadius: '10px' }}>
                        NOUVEAU
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>{n.message}</p>
                </div>
              </div>

              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', whiteSpace: 'nowrap' }}>{n.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
