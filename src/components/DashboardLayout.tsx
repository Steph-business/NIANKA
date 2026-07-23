"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { LayoutDashboard, ScanLine, FileText, History, Plus, Settings, Bot } from 'lucide-react';
import { FloatingChatbot } from './FloatingChatbot';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'user' | 'admin';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const pathname = usePathname();

  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const userLinks = [
    { label: 'Dashboard', href: '/user/dashboard', icon: 'dashboard' },
    { label: 'Scanner', href: '/analysis', icon: 'document_scanner' },
    { label: 'Résultat', href: '/analysis/result', icon: 'receipt_long' },
    { label: 'Historique', href: '/user/history', icon: 'history' },
    { label: 'Assistant IA', href: '#chatbot', icon: 'chatbot' },
  ];

  const adminLinks = [
    { label: 'Tableau de bord', href: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Historique Global', href: '/admin/history', icon: 'history' },
    { label: 'Gestion Utilisateurs', href: '#', icon: 'group' },
    { label: 'Paramètres Système', href: '#', icon: 'settings' },
  ];

  const navLinks = userType === 'admin' ? adminLinks : userLinks;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        width: '256px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--color-surface-container-lowest)',
        borderRight: '1px solid rgba(188, 202, 192, 0.3)',
        padding: 'var(--space-lg) var(--space-sm)',
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Brand */}
        <div style={{ padding: '0 var(--space-sm)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', height: '40px' }}>
          <Logo style={{ height: '32px' }} />
        </div>

        {/* Main Navigation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const isChatbotLink = link.icon === 'chatbot';
            
            const handleChatbotClick = (e: React.MouseEvent) => {
              if (isChatbotLink) {
                e.preventDefault();
                setIsChatbotOpen(true);
              }
            };

            const LinkWrapper = isChatbotLink ? 'div' : Link;

            return (
              <LinkWrapper key={link.label} href={link.href} onClick={handleChatbotClick} style={{ textDecoration: 'none' }}>
                <div 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', 
                    fontWeight: isActive ? 700 : 500, 
                    cursor: 'pointer',
                    fontSize: '16px',
                    backgroundColor: isActive ? 'rgba(0, 105, 71, 0.1)' : 'transparent'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>
                    {link.icon === 'dashboard' && <LayoutDashboard size={20} />}
                    {link.icon === 'document_scanner' && <ScanLine size={20} />}
                    {link.icon === 'receipt_long' && <FileText size={20} />}
                    {link.icon === 'history' && <History size={20} />}
                    {link.icon === 'chatbot' && <Bot size={20} />}
                  </span>
                  {link.label}
                </div>
              </LinkWrapper>
            );
          })}
        </div>

        {/* New Analysis Button */}
        <div style={{ padding: '0 var(--space-sm)', marginTop: 'var(--space-md)' }}>
          <Link href="/analysis" className="btn-hover" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            padding: '12px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Plus size={18} /> New Analysis
          </Link>
        </div>

        {/* Footer Navigation */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-lg)', borderTop: '1px solid rgba(188, 202, 192, 0.3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Link href="/user/settings" style={{ textDecoration: 'none' }}>
            <div className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 16px', borderRadius: '8px', color: 'var(--color-on-surface-variant)', fontWeight: 500, cursor: 'pointer', fontSize: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}><Settings size={20} /></span> Paramètres
            </div>
          </Link>
          
          {/* User Profile Snippet */}
          <div style={{ marginTop: '24px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIJ919Tg4ZVeDf2Tq2bEOuiC0gKYmdSQV-_TUbX3UcMPQ5vuHJyloWbkPFibQ4j8VhkaCYglSsx3EZm8LmcIXRiF748MGtHRR5Cf1mqW1j1dZFIcCXLRr1ZNFmZHMOotNsRW9-vO5v8AjxFDrVz_wCFXskcKgbYfQRx_YO-P7geQGP3sD6kfCh0gEVCR1TSS7TeXMj6ItXlHDtWl0LqqT7HVx5SKUbkBMia6gHzJeeUTU-1HpCEZrFlwbq34659HO43zzH0RoCNX8" alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)', margin: 0 }}>Stéphane L.</p>
              <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-on-surface-variant)', margin: 0 }}>Lab Analyst</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '256px', padding: 'var(--space-xl)', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {children}
        </div>
      </main>

      {/* Floating Chatbot */}
      {userType === 'user' && <FloatingChatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />}
    </div>
  );
};
