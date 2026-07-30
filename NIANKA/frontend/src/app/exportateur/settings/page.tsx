"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api, getCurrentUserProfile } from '@/lib/api';

const PREFS_KEY = 'nianka_prefs_exportateur';

export default function ExportateurSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    port: "Port Autonome d'Abidjan",
  });

  useEffect(() => {
    const profile = getCurrentUserProfile();
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PREFS_KEY) : null;
    const prefs = raw ? JSON.parse(raw) : {};
    setForm(f => ({
      ...f,
      companyName: profile?.nom_complet || '',
      port: prefs.port || "Port Autonome d'Abidjan",
    }));
  }, []);

  /** La raison sociale est réellement persistée en base (PUT /auth/me). Le
   * port d'embarquement n'a pas d'équivalent côté serveur il est donc
   * sauvegardé localement. */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.auth.updateProfile({ nom_complet: form.companyName });
      if (typeof window !== 'undefined') {
        localStorage.setItem(PREFS_KEY, JSON.stringify({ port: form.port }));
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
            Paramètres Exportateur International
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Raison sociale et port d&apos;embarquement principal.
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '14px 20px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
          borderRadius: '12px', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 800, fontSize: '13.5px',
        }}>
          <CheckCircle2 size={18} />
          <span>Raison sociale enregistrée en base ; port enregistré sur cet appareil.</span>
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
            CERTIFICATION ET LOGISTIQUE MARITIME
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Raison Sociale</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Port d&apos;Embarquement Principal</label>
              <select
                value={form.port}
                onChange={e => setForm({ ...form, port: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none' }}
              >
                <option value="Port Autonome d'Abidjan">Port Autonome d&apos;Abidjan</option>
                <option value="Port Autonome de San Pédro">Port Autonome de San Pédro</option>
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
