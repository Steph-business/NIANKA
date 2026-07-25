"use client";

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function EntrepotSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    entrepotName: 'Entrepôt Central Abidjan Port',
    location: 'Quai 4 — Zone Portuaire',
    capacity: '500 Tonnes',
    aiConfidenceMin: '95.0%',
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
            Paramètres de l&apos;Entrepôt Central
          </h1>
        </div>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Configuration du magasin, capacités de stockage et règles d&apos;arbitrage IA au déchargement.
        </p>
      </div>

      {saved && (
        <div style={{
          padding: '14px 20px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
          borderRadius: '12px', border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '10px',
          fontWeight: 800, fontSize: '13.5px',
        }}>
          <CheckCircle2 size={18} />
          <span>Paramètres enregistrés avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            PROFIL MAGASIN &amp; INFRASTRUCTURE LOGISTIQUE
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Nom de l&apos;Entrepôt</label>
              <input
                type="text"
                value={form.entrepotName}
                onChange={e => setForm({ ...form, entrepotName: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Capacité Maximale (Tonnes)</label>
              <input
                type="text"
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
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
