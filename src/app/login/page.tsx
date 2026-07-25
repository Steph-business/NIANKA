"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, Shield, FileCheck, FlaskConical, Building2, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';

import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    organisation: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'agent' | 'cooperative' | 'entrepot' | 'usineur' | 'exportateur' | 'institution'>('cooperative');

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const redirectByRole = (userRole: string) => {
    const cleanRole = (userRole || 'cooperative').toLowerCase();
    switch (cleanRole) {
      case 'agent':
        router.push('/user/analysis');
        break;
      case 'cooperative':
        router.push('/cooperative/dashboard');
        break;
      case 'entrepot':
        router.push('/entrepot/dashboard');
        break;
      case 'usineur':
        router.push('/usineur/dashboard');
        break;
      case 'exportateur':
      case 'acheteur':
        router.push('/usineur/dashboard');
        break;
      case 'institution':
      case 'admin':
        router.push('/institution/dashboard');
        break;
      default:
        router.push('/cooperative/dashboard');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'login') {
        const targetPhone = phone.trim();
        const res = await api.auth.login(targetPhone, password);
        redirectByRole(res.user.role);
      } else {
        const targetPhone = (form.phone || phone).trim();
        const targetPassword = form.password || password;
        const targetConfirm = form.confirmPassword || password;

        if ((form.fullName || '').trim().length < 3) {
          setErrorMessage('Le nom complet doit comporter au moins 3 caractères.');
          setLoading(false);
          return;
        }

        if (targetPassword !== targetConfirm) {
          setErrorMessage('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        const res = await api.auth.register({
          nom_complet: form.fullName || 'Utilisateur NIANKA',
          telephone: targetPhone,
          role: role,
          mot_de_passe: targetPassword,
          organisation: form.organisation,
        });

        redirectByRole(res.user?.role || role);
      }
    } catch (err: any) {
      console.warn('Notice connexion/inscription backend:', err);
      setErrorMessage(err.message || 'Erreur lors du traitement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const inputBoxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1.5px solid #E2E8F0',
    borderRadius: '10px',
    padding: '10px 14px',
    backgroundColor: '#F8FAFC',
    transition: 'border-color 0.2s',
  } as React.CSSProperties;

  const inputStyle = {
    border: 'none',
    outline: 'none',
    flex: 1,
    fontSize: '14px',
    color: '#0F172A',
    fontWeight: 500,
    backgroundColor: 'transparent',
    width: '100%',
  } as React.CSSProperties;

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    color: '#334155',
    marginBottom: '5px',
  } as React.CSSProperties;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#ffffff',
      fontFamily: 'var(--font-inter), sans-serif',
    }}>
      {/* ── LEFT PANEL: Hero Visual & Branding (Web Split Screen) ── */}
      <div style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        color: '#ffffff',
        overflow: 'hidden',
      }} className="hidden-mobile">
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/inspection.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.65)',
          zIndex: 1,
        }} />

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(15,45,10,0.85) 0%, rgba(26,107,10,0.65) 50%, rgba(10,35,8,0.9) 100%)',
          zIndex: 2,
        }} />

        {/* Content over background */}
        <div style={{ position: 'relative', zIndex: 3 }}>
          <Logo style={{ height: '48px' }} />
          <p style={{
            fontSize: '12px',
            fontWeight: 800,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginTop: '8px',
          }}>
            Technologie Agroalimentaire par IA
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 3, maxWidth: '520px', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            <Sparkles size={16} color="#40BB1B" />
            <span>Plateforme d&apos;Analyse de Qualité Agricole</span>
          </div>

          <h2 style={{
            fontSize: '34px',
            fontWeight: 900,
            lineHeight: 1.25,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}>
            Optimisez vos contrôles avec l&apos;Intelligence Artificielle
          </h2>

          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}>
            Anacarde, Cacao, Mangue et plus encore. Obtenez des résultats certifiés et traçables en quelques secondes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Analyse automatisée du grainage et du taux de défauts',
              'Rapports de conformité conformes aux normes internationales',
              'Accès direct aux données de traçabilité pour coopératives et usineurs',
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#40BB1B" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 3, fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
          © {new Date().getFullYear()} NIANKA AI — Tous droits réservés.
        </div>
      </div>

      {/* ── RIGHT PANEL: Form Container ── */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '40px 48px',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
      }}>
        {/* Top Header */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Logo style={{ height: '38px' }} />
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre espace d\'analyse.'
              : 'Rejoignez la plateforme NIANKA en quelques instants.'
            }
          </p>
        </div>

        {/* Form Content */}
        <div style={{ margin: '24px 0' }}>
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertTriangle size={18} color="#DC2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ═══ LOGIN MODE ═══ */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelStyle}>Numéro de téléphone</label>
                <div style={inputBoxStyle}>
                  <Phone size={16} color="#94a3b8" strokeWidth={2} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+225 00 00 00 00 00"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Mot de passe</label>
                <div style={inputBoxStyle}>
                  <Lock size={16} color="#94a3b8" strokeWidth={2} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                <Link href="#" style={{ fontSize: '13px', fontWeight: 700, color: '#1a6b0a', textDecoration: 'none' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#94A3B8' : '#1a6b0a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '6px',
                }}
              >
                {loading ? 'Connexion en cours...' : <>Se connecter <ArrowRight size={16} /></>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                Vous n&apos;avez pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a6b0a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  S&apos;inscrire
                </button>
              </div>
            </form>
          )}

          {/* ═══ REGISTER MODE ═══ */}
          {mode === 'register' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Role selector */}
              <div>
                <label style={labelStyle}>Sélectionnez votre rôle / profil NIANKA</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { key: 'agent', label: 'Agent Terrain' },
                    { key: 'cooperative', label: 'Coopérative' },
                    { key: 'entrepot', label: 'Entrepôt' },
                    { key: 'usineur', label: 'Usineur' },
                    { key: 'exportateur', label: 'Exportateur' },
                    { key: 'institution', label: 'Institution' },
                  ].map(r => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRole(r.key as typeof role)}
                      style={{
                        padding: '9px 4px',
                        borderRadius: '8px',
                        border: role === r.key ? '1.5px solid #1a6b0a' : '1.5px solid #E2E8F0',
                        backgroundColor: role === r.key ? '#F0FDF4' : '#ffffff',
                        color: role === r.key ? '#1a6b0a' : '#475569',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'center',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid 2-columns on desktop for compact layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Nom complet</label>
                  <div style={inputBoxStyle}>
                    <User size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="Jean Konan"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Téléphone</label>
                  <div style={inputBoxStyle}>
                    <Phone size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+225 00 00 00 00"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Coopérative de Rattachement</label>
                <div style={inputBoxStyle}>
                  <Building2 size={16} color="#1a6b0a" strokeWidth={2} />
                  <select
                    value={form.organisation}
                    onChange={e => handleChange('organisation', e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', backgroundColor: 'transparent' }}
                  >
                    <option value="Coop. ANADER Bouaké">Coop. ANADER Bouaké</option>
                    <option value="Coop. Agricole Yamoussoukro">Coop. Agricole Yamoussoukro</option>
                    <option value="Coop. Anacarde Korhogo">Coop. Anacarde Korhogo</option>
                    <option value="Coop. Centrale San Pedro">Coop. Centrale San Pedro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Mot de passe</label>
                  <div style={inputBoxStyle}>
                    <Lock size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type={showRegPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      style={inputStyle}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPwd(!showRegPwd)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      {showRegPwd ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Confirmation</label>
                  <div style={inputBoxStyle}>
                    <Lock size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      style={inputStyle}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                      {showConfirm ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: loading ? '#94A3B8' : '#1a6b0a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  marginTop: '8px',
                }}
              >
                {loading ? 'Création en cours...' : <>Créer mon compte <ArrowRight size={16} /></>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#1a6b0a',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Trust Badges */}
        <div style={{
          borderTop: '1px solid #F1F5F9',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
          {[
            { icon: <Shield size={16} color="#64748B" />, label: 'Sécurisé' },
            { icon: <FileCheck size={16} color="#64748B" />, label: 'Conforme RGPD' },
            { icon: <FlaskConical size={16} color="#64748B" />, label: 'Certifié Lab' },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {icon}
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          .hidden-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
