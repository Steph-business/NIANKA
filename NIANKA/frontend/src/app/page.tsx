"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import { 
  ChevronDown, 
  Play, 
  X, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Menu, 
  CheckCircle2, 
  Building2, 
  Users, 
  Award, 
  BarChart3, 
  Leaf, 
  Clock, 
  MapPin, 
  FileText, 
  Cpu, 
  WifiOff, 
  Search, 
  Download,
  AlertTriangle,
  Layers,
  Filter,
  Eye,
  Maximize2,
  Activity,
  Brain,
  Scan,
  Radar,
  Bot,
  Flame,
  CircuitBoard,
  Grid,
  Disc,
  Feather,
  ArrowUpRight
} from 'lucide-react';

export default function NiankaLandingPage() {
  const [activeFiliere, setActiveFiliere] = useState<'anacarde' | 'cacao' | 'mangue'>('anacarde');
  const [heroFilter, setHeroFilter] = useState<'all' | 'anacarde' | 'cacao' | 'mangue'>('all');
  const [selectedHeroItemIndex, setSelectedHeroItemIndex] = useState<number>(5); // Ananas by default as in screenshot
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [simulFiliere, setSimulFiliere] = useState<'anacarde' | 'cacao' | 'mangue'>('anacarde');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeActeur, setActiveActeur] = useState<'cooperative' | 'acheteur' | 'usineur'>('cooperative');

  const acteursData = {
    cooperative: {
      role: 'Pour la Coopérative & Planteurs',
      title: 'Sécurisez la valeur au kilo & éliminez le déclassement injustifié',
      badge: 'Bénéfice Coopérative',
      color: '#40BB1B',
      bgColor: 'rgba(64, 187, 27, 0.1)',
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
      defiTitle: 'Le Défi de la Filière',
      defi: 'Une estimation empirique et imprécise du KOR ou du taux d\'humidité conduit souvent au déclassement injustifié des récoltes lors des pesées et à d\'importantes pertes financières pour les planteurs.',
      solutionTitle: 'La Solution NIANKA',
      solution: 'Contrôle visuel et hygrométrique certifié dès la brousse. Émission immédiate d\'un certificat de conformité horodaté pour négocier les lots au prix le plus fort auprès des acheteurs.',
      metric: '+22%',
      metricLabel: 'de valeur nette préservée par lot',
      features: [
        'Évaluation automatique du KOR (lbs) dès la récolte',
        'Réduction totale des litiges de qualité avec les pistages',
        'Horodatage certifié des bulletins d\'analyse visuelle'
      ]
    },
    acheteur: {
      role: 'Pour l\'Acheteur & Pisteur',
      title: 'Inspectez les sacs en brousse en 2s sans matériel de labo',
      badge: 'Bénéfice Acheteur',
      color: '#2563EB',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      iconBg: '#DBEAFE',
      iconColor: '#1D4ED8',
      defiTitle: 'Le Défi de la Filière',
      defi: 'Le risque permanent d\'acheter des sacs de noix de cajou ou de cacao adultérés, trop humides ou piquées par des insectes en zone rurale sans accès à un laboratoire d\'analyse.',
      solutionTitle: 'La Solution NIANKA',
      solution: 'Application mobile 100% offline. Le capteur photo du smartphone analyse l\'échantillon et calcule instantanément le taux de défaut et le prix d\'achat juste recommandable.',
      metric: '0 Sac',
      metricLabel: 'non-conforme acheté sur le terrain',
      features: [
        'Inférence 100% hors-ligne (fonctionne sans réseau GSM)',
        'Détection visuelle des piqûres d\'insectes et moisissures',
        'Calcul immédiat du prix d\'achat recommandé'
      ]
    },
    usineur: {
      role: 'Pour l\'Usineur & Transformateur',
      title: 'Optimisez les rendements d\'usinage & évitez les rejets export',
      badge: 'Bénéfice Usineur',
      color: '#D97706',
      bgColor: 'rgba(217, 119, 6, 0.1)',
      iconBg: '#FEF3C7',
      iconColor: '#B45309',
      defiTitle: 'Le Défi de la Filière',
      defi: 'Les arrêts de chaîne de décorticage ou de fermentation causés par des matières premières non-conformes et les rejets coûteux de conteneurs dans les ports internationaux (UE/US).',
      solutionTitle: 'La Solution NIANKA',
      solution: 'Filtrage automatique et systématique à la réception usine. Intégration des métriques visuelles dans votre ERP de production et délivrance des certificats aux normes export.',
      metric: '99.4%',
      metricLabel: 'de conformité garantie pour les conteneurs export',
      features: [
        'Classification automatique à l\'entrée des usines',
        'Protection optimale des lignes de transformation mécanique',
        'Conformité totale aux exigences phytosanitaires UE & US'
      ]
    }
  };

  const currentActeur = acteursData[activeActeur];

  // 6 Representative Items Matrix Grades A, B, C
  const niankaHeroItems = [
    {
      id: 'item-1',
      name: 'Fèves Cacao Séchées',
      category: 'cacao',
      image: '/images/items/cacao1.png',
      grade: 'A',
      gradeLabel: 'Grade A',
      score: 'Fermentation 88%',
      moisture: '7.4% Humidité',
      defects: '1.1% Ardoisées',
      status: 'Certifié Grade 1 Export'
    },
    {
      id: 'item-2',
      name: 'Mangue Kent Fraîche',
      category: 'mangue',
      image: '/images/items/mangue1.png',
      grade: 'A',
      gradeLabel: 'Grade A',
      score: '14.8° Brix',
      moisture: 'Maturité Stade 2',
      defects: '0.4% Taches',
      status: 'Qualité Supérieure Export'
    },
    {
      id: 'item-3',
      name: 'Anacarde Brute',
      category: 'anacarde',
      image: '/images/items/anacarde1.png',
      grade: 'B',
      gradeLabel: 'Grade B',
      score: 'KOR 46.8 lbs',
      moisture: '9.1% Humidité',
      defects: '2.3% Piqûres',
      status: 'Acceptable Séchage Requis'
    },
    {
      id: 'item-4',
      name: 'Cabosse Cacao Rouge',
      category: 'cacao',
      image: '/images/items/cacao2.png',
      grade: 'B',
      gradeLabel: 'Grade B',
      score: 'Rendement 78%',
      moisture: 'Légère Moisissure',
      defects: '3.8% Ardoisées',
      status: 'Marché Local Uniquement'
    },
    {
      id: 'item-5',
      name: 'Anacarde Décortiquée',
      category: 'anacarde',
      image: '/images/items/anacarde2.png',
      grade: 'A',
      gradeLabel: 'Grade A',
      score: 'KOR 54.2 lbs',
      moisture: '5.2% Humidité',
      defects: '0.0% Brisure',
      status: 'Qualité Supérieure Export'
    },
    {
      id: 'item-6',
      name: 'Tranche Mangue Mûre',
      category: 'mangue',
      image: '/images/items/mangue2.png',
      grade: 'C',
      gradeLabel: 'Grade C',
      score: '10.1° Brix',
      moisture: 'Sur-Maturité',
      defects: '8.5% Taches + Meurtr.',
      status: 'Déclassé Usage Transformation'
    }
  ];

  const filteredHeroItems = heroFilter === 'all' 
    ? niankaHeroItems 
    : niankaHeroItems.filter(item => item.category === heroFilter);

  const selectedItem = niankaHeroItems[selectedHeroItemIndex] || niankaHeroItems[0];

  const filieresData = {
    anacarde: {
      title: 'Anacarde (Noix de Cajou)',
      subtitle: 'Contrôle KOR & Détection de Piqûres par Vision IA',
      image: '/images/anacarde.png',
      kor: '54.2 lbs',
      humidity: '5.8%',
      defects: '0.4% Piqûres',
      yield: 'KOR 54+ LBS (Grade A Supérieur)',
      color: '#40BB1B',
      features: [
        'Calcul automatisé du Kernel Outturn Ratio (KOR en lbs)',
        'Détection infrarouge des piqûres de punaises et chenilles',
        'Mesure du taux de moisissure interne sans coupe destructive',
        'Rapport certifié pour les usines de décorticage'
      ]
    },
    cacao: {
      title: 'Cacao (Fèves de Cacao)',
      subtitle: 'Analyse du Taux de Fermentation & Grainage IA',
      image: '/images/cacao.png',
      kor: '88% Fermenté',
      humidity: '7.2%',
      defects: '1.2% Ardoisées',
      yield: 'Grade 1 Exportation (Taux Humidité Conforme)',
      color: '#2563EB',
      features: [
        'Comptage et classification du grainage par 100g',
        'Évaluation du taux de fèves violets et ardoisées',
        'Contrôle de moisissure interne par spectre visuel',
        'Conformité aux normes internationales du Conseil Cacao'
      ]
    },
    mangue: {
      title: 'Mangue (Kent, Amélie, Keitt)',
      subtitle: 'Calibration Export, Maturité & Taux de Sucre Brix',
      image: '/images/mangue.png',
      kor: '15.2° Brix',
      humidity: 'Stade 3',
      defects: '0.0% Taches',
      yield: 'Calibre 9 (Export Avorté / Fret Aérien)',
      color: '#D97706',
      features: [
        'Mesure optique non-destructive du taux de sucre (°Brix)',
        'Détection des piqûres de mouches des fruits (Ceratitis)',
        'Calibrage automatique selon les normes d\'emballage EU',
        'Prédiction de la durée de conservation en conteneur réfrigéré'
      ]
    }
  };

  const current = filieresData[activeFiliere];

  const triggerSimulation = () => {
    setSimulating(true);
    setSimulationComplete(false);
    setTimeout(() => {
      setSimulating(false);
      setSimulationComplete(true);
    }, 2000);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh' }}>
      
      {/* ========================================================================= */}
      {/* 1. HEADER & NAVIGATION BAR                                                */}
      {/* ========================================================================= */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo style={{ height: '36px' }} />
          </Link>

          {/* Nav Links */}
          <nav className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#hero" style={{ textDecoration: 'none', color: '#334155', fontWeight: 700, fontSize: '15px' }}>Accueil</a>
            <a href="#filieres" style={{ textDecoration: 'none', color: '#334155', fontWeight: 700, fontSize: '15px' }}>Filières</a>
            <a href="#simulateur" style={{ textDecoration: 'none', color: '#334155', fontWeight: 700, fontSize: '15px' }}>Simulateur IA</a>
            <a href="#acteurs" style={{ textDecoration: 'none', color: '#334155', fontWeight: 700, fontSize: '15px' }}>Tous les Acteurs</a>
            <a href="#fonctionnalites" style={{ textDecoration: 'none', color: '#334155', fontWeight: 700, fontSize: '15px' }}>Fonctionnalités</a>
            <a href="#tarifs" style={{ textDecoration: 'none', color: '#334155', fontWeight: 700, fontSize: '15px' }}>Tarifs</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/login" style={{ textDecoration: 'none', color: '#0F172A', fontWeight: 800, fontSize: '14px', padding: '10px 18px', borderRadius: '12px', border: '1.5px solid #CBD5E1' }}>
              Se connecter
            </Link>
            <Link href="/user/dashboard" className="nianka-btn-primary" style={{ fontSize: '14px', padding: '12px 22px', textDecoration: 'none' }}>
              Demo IA NIANKA <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION - EXACT MATCH TO USER'S SCREENSHOT                        */}
      {/* ========================================================================= */}
      <section id="hero" style={{ padding: '60px 24px 80px 24px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          
          {/* LEFT HERO TEXT COLUMN */}
          <div>
            {/* Tag Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '8px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: 800, marginBottom: '24px', border: '1px solid #BBF7D0' }}>
              <Brain size={16} color="#15803D" /> IA Vision v4.2 • Inspection Agroalimentaire
            </div>

            {/* Main Headline */}
            <h1 style={{ fontSize: '48px', fontWeight: 900, lineHeight: 1.15, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '24px' }}>
              Perfectionnez votre contrôle qualité pour <span style={{ color: '#40BB1B' }}>tous vos produits frais .</span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: '18px', color: '#475569', lineHeight: 1.6, marginBottom: '36px', maxWidth: '560px', fontWeight: 500 }}>
              NIANKA numérise l'inspection visuelle des récoltes en Côte d'Ivoire. Analysez les lots d'<strong>Anacarde</strong>, <strong>Cacao</strong> et <strong>Mangue</strong> avec une précision IA garantie.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
              <Link href="/user/dashboard" className="nianka-btn-primary" style={{ fontSize: '16px', padding: '16px 32px' }}>
                <Brain size={20} /> Commencer maintenant
              </Link>
              
              <Link href="/login" className="nianka-btn-secondary" style={{ fontSize: '16px', padding: '16px 32px', backgroundColor: '#2563EB', color: '#ffffff', border: 'none', textDecoration: 'none' }}>
                Se connecter
              </Link>
            </div>

            {/* Feature Highlights Footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                <CheckCircle2 size={18} color="#40BB1B" /> Précision 99.4%
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                <WifiOff size={18} color="#40BB1B" /> Mode Hors-Ligne
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                <Award size={18} color="#40BB1B" /> Normes Exportation
              </div>
            </div>
          </div>

          {/* RIGHT HERO INTERACTIVE PRODUCT MATRIX - EXACT MATCH TO USER'S SCREENSHOT */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '28px', padding: '28px', boxShadow: '0 25px 50px rgba(0,0,0,0.08)', border: '1.5px solid #E2E8F0' }}>
            


            {/* 6 Real Commodity Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: filteredHeroItems.length <= 2 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
              {filteredHeroItems.map((item, idx) => {
                const isSelected = selectedHeroItemIndex === niankaHeroItems.findIndex(i => i.id === item.id);
                return (
                  <div 
                    key={item.id}
                    className="hover-card-lift"
                    onClick={() => setSelectedHeroItemIndex(niankaHeroItems.findIndex(i => i.id === item.id))}
                    onMouseEnter={() => setHoveredItemIndex(idx)}
                    onMouseLeave={() => setHoveredItemIndex(null)}
                    style={{ 
                      backgroundColor: isSelected ? 'rgba(64, 187, 27, 0.05)' : '#ffffff', 
                      borderRadius: '18px', 
                      padding: '12px', 
                      border: isSelected ? '2.5px solid #40BB1B' : hoveredItemIndex === idx ? '2px solid #56D82F' : '1.5px solid #E2E8F0', 
                      cursor: 'pointer', 
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: isSelected ? '0 12px 30px rgba(64, 187, 27, 0.25)' : hoveredItemIndex === idx ? '0 8px 20px rgba(0,0,0,0.08)' : 'none',
                      transform: isSelected ? 'scale(1.03)' : hoveredItemIndex === idx ? 'translateY(-4px)' : 'none'
                    }}>
                    
                    {/* Grade Badge A / B / C */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                      <span className={`grade-badge-${item.grade.toLowerCase()}`}>Grade {item.grade}</span>
                    </div>

                    {/* Commodity Image with Live Laser Scanner Overlay */}
                    <div style={{ width: '145px', height: '145px', position: 'relative', borderRadius: '14px', overflow: 'hidden', margin: '4px 0 10px 0' }}>
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        width={145}
                        height={145}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />

                      {/* Laser Scanner Line Passing Animation */}
                      {(isSelected || hoveredItemIndex === idx) && (
                        <div className="laser-scanner-line" style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, #40BB1B, #ffffff, #40BB1B, transparent)', boxShadow: '0 0 12px #40BB1B', zIndex: 20 }} />
                      )}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                      {item.name}
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#40BB1B', marginTop: '2px' }}>
                      {item.score}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Live Telemetry Banner */}
            <div style={{ backgroundColor: '#123A07', color: '#ffffff', borderRadius: '18px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 15px 30px rgba(18, 58, 7, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid #40BB1B', flexShrink: 0, backgroundColor: '#ffffff' }}>
                  <Image src={selectedItem.image} alt={selectedItem.name} width={48} height={48} style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {selectedItem.name} <Brain size={14} color="#40BB1B" />
                  </div>
                  <div style={{ fontSize: '12px', color: '#40BB1B', fontWeight: 700, marginTop: '2px' }}>
                    {selectedItem.score} • {selectedItem.moisture}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ backgroundColor: '#40BB1B', color: '#ffffff', fontSize: '12px', fontWeight: 800, padding: '6px 14px', borderRadius: '9999px', display: 'inline-block' }}>
                  {selectedItem.status}
                </span>
                <div style={{ fontSize: '10px', color: '#a7f3d0', marginTop: '4px', fontFamily: 'monospace' }}>Inférence  12 ms</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FILIÈRES AGRICOLES                                                      */}
      {/* ========================================================================= */}
      <section id="filieres" style={{ padding: '90px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Nos 3 Filières Agricoles Stratégiques
            </h2>
            <p style={{ fontSize: '18px', color: '#64748B', marginTop: '12px', maxWidth: '640px', margin: '12px auto 0 auto' }}>
              Des modèles visuels spécialisés et pré-entraînés sur le terrain en Côte d'Ivoire.
            </p>

            {/* Filière Selector Tabs */}
            <div style={{ display: 'inline-flex', gap: '12px', backgroundColor: '#F1F5F9', padding: '6px', borderRadius: '9999px', marginTop: '32px' }}>
              <button 
                onClick={() => setActiveFiliere('anacarde')}
                style={{ 
                  padding: '12px 28px', borderRadius: '9999px', border: 'none', 
                  backgroundColor: activeFiliere === 'anacarde' ? '#40BB1B' : 'transparent', 
                  color: activeFiliere === 'anacarde' ? '#ffffff' : '#64748B', 
                  fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' 
                }}>
                Anacarde (Cajou)
              </button>

              <button 
                onClick={() => setActiveFiliere('cacao')}
                style={{ 
                  padding: '12px 28px', borderRadius: '9999px', border: 'none', 
                  backgroundColor: activeFiliere === 'cacao' ? '#2563EB' : 'transparent', 
                  color: activeFiliere === 'cacao' ? '#ffffff' : '#64748B', 
                  fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' 
                }}>
                Cacao (Fèves)
              </button>

              <button 
                onClick={() => setActiveFiliere('mangue')}
                style={{ 
                  padding: '12px 28px', borderRadius: '9999px', border: 'none', 
                  backgroundColor: activeFiliere === 'mangue' ? '#D97706' : 'transparent', 
                  color: activeFiliere === 'mangue' ? '#ffffff' : '#64748B', 
                  fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' 
                }}>
                Mangue (Kent)
              </button>
            </div>
          </div>

          {/* Active Filiere Detailed Card */}
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: '32px', border: '1.5px solid #E2E8F0', padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            <div>
              <div style={{ color: current.color, fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {current.subtitle}
              </div>
              <h3 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', marginBottom: '24px' }}>
                {current.title}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>INDICATEUR IA</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: current.color, marginTop: '4px' }}>{current.kor}</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>HUMIDITÉ</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>{current.humidity}</div>
                </div>
                <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>DÉFAUTS</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginTop: '4px' }}>{current.defects}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {current.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                    <CheckCircle2 size={20} color={current.color} /> {feat}
                  </div>
                ))}
              </div>

              <Link href="/user/dashboard" className="nianka-btn-primary" style={{ backgroundColor: current.color, fontSize: '15px', padding: '14px 28px' }}>
                Lancer une inspection {current.title.split(' ')[0]} <ArrowRight size={16} />
              </Link>
            </div>

            {/* Filière Image Card */}
            <div style={{ borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.12)', border: '4px solid #ffffff', position: 'relative', minHeight: '460px' }}>
              <Image 
                src={current.image} 
                alt={`NIANKA Contrôle Qualité ${current.title}`} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }} 
              />
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', color: '#ffffff', padding: '16px 24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Brain size={18} color="#40BB1B" /> Vision IA NIANKA v4.2</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#40BB1B' }}>99.4% Précision</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SIMULATEUR D'INSPECTION VISUELLE EN DIRECT                             */}
      {/* ========================================================================= */}
      <section id="simulateur" style={{ padding: '90px 24px', backgroundColor: '#0B1D08', color: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(64, 187, 27, 0.2)', color: '#40BB1B', padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 800, marginBottom: '16px' }}>
              <Zap size={16} /> DEMO INTERACTIVE EN DIRECT
            </div>
            <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#ffffff' }}>
              Testez la Détection par Réseau de Neurones
            </h2>
            <p style={{ fontSize: '17px', color: '#94a3b8', marginTop: '12px', maxWidth: '600px', margin: '12px auto 0 auto' }}>
              Sélectionnez une filière et lancez l'inférence en temps réel pour simuler un diagnostic terrain.
            </p>
          </div>

          <div style={{ backgroundColor: '#051003', borderRadius: '32px', padding: '36px', border: '1px solid rgba(64, 187, 27, 0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
            
            {/* Filières Crop Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              
              {/* Tab 1: Anacarde */}
              <button 
                onClick={() => { setSimulFiliere('anacarde'); setSimulationComplete(false); }} 
                style={{ 
                  padding: '18px 20px', 
                  borderRadius: '20px', 
                  border: simulFiliere === 'anacarde' ? '2px solid #40BB1B' : '1.5px solid rgba(255,255,255,0.1)', 
                  backgroundColor: simulFiliere === 'anacarde' ? 'rgba(64, 187, 27, 0.15)' : 'rgba(255,255,255,0.03)', 
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left',
                  boxShadow: simulFiliere === 'anacarde' ? '0 10px 25px rgba(64, 187, 27, 0.25)' : 'none',
                  transform: simulFiliere === 'anacarde' ? 'translateY(-2px)' : 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Lot Anacarde (Cajou)</div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', backgroundColor: simulFiliere === 'anacarde' ? '#40BB1B' : 'rgba(255,255,255,0.1)', color: simulFiliere === 'anacarde' ? '#ffffff' : '#94a3b8' }}>KOR 54.2 lbs</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Rendement amande & piqûres</div>
              </button>

              {/* Tab 2: Cacao */}
              <button 
                onClick={() => { setSimulFiliere('cacao'); setSimulationComplete(false); }} 
                style={{ 
                  padding: '18px 20px', 
                  borderRadius: '20px', 
                  border: simulFiliere === 'cacao' ? '2px solid #2563EB' : '1.5px solid rgba(255,255,255,0.1)', 
                  backgroundColor: simulFiliere === 'cacao' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.03)', 
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left',
                  boxShadow: simulFiliere === 'cacao' ? '0 10px 25px rgba(37, 99, 235, 0.25)' : 'none',
                  transform: simulFiliere === 'cacao' ? 'translateY(-2px)' : 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Lot Cacao (Fèves)</div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', backgroundColor: simulFiliere === 'cacao' ? '#2563EB' : 'rgba(255,255,255,0.1)', color: simulFiliere === 'cacao' ? '#ffffff' : '#94a3b8' }}>88% Fermenté</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Taux de moisissure & grainage</div>
              </button>

              {/* Tab 3: Mangue */}
              <button 
                onClick={() => { setSimulFiliere('mangue'); setSimulationComplete(false); }} 
                style={{ 
                  padding: '18px 20px', 
                  borderRadius: '20px', 
                  border: simulFiliere === 'mangue' ? '2px solid #D97706' : '1.5px solid rgba(255,255,255,0.1)', 
                  backgroundColor: simulFiliere === 'mangue' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(255,255,255,0.03)', 
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left',
                  boxShadow: simulFiliere === 'mangue' ? '0 10px 25px rgba(217, 119, 6, 0.25)' : 'none',
                  transform: simulFiliere === 'mangue' ? 'translateY(-2px)' : 'none'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Lot Mangue (Kent)</div>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', backgroundColor: simulFiliere === 'mangue' ? '#D97706' : 'rgba(255,255,255,0.1)', color: simulFiliere === 'mangue' ? '#ffffff' : '#94a3b8' }}>15.2° Brix</span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Calibrage export & maturité</div>
              </button>

            </div>

            {/* Interactive Sample Inspection Preview HUD */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '350px', marginBottom: '28px', border: '1.5px solid rgba(255,255,255,0.15)', boxShadow: 'inset 0 0 35px rgba(0,0,0,0.6)' }}>
              <Image 
                src={simulFiliere === 'anacarde' ? '/images/items/anacarde1.png' : simulFiliere === 'cacao' ? '/images/items/cacao1.png' : '/images/items/mangue1.png'} 
                alt="Aperçu Échantillon"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                style={{ objectFit: 'cover', filter: simulating ? 'brightness(0.7)' : 'brightness(0.95)', transition: 'all 0.3s' }}
              />

              {/* Laser Scanning Line Animation when Simulating */}
              {simulating && (
                <div className="laser-scanner-line" style={{ background: 'linear-gradient(90deg, transparent, #40BB1B, #ffffff, #40BB1B, transparent)', boxShadow: '0 0 20px #40BB1B', height: '4px' }} />
              )}

              {/* Telemetry HUD Overlay */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'rgba(5, 16, 3, 0.85)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(64, 187, 27, 0.4)', fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                SPECIMEN {simulFiliere.toUpperCase()}-SPEC-01
              </div>

              <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(5, 16, 3, 0.85)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(64, 187, 27, 0.4)', fontSize: '13px', fontWeight: 800, color: '#40BB1B' }}>
                CONFORT  99.6%
              </div>
            </div>

            {/* Main Action Trigger Button */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <button 
                onClick={triggerSimulation}
                disabled={simulating}
                className="nianka-btn-primary pulse-button-glow" 
                style={{ fontSize: '17px', padding: '18px 48px', opacity: simulating ? 0.7 : 1, cursor: 'pointer', borderRadius: '18px', boxShadow: '0 12px 30px rgba(64, 187, 27, 0.4)' }}>
                {simulating ? 'Inférence par Réseau de Neurones...' : 'Lancer l\'Analyse IA du Lot'}
              </button>
            </div>

            {/* Simulation Progress Telemetry Bar */}
            {simulating && (
              <div style={{ margin: '24px 0', backgroundColor: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(64, 187, 27, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#40BB1B', marginBottom: '10px', fontWeight: 800, fontFamily: 'monospace' }}>
                  <span>SCANNER SPECTRAL & DECTECTION ANOMALIES EN COURS...</span>
                  <span>92%</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: '#40BB1B', borderRadius: '9999px', boxShadow: '0 0 10px #40BB1B', transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Simulation Completed Diagnostic Dashboard */}
            {simulationComplete && (
              <div style={{ backgroundColor: 'rgba(64, 187, 27, 0.1)', border: '1.5px solid #40BB1B', borderRadius: '20px', padding: '24px', animation: 'fadeIn 0.4s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 color="#40BB1B" size={22} /> Diagnostic Terminé • Conforme Export Grade A
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 800, backgroundColor: '#40BB1B', color: '#ffffff', padding: '4px 12px', borderRadius: '9999px' }}>
                    Horodaté Blockchain & ISO
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px', color: '#cbd5e1' }}>
                  <div><strong>Taux de moisissure:</strong> &lt; 0.2% (Conforme)</div>
                  <div><strong>Humidité contrôlée:</strong> 6.8% (Optimale)</div>
                  <div><strong>Grade retenu:</strong> Grade A Supérieur</div>
                  <div><strong>Recommandation:</strong> Validé pour exportation EU/US</div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LES DÉFIS DE LA FILIÈRE & SOLUTIONS PAR INTERVENANT                    */}
      {/* ========================================================================= */}
      <section id="acteurs" style={{ padding: '90px 24px', backgroundColor: '#F8FAFC' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '8px 18px', borderRadius: '9999px', fontSize: '13px', fontWeight: 800, marginBottom: '16px' }}>
              <ShieldCheck size={16} /> LES DÉFIS DE LA FILIÈRE &amp; SOLUTIONS PAR INTERVENANT
            </div>
            <h2 style={{ fontSize: '38px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Une Réponse Ciblée aux Enjeux du Terrain
            </h2>
            <p style={{ fontSize: '18px', color: '#64748B', marginTop: '12px', maxWidth: '640px', margin: '12px auto 0 auto' }}>
              Cliquez sur un rôle pour découvrir le défi de la filière et la réponse technologique apportée par NIANKA.
            </p>

            {/* 3 Interactive Role Tabs */}
            <div style={{ display: 'inline-flex', gap: '12px', backgroundColor: '#ffffff', padding: '8px', borderRadius: '9999px', border: '1.5px solid #E2E8F0', marginTop: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <button 
                onClick={() => setActiveActeur('cooperative')}
                style={{ 
                  padding: '14px 30px', borderRadius: '9999px', border: 'none', 
                  backgroundColor: activeActeur === 'cooperative' ? '#40BB1B' : 'transparent', 
                  color: activeActeur === 'cooperative' ? '#ffffff' : '#475569', 
                  fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: activeActeur === 'cooperative' ? '0 8px 20px rgba(64, 187, 27, 0.3)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                <Users size={18} /> Pour la Coopérative
              </button>

              <button 
                onClick={() => setActiveActeur('acheteur')}
                style={{ 
                  padding: '14px 30px', borderRadius: '9999px', border: 'none', 
                  backgroundColor: activeActeur === 'acheteur' ? '#2563EB' : 'transparent', 
                  color: activeActeur === 'acheteur' ? '#ffffff' : '#475569', 
                  fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: activeActeur === 'acheteur' ? '0 8px 20px rgba(37, 99, 235, 0.3)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                <Building2 size={18} /> Pour l&apos;Acheteur
              </button>

              <button 
                onClick={() => setActiveActeur('usineur')}
                style={{ 
                  padding: '14px 30px', borderRadius: '9999px', border: 'none', 
                  backgroundColor: activeActeur === 'usineur' ? '#D97706' : 'transparent', 
                  color: activeActeur === 'usineur' ? '#ffffff' : '#475569', 
                  fontWeight: 800, fontSize: '15px', cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: activeActeur === 'usineur' ? '0 8px 20px rgba(217, 119, 6, 0.3)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                <Award size={18} /> Pour l&apos;Usineur
              </button>
            </div>
          </div>

          {/* Active Role Content Card Display */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '32px', border: `2px solid ${currentActeur.color}`, padding: '48px', boxShadow: '0 20px 40px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ backgroundColor: currentActeur.bgColor, color: currentActeur.color, fontSize: '13px', fontWeight: 900, padding: '6px 16px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentActeur.badge}
                </span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', marginTop: '12px' }}>
                  {currentActeur.title}
                </h3>
              </div>

              {/* Key Metric Callout */}
              <div style={{ backgroundColor: currentActeur.bgColor, border: `1.5px solid ${currentActeur.color}`, padding: '16px 24px', borderRadius: '20px', textAlign: 'center', minWidth: '180px' }}>
                <div style={{ fontSize: '32px', fontWeight: 900, color: currentActeur.color }}>{currentActeur.metric}</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginTop: '2px' }}>{currentActeur.metricLabel}</div>
              </div>
            </div>

            {/* 2 Grid Columns: Le Défi vs La Solution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
              
              {/* Le Défi */}
              <div style={{ backgroundColor: '#FEF2F2', padding: '28px', borderRadius: '24px', border: '1.5px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#991B1B', fontWeight: 900, fontSize: '18px', marginBottom: '12px' }}>
                  <AlertTriangle size={24} color="#EF4444" /> {currentActeur.defiTitle}
                </div>
                <p style={{ fontSize: '15px', color: '#7F1D1D', lineHeight: 1.7, fontWeight: 500 }}>
                  {currentActeur.defi}
                </p>
              </div>

              {/* La Solution NIANKA */}
              <div style={{ backgroundColor: '#F0FDF4', padding: '28px', borderRadius: '24px', border: '1.5px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#166534', fontWeight: 900, fontSize: '18px', marginBottom: '12px' }}>
                  <CheckCircle2 size={24} color="#40BB1B" /> {currentActeur.solutionTitle}
                </div>
                <p style={{ fontSize: '15px', color: '#14532D', lineHeight: 1.7, fontWeight: 500, marginBottom: '20px' }}>
                  {currentActeur.solution}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {currentActeur.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 800, color: '#15803D' }}>
                      <Check size={16} color="#40BB1B" /> {f}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FONCTIONNALITÉS CLÉS                                                    */}
      {/* ========================================================================= */}
      <section id="fonctionnalites" style={{ padding: '90px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A' }}>
              Fonctionnalités Technologiques Avancées
            </h2>
            <p style={{ fontSize: '18px', color: '#64748B', marginTop: '12px' }}>
              Une technologie d'inférence embarquée conçue spécifiquement pour les conditions du terrain.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <Cpu size={32} color="#40BB1B" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Inférence Mobile Offline</h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
                Exécutez les réseaux de neurones directement sur smartphone, sans nécessiter de connexion internet en brousse.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <FileText size={32} color="#40BB1B" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Rapports Certifiés PDF & WhatsApp</h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
                Générez instantanément des certificats de qualité horodatés et partagez-les directement aux acheteurs.
              </p>
            </div>

            <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <BarChart3 size={32} color="#40BB1B" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Tableau de Bord Centralisé</h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6 }}>
                Synchronisez les données de collecte de tous vos agents de terrain dès le retour du réseau GSM.
              </p>
            </div>

            {/* Dedicated Security & Compliance Block as requested in Audio */}
            <div style={{ padding: '28px', borderRadius: '20px', backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
              <ShieldCheck size={32} color="#15803D" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>Sécurité & Conformité ISO</h3>
              <p style={{ fontSize: '15px', color: '#14532D', lineHeight: 1.6 }}>
                Cryptage SSL 256-bit, horodatage certifié des bulletins et respect strict des normes phytosanitaires UE & US FDA.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TARIFICATION TRANSPARENTE (3 PLANS SPECIFIQUES)                        */}
      {/* ========================================================================= */}
      <section id="tarifs" style={{ padding: '90px 24px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A' }}>
              Tarification Transparente par Intervenant
            </h2>
            <p style={{ fontSize: '18px', color: '#64748B', marginTop: '12px' }}>
              Des forfaits adaptés pour les coopératives, usineurs et grands exportateurs internationaux.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Plan 1: Coopérative */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '36px', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#40BB1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Coopérative</div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', margin: '16px 0 8px 0' }}>150 000 FCFA <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 500 }}>/mois</span></div>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Pour équiper vos acheteurs et stations de collecte rurales.</p>
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                  <div>✓ Inspections Visuelles ILLIMITÉES</div>
                  <div>✓ Mode 100% Offline (Fonctionne en Brousse)</div>
                  <div>✓ Calcul KOR & Taux de Fermentation</div>
                  <div>✓ Bulletins PDF & Partage WhatsApp</div>
                </div>
              </div>
              <Link href="/user/dashboard" className="nianka-btn-secondary" style={{ marginTop: '32px', textAlign: 'center', justifyContent: 'center' }}>
                Essai Gratuit 14 Jours
              </Link>
            </div>

            {/* Plan 2: Usineur / Transformateur (Highlighted Recommandé) */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '36px', border: '3px solid #2563EB', boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#2563EB', color: '#ffffff', padding: '4px 16px', borderRadius: '9999px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>
                Recommandé Usines
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Usineur & Transformateur</div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', margin: '16px 0 8px 0' }}>350 000 FCFA <span style={{ fontSize: '15px', color: '#64748B', fontWeight: 500 }}>/mois</span></div>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Pour le filtrage aux réceptions usines et le suivi de production.</p>
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                  <div>✓ Filtrage automatisé aux entrées usines</div>
                  <div>✓ Intégration ERP & API Temps Réel</div>
                  <div>✓ Multi-utilisateurs & Gestion des rôles</div>
                  <div>✓ Support prioritaire & Calibration mensuelle</div>
                </div>
              </div>
              <Link href="/user/dashboard" className="nianka-btn-primary" style={{ backgroundColor: '#2563EB', marginTop: '32px', textAlign: 'center', justifyContent: 'center' }}>
                Activer la Solution Usine <ArrowRight size={16} />
              </Link>
            </div>

            {/* Plan 3: Exportateur International */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '36px', border: '1.5px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan Exportateur International</div>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A', margin: '16px 0 8px 0' }}>Sur Devis</div>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Dedicated infrastructure for global shipping networks.</p>
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                  <div>✓ Nœuds matériels dédiés dans les ports</div>
                  <div>✓ Entraînement de modèles IA sur-mesure</div>
                  <div>✓ Conformité phytosanitaire UE & US FDA</div>
                  <div>✓ Accompagnement technique & SLA 24/7</div>
                </div>
              </div>
              <a href="#footer" className="nianka-btn-secondary" style={{ marginTop: '32px', textAlign: 'center', justifyContent: 'center' }}>
                Contacter les Ventes Export
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7.5. PARTNERS / TRUST SECTION                                             */}
      {/* ========================================================================= */}
      <section id="partenaires" style={{ padding: '90px 24px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 900, color: '#0F172A' }}>
            Ils nous font confiance
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', marginTop: '12px', maxWidth: '640px', margin: '12px auto 60px auto' }}>
            NIANKA est la technologie de confiance pour les leaders de la filière agro-industrielle en Côte d&apos;Ivoire et à l&apos;international.
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '64px',
            filter: 'grayscale(100%)',
            opacity: 0.6,
          }}>
            {[
              { name: 'Le Conseil du Coton et de l\'Anacarde', width: 220 },
              { name: 'OLAM', width: 140 },
              { name: 'CARGILL', width: 160 },
              { name: 'BARRY CALLEBAUT', width: 200 },
              { name: 'Touton', width: 150 },
            ].map(partner => (
              <div key={partner.name} style={{ width: `${partner.width}px`, textAlign: 'center' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#475569', letterSpacing: '0.05em' }}>
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer style={{ backgroundColor: '#0F172A', color: '#ffffff', padding: '60px 24px 30px 24px', borderTop: '1px solid #1E293B' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px', paddingBottom: '40px', borderBottom: '1px solid #1E293B' }}>
          <div>
            <Logo style={{ height: '36px', filter: 'brightness(0) invert(1)' }} />
            <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '12px', maxWidth: '320px' }}>
              La plateforme d'intelligence artificielle dédiée au contrôle qualité agroalimentaire en Côte d'Ivoire.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff', marginBottom: '16px' }}>Filières</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
                <a href="#filieres" style={{ color: '#94A3B8', textDecoration: 'none' }}>Anacarde (Cajou)</a>
                <a href="#filieres" style={{ color: '#94A3B8', textDecoration: 'none' }}>Cacao (Fèves)</a>
                <a href="#filieres" style={{ color: '#94A3B8', textDecoration: 'none' }}>Mangue (Kent)</a>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff', marginBottom: '16px' }}>Plateforme</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
                <a href="#simulateur" style={{ color: '#94A3B8', textDecoration: 'none' }}>Simulateur IA</a>
                <a href="#acteurs" style={{ color: '#94A3B8', textDecoration: 'none' }}>Acteurs de la chaîne</a>
                <a href="#tarifs" style={{ color: '#94A3B8', textDecoration: 'none' }}>Tarifs</a>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1320px', margin: '24px auto 0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748B', flexWrap: 'wrap', gap: '12px' }}>
          <div>© 2026 NIANKA AgroTech. Tous droits réservés.</div>
          <div>Abidjan, Côte d'Ivoire • Made with Precision</div>
        </div>
      </footer>

    </div>
  );
}
