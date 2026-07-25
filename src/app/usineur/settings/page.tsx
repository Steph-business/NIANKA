"use client";

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function UsineurSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    usineName: 'Usineur San Pédro Transformation',
    capacity: '1,200 Tonnes / an',
    minKor: '48.0 lbs',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
          Définissez vos critères d&apos;achat KOR minimums et votre capacité d&apos;usinage local.
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '14px 20px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
          borderRadius: '12px', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 800, fontSize: '13.5px',
        }}>
          <CheckCircle2 size={18} />
          <span>Paramètres Usineur enregistrés !</span>
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
          style={{
            padding: '14px 28px', backgroundColor: '#1a6b0a', color: '#ffffff',
            border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start',
            boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
          }}
        >
          <Save size={18} /> Enregistrer
        </button>
      </form>
    </div>
  );
}
