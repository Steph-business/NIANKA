"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { 
  BarChart3, 
  Plus, 
  Search, 
  Clock, 
  Settings, 
  HelpCircle, 
  FileText,
  UploadCloud,
  Camera,
  FolderOpen,
  Zap,
  CheckCircle2,
  Brain,
  ShieldCheck,
  MapPin,
  Maximize2,
  LayoutGrid,
  Download,
  RefreshCw,
  Map as MapIcon
} from 'lucide-react';

export default function TerminalPage() {
  const [currentView, setCurrentView] = useState<'grid' | 'screen1' | 'screen2' | 'screen3' | 'screen4'>('grid');

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '60px' }}>
      
      {/* Top View Selector Bar */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#1e293b', borderBottom: '1.5px solid #334155', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/">
              <Logo style={{ height: '32px' }} />
            </Link>
            <div style={{ height: '24px', width: '1.5px', backgroundColor: '#475569' }} />
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#40BB1B', letterSpacing: '0.05em' }}>
              FIELD AGENT TERMINAL v2.4
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', padding: '6px', borderRadius: '14px', border: '1px solid #334155' }}>
            <button 
              onClick={() => setCurrentView('grid')} 
              style={{ 
                padding: '8px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: currentView === 'grid' ? '#006947' : 'transparent', 
                color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
              <LayoutGrid size={16} /> Vue 4 Écrans
            </button>

            <button 
              onClick={() => setCurrentView('screen1')} 
              style={{ 
                padding: '8px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: currentView === 'screen1' ? '#006947' : 'transparent', 
                color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
              }}>
              1. Nouvelle Analyse
            </button>

            <button 
              onClick={() => setCurrentView('screen2')} 
              style={{ 
                padding: '8px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: currentView === 'screen2' ? '#006947' : 'transparent', 
                color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
              }}>
              2. Diagnostic IA
            </button>

            <button 
              onClick={() => setCurrentView('screen3')} 
              style={{ 
                padding: '8px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: currentView === 'screen3' ? '#006947' : 'transparent', 
                color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
              }}>
              3. Tableau de bord
            </button>

            <button 
              onClick={() => setCurrentView('screen4')} 
              style={{ 
                padding: '8px 16px', borderRadius: '10px', border: 'none', 
                backgroundColor: currentView === 'screen4' ? '#006947' : 'transparent', 
                color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer'
              }}>
              4. Historique
            </button>
          </div>

        </div>
      </header>

      {/* Content */}
      <main style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
        {currentView === 'grid' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Field Agent Terminal (4 Écrans de Capture)
              </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              <div onClick={() => setCurrentView('screen1')} style={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', border: '2px solid #334155' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', fontSize: '13px', fontWeight: 800, color: '#40BB1B' }}>🖥️ 1. Nouvelle Analyse de Lot</div>
                <div style={{ height: '550px', zoom: '0.6', pointerEvents: 'none' }}><TerminalScreen1 /></div>
              </div>

              <div onClick={() => setCurrentView('screen2')} style={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', border: '2px solid #6366f1' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', fontSize: '13px', fontWeight: 800, color: '#6366f1' }}>🔬 2. Résultat du Diagnostic IA</div>
                <div style={{ height: '550px', zoom: '0.6', pointerEvents: 'none' }}><TerminalScreen2 /></div>
              </div>

              <div onClick={() => setCurrentView('screen3')} style={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', border: '2px solid #38bdf8' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>📊 3. Tableau de bord Agent</div>
                <div style={{ height: '550px', zoom: '0.6', pointerEvents: 'none' }}><TerminalScreen3 /></div>
              </div>

              <div onClick={() => setCurrentView('screen4')} style={{ cursor: 'pointer', borderRadius: '16px', overflow: 'hidden', border: '2px solid #f59e0b' }}>
                <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>📋 4. Historique Agent</div>
                <div style={{ height: '550px', zoom: '0.6', pointerEvents: 'none' }}><TerminalScreen4 /></div>
              </div>
            </div>
          </div>
        ) : currentView === 'screen1' ? (
          <TerminalScreen1 />
        ) : currentView === 'screen2' ? (
          <TerminalScreen2 />
        ) : currentView === 'screen3' ? (
          <TerminalScreen3 />
        ) : (
          <TerminalScreen4 />
        )}
      </main>

    </div>
  );
}

function TerminalScreen1() {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '16px', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>Nouveau Lot d'Analyse (Agent Field)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', marginBottom: '10px' }}>DÉTAILS DU LOT</div>
          <p>Producteur: Koffi Kouassi</p>
          <p>Coopérative: COOP-YA Yamoussoukro</p>
          <p>Poids: 0.50 kg</p>
          <p>GPS: 5.3600° N, 3.8900° W</p>
        </div>
        <div style={{ border: '2px dashed #cbd5e1', padding: '24px', textAlign: 'center', borderRadius: '12px' }}>
          <UploadCloud size={32} style={{ margin: '0 auto 8px auto', color: '#006947' }} />
          <p style={{ fontWeight: 800 }}>Importer l'image du produit</p>
          <button style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#006947', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
            ⚡ Lancer l'Analyse
          </button>
        </div>
      </div>
    </div>
  );
}

function TerminalScreen2() {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '16px', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>AI Diagnostic Terminal — Cashew Lot #2024-001-082</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ height: '240px', backgroundColor: '#e2e8f0', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
          <Image src="/images/items/anacarde2.png" alt="Anacarde" fill style={{ objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#006947' }}>Grade A (98.2%)</div>
          <div style={{ marginTop: '12px', color: '#ef4444', fontWeight: 800 }}>🔴 Humidité Élevée — CRITIQUE</div>
          <div style={{ marginTop: '4px', color: '#16a34a', fontWeight: 800 }}>🟢 Corps Étrangers — MINEUR</div>
          <button style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#006947', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800 }}>
            Conforme Export EU
          </button>
        </div>
      </div>
    </div>
  );
}

function TerminalScreen3() {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '16px', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>Résumé de l'activité (Agent de Terrain)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>Lots: <strong>28</strong></div>
        <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>Qualité: <strong>94% Grade A</strong></div>
        <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>Sync: <strong>142</strong></div>
        <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>En attente: <strong>5</strong></div>
      </div>
    </div>
  );
}

function TerminalScreen4() {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '16px', padding: '24px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 900, marginBottom: '16px' }}>Historique des analyses Agent</h2>
      <p style={{ color: '#64748b' }}>Filtres: 7 derniers jours • Tous les grades</p>
      <div style={{ marginTop: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        LOT-00204-001C — Koffi Kouassi — Grade A (Synchronisé)
      </div>
    </div>
  );
}
