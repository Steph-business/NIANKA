"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, Shield, FileCheck, FlaskConical, Building2, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import styles from './page.module.css';
import { api, UserProfile } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('mode') === 'register') {
        setMode('register');
      }
    }
  }, []);

  // Login state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    organisation: '',
    cooperativeId: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<'agent' | 'cooperative' | 'entrepot' | 'usineur' | 'exportateur' | 'institution'>('cooperative');
  const [cooperatives, setCooperatives] = useState<UserProfile[]>([]);

  // Annuaire des coopératives : un agent doit désigner celle qui recevra ses scans.
  React.useEffect(() => {
    if (mode !== 'register' || role !== 'agent' || cooperatives.length > 0) return;
    api.auth.listEntites('cooperative')
      .then(setCooperatives)
      .catch(() => setCooperatives([]));
  }, [mode, role, cooperatives.length]);

  const handleChange = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  /**
   * Oriente vers le portail correspondant au rôle.
   *
   * Le backend normalise les rôles (« usineur » devient « usine »,
   * « institution » devient « admin ») : les deux graphies sont acceptées ici
   * pour qu'aucun utilisateur ne retombe sur le tableau de bord par défaut.
   */
  const redirectByRole = (userRole: string) => {
    const destinations: Record<string, string> = {
      agent: '/user/analysis',
      cooperative: '/cooperative/dashboard',
      entrepot: '/entrepot/dashboard',
      usine: '/usineur/dashboard',
      usineur: '/usineur/dashboard',
      exportateur: '/exportateur/dashboard',
      exporteur: '/exportateur/dashboard',
      acheteur: '/exportateur/dashboard',
      admin: '/institution/dashboard',
      institution: '/institution/dashboard',
    };

    const cleanRole = (userRole || '').toLowerCase().trim();
    router.push(destinations[cleanRole] ?? '/cooperative/dashboard');
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

        if (role === 'agent' && !form.cooperativeId) {
          setErrorMessage(
            cooperatives.length === 0
              ? "Aucune coopérative n'est encore inscrite. Créez d'abord un compte Coopérative."
              : 'Sélectionnez la coopérative à laquelle vous êtes rattaché.'
          );
          setLoading(false);
          return;
        }

        const res = await api.auth.register({
          nom_complet: form.fullName || 'Utilisateur NIANKA',
          telephone: targetPhone,
          role: role,
          mot_de_passe: targetPassword,
          organisation: form.organisation,
          cooperative_id: role === 'agent' ? form.cooperativeId : undefined,
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

  const handleGoogleLogin = () => {
    // Placeholder for Google Sign-In logic
    console.log("Tentative de connexion avec Google...");
    setErrorMessage("La connexion Google n'est pas encore implémentée.");
  };

  return (
    <div className={styles.pageWrapper}>
      {/* ── LEFT PANEL: Hero Visual & Branding (Web Split Screen) ── */}
      <div className={`${styles.leftPanel} hidden-mobile`}>
        {/* Background Image */}
        <div className={styles.bgImage} />

        {/* Gradient Overlay */}
        <div className={styles.gradientOverlay} />

        {/* Content over background */}
        <div className={styles.leftContent}>
          <Logo style={{ height: '48px' }} />
          <p className={styles.logoSubtitle}>
            Technologie Agroalimentaire par IA
          </p>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Sparkles size={16} color="#40BB1B" />
            <span>Plateforme d&apos;Analyse de Qualité Agricole</span>
          </div>

          <h2 className={styles.heroTitle}>
            Optimisez vos contrôles avec l&apos;Intelligence Artificielle
          </h2>

          <p className={styles.heroText}>
            Anacarde, Cacao, Mangue et plus encore. Obtenez des résultats certifiés et traçables en quelques secondes.
          </p>

          <div className={styles.featureList}>
            {[
              'Analyse automatisée du grainage et du taux de défauts',
              'Rapports de conformité conformes aux normes internationales',
              'Accès direct aux données de traçabilité pour coopératives et usineurs',
            ].map((text, idx) => (
              <div key={idx} className={styles.featureItem}>
                <CheckCircle2 size={18} color="#40BB1B" style={{ flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footerText}>
          © {new Date().getFullYear()} NIANKA AI — Tous droits réservés.
        </div>
      </div>

      {/* ── RIGHT PANEL: Form Container ── */}
      <div className={styles.rightPanel}>
        {/* Top Header */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            <Logo style={{ height: '38px' }} />
          </div>

          <h1 className={styles.formHeader}>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h1>
          <p className={styles.formSubtitle}>
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre espace d\'analyse.'
              : 'Rejoignez la plateforme NIANKA en quelques instants.'
            }
          </p>
        </div>

        {/* Form Content */}
        <div className={styles.formWrapper}>
          {errorMessage && (
            <div className={styles.errorMessage}>
              <AlertTriangle size={18} color="#DC2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ═══ LOGIN MODE ═══ */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Numéro de téléphone</label>
                <div className={styles.inputBox}>
                  <Phone size={16} color="#94a3b8" strokeWidth={2} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+225 00 00 00 00 00"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Mot de passe</label>
                <div className={styles.inputBox}>
                  <Lock size={16} color="#94a3b8" strokeWidth={2} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={styles.input}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.passwordToggle}
                  >
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
              </div>

              <div className={styles.formActions}>
                <label className={styles.rememberMe}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Se souvenir de moi
                </label>
                <Link href="#" className={styles.forgotPasswordLink}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? 'Connexion en cours...' : <>Se connecter <ArrowRight size={16} /></>}
              </button>

              <div className={styles.separator}>OU</div>

              <button type="button" onClick={handleGoogleLogin} className={styles.googleButton}>
                <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
                Se connecter avec Google
              </button>

              <div className={styles.switchModeText}>
                Vous n&apos;avez pas encore de compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={styles.switchModeButton}
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
                <label className={styles.inputLabel}>Sélectionnez votre rôle / profil NIANKA</label>
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
                  <label className={styles.inputLabel}>Nom complet</label>
                  <div className={styles.inputBox}>
                    <User size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      placeholder="Jean Konan"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.inputLabel}>Téléphone</label>
                  <div className={styles.inputBox}>
                    <Phone size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => handleChange('phone', e.target.value)}
                      placeholder="+225 00 00 00 00"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {role === 'agent' ? (
                <div>
                  <label className={styles.inputLabel}>
                    Coopérative de rattachement <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div className={styles.inputBox}>
                    <Building2 size={16} color="#1a6b0a" strokeWidth={2} />
                    <select
                      value={form.cooperativeId}
                      onChange={e => handleChange('cooperativeId', e.target.value)}
                      className={styles.input} style={{ appearance: 'none', cursor: 'pointer' }}
                      required
                    >
                      {cooperatives.length === 0 ? (
                        <option value="">Aucune coopérative inscrite — créez-en une d&apos;abord</option>
                      ) : (
                        <>
                          <option value="">Sélectionnez votre coopérative</option>
                          {cooperatives.map(c => (
                            <option key={c.id} value={c.id}>{c.nom_complet}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '5px 0 0 2px', fontWeight: 500 }}>
                    Vos scans terrain remonteront automatiquement vers cette coopérative.
                  </p>
                </div>
              ) : (
                <div>
                  <label className={styles.inputLabel}>Organisation / Structure</label>
                  <div className={styles.inputBox}>
                    <Building2 size={16} color="#1a6b0a" strokeWidth={2} />
                    <input
                      type="text"
                      value={form.organisation}
                      onChange={e => handleChange('organisation', e.target.value)}
                      placeholder="Nom de votre structure"
                      className={styles.input}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className={styles.inputLabel}>Mot de passe</label>
                  <div className={styles.inputBox}>
                    <Lock size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type={showRegPwd ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="••••••••"
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPwd(!showRegPwd)}
                      className={styles.passwordToggle}
                    >
                      {showRegPwd ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={styles.inputLabel}>Confirmation</label>
                  <div className={styles.inputBox}>
                    <Lock size={16} color="#94a3b8" strokeWidth={2} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={e => handleChange('confirmPassword', e.target.value)}
                      placeholder="••••••••"
                      className={styles.input}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className={styles.passwordToggle}>
                      {showConfirm ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Création en cours...' : <>Créer mon compte <ArrowRight size={16} /></>}
              </button>

              <div className={styles.switchModeText} style={{ marginTop: '8px' }}>
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={styles.switchModeButton}
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Trust Badges */}
        <div className={styles.trustBadges}>
          {[
            { icon: <Shield size={16} color="#64748B" />, label: 'Sécurisé' },
            { icon: <FileCheck size={16} color="#64748B" />, label: 'Conforme RGPD' },
            { icon: <FlaskConical size={16} color="#64748B" />, label: 'Certifié Lab' },
          ].map(({ icon, label }) => (
            <div key={label} className={styles.badgeItem}>
              {icon}
              <span>{label}</span>
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
