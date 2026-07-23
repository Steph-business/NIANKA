"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { User, Bell, Shield, Plug, CreditCard, HelpCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface)' }}>
      
      {/* Settings Sidebar */}
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
        <div style={{ padding: '0 var(--space-sm)', marginBottom: 'var(--space-xl)', display: 'flex', alignItems: 'center', height: '40px', cursor: 'pointer' }}>
          <Link href="/user/dashboard" style={{ textDecoration: 'none' }}>
            <Logo style={{ height: '32px' }} />
          </Link>
        </div>

        {/* Settings Menu */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ backgroundColor: 'rgba(0, 105, 71, 0.1)', color: 'var(--color-primary)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex' }}><User size={18} /></span> Profile Settings
          </div>
          <div className="nav-item" style={{ color: 'var(--color-on-surface-variant)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex' }}><Bell size={18} /></span> Notifications
          </div>
          <div className="nav-item" style={{ color: 'var(--color-on-surface-variant)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex' }}><Shield size={18} /></span> Security & Privacy
          </div>
          <div className="nav-item" style={{ color: 'var(--color-on-surface-variant)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex' }}><Plug size={18} /></span> API Access
          </div>
          <div className="nav-item" style={{ color: 'var(--color-on-surface-variant)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex' }}><CreditCard size={18} /></span> Subscription
          </div>
        </div>

        {/* Support at Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)' }}>
          <div className="nav-item" style={{ color: 'var(--color-on-surface-variant)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <span style={{ display: 'flex' }}><HelpCircle size={18} /></span> Support
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '256px', padding: '40px 64px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Back Button */}
          <Link href="/user/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-on-surface-variant)', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600, padding: 0, marginBottom: '24px', textDecoration: 'none' }}>
            <ArrowLeft size={18} /> Retour au Dashboard
          </Link>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '8px' }}>Profile Settings</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
              Manage your personal information, security preferences, and subscription details.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            {/* Left Column (Forms) */}
            <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Profile Info Card */}
              <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-outline-variant)' }}>
                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                  <img src="https://i.pravatar.cc/150?u=elena" alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 4px 0' }}>Dr. Elena Rostova</h2>
                    <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', margin: '0 0 12px 0' }}>Lead Food Safety Analyst</p>
                    <button className="btn-hover" style={{ backgroundColor: 'transparent', border: '1px solid var(--color-outline-variant)', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--color-on-surface)' }}>
                      Update Avatar
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>First Name</label>
                    <input type="text" defaultValue="Elena" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: '14px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Last Name</label>
                    <input type="text" defaultValue="Rostova" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: '14px', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Email Address</label>
                  <input type="email" defaultValue="elena.rostova@nianka.health" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: '14px', outline: 'none' }} />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Phone Number (Optional)</label>
                  <input type="tel" defaultValue="+1 (555) 019-2834" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: '14px', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn-hover" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: '6px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Regional Preferences */}
              <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-outline-variant)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '24px' }}>Regional Preferences</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Language</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: '14px', outline: 'none', appearance: 'none' }}>
                      <option>English (United States)</option>
                      <option>Français (France)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Timezone</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: '14px', outline: 'none', appearance: 'none' }}>
                      <option>Pacific Time (PT)</option>
                      <option>Central European Time (CET)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Cards) */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Enterprise Plan Card */}
              <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-primary)' }}>
                  <Shield size={24} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>Enterprise Plan</h3>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', lineHeight: 1.5, marginBottom: '32px' }}>
                  You are currently on the Enterprise precision tier, providing unlimited AI analysis.
                </p>
                
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px', color: 'var(--color-on-surface-variant)' }}>
                  <span>Billing Cycle</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>Annually</span>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '32px', color: 'var(--color-on-surface-variant)' }}>
                  <span>Next Payment</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>Oct 15, 2024</span>
                </div>

                <button className="btn-hover" style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid var(--color-outline-variant)', borderRadius: '6px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'var(--color-on-surface)' }}>
                  Manage Billing & Invoices
                </button>
              </div>

              {/* Security Alert Card */}
              <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                  <CheckCircle size={18} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0 }}>Security Status: High</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
                  2FA is enabled. Last login was from Seattle, WA (IP: 192.168.1.48) 2 hours ago.
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
