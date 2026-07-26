"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Package, Download, FileText, Globe } from 'lucide-react';
import { api, LotData } from '@/lib/api';

export default function LotDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [lot, setLot] = useState<LotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.etapes.getLot(params.id)
      .then(setLot)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ padding: '24px', color: '#64748B', fontWeight: 600 }}>Chargement des données d&apos;exportation...</div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ color: '#EF4444', fontWeight: 600 }}>Erreur : Lot introuvable.</div>
        <button onClick={() => router.back()} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer' }}>Retour</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px' }}>
      
      {/* Header avec Retour */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => router.back()}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            width: '40px', height: '40px', borderRadius: '12px', 
            border: '1.5px solid #E2E8F0', backgroundColor: '#ffffff', cursor: 'pointer' 
          }}
        >
          <ArrowLeft size={20} color="#0F172A" />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Dossier d&apos;Exportation #{lot.numero_lot || lot.id.substring(0,8)}
            <Globe size={22} color="#1a6b0a" />
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
            <span style={{ color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '4px 10px', borderRadius: '8px' }}>
              {lot.statut || 'VALIDE'}
            </span>
            <span>• Certifié le {new Date(lot.created_at || '').toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Colonne Principale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} color="#1a6b0a" />
              Volume et Qualité
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Volume Certifié</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{lot.poids_tonnes} Tonnes</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Rendement en amandes (KOR)</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A' }}>{lot.score_kor || '-'} lbs</div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, marginBottom: '6px' }}>Grade Export</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a6b0a' }}>{lot.grade}</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#1a6b0a" />
              Conformité Douanière & Phytosanitaire
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Norme Internationale</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 800 }}>Conforme EU / FDA US</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Certificat Phytosanitaire</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 800 }}>Délivré et Signé numériquement</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Rapport d&apos;Analyse IA</span>
                <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 800 }}>Validé (Trace: NIANKA-AI)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne Latérale : Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '16px' }}>Documents d&apos;Exportation</h3>
            
            <button style={{ 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 800, cursor: 'pointer', marginBottom: '12px',
              boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)'
            }}>
              <Download size={18} /> Certificat Phytosanitaire
            </button>
            
            <button style={{ 
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '14px', backgroundColor: '#F8FAFC', color: '#0F172A', border: '1.5px solid #E2E8F0', borderRadius: '12px',
              fontSize: '13.5px', fontWeight: 800, cursor: 'pointer'
            }}>
              <FileText size={18} /> Bon de Livraison (Douane)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
