"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { useUserProfile, initialesDe } from '@/lib/useUserProfile';
import {
  LayoutDashboard,
  Microscope,
  FileBarChart,
  History,
  Users,
  Settings,
  Search,
  Bell,
  Sparkles
} from 'lucide-react';

export default function CooperativeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const profile = useUserProfile();

  const navItems = [
    { label: 'Dashboard', href: '/cooperative/dashboard', icon: LayoutDashboard },
    { label: 'Suivi des lots', href: '/cooperative/analysis', icon: Microscope },
    { label: 'Rapports', href: '/cooperative/reports', icon: FileBarChart },
    { label: 'Historique des lots', href: '/cooperative/history', icon: History },
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f4f6f5',
      color: '#0F172A',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      {/* ── SIDEBAR COOPÉRATIVE ── */}
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
          {/* Brand Logo */}
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
              <span>ESPACE COOPÉRATIVE</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/cooperative/dashboard' && pathname?.startsWith(item.href));

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
                    fontSize: '13px',
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

        {/* Bottom Profile & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/cooperative/settings"
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
            <span>Paramètres Coopérative</span>
          </Link>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1a6b0a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(26, 107, 10, 0.25)',
            }}>
              {initialesDe(profile?.nom_complet)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{profile?.nom_complet || 'Chargement…'}</span>
              <span style={{ fontSize: '10.5px', color: '#1a6b0a', fontWeight: 700 }}>Gestionnaire Terrain</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={{
        marginLeft: '240px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Top Bar */}
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            padding: '9px 16px',
            width: '360px',
          }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Rechercher un agent, lot ou producteur..."
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/cooperative/notifications" style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px', display: 'inline-flex' }}>
              <Bell size={19} color="#64748B" />
              <span style={{
                position: 'absolute', top: 5, right: 5, width: 8, height: 8,
                backgroundColor: '#EF4444', borderRadius: '50%',
              }} />
            </Link>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/usineur/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
                Vue Usineur →
              </Link>
              <Link href="/exportateur/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', backgroundColor: '#ECFDF5', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
                Vue Exportateur →
              </Link>
              <Link href="/entrepot/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', backgroundColor: '#e0e7ff', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
                Vue Entrepôt →
              </Link>
            </div>
          </div>
        </header>

        <main style={{ padding: '32px 36px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
