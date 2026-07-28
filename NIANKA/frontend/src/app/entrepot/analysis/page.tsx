"use client";

import React, { useEffect, useState } from 'react';
import { Camera, Sparkles, CheckCircle2, FileCheck, RefreshCw, QrCode, Search, Check, Upload, Image as ImageIcon, X, ArrowRight, ShieldCheck, Scale, AlertCircle, Scan, Cpu } from 'lucide-react';
import { api, PredictionResult, TransferOrderData } from '@/lib/api';
import styles from './page.module.css';

const SEUIL_CONFORMITE_KOR = 1.5;

export default function EntrepotAnalysisPage() {
  const [inputCode, setInputCode] = useState('');
  const [buyerOptions, setBuyerOptions] = useState<Array<{ id: string; nom_complet: string; role: string }>>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scan Execution State
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('/images/inspection.png');

  const [saleSealedSuccess, setSaleSealedSuccess] = useState(false);
  const [isSealing, setIsSealing] = useState(false);

  const [transferData, setTransferData] = useState<TransferOrderData | null>(null);
  const [scanResult, setScanResult] = useState<PredictionResult | null>(null);

  const selectedBuyer = buyerOptions.find((buyer) => buyer.id === selectedBuyerId);
  const selectedBuyerLabel = selectedBuyer ? (selectedBuyer.role === 'usine' ? 'Usineur' : 'Exportateur') : 'Acheteur';

  // --- Comparaison côte-à-côte : les deux mesures viennent de la base ---
  const scanInitial = transferData?.scan_initial ?? null;
  const korInitial = transferData?.kor_initial ?? scanInitial?.score_kor ?? null;
  const humiditeInitiale = transferData?.humidite_initiale ?? scanInitial?.humidite ?? null;
  const korEntrepot = scanResult?.metrics?.kor_lbs ?? null;
  const humiditeEntrepot = scanResult?.metrics?.humidity_pct ?? null;
  const deltaKor = korInitial !== null && korEntrepot !== null
    ? Math.abs(korEntrepot - korInitial)
    : null;
  const estConforme = deltaKor !== null ? deltaKor <= SEUIL_CONFORMITE_KOR : null;

  useEffect(() => {
    const loadAcheteurs = async () => {
      try {
        const acheteurs = await api.auth.listAcheteurs();
        setBuyerOptions(acheteurs.map((buyer) => ({ id: buyer.id, nom_complet: buyer.nom_complet, role: buyer.role })));
        if (acheteurs.length > 0) {
          setSelectedBuyerId(acheteurs[0].id);
        }
      } catch (err) {
        console.warn('Impossible de charger les acheteurs:', err);
      }
    };

    loadAcheteurs();
  }, []);

  // Arrivée depuis le tableau de bord : ?bordereau=TRF-2026-08 charge directement le camion.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const depuisUrl = new URLSearchParams(window.location.search).get('bordereau');
    if (depuisUrl) {
      setInputCode(depuisUrl);
      chargerBordereau(depuisUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerBordereau = async (code: string) => {
    setIsSearching(true);
    setErrorMessage('');
    setScanCompleted(false);
    setScanResult(null);
    setSaleSealedSuccess(false);

    try {
      const data = await api.etapes.getTransfer(code.trim());
      setTransferData(data);
      if (data.arbitre) {
        setErrorMessage(`Le bordereau ${data.numero_bordereau} a déjà été arbitré et scellé.`);
      }
    } catch (err) {
      setTransferData(null);
      setErrorMessage(err instanceof Error ? err.message : 'Bordereau introuvable.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMessage('Saisissez le numéro du bordereau (ex : TRF-2026-08).');
      return;
    }
    await chargerBordereau(inputCode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      setSelectedImageUrl(URL.createObjectURL(file));
    }
  };

  const handleStartScan = async () => {
    if (!selectedImageFile) {
      setErrorMessage("Importez la photo de l'échantillon prélevé au déchargement.");
      return;
    }

    setShowScanModal(false);
    setIsScanning(true);
    setScanCompleted(false);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedImageFile);
      formData.append('cooperative', transferData?.nom_cooperative || '');
      formData.append('weight_kg', String((transferData?.volume_tonnes ?? 0) * 1000));
      formData.append('sample_weight_kg', '0.5');
      formData.append('etape', 'entrepot_arbitrage');

      const result = await api.etapes.predictQuality(formData);
      setScanResult(result);
      setScanCompleted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Échec de l'analyse IA d'arbitrage.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSealSale = async () => {
    if (!transferData?.id || !scanResult) return;

    setIsSealing(true);
    setErrorMessage('');
    try {
      await api.etapes.executeArbitrage({
        bordereau_id: transferData.id,
        scan_entrepot_image_url: scanResult.image_url || selectedImageUrl,
        scan_entrepot_grade: scanResult.predicted_grade,
        scan_entrepot_kor: scanResult.metrics.kor_lbs,
        scan_entrepot_humidite: scanResult.metrics.humidity_pct,
        acheteur_id: selectedBuyerId || undefined,
      });
      setSaleSealedSuccess(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Le scellement de la vente a échoué.');
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* Page Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIcon}>
              <Camera size={22} />
            </div>
            <h1 className={styles.title}>
              Scan d&apos;Arbitrage Officiel IA (Entrepôt Central)
            </h1>
          </div>
          <p className={styles.subtitle}>
            Charger le bordereau, scanner la photo d&apos;échantillon au déchargement, puis attribuer la vente à l&apos;acheteur en fonction du résultat.
          </p>
        </div>

        <div className={styles.headerBadge}>
          <Sparkles size={16} color="#40BB1B" />
          <span>Arbitrage Neutre Certifié IA</span>
        </div>
      </div>

      {/* STEP 1 BAR: DESKTOP CODE INPUT OR SEARCH */}
      <div className={styles.stepCard}>
        <div className={styles.stepTitle}>
          <QrCode size={20} color="#1a6b0a" />
          <span>Étape 1 : Charger le Bordereau par N° ou Scan QR (Camion Arrivé)</span>
        </div>

        <form onSubmit={handleSearchCode} className={styles.searchForm}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              placeholder="Saisissez ou collez le N° de bordereau (ex: TRF-2024-08 ou TRF-2024-09)..."
              className={styles.searchInput}
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className={styles.searchButton}
          >
            {isSearching ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Recherche du lot...</span>
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

      {errorMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '13px 18px', borderRadius: '12px',
          backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', color: '#991B1B',
          fontSize: '13.5px', fontWeight: 700,
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 2: CAMERA CAPTURE & SCAN EXECUTION TERMINAL */}
      <div className={styles.mainGrid}>
        
        {/* Left Column: Data + Photo Dropzone + Big Scan Button */}
        <div className={styles.dataCard}>
          <h2 className={styles.cardTitle}>
            DONNÉES DU CAMION À DÉCHARGER
          </h2>

          <div className={styles.dataList}>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Réf Bordereau:</span>
              <strong className={`${styles.dataValue} ${styles.dataValueHighlight}`}>#{transferData?.numero_bordereau || '---'}</strong>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Coopérative Origine:</span>
              <strong className={styles.dataValue}>{transferData?.nom_cooperative || '---'}</strong>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Chauffeur &amp; Camion:</span>
              <strong className={styles.dataValue}>
                {transferData ? `${transferData.immatriculation_camion} (${transferData.nom_chauffeur})` : '---'}
              </strong>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Agent Pisteur (Champ):</span>
              <strong className={`${styles.dataValue} ${styles.dataValueHighlight}`}>
                {transferData?.nom_agent || '---'}
              </strong>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Volume à Décharger:</span>
              <strong className={styles.dataValue}>
                {transferData ? `${transferData.volume_tonnes} Tonnes (${transferData.grade_lot})` : '---'}
              </strong>
            </div>
            <div className={styles.dataRow}>
              <span className={styles.dataLabel}>Scan bord champ:</span>
              <strong className={styles.dataValue}>
                {korInitial !== null
                  ? `KOR ${korInitial} lbs • ${humiditeInitiale ?? '—'}% • ${scanInitial?.grade_ia ?? ''}`
                  : '---'}
              </strong>
            </div>
          </div>

          <button
            onClick={() => setShowScanModal(true)}
            disabled={isScanning || !transferData}
            className={styles.scanButton}
          >
            <Camera size={20} />
            <span>Étape 2 : Importer / Scanner l&apos;Échantillon Déchargement 📷</span>
          </button>
        </div>

        {/* Right Column: Dynamic Terminal State */}
        <div className={styles.terminal}>
          {isScanning ? (
            <div className={styles.terminalPlaceholder}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '4px solid #F0FDF4', borderTopColor: '#1a6b0a' }} className="animate-spin" />
                <Cpu size={36} color="#1a6b0a" />
              </div>
              <div>
                <div className={styles.placeholderTitle} style={{color: '#0F172A'}}>Inférence IA Backend en cours...</div>
                <div className={styles.placeholderText} style={{color: '#64748B', marginTop: '4px'}}>Modèle MobileNetV3-Small • Télémétrie 18ms</div>
              </div>
            </div>
          ) : !scanCompleted ? (
            <div className={styles.terminalPlaceholder}>
              <div className={styles.placeholderIcon}>
                <Scan size={42} />
              </div>
              <div className={styles.placeholderTitle}>Prêt pour l&apos;Analyse IA d&apos;Arbitrage</div>
              <p className={styles.placeholderText}>
                Cliquez sur le bouton vert à gauche pour importer la photo et exécuter le scan IA de déchargement.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className={styles.cardTitle}>
                  COMPARAISON &amp; ATTRIBUTION DE VENTE
                </h2>
                <span className={styles.headerBadge} style={{padding: '3px 10px', fontSize: '11px'}}>
                  Arbitrage IA Certifié
                </span>
              </div>

              <div className={styles.comparisonImage} style={{ backgroundImage: `url(${selectedImageUrl})` }}>
                <div className={styles.comparisonOverlay} />
                <div className={styles.comparisonFooter}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#40BB1B' }} />
                    Confiance IA : {scanResult ? scanResult.confidence_pct.toFixed(1) : '—'}%
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
                    1. SCAN BORD CHAMP — {transferData?.nom_agent || 'Agent'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                    {korInitial !== null ? `${korInitial.toFixed(1)} lbs` : '—'} ({scanInitial?.grade_ia || '—'})
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    Humidité: {humiditeInitiale !== null ? `${humiditeInitiale.toFixed(1)}%` : '—'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>
                    {scanInitial?.date_scan
                      ? new Date(scanInitial.date_scan).toLocaleString('fr-FR')
                      : 'Aucun scan lié'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '10px', padding: '12px', border: '1.5px solid #BBF7D0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#1a6b0a', marginBottom: '4px', textTransform: 'uppercase' }}>
                    2. SCAN ARBITRAGE ENTREPÔT
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#1a6b0a' }}>
                    {korEntrepot !== null ? `${korEntrepot.toFixed(1)} lbs` : '—'} ({scanResult?.predicted_grade || '—'})
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>
                    Humidité: {humiditeEntrepot !== null ? `${humiditeEntrepot.toFixed(1)}%` : '—'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '3px' }}>
                    Confiance IA {scanResult ? scanResult.confidence_pct.toFixed(1) : '—'}% • {scanResult?.metrics.latency_ms ?? '—'} ms
                  </div>
                </div>
              </div>

              {/* VERDICT D'ARBITRAGE CALCULÉ SUR LES DEUX MESURES RÉELLES */}
              {deltaKor !== null && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px', textAlign: 'center',
                  backgroundColor: estConforme ? '#ECFDF5' : '#FEF2F2',
                  border: `1.5px solid ${estConforme ? '#A7F3D0' : '#FCA5A5'}`,
                  color: estConforme ? '#065F46' : '#991B1B',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 900 }}>
                    {estConforme
                      ? `VERDICT IA : CONFORME — aucune dégradation durant le transport`
                      : `VERDICT IA : ÉCART DÉTECTÉ — dégradation constatée au déchargement`}
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 600, marginTop: '3px' }}>
                    Écart KOR mesuré : {deltaKor.toFixed(2)} lbs (tolérance {SEUIL_CONFORMITE_KOR} lbs)
                  </div>
                </div>
              )}

              {/* BUYER ASSIGNMENT SELECTOR */}
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #CBD5E1' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  Étape 3 : Attribuer le Lot Certifié à un Acheteur
                </label>
                <select
                  value={selectedBuyerId}
                  onChange={e => setSelectedBuyerId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '12.5px', fontWeight: 700, outline: 'none', backgroundColor: '#ffffff' }}
                >
                  {buyerOptions.length > 0 ? (
                    buyerOptions.map((buyer) => (
                      <option key={buyer.id} value={buyer.id}>
                        {buyer.nom_complet} ({buyer.role === 'usine' ? 'Usineur' : 'Exportateur'})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      Chargement des acheteurs... Veuillez patienter
                    </option>
                  )}
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
                  <span>Vente Scellée &amp; Transmise au Catalogue {selectedBuyerLabel} !</span>
                </div>
              ) : (
                <button
                  onClick={handleSealSale}
                  disabled={isSealing || !transferData?.id || !scanResult}
                  className={styles.sealButton}
                  style={(isSealing || !transferData?.id || !scanResult) ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                >
                  <FileCheck size={18} />
                  <span>
                    {isSealing
                      ? 'Scellement en cours...'
                      : 'Sceller la Vente & Transmettre au Catalogue Acheteur ➔'}
                  </span>
                </button>
              )}

              {saleSealedSuccess && transferData && (
                <a
                  href={api.etapes.certificatUrl(transferData.numero_bordereau)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '12px', borderRadius: '10px', textDecoration: 'none',
                    backgroundColor: '#ffffff', border: '1.5px solid #1a6b0a',
                    color: '#1a6b0a', fontSize: '13px', fontWeight: 800,
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>Ouvrir le certificat de qualité (QR Code)</span>
                </a>
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
                  onClick={() => setSelectedImageUrl('/images/inspection.png')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #1a6b0a',
                    backgroundColor: selectedImageUrl === '/images/inspection.png' ? '#F0FDF4' : '#ffffff',
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
