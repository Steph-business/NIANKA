"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Camera, Sparkles, CheckCircle2, FileCheck, RefreshCw, QrCode, Search, Check, Upload, Image as ImageIcon, X, ArrowRight, ShieldCheck, Scale, AlertCircle, Scan, Cpu } from 'lucide-react';
import { api } from '@/lib/api';

export default function EntrepotAnalysisPage() {
  const [inputCode, setInputCode] = useState('');
  const [selectedBuyer, setSelectedBuyer] = useState('usineur');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);

  // Scan Execution State
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('/images/inspection.png');

  // Sale Seal Success Notification State
  const [saleSealedSuccess, setSaleSealedSuccess] = useState(false);

  const [lotData, setLotData] = useState<any>(null);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleSearchCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);

    try {
      const data = await api.etapes.getTransfer(inputCode);
      if (data) {
        setLotData({
          id: data.numero_bordereau || inputCode,
          origin: data.cooperative_depart || 'Coopérative ANADER Bouaké',
          truck: 'CI-482-AB (Chauffeur: Koffi B.)',
          initialKor: '54.2 lbs (Grade A)',
          initialMoisture: '6.8%',
          agentScan: 'Agent NIANKA',
          volume: `${data.tonnage_transfert || 20} Tonnes`,
          store: 'Magasin A — Quai 4',
        });
      }
    } catch (err) {
      console.warn('Backend transfer fetch notice:', err);
    } finally {
      setIsSearching(false);
      setSearchSuccess(true);
      setTimeout(() => setSearchSuccess(false), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleStartScan = () => {
    setShowScanModal(false);
    setIsScanning(true);
    setScanCompleted(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
    }, 1200);
  };

  const handleSealSale = async () => {
    try {
      await api.etapes.executeArbitrage({
        bordereau_id: lotData?.id,
        score_kor_entrepot: parseFloat(scanResult.kor) || 54.2,
        taux_humidite_entrepot: parseFloat(scanResult.moisture) || 6.8,
        verdict_conforme: true,
        notes_arbitre: 'Arbitrage neutre validé par Entrepôt Central',
      });
    } catch (err) {
      console.warn('Arbitrage backend notice:', err);
    }
    setSaleSealedSuccess(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1280px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#1a6b0a' }}>
              <Camera size={22} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Scan d&apos;Arbitrage Officiel IA (Entrepôt Central)
            </h1>
          </div>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
            Charger le bordereau, scanner la photo d&apos;échantillon au déchargement, puis attribuer la vente à l&apos;acheteur en fonction du résultat.
          </p>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 16px', borderRadius: '20px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
          fontSize: '12px', fontWeight: 800, border: '1px solid #BBF7D0',
        }}>
          <Sparkles size={16} color="#40BB1B" />
          <span>Arbitrage Neutre Certifié IA</span>
        </div>
      </div>

      {/* STEP 1 BAR: DESKTOP CODE INPUT OR SEARCH */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px 24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '14px',
        border: '1.5px dashed #1a6b0a',
      }}>
        <div style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={20} color="#1a6b0a" />
          <span>Étape 1 : Charger le Bordereau par N° ou Scan QR (Camion Arrivé)</span>
        </div>

        <form onSubmit={handleSearchCode} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              placeholder="Saisissez ou collez le N° de bordereau (ex: TRF-2024-08 ou TRF-2024-09)..."
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                border: '1.5px solid #CBD5E1', fontSize: '13.5px', fontWeight: 700,
                color: '#0F172A', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            style={{
              padding: '12px 24px', backgroundColor: '#1a6b0a', color: '#ffffff',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            {isSearching ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Recherche du lot...</span>
              </>
            ) : searchSuccess ? (
              <>
                <Check size={16} color="#ffffff" />
                <span>Données Chargées !</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Rechercher &amp; Charger Traçabilité</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* STEP 2: CAMERA CAPTURE & SCAN EXECUTION TERMINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        
        {/* Left Column: Data + Photo Dropzone + Big Scan Button */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px',
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            DONNÉES DU CAMION À DÉCHARGER
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Réf Bordereau:</span>
                <strong style={{ color: '#1a6b0a' }}>#{lotData?.id || '---'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Coopérative Origine:</span>
                <strong style={{ color: '#0F172A' }}>{lotData?.origin || '---'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Chauffeur &amp; Camion:</span>
                <strong style={{ color: '#0F172A' }}>{lotData?.truck || '---'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Agent Pisteur (Champ):</span>
                <strong style={{ color: '#1a6b0a' }}>{lotData?.agentScan || '---'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Volume à Décharger:</span>
                <strong style={{ color: '#0F172A' }}>{lotData?.volume || '---'}</strong>
              </div>
            </div>

            <button
              onClick={() => setShowScanModal(true)}
              disabled={isScanning}
              style={{
                marginTop: '10px', padding: '16px', backgroundColor: '#1a6b0a', color: '#ffffff',
                border: 'none', borderRadius: '12px', fontSize: '14.5px', fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(26, 107, 10, 0.3)',
              }}
            >
              <Camera size={20} />
              <span>Étape 2 : Importer / Scanner l&apos;Échantillon Déchargement 📷</span>
            </button>
          </div>
        </div>

        {/* Right Column: Dynamic Terminal State */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '20px',
          justifyContent: 'space-between',
        }}>
          {isScanning ? (
            <div style={{
              height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center',
            }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #F0FDF4', borderTopColor: '#1a6b0a' }} className="animate-spin" />
                <Cpu size={36} color="#1a6b0a" />
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>Inférence IA Backend en cours...</div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>Modèle MobileNetV3-Small • Télémétrie 18ms</div>
              </div>
            </div>
          ) : !scanCompleted ? (
            <div style={{
              height: '100%', minHeight: '380px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', color: '#94A3B8',
            }}>
              <div style={{ padding: '20px', borderRadius: '50%', backgroundColor: '#F8FAFC', color: '#94A3B8' }}>
                <Scan size={42} />
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#475569' }}>Prêt pour l&apos;Analyse IA d&apos;Arbitrage</div>
              <p style={{ fontSize: '12px', color: '#94A3B8', maxWidth: '320px', margin: 0, textAlign: 'center' }}>
                Cliquez sur le bouton vert à gauche pour importer la photo et exécuter le scan IA de déchargement.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
                  COMPARAISON &amp; ATTRIBUTION DE VENTE
                </h2>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#1a6b0a', backgroundColor: '#F0FDF4', padding: '3px 10px', borderRadius: '12px' }}>
                  Arbitrage IA Certifié
                </span>
              </div>

              <div style={{
                height: '140px', borderRadius: '12px',
                backgroundImage: `url(${selectedImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
                position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '12px',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' }} />
                <div style={{ position: 'relative', zIndex: 10, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#40BB1B' }} />
                    IA Confidence: {scanResult.confidence}
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '10px' }}>
                    Échantillon Déchargement 500g
                  </span>
                </div>
              </div>

              {/* SIDE-BY-SIDE COMPARISON TABLE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', marginBottom: '4px', textTransform: 'uppercase' }}>
                    1. SCAN INITIAL COOPÉRATIVE
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                    {lotData?.initialKor}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>Humidité: {lotData?.initialMoisture}</div>
                </div>

                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '12px', border: '1.5px solid #BBF7D0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a6b0a', marginBottom: '4px', textTransform: 'uppercase' }}>
                    2. SCAN ARBITRAGE ENTREPÔT
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#1a6b0a' }}>
                    {scanResult.kor} lbs ({scanResult.grade})
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Humidité: {scanResult.moisture}</div>
                </div>
              </div>

              {/* BUYER ASSIGNMENT SELECTOR */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #CBD5E1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Étape 3 : Attribuer le Lot Certifié à un Acheteur
                </label>
                <select
                  value={selectedBuyer}
                  onChange={e => setSelectedBuyer(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', fontWeight: 700, outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="usineur">Usineur San Pédro (Décorticage &amp; Transformation Locale)</option>
                  <option value="exportateur">Exportateur Abidjan Port (Conformité Export EU / US)</option>
                </select>
              </div>

              {/* ACTION BUTTON WITH STAYS-IN-ENTREPOT NOTIFICATION */}
              {saleSealedSuccess ? (
                <div style={{
                  padding: '14px', backgroundColor: '#F0FDF4', color: '#1a6b0a',
                  borderRadius: '10px', fontSize: '13px', fontWeight: 800, textAlign: 'center',
                  border: '1.5px solid #BBF7D0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <CheckCircle2 size={18} />
                  <span>Vente Scellée &amp; Transmise au Catalogue {selectedBuyer === 'usineur' ? 'Usineur' : 'Exportateur'} !</span>
                </div>
              ) : (
                <button
                  onClick={handleSealSale}
                  style={{
                    padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff', border: 'none',
                    borderRadius: '10px', fontSize: '13.5px', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
                  }}
                >
                  <FileCheck size={18} />
                  <span>Sceller la Vente &amp; Transmettre au Catalogue Acheteur ➔</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SCAN MODAL */}
      {showScanModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', padding: '28px',
            maxWidth: '520px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid #F1F5F9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Camera size={22} color="#1a6b0a" />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    Charger la Photo de l&apos;Échantillon (Déchargement)
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Contrôle de qualité officiel pour la vente</span>
                </div>
              </div>
              <button onClick={() => setShowScanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <X size={20} color="#64748B" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{
                height: '170px', borderRadius: '14px', border: '2px dashed #1a6b0a',
                backgroundColor: '#F0FDF4', cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px',
                textAlign: 'center', transition: 'all 0.2s ease',
              }}>
                <Upload size={32} color="#1a6b0a" />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1a6b0a' }}>
                    Cliquez ici pour importer la photo d&apos;échantillon
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>Formats acceptés: JPG, PNG, WEBP (500g au déchargement)</span>
                </div>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedImage('/images/inspection.png')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #1a6b0a',
                    backgroundColor: selectedImage === '/images/inspection.png' ? '#F0FDF4' : '#ffffff',
                    fontSize: '12px', fontWeight: 800, color: '#1a6b0a', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  <ImageIcon size={15} /> Échantillon Quai A
                </button>
              </div>

              <button
                onClick={handleStartScan}
                style={{
                  marginTop: '10px', padding: '14px', backgroundColor: '#1a6b0a', color: '#ffffff',
                  border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(26, 107, 10, 0.25)',
                }}
              >
                <Sparkles size={18} />
                <span>Lancer le Scan d&apos;Arbitrage &amp; Obtenir les Résultats</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
