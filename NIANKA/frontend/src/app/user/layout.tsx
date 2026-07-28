"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { api, NotificationItem } from '@/lib/api';
import { useUserProfile, initialesDe } from '@/lib/useUserProfile';
import {
  LayoutDashboard,
  Microscope,
  History,
  Plus,
  Settings,
  HelpCircle,
  Search,
  Bell,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useUserProfile();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const fetchNotifs = async () => {
    const data = await api.notifications.list().catch(() => [] as NotificationItem[]);
    setNotifications(data);
    // L'API expose le champ « lu » (et non « est_lue ») : compter correctement
    // évite un badge bloqué en permanence sur le total.
    setUnreadCount(data.filter(n => !n.lu).length);
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Tableau de bord', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Nouvelle Analyse', href: '/user/analysis', icon: Microscope },
    { label: 'Historique', href: '/user/history', icon: History },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f4f6f5',
      color: '#0F172A',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        width: '240px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '28px 20px',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 40,
        boxShadow: '4px 0 24px rgba(0,0,0,0.03)',
      }}>
        <div>
          {/* Brand & Subtitle */}
          <div style={{ padding: '0 4px', marginBottom: '32px' }}>
            <Logo style={{ height: '34px' }} />
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '10px',
              padding: '3px 8px',
              borderRadius: '20px',
              backgroundColor: '#F0FDF4',
              color: '#1a6b0a',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}>
              <Sparkles size={11} color="#40BB1B" />
              <span>ESPACE AGENT</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/user/analysis' && pathname?.startsWith('/user/analysis'));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#ffffff' : '#64748B',
                    backgroundColor: isActive ? '#1a6b0a' : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(26, 107, 10, 0.25)' : 'none',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={18} color={isActive ? '#ffffff' : '#64748B'} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Link
            href="/user/analysis"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '13px',
              backgroundColor: '#40BB1B',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '13.5px',
              fontWeight: 800,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(64, 187, 27, 0.3)',
              transition: 'transform 0.15s, background-color 0.2s',
            }}
          >
            <Plus size={18} strokeWidth={3} />
            <span>Nouveau Lot</span>
          </Link>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '12px' }}>
            <Link
              href="/user/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#64748B',
                textDecoration: 'none',
                borderRadius: '8px',
              }}
            >
              <Settings size={16} />
              <span>Paramètres</span>
            </Link>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#64748B',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '8px',
                textAlign: 'left',
              }}
            >
              <HelpCircle size={16} />
              <span>Support & Aide</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN LAYOUT AREA ── */}
      <div style={{
        marginLeft: '240px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Top Header Bar */}
        <header style={{
          height: '70px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 2px 16px rgba(0,0,0,0.02)',
        }}>
          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '9px 16px',
            width: '340px',
          }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Rechercher un lot, producteur..."
              style={{
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '13px',
                color: '#0F172A',
                fontWeight: 500,
                width: '100%',
              }}
            />
          </div>

          {/* User profile & actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                if (unreadCount > 0) {
                  setUnreadCount(0);
                  api.notifications.markAllRead().catch(() => null);
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px' }}
              title="Notifications"
            >
              <Bell size={19} color="#64748B" />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  minWidth: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: '#EF4444', color: '#ffffff',
                  fontSize: '10px', fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div style={{
                position: 'absolute', top: '48px', right: '120px', width: '380px',
                backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.18)',
                border: '1px solid #E2E8F0', zIndex: 1000, overflow: 'hidden'
              }}>
                <div style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} color="#1a6b0a" />
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>Notifications NIANKA</span>
                  </div>
                  <button
                    onClick={() => { setNotifications(notifications.map(n => ({ ...n, lu: true }))); setUnreadCount(0); }}
                    style={{ fontSize: '11px', color: '#1a6b0a', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Tout marquer lu
                  </button>
                </div>

                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedNotif(item);
                        setShowNotifModal(true);
                        setShowNotifs(false);
                      }}
                      style={{
                        padding: '12px 16px', borderBottom: idx < notifications.length - 1 ? '1px solid #F8FAFC' : 'none',
                        backgroundColor: item.lu ? '#ffffff' : '#F0FDF4', transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      <p style={{ fontSize: '12.5px', color: '#0F172A', margin: '0 0 4px 0', fontWeight: item.lu ? 500 : 700, lineHeight: 1.4 }}>
                        {item.contenu}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>
                          {item.cree_le ? new Date(item.cree_le).toLocaleString('fr-FR') : 'À l\'instant'}
                        </span>
                        <span style={{ fontSize: '10.5px', color: '#1a6b0a', fontWeight: 800 }}>
                          Voir le produit 👁️
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={fetchNotifs} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }} title="Rafraîchir">
              <RefreshCw size={18} color="#64748B" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#1a6b0a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(26, 107, 10, 0.25)',
              }}>
                {initialesDe(profile?.nom_complet)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{profile?.nom_complet || 'Chargement…'}</span>
                <span style={{ fontSize: '11px', color: '#1a6b0a', fontWeight: 700 }}>Agent de Terrain</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ padding: '32px 36px', flex: 1 }}>
          {children}
        </main>
      </div>

      {showNotifModal && selectedNotif && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '28px 32px', borderRadius: '24px',
            maxWidth: '520px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '12px' }}>
                  ● NOTIFICATION & FICHES DÉTAILS PRODUIT
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: '6px 0 0 0' }}>
                  Détails du Lot Notifié
                </h2>
              </div>
              <button onClick={() => setShowNotifModal(false)} style={{ border: 'none', background: '#F1F5F9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="#64748B" />
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', marginBottom: '4px' }}>MESSAGE DE LA NOTIFICATION</div>
              <p style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.4 }}>
                {selectedNotif.contenu}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>GRADE QUALITÉ IA</div>
                <div style={{
                  fontSize: '13px', fontWeight: 900,
                  color: (selectedNotif.scan?.grade_ia || selectedNotif.contenu).includes('Rejeté') ? '#DC2626' : (selectedNotif.scan?.grade_ia || selectedNotif.contenu).includes('Grade B') ? '#EA580C' : (selectedNotif.scan?.grade_ia || selectedNotif.contenu).includes('Grade C') ? '#CA8A04' : '#166534',
                  backgroundColor: (selectedNotif.scan?.grade_ia || selectedNotif.contenu).includes('Rejeté') ? '#FEF2F2' : (selectedNotif.scan?.grade_ia || selectedNotif.contenu).includes('Grade B') ? '#FFEDD5' : (selectedNotif.scan?.grade_ia || selectedNotif.contenu).includes('Grade C') ? '#FEF9C3' : '#F0FDF4',
                  padding: '3px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '2px'
                }}>
                  {selectedNotif.scan?.grade_ia || (selectedNotif.contenu.includes('Grade C') ? 'Grade C' : selectedNotif.contenu.includes('Grade B') ? 'Grade B' : selectedNotif.contenu.includes('Rejeté') ? 'Rejeté' : 'Grade A')}
                </div>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8' }}>RENDEMENT KOR</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {selectedNotif.scan?.score_kor != null ? `${selectedNotif.scan.score_kor} lbs` : '—'}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', marginBottom: '6px' }}>PHOTO ÉCHANTILLON REÇUE</div>
              <img
                src={selectedNotif.scan?.image_url || '/images/anacarde.png'}
                alt="Échantillon Notifié"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/anacarde.png'; }}
                style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                {selectedNotif.cree_le ? new Date(selectedNotif.cree_le).toLocaleString('fr-FR') : 'À l\'instant'}
              </span>
              <button
                onClick={() => setShowNotifModal(false)}
                style={{ padding: '8px 18px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '12.5px', fontWeight: 800, cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
