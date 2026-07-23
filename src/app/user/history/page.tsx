"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { 
  BarChart3, 
  Plus, 
  Search, 
  Clock, 
  Settings, 
  HelpCircle, 
  FileText,
  RefreshCw
} from 'lucide-react';

export default function UserHistory() {
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo style={{ height: '28px' }} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '320px', backgroundColor: '#f8fafc', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <Search size={16} color="#94a3b8" />
          <input type="text" placeholder="Rechercher un code lot ou un producteur..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '9999px', backgroundColor: '#006947', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
            SK
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 57px)' }}>
        
        {/* Sidebar */}
        <div style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingLeft: '8px' }}>
              FIELD AGENT TERMINAL
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link href="/user/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 700 }}>
                  <BarChart3 size={18} /> Dashboard
                </div>
              </Link>

              <Link href="/user/analysis" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 700 }}>
                  <Plus size={18} /> New Analysis
                </div>
              </Link>

              <Link href="/user/history" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#006947', fontSize: '13px', fontWeight: 700 }}>
                  <Clock size={18} /> History
                </div>
              </Link>
            </nav>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/user/analysis" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#006947', color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Plus size={16} /> Create New Lot
              </button>
            </Link>
            <button style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={16} /> Settings
            </button>
            <button style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} /> Support
            </button>
          </div>
        </div>

        {/* Content Panel */}
        <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '28px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0 }}>Historique des analyses</h1>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Consulter et gérer les lots de noix de cajou traités sur le terrain. Filtrez par grade de qualité ou synchronisez manuellement les données vers le serveur central.
            </p>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff' }}>
                <option>7 derniers jours</option>
                <option>30 derniers jours</option>
                <option>Toute la période</option>
              </select>

              <select style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#ffffff' }}>
                <option>Tous les grades</option>
                <option>Grade A</option>
                <option>Grade B</option>
                <option>Grade C</option>
              </select>
            </div>

            <button onClick={() => alert("Données synchronisées avec le serveur central !")} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} /> Tout synchroniser
            </button>
          </div>

          {/* History Table */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 10px' }}>Code Lot</th>
                  <th style={{ padding: '12px 10px' }}>Producteur</th>
                  <th style={{ padding: '12px 10px' }}>Date & Heure</th>
                  <th style={{ padding: '12px 10px' }}>Grade</th>
                  <th style={{ padding: '12px 10px' }}>Sync Statut</th>
                  <th style={{ padding: '12px 10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 10px', fontWeight: 800, color: '#006947' }}>LOT-00204-001C</td>
                  <td style={{ padding: '14px 10px', fontWeight: 700, color: '#0f172a' }}>Koffi Kouassi</td>
                  <td style={{ padding: '14px 10px', color: '#64748b' }}>24 Oct 2023, 14:30</td>
                  <td style={{ padding: '14px 10px' }}><span className="grade-badge-a">GRADE A</span></td>
                  <td style={{ padding: '14px 10px' }}><span style={{ color: '#16a34a', fontWeight: 800, fontSize: '12px' }}>✓ Synchronisé</span></td>
                  <td style={{ padding: '14px 10px' }}><Link href="/analysis/result" style={{ color: '#006947', fontWeight: 800, textDecoration: 'none', fontSize: '12px' }}>Voir rapport</Link></td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 10px', fontWeight: 800, color: '#006947' }}>LOT-00204-002C</td>
                  <td style={{ padding: '14px 10px', fontWeight: 700, color: '#0f172a' }}>Yao Kouassi</td>
                  <td style={{ padding: '14px 10px', color: '#64748b' }}>24 Oct 2023, 10:45</td>
                  <td style={{ padding: '14px 10px' }}><span className="grade-badge-b">GRADE B</span></td>
                  <td style={{ padding: '14px 10px' }}><span style={{ color: '#d97706', fontWeight: 800, fontSize: '12px' }}>⏳ En attente</span></td>
                  <td style={{ padding: '14px 10px' }}><Link href="/analysis/result" style={{ color: '#006947', fontWeight: 800, textDecoration: 'none', fontSize: '12px' }}>Voir rapport</Link></td>
                </tr>

                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 10px', fontWeight: 800, color: '#006947' }}>LOT-00204-003C</td>
                  <td style={{ padding: '14px 10px', fontWeight: 700, color: '#0f172a' }}>Amadou Sylla</td>
                  <td style={{ padding: '14px 10px', color: '#64748b' }}>23 Oct 2023, 09:15</td>
                  <td style={{ padding: '14px 10px' }}><span className="grade-badge-c">GRADE C</span></td>
                  <td style={{ padding: '14px 10px' }}><span style={{ color: '#ef4444', fontWeight: 800, fontSize: '12px' }}>❌ Échec sync</span></td>
                  <td style={{ padding: '14px 10px' }}><Link href="/user/analysis" style={{ color: '#ef4444', fontWeight: 800, textDecoration: 'none', fontSize: '12px' }}>Re-tester</Link></td>
                </tr>

                <tr>
                  <td style={{ padding: '14px 10px', fontWeight: 800, color: '#006947' }}>LOT-00204-004C</td>
                  <td style={{ padding: '14px 10px', fontWeight: 700, color: '#0f172a' }}>Traoré Moussa</td>
                  <td style={{ padding: '14px 10px', color: '#64748b' }}>22 Oct 2023, 11:20</td>
                  <td style={{ padding: '14px 10px' }}><span className="grade-badge-a">GRADE A</span></td>
                  <td style={{ padding: '14px 10px' }}><span style={{ color: '#16a34a', fontWeight: 800, fontSize: '12px' }}>✓ Synchronisé</span></td>
                  <td style={{ padding: '14px 10px' }}><Link href="/analysis/result" style={{ color: '#006947', fontWeight: 800, textDecoration: 'none', fontSize: '12px' }}>Voir rapport</Link></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom 3 Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>QUALITÉ MOYENNE</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>84% Grade A</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>EN ATTENTE DE SYNC</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>12 Fichiers</div>
            </div>

            <div style={{ backgroundColor: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>VOLUME TRAITÉ</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#006947', marginTop: '4px' }}>3.2 Tonnes</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
