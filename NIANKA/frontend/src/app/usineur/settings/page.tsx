"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, getCurrentUserProfile } from '@/lib/api';

const PREFS_KEY = 'nianka_prefs_usineur';

export default function UsineurSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    usineName: '',
    minKor: '48.0 lbs',
  });

  useEffect(() => {
    const profile = getCurrentUserProfile();
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PREFS_KEY) : null;
    const prefs = raw ? JSON.parse(raw) : {};
    setForm(f => ({
      ...f,
      usineName: profile?.nom_complet || '',
      minKor: prefs.minKor || '48.0 lbs',
    }));
  }, []);

  /** Le nom est réellement persisté en base (PUT /auth/me). Le seuil KOR
   * minimum d'achat n'a pas d'équivalent côté serveur — le filtre affiché sur
   * le tableau de bord usinier est un filtre d'affichage local, pas une règle
   * d'achat appliquée serveur — il est donc sauvegardé localement. */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.auth.updateProfile({ nom_complet: form.usineName });
      if (typeof window !== 'undefined') {
        localStorage.setItem(PREFS_KEY, JSON.stringify({ minKor: form.minKor }));
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
            Paramètres Usineur &amp; Acheteur
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Nom d&apos;usine et seuil KOR minimum indicatif pour le filtre du tableau de bord.
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '14px 20px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
          borderRadius: '12px', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 800, fontSize: '13.5px',
        }}>
          <CheckCircle2 size={18} />
          <span>Nom enregistré en base ; seuil KOR enregistré sur cet appareil.</span>
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
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            CRITÈRES D&apos;ACHAT INDUSTRIEL
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Nom de l&apos;Usine</label>
              <input
                type="text"
                value={form.usineName}
                onChange={e => setForm({ ...form, usineName: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Seuil KOR Minimum d&apos;Achat</label>
              <select
                value={form.minKor}
                onChange={e => setForm({ ...form, minKor: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              >
                <option value="48.0 lbs">48.0 lbs (Tolérance Décorticage Standard)</option>
                <option value="50.0 lbs">50.0 lbs (Standard Supérieur)</option>
                <option value="52.0 lbs">52.0 lbs (Haut Rendement)</option>
              </select>
            </div>
          </div>
        </div>

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
          <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
