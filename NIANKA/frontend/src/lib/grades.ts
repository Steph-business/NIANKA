/**
 * Traduction du grade technique du modèle vers un langage de DÉCISION.
 *
 * Pourquoi : « Grade A/B/C » n'est pas un référentiel de la filière anacarde.
 * La noix brute se négocie sur quatre paramètres chiffrés (KOR, grainage,
 * humidité, taux de défaut), et l'amande décortiquée sur les calibres
 * internationaux (W180, W240, W320...). Afficher une note en lettres
 * laisserait croire à un grade commercial qui n'existe pas.
 *
 * Les libellés ci-dessous disent à l'agent ce qu'il doit FAIRE, ce qui
 * correspond au véritable usage du modèle : un outil de dépistage, pas de
 * diagnostic. Les valeurs techniques restent inchangées en base de données —
 * seul l'affichage est traduit.
 */

export interface LibelleGrade {
  /** Libellé affiché à l'utilisateur. */
  label: string;
  /** Action attendue de l'agent. */
  action: string;
  color: string;
  bg: string;
  border: string;
}

const TABLE: Record<string, LibelleGrade> = {
  'Grade A': { label: 'Conforme', action: 'Lot sain', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0' },
  'Grade B': { label: 'Acceptable', action: 'Écarts mineurs', color: '#EA580C', bg: '#FFEDD5', border: '#FDBA74' },
  'Grade C': { label: 'À contrôler', action: 'Test de coupe recommandé', color: '#CA8A04', bg: '#FEF9C3', border: '#FDE047' },
  'Rejeté':  { label: 'Non conforme', action: 'Refus ou décote', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

const INCONNU: LibelleGrade = {
  label: '—', action: '', color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0',
};

/** Traduit un grade technique ; tolère les valeurs absentes ou inattendues. */
export function libelleGrade(gradeTechnique?: string | null): LibelleGrade {
  if (!gradeTechnique) return INCONNU;
  const exact = TABLE[gradeTechnique];
  if (exact) return exact;
  // Tolérance : anciennes données ou variantes de casse.
  const cle = Object.keys(TABLE).find(k => gradeTechnique.includes(k));
  return cle ? TABLE[cle] : INCONNU;
}

/** Vrai si le lot demande une vérification humaine (ex-Grade C ou Rejeté). */
export function demandeControle(gradeTechnique?: string | null): boolean {
  if (!gradeTechnique) return false;
  return gradeTechnique.includes('Grade C') || gradeTechnique.includes('Rejeté');
}
