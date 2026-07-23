"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Camera, Upload, Microscope } from 'lucide-react';

export default function AnalysisPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('Identification...');
  const router = useRouter();

  const startAnalysis = () => {
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      setShowProgress(true);
      
      let currentProgress = 0;
      const steps = ['Identification...', 'Détection des défauts...', 'Calcul du score...'];
      let stepIndex = 0;

      const interval = setInterval(() => {
        currentProgress += Math.random() * 5 + 1;
        if (currentProgress > 100) currentProgress = 100;

        if (currentProgress > 33 && stepIndex === 0) { stepIndex = 1; setStepText(steps[stepIndex]); }
        if (currentProgress > 66 && stepIndex === 1) { stepIndex = 2; setStepText(steps[stepIndex]); }

        setProgress(currentProgress);

        if (currentProgress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push('/analysis/result');
          }, 1000);
        }
      }, 150);
    }, 800);
  };

  return (
    <DashboardLayout userType="user">
      <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Column */}
        <div style={{ width: '100%', flex: '1 1 300px', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="glass-panel" style={{ borderRadius: '12px', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-on-surface)', margin: 0 }}>Data Input</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-on-surface-variant)', marginBottom: '8px' }}>Select image source for AI processing.</p>
            
            <button className="btn-hover" style={{ width: '100%', backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              <Camera size={18} /> Prendre une photo
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }}></div>
              <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>ou</span>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)' }}></div>
            </div>

            <button className="btn-hover" style={{ width: '100%', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: '6px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Upload size={18} /> Importer une image
            </button>
          </div>

          <div className="glass-panel" style={{ borderRadius: '12px', padding: 'var(--space-md)', marginTop: 'auto' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
              System Status
            </h3>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Core AI:</span> <span style={{ color: 'var(--color-primary)' }}>Online</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Latency:</span> <span>12ms</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Model V:</span> <span>NIANKA-CV-4.2</span></div>
            </div>
          </div>
        </div>

        {/* Right Column Workspace */}
        <div className="glass-panel" style={{ flex: '2 1 600px', borderRadius: '12px', padding: 'var(--space-md)', minHeight: '600px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', zIndex: 10 }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-on-surface)', margin: 0 }}>Workspace</h2>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button className="btn-hover" style={{ backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', color: 'var(--color-on-surface)', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Changer</button>
              <button onClick={startAnalysis} className="btn-hover" style={{ backgroundColor: 'var(--color-primary)', border: 'none', color: 'var(--color-on-primary)', fontSize: '14px', fontWeight: 600, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Analyser</button>
            </div>
          </div>

          <div style={{ flexGrow: 1, backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid rgba(188, 202, 192, 0.5)', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7ZrIxcjyF2wWFTtAx8aASk-VhHTnl7S-pyf-L81Nnebp-RLsOlrNJieHGAloEIsi782NFKWkLKUOFgFWuWwpy6_SZaMyCuAD5aoVj_ZdeergVCgCjLlYOHGUkisobukuFZC7uYfeUpDu9sNV-zewzOPKgK20ke9ms4rSL2_HkEKbzBwpn4mgnqfJ5mLFFNP_csa6X9pJbAfb2EX0sKTHT5Rt_ECLC_s4Kpv2hxrQbF-h9j1FSqkvpOBbVSSHti0CYqoyqMRoXfH0" alt="Sample" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
            
            <div style={{ position: 'absolute', top: 'var(--space-sm)', left: 'var(--space-sm)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', padding: '8px', border: '1px solid rgba(188,202,192,0.3)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-secondary)' }}>
              <div>{isScanning || showProgress ? 'TRGT: ACQ' : 'TRGT: --'}</div>
              <div>{isScanning || showProgress ? 'COORD: MAPPING' : 'COORD: --'}</div>
            </div>

            <div style={{ position: 'absolute', bottom: 'var(--space-sm)', right: 'var(--space-sm)', color: 'var(--color-outline-variant)', opacity: 0.5, fontSize: '32px' }}>
              ⛶
            </div>

            {isScanning && <div className="scanning-line"></div>}

            {showProgress && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(248, 249, 250, 0.9)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}>
                <div style={{ width: '200px', height: '200px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'rgba(0,105,71,0.2)' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="2"></circle>
                  </svg>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'var(--color-primary)', transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s ease' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (progress / 100) * 283}></circle>
                  </svg>
                  <div className="pulse-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(0,105,71,0.1)', color: 'var(--color-primary)' }}>
                    <Microscope size={24} />
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', width: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600, color: 'var(--color-on-surface)' }}>
                    <span>{stepText}</span>
                    <span style={{ color: 'var(--color-primary)' }}>{Math.floor(progress)}%</span>
                  </div>
                  <div style={{ width: '100%', backgroundColor: 'var(--color-surface-variant)', borderRadius: '9999px', height: '4px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: 'var(--color-primary)', height: '100%', width: `${progress}%`, transition: 'width 0.3s ease' }}></div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-secondary)', marginTop: '8px', textAlign: 'left', opacity: 0.7 }}>
                    &gt; executing vision_model_v4...<br/>
                    &gt; extracting features...<br/>
                    &gt; cross-referencing database...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
