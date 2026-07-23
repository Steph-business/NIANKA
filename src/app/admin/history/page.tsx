import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function AdminHistoryPage() {
  return (
    <DashboardLayout userType="admin">
      <h1 style={{ marginBottom: 'var(--space-xs)' }}>Historique Global des Analyses</h1>
      <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-xl)' }}>Registre complet de toutes les analyses effectuées sur la plateforme.</p>

      <Card elevation="sm" style={{ marginBottom: 'var(--space-lg)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Input placeholder="Rechercher par ID, Utilisateur ou Produit..." fullWidth={false} style={{ width: '100%', marginBottom: 0 }} />
        </div>
        <Button variant="outline">Filtrer</Button>
        <Button variant="outline">Exporter CSV</Button>
      </Card>

      <Card noPadding elevation="md">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container)' }}>
              <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '14px', color: 'var(--color-secondary)' }}>ID Analyse</th>
              <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '14px', color: 'var(--color-secondary)' }}>Utilisateur</th>
              <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '14px', color: 'var(--color-secondary)' }}>Date</th>
              <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '14px', color: 'var(--color-secondary)' }}>Produit</th>
              <th style={{ padding: 'var(--space-md)', textAlign: 'left', fontSize: '14px', color: 'var(--color-secondary)' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr className="table-row" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', fontWeight: 500 }}>#AN-2026-001</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Entreprise A</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>17 Juil 2026 14:32</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Lot Cacao A1</td>
              <td style={{ padding: 'var(--space-md)' }}>
                <span style={{ backgroundColor: 'rgba(0, 105, 71, 0.1)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>Conforme</span>
              </td>
            </tr>
            <tr className="table-row" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', fontWeight: 500 }}>#AN-2026-002</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Laboratoire X</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>15 Juil 2026 10:15</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px', color: 'var(--color-on-surface-variant)' }}>Lot Mangue B4</td>
              <td style={{ padding: 'var(--space-md)' }}>
                <span style={{ backgroundColor: 'rgba(186, 26, 26, 0.1)', color: 'var(--color-error)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>Risque Élevé</span>
              </td>
            </tr>
            <tr className="table-row" style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px' }}>#AN-2026-003</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px' }}>Bamba Ali</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px' }}>16 Juil 2026 09:45</td>
              <td style={{ padding: 'var(--space-md)', fontSize: '14px' }}>Anacarde Z9</td>
              <td style={{ padding: 'var(--space-md)' }}>
                <span style={{ backgroundColor: 'rgba(0, 105, 71, 0.1)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>Conforme</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}
