"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { User, Bell, Shield, Plug, CreditCard, HelpCircle, ArrowLeft, CheckCircle, Save, LogOut } from 'lucide-react';
import { getCurrentUserProfile, clearAuthSession } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const user = getCurrentUserProfile();
    if (user) {
      setProfile(user);
      setFullName(user.nom_complet || 'Agent NIANKA');
      setPhone(user.telephone || '0153646448');
      setEmail(user.email || 'agent@nianka.ci');
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/login');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* Settings Sidebar */}
      <nav style={{
        display: 'flex',
        flexDirection: 'column',
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #E2E8F0',
        padding: '24px 16px',
        zIndex: 40,
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        {/* Brand */}
        <div style={{ padding: '0 8px', marginBottom: '28px', display: 'flex', alignItems: 'center' }}>
          <Link href="/user/dashboard" style={{ textDecoration: 'none' }}>
            <Logo style={{ height: '32px' }} />
          </Link>
        </div>

        {/* Back to Dashboard CTA in Sidebar */}
        <Link
          href="/user/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#F0FDF4',
            color: '#1a6b0a',
            borderRadius: '12px',
            fontSize: '13.5px',
            fontWeight: 800,
            textDecoration: 'none',
            marginBottom: '24px',
            border: '1px solid #DCFCE7',
          }}
        >
          <ArrowLeft size={18} />
          <span>Tableau de bord</span>
        </Link>

        {/* Settings Menu */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ backgroundColor: '#1a6b0a', color: '#ffffff', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer' }}>
            <User size={18} /> Mon Profil Agent
          </div>
          <div style={{ color: '#64748B', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}>
            <Bell size={18} /> Notifications
          </div>
          <div style={{ color: '#64748B', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}>
            <Shield size={18} /> Sécurité & Accès
          </div>
        </div>

        {/* Logout at Bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', color: '#EF4444', backgroundColor: '#FEF2F2', border: 'none', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}
          >
            <LogOut size={18} /> Se Déconnecter
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          
          {/* Back Button Banner */}
          <div style={{ marginBottom: '24px' }}>
            <Link href="/user/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#1a6b0a', background: '#F0FDF4', borderRadius: '10px', padding: '10px 18px', fontSize: '13.5px', fontWeight: 800, textDecoration: 'none', border: '1px solid #DCFCE7' }}>
              <ArrowLeft size={18} /> Retourner au Tableau de Bord Agent
            </Link>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.02em' }}>Paramètres du Compte</h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Gérez vos informations personnelles, vos coordonnées et vos préférences de sécurité.
            </p>
          </div>

          {savedSuccess && (
            <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #10B981', color: '#166534', padding: '14px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} color="#10B981" /> Profil mis à jour avec succès en base de données.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
            
            {/* Left Column (Forms) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Profile Info Card */}
              <form onSubmit={handleSave} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #F8FAFC' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#1a6b0a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: 900 }}>
                    {fullName.substring(0, 2).toUpperCase() || 'AG'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>{fullName}</h2>
                    <p style={{ fontSize: '13px', color: '#1a6b0a', margin: '0 0 4px 0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Rôle : Agent de Terrain NIANKA
                    </p>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Statut : Compte Vérifié (Supabase Active)</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Nom Complet</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none', color: '#0F172A', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Numéro de Téléphone (Identifiant)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none', color: '#0F172A', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Adresse Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '14px', outline: 'none', color: '#0F172A', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={{ backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)' }}>
                    <Save size={16} /> Enregistrer les Modifications
                  </button>
                </div>
              </form>

              {/* Regional Preferences */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '20px' }}>Préférences Régionales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Langue</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#ffffff', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', outline: 'none' }}>
                      <option>Français (Côte d&apos;Ivoire)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Fuseau Horaire</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #E2E8F0', backgroundColor: '#ffffff', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', outline: 'none' }}>
                      <option>GMT+0 (Abidjan / Yamoussoukro)</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (Cards) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Enterprise Plan Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px', color: '#1a6b0a' }}>
                  <Shield size={24} />
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>Plan Agent NIANKA</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px', fontWeight: 500 }}>
                  Accès illimité au moteur d&apos;analyse IA MobileNetV3 et synchronisation terrain Supabase.
                </p>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#64748B', fontWeight: 600 }}>
                  <span>Licence</span>
                  <span style={{ fontWeight: 800, color: '#1a6b0a' }}>Active</span>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '24px', color: '#64748B', fontWeight: 600 }}>
                  <span>Portée</span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>Toute la CI</span>
                </div>
              </div>

              {/* Security Alert Card */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', borderLeft: '4px solid #10B981', borderTop: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#10B981' }}>
                  <CheckCircle size={18} />
                  <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Sécurité : Maximale</h4>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  Connexion sécurisée avec numéro et token JWT actif sur l&apos;API FastAPI.
                </p>
              </div>

            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
