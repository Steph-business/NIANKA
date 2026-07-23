"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';

export default function LoginPage() {
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-surface-container-low)',
    padding: 'var(--space-lg)',
  };

  const cardContainerStyle = {
    width: '100%',
    maxWidth: '450px',
  };

  return (
    <div style={containerStyle}>
      <div style={cardContainerStyle}>
        <Card elevation="md" style={{ padding: 'var(--space-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <img src="/logo.png" alt="NIANKA Logo" style={{ height: '48px', margin: '0 auto', marginBottom: 'var(--space-sm)' }} />
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '16px' }}>Precision Food Safety Intelligence</p>
          </div>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <Input label="Email Professionnel" type="email" placeholder="jane.doe@lab.com" />
            <Input label="Mot de passe" type="password" placeholder="••••••••" />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" /> Se souvenir de moi
              </label>
              <a href="#" style={{ fontSize: '14px', color: 'var(--color-primary)' }}>Mot de passe oublié ?</a>
            </div>

            <Link href="/user/dashboard" style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>
              <Button fullWidth variant="primary">Connexion</Button>
            </Link>
          </form>
          
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)', opacity: 0.3 }}></div>
            <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>ou continuer avec</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline-variant)', opacity: 0.3 }}></div>
          </div>

          <div style={{ marginTop: 'var(--space-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
            <Button variant="outline" style={{ display: 'flex', gap: '8px', color: 'var(--color-on-surface)', borderColor: 'rgba(188, 202, 192, 0.5)' }}>Google</Button>
            <Button variant="outline" style={{ display: 'flex', gap: '8px', color: 'var(--color-on-surface)', borderColor: 'rgba(188, 202, 192, 0.5)' }}>GitHub</Button>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>
            Pas encore de compte ? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Inscrivez-vous</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
