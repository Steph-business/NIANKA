import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/Card';

export default function AdminDashboard() {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--space-lg)',
    marginBottom: 'var(--space-xl)',
  };

  return (
    <DashboardLayout userType="admin">
      <h1 style={{ marginBottom: 'var(--space-xs)' }}>Tableau de bord Administrateur</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-xl)' }}>Vue globale de l'activité de la plateforme NIANKA.</p>

      <div style={gridStyle}>
        <Card elevation="md">
          <h3 style={{ fontSize: '14px', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>Utilisateurs Actifs</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-on-surface)' }}>1,248</div>
          <div style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: 'var(--space-xs)' }}>+12% ce mois-ci</div>
        </Card>
        <Card elevation="md">
          <h3 style={{ fontSize: '14px', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>Analyses Totales</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-on-surface)' }}>8,432</div>
          <div style={{ fontSize: '12px', color: 'var(--color-primary)', marginTop: 'var(--space-xs)' }}>+5% ce mois-ci</div>
        </Card>
        <Card elevation="md">
          <h3 style={{ fontSize: '14px', color: 'var(--color-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>Taux d'Anomalies</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--color-error)' }}>4.2%</div>
          <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginTop: 'var(--space-xs)' }}>Moyenne stable</div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
        <Card elevation="md">
          <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-md)' }}>Activité Récente</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <th style={{ padding: 'var(--space-sm) 0', textAlign: 'left', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Utilisateur</th>
                <th style={{ padding: 'var(--space-sm) 0', textAlign: 'left', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Action</th>
                <th style={{ padding: 'var(--space-sm) 0', textAlign: 'right', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Heure</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-surface-container-high)' }}>
                <td style={{ padding: 'var(--space-md) 0', fontSize: '14px' }}>Kouakou Jean</td>
                <td style={{ padding: 'var(--space-md) 0', fontSize: '14px' }}>Nouvelle Analyse (Cacao)</td>
                <td style={{ padding: 'var(--space-md) 0', textAlign: 'right', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Il y a 5 min</td>
              </tr>
              <tr>
                <td style={{ padding: 'var(--space-md) 0', fontSize: '14px' }}>Sika Coop</td>
                <td style={{ padding: 'var(--space-md) 0', fontSize: '14px' }}>Abonnement Pro</td>
                <td style={{ padding: 'var(--space-md) 0', textAlign: 'right', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Il y a 12 min</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card elevation="md">
          <h2 style={{ fontSize: '18px', marginBottom: 'var(--space-md)' }}>Alertes Système</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'rgba(186, 26, 26, 0.05)', borderLeft: '4px solid var(--color-error)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-error)' }}>Risque Élevé détecté</div>
              <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Lot #AN-2026-002</div>
            </div>
            <div style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--color-surface-container)', borderLeft: '4px solid var(--color-outline)', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Mise à jour Modèle IA</div>
              <div style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Planifiée pour ce soir 00:00</div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
