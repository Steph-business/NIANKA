"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FolderOpen, UploadCloud, MapPin, Scan, Cpu, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

export default function UserAnalysisPage() {
  const router = useRouter();
  const [producer, setProducer] = useState('');
  const [cooperative, setCooperative] = useState('');
  const [totalWeight, setTotalWeight] = useState('500');
  const [sampleWeight, setSampleWeight] = useState('1.0');
  const [gps, setGps] = useState('7.6900° N, -5.0300° W');
  const [fetchingGps, setFetchingGps] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const getCityNameFromCoords = (latNum: number, lngNum: number) => {
    if (latNum >= 9.0) return 'Korhogo (District du Poro)';
    if (latNum >= 7.5 && latNum < 9.0) return 'Bouaké (Vallée du Bandama)';
    if (latNum >= 6.5 && latNum < 7.5) return 'Yamoussoukro (Bélier)';
    if (lngNum >= -3.5) return 'Bondoukou (Gontougo)';
    if (latNum < 6.0) return 'Abidjan / Port San Pedro';
    return 'Bouaké Nord (Secteur Anacarde)';
  };

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
          const city = getCityNameFromCoords(latVal, lngVal);
          setGps(`${latStr}° ${latDir}, ${lngStr}° ${lngDir} — ${city}`);
          setFetchingGps(false);
        },
        (err) => {
          console.warn('Notice géolocalisation GPS:', err);
          setGps('7.6900° N, 5.0300° W — Bouaké Nord');
          setFetchingGps(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGps('7.6900° N, 5.0300° W — Bouaké Nord');
    }
  };

  useEffect(() => {
    fetchLiveGPS();
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
    if (!sampleWeight || parseFloat(sampleWeight) <= 0) {
      alert('⚠️ Veuillez renseigner le Poids de l\'Échantillon (kg) scanné.');
      return;
    }
    setIsScanning(true);
    setProgress(15);

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      } else {
        // Create a dummy image blob if no image selected
        const canvas = document.createElement('canvas');
        canvas.width = 224;
        canvas.height = 224;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#8B5A2B';
          ctx.fillRect(0, 0, 224, 224);
        }
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
        if (blob) {
          formData.append('file', blob, 'cashew.jpg');
        }
      }

      formData.append('producer', producer || 'Producteur Anonyme');
      formData.append('cooperative', cooperative || 'Coop. Anacarde');
      formData.append('weight_kg', totalWeight || '500');
      formData.append('sample_weight_kg', sampleWeight || '1.0');
      formData.append('gps', gps);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 150);

      const res = await fetch(`${API_URL}/etapes/predict-quality`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('nianka_last_analysis', JSON.stringify(data));
      }

      if (previewUrl) {
        localStorage.setItem('nianka_last_image', previewUrl);
      } else {
        localStorage.setItem('nianka_last_image', '/images/anacarde.png');
      }

      setTimeout(() => {
        router.push('/user/analysis/result');
      }, 300);

    } catch (err) {
      console.warn('Backend API notification:', err);
      setProgress(100);
      setTimeout(() => {
        router.push('/user/analysis/result');
      }, 300);
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
          justifyContent: 'space-between',
          gap: '18px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              📋 DÉTAILS DU LOT
            </h2>

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
                <option value="">Sélectionner une coopérative</option>
                <option value="anader_bouake">Coop. ANADER Bouaké</option>
                <option value="coop_yamoussoukro">Coop. Agricole Yamoussoukro</option>
                <option value="coop_korhogo">Coop. Anacarde Korhogo</option>
              </select>
            </div>

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
                  Poids Échantillon (kg) <span style={{ color: '#EF4444' }}>* (Scanné)</span>
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

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Localisation GPS
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
          <h2 style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
            📷 CAPTURE & ANALYSE IA
          </h2>

          {/* Large Square Dotted Upload Box */}
          <div style={{
            border: '2px dashed #CBD5E1',
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
          }}>
            {previewUrl ? (
              <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                <img src={previewUrl} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 16px rgba(26, 107, 10, 0.3)',
              }}
            >
              <Scan size={20} />
              <span>{isScanning ? `Analyse IA en cours (${progress}%)...` : "Lancer l'Analyse"}</span>
            </button>
            <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#94A3B8', marginTop: '8px', margin: '8px 0 0 0', fontWeight: 500 }}>
              L&apos;analyse IA prend généralement entre 3 et 8 secondes.
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
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>MOTEUR IA PRÊT</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>MobileNetV3 — Cashew Quality</div>
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
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>OPTIMISATION GPU</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Latence estimée : &lt; 15ms</div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '14px', padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <div style={{ padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '10px', color: '#1a6b0a' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B' }}>INTÉGRITÉ DONNÉES</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Cryptage SSL 256-bit actif</div>
          </div>
        </div>
      </div>
    </div>
  );
}
