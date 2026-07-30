"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FolderOpen, UploadCloud, MapPin, Scan, Cpu, ShieldCheck, Zap, RefreshCw, AlertTriangle, ScanLine, User, Scale } from 'lucide-react';
import { api, UserProfile } from '@/lib/api';
import styles from './page.module.css';

export default function UserAnalysisPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  // Détails du lot
  const [producer, setProducer] = useState('');
  const [cooperative, setCooperative] = useState('');
  const [cooperatives, setCooperatives] = useState<UserProfile[]>([]);
  const [loadingCooperatives, setLoadingCooperatives] = useState(true);
  const [totalWeight, setTotalWeight] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');
  // Relevé de l'humidimètre : facultatif, mais c'est la seule vraie mesure
  // physique que l'agent peut apporter l'IA ne peut pas la déduire d'une photo.
  const [humiditeMesuree, setHumiditeMesuree] = useState('');
  const [gps, setGps] = useState('');
  const [fetchingGps, setFetchingGps] = useState(false);
  const [isSecureConnection, setIsSecureConnection] = useState(true);

  // Capture & analyse
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Coopératives réelles : la liste affichait auparavant trois noms fictifs
  // en dur, sans rapport avec les comptes réellement enregistrés.
  useEffect(() => {
    api.auth.listEntites('cooperative')
      .then(setCooperatives)
      .catch(() => setCooperatives([]))
      .finally(() => setLoadingCooperatives(false));
  }, []);

  const fetchLiveGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setFetchingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latVal = pos.coords.latitude;
          const lngVal = pos.coords.longitude;
          const latStr = Math.abs(latVal).toFixed(4);
          const lngStr = Math.abs(lngVal).toFixed(4);
          const latDir = latVal >= 0 ? 'N' : 'S';
          const lngDir = lngVal >= 0 ? 'E' : 'W';
          setGps(`${latStr}° ${latDir}, ${lngStr}° ${lngDir}`);
          setFetchingGps(false);
        },
        (err) => {
          console.warn('Notice géolocalisation GPS:', err);
          setFetchingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  useEffect(() => {
    fetchLiveGPS();
    setIsSecureConnection(window.location.protocol === 'https:');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setPreviewUrl(base64Url);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nianka_last_image', base64Url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalWeightNum = parseFloat(totalWeight);
    const sampleWeightNum = parseFloat(sampleWeight);

    if (!totalWeight || isNaN(totalWeightNum) || totalWeightNum <= 0) {
      setErrorMessage("Veuillez renseigner le poids total réel du lot (kg).");
      return;
    }
    if (!sampleWeight || isNaN(sampleWeightNum) || sampleWeightNum <= 0) {
      setErrorMessage("Veuillez renseigner le poids réel de l'échantillon (kg).");
      return;
    }
    if (sampleWeightNum > totalWeightNum) {
      setErrorMessage("Le poids de l'échantillon ne peut pas dépasser le poids total du lot.");
      return;
    }
    // Champ facultatif : on ne bloque que si une valeur saisie est aberrante.
    if (humiditeMesuree) {
      const h = parseFloat(humiditeMesuree);
      if (isNaN(h) || h < 0 || h > 30) {
        setErrorMessage("Le taux d'humidité relevé doit être compris entre 0 et 30 %.");
        return;
      }
    }
    if (!selectedFile) {
      setErrorMessage("Veuillez capturer ou importer la photo de l'échantillon avant de lancer l'analyse.");
      return;
    }

    setErrorMessage('');
    setIsScanning(true);
    setProgress(15);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 150);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('producer', producer || 'Producteur Anonyme');
      formData.append('cooperative', cooperative || 'Coop. Anacarde');
      formData.append('weight_kg', totalWeight);
      formData.append('sample_weight_kg', sampleWeight);
      if (humiditeMesuree) formData.append('humidite_mesuree', humiditeMesuree);
      formData.append('gps', gps);
      formData.append('etape', 'collecte_terrain');

      // Appel authentifié : le scan est rattaché à l'agent connecté et sa
      // coopérative est notifiée automatiquement par le backend.
      const data = await api.etapes.predictQuality(formData);

      clearInterval(progressInterval);
      setProgress(100);

      localStorage.setItem('nianka_last_analysis', JSON.stringify(data));
      localStorage.setItem('nianka_last_image', previewUrl || '/images/anacarde.png');

      setTimeout(() => {
        router.push('/user/analysis/result');
      }, 300);
    } catch (err) {
      clearInterval(progressInterval);
      setIsScanning(false);
      setProgress(0);
      const message = err instanceof Error ? err.message : "Erreur lors de l'analyse.";
      setErrorMessage(
        message.includes('401') || message.toLowerCase().includes('jeton')
          ? 'Votre session a expiré. Veuillez vous reconnecter avec votre numéro de téléphone.'
          : message
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px' }}>
      {/* Header Title */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          Nouveau Lot d&apos;Analyse
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: 500 }}>
          Saisissez les informations du lot pour lancer l&apos;analyse de qualité IA.
        </p>
      </div>

      {errorMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '13px 18px', borderRadius: '12px',
          backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', color: '#991B1B',
          fontSize: '13.5px', fontWeight: 700,
        }}>
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main 2-Column Form */}
      <form onSubmit={handleStartAnalysis} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'stretch' }}>

        {/* Left Column: Lot Details */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}>
          {/* Section 1 : Identification */}
          <div>
            <h2 className={styles.sectionLabel}>
              <User size={13} /> Identification
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Nom du Producteur
                </label>
                <input
                  type="text"
                  value={producer}
                  onChange={e => setProducer(e.target.value)}
                  placeholder="Entrer le nom complet"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Coopérative
                </label>
                <select
                  value={cooperative}
                  onChange={e => setCooperative(e.target.value)}
                  disabled={loadingCooperatives}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    boxSizing: 'border-box',
                  }}
                  required
                >
                  <option value="">
                    {loadingCooperatives ? 'Chargement...' : 'Sélectionner une coopérative'}
                  </option>
                  {cooperatives.map(c => (
                    <option key={c.id} value={c.nom_complet}>{c.nom_complet}</option>
                  ))}
                </select>
                {!loadingCooperatives && cooperatives.length === 0 && (
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '5px 0 0 2px' }}>
                    Aucune coopérative enregistrée sur la plateforme pour l&apos;instant.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2 : Pesée */}
          <div>
            <h2 className={styles.sectionLabel}>
              <Scale size={13} /> Pesée
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Poids Total du Lot (kg) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={totalWeight}
                  onChange={e => setTotalWeight(e.target.value)}
                  placeholder="Ex: 500 kg"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Poids Échantillon (kg) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={sampleWeight}
                  onChange={e => setSampleWeight(e.target.value)}
                  placeholder="Ex: 1.0 kg"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1.5px solid #1a6b0a',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>
            </div>

            {/* Relevé de l'humidimètre : seule mesure physique réelle que
                l'agent peut apporter. Facultative, mais elle remplace alors
                l'estimation de l'IA. */}
            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Humidité relevée (%) <span style={{ color: '#94A3B8', fontWeight: 600 }}></span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="30"
                  value={humiditeMesuree}
                  onChange={e => setHumiditeMesuree(e.target.value)}
                  placeholder="Ex: 7.5"
                  style={{
                    width: '140px',
                    padding: '11px 14px',
                    border: humiditeMesuree ? '1.5px solid #1a6b0a' : '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                    color: '#0F172A',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box',
                    fontWeight: 700,
                  }}
                />
                <span style={{ fontSize: '11.5px', color: humiditeMesuree ? '#1a6b0a' : '#94A3B8', fontWeight: 600, lineHeight: 1.4 }}>
                  {humiditeMesuree
                    ? '✓ Mesure réelle remplacera l’estimation de l’IA'
                    : 'Saisir la valeur lue sur l’humidimètre.'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3 : Localisation */}
          <div>
            <h2 className={styles.sectionLabel}>
              <MapPin size={13} /> Localisation
            </h2>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Position GPS de la collecte
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 14px',
              border: '1.5px solid #E2E8F0',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
            }}>
              <MapPin size={16} color="#1a6b0a" />
              <input
                type="text"
                value={gps}
                onChange={e => setGps(e.target.value)}
                placeholder="Détection de votre position GPS..."
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: '12.5px', fontWeight: 600, color: '#0F172A', backgroundColor: 'transparent' }}
              />
              <button
                type="button"
                onClick={fetchLiveGPS}
                title="Détecter la position GPS exacte du téléphone/appareil"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#1a6b0a' }}
              >
                <RefreshCw size={14} className={fetchingGps ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Capture & IA */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '18px',
        }}>
          <h2 className={styles.sectionLabel} style={{ margin: 0 }}>
            <Camera size={13} /> Capture &amp; Analyse IA
          </h2>

          {/* Large Square Dotted Upload Box */}
          <div style={{
            border: isScanning ? '2px solid #1a6b0a' : '2px dashed #CBD5E1',
            borderRadius: '14px',
            minHeight: '260px',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            transition: 'border-color 0.2s ease',
          }}>
            {previewUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                <img src={previewUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />

                {isScanning ? (
                  <div className={styles.scanOverlay}>
                    <div className={`${styles.scanCorner} ${styles.scanCornerTL}`} />
                    <div className={`${styles.scanCorner} ${styles.scanCornerTR}`} />
                    <div className={`${styles.scanCorner} ${styles.scanCornerBL}`} />
                    <div className={`${styles.scanCorner} ${styles.scanCornerBR}`} />
                    <div className={styles.scanLine} />
                    <div className={styles.scanBadge}>
                      <span className={styles.scanPulseDot} />
                      <span>Analyse IA en cours… {progress}%</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      backgroundColor: 'rgba(15,23,42,0.85)', color: '#fff',
                      border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  backgroundColor: '#F0FDF4', color: '#1a6b0a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 14px rgba(26, 107, 10, 0.15)',
                }}>
                  <UploadCloud size={32} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Importer l&apos;image du produit
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0', maxWidth: '280px', fontWeight: 500 }}>
                  Glissez-déposez ou cliquez pour capturer via la caméra
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px', borderRadius: '10px', backgroundColor: '#F0FDF4',
                    color: '#1a6b0a', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                  }}>
                    <Camera size={16} />
                    <span>Utiliser Caméra</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>

                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '10px 16px', borderRadius: '10px', border: '1.5px solid #CBD5E1',
                    backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                  }}>
                    <FolderOpen size={16} />
                    <span>Parcourir Fichiers</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* CTA Scan Button */}
          <div>
            <button
              type="submit"
              disabled={isScanning}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#1a6b0a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15.5px',
                fontWeight: 900,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                opacity: isScanning ? 0.85 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 16px rgba(26, 107, 10, 0.3)',
              }}
            >
              {isScanning ? <ScanLine size={20} className="animate-pulse" /> : <Scan size={20} />}
              <span>{isScanning ? `Analyse IA en cours (${progress}%)...` : "Lancer l'Analyse"}</span>
            </button>
            {isScanning && (
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
            )}
            <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#94A3B8', marginTop: '8px', margin: '8px 0 0 0', fontWeight: 500 }}>
              L&apos;analyse IA prend généralement entre 1 et 3 secondes.
            </p>
          </div>
        </div>
      </form>

      {/* Bottom Status Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '10px', color: '#1a6b0a' }}>
            <Cpu size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>ANALYSE IA</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Système prêt à scanner</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '10px', color: '#1a6b0a' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>RAPIDITÉ</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Résultat en quelques secondes</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ padding: '10px', backgroundColor: isSecureConnection ? '#F0FDF4' : '#FFFBEB', borderRadius: '10px', color: isSecureConnection ? '#1a6b0a' : '#D97706' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>SÉCURITÉ</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
              {isSecureConnection ? 'Vos données sont protégées' : 'Mode local (démonstration)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
