"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import {
  Building,
  Search,
  Sparkles,
} from 'lucide-react';

export default function InstitutionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f4f6f5',
      color: '#0F172A',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      {/* ── SIDEBAR INSTITUTION / MINISTÈRE ── */}
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
              <span>MINISTÈRE &amp; REGULATEUR</span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link
              href="/institution/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                backgroundColor: '#1a6b0a',
                boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
                textDecoration: 'none',
              }}
            >
              <Building size={18} color="#ffffff" />
              <span>Observatoire National</span>
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
              IN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>Conseil Coton-Anacarde</span>
              <span style={{ fontSize: '10.5px', color: '#1a6b0a', fontWeight: 700 }}>Régulateur National</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
            display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '9px 16px', width: '360px',
          }}>
            <Search size={16} color="#94A3B8" />
            <input type="text" placeholder="Rechercher une région, coopérative..." style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', color: '#0F172A', fontWeight: 500, width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href="/cooperative/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
              Coopérative →
            </Link>
            <Link href="/usineur/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
              Usineur →
            </Link>
            <Link href="/exportateur/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
              Exportateur →
            </Link>
            <Link href="/entrepot/dashboard" style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
              Entrepôt →
            </Link>
          </div>
        </header>

        <main style={{ padding: '32px 36px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
