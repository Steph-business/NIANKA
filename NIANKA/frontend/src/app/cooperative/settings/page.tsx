"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, getCurrentUserProfile } from '@/lib/api';

const PREFS_KEY = 'nianka_prefs_cooperative';

export default function CooperativeSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    coopName: '',
    zone: '',
    thresholdMoisture: '7.5%',
    minKorGradeA: '52.0 lbs',
  });

  useEffect(() => {
    const profile = getCurrentUserProfile();
    const prefs = typeof window !== 'undefined' ? localStorage.getItem(PREFS_KEY) : null;
    const saved = prefs ? JSON.parse(prefs) : {};
    setForm(f => ({
      ...f,
      coopName: profile?.nom_complet || '',
      zone: saved.zone || '',
      thresholdMoisture: saved.thresholdMoisture || '7.5%',
      minKorGradeA: saved.minKorGradeA || '52.0 lbs',
    }));
  }, []);

  /** Le nom est réellement persisté en base (PUT /auth/me). Les seuils
   * qualité n'ont pas d'équivalent côté serveur — l'arbitrage applique un
   * seuil fixe (1,5 lbs d'écart KOR) indépendant de ces préférences
   * d'affichage ; elles sont donc sauvegardées localement, pas en base. */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.auth.updateProfile({ nom_complet: form.coopName });
      if (typeof window !== 'undefined') {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
          zone: form.zone, thresholdMoisture: form.thresholdMoisture, minKorGradeA: form.minKorGradeA,
        }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
            <Settings size={22} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Paramètres de la Coopérative
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Personnalisez la configuration de votre coopérative, vos seuils d&apos;alertes qualité et vos notifications.
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '14px 20px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
          borderRadius: '12px', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 800, fontSize: '13.5px',
        }}>
          <CheckCircle2 size={18} />
          <span>Nom enregistré en base ; préférences de seuils enregistrées sur cet appareil.</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 20px', backgroundColor: '#FEF2F2', color: '#991B1B',
          borderRadius: '12px', border: '1.5px solid #FCA5A5', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 700, fontSize: '13.5px',
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Card 1: Profil Coopérative */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            PROFIL &amp; IDENTIFICATION COOPÉRATIVE
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Nom de la Coopérative</label>
              <input
                type="text"
                value={form.coopName}
                onChange={e => setForm({ ...form, coopName: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Zone Principal de Collecte</label>
              <input
                type="text"
                value={form.zone}
                onChange={e => setForm({ ...form, zone: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Seuils d'Alertes Qualité IA */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px 0' }}>
              SEUILS QUALITÉ ET CONTRÔLE IA
            </h2>
            <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>
              Préférences d&apos;affichage locales : l&apos;arbitrage réel applique un seuil fixe de 1,5 lbs d&apos;écart KOR, indépendant de ces valeurs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Seuil Maximal Humidité (Alerte)</label>
              <select
                value={form.thresholdMoisture}
                onChange={e => setForm({ ...form, thresholdMoisture: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              >
                <option value="7.0%">7.0% (Très Strict)</option>
                <option value="7.5%">7.5% (Standard National)</option>
                <option value="8.0%">8.0% (Tolérance Maximale)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Rendement (KOR) Minimum Grade A</label>
              <select
                value={form.minKorGradeA}
                onChange={e => setForm({ ...form, minKorGradeA: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              >
                <option value="50.0 lbs">50.0 lbs</option>
                <option value="52.0 lbs">52.0 lbs (Standard Premium)</option>
                <option value="54.0 lbs">54.0 lbs (Export Haute Qualité)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '14px 28px', backgroundColor: '#1a6b0a', color: '#ffffff',
            border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}
        >
          <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer les Paramètres'}
        </button>
      </form>
    </div>
  );
}
