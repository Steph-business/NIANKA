/**
 * Centralized API Integration Client for NIANKA Platform
 * Connects Next.js Frontend to FastAPI Backend Services (/api/v1)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export interface UserProfile {
  id: string;
  nom_complet: string;
  telephone: string;
  email?: string;
  role: 'cooperative' | 'entrepot' | 'institution' | 'usineur' | 'usine' | 'admin' | 'acheteur' | 'exportateur' | 'agent';
  organisation?: string;
  cooperative_id?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface LotData {
  id?: string;
  code_lot?: string;
  numero_lot?: string;
  nom_producteur?: string;
  nom_cooperative?: string;
  cooperative_id?: string;
  poids_tonnes?: number;
  grade?: string;
  grade_qualite?: string;
  kor_score?: number;
  score_kor?: number;
  humidite?: number;
  gps_lat?: number;
  gps_long?: number;
  coord_gps?: string;
  date_creation?: string;
  created_at?: string;
  statut?: string;
  acheteur_id?: string;
}

/** Scan bord champ tel que renvoyé par l'API (source de vérité de la traçabilité). */
export interface ScanData {
  id: string;
  agent_id: string;
  nom_agent?: string | null;
  image_url: string;
  grade_ia: string;
  score_confiance: number;
  score_kor?: number | null;
  humidite?: number | null;
  defauts?: Record<string, unknown> | null;
  gps_lat?: number | null;
  gps_long?: number | null;
  etape: string;
  date_scan: string;
}

/** Lot certifié transmis au portail acheteur après scellement de la vente. */
export interface LotCertifie {
  arbitrage_id: string;
  bordereau_id: string;
  numero_bordereau: string;
  acheteur_id?: string | null;
  nom_acheteur?: string | null;
  nom_cooperative?: string | null;
  nom_agent?: string | null;
  nom_entrepot?: string | null;
  grade_lot: string;
  volume_tonnes: number;
  immatriculation_camion: string;
  nom_chauffeur: string;
  kor_initial?: number | null;
  humidite_initiale?: number | null;
  kor_entrepot?: number | null;
  humidite_entrepot?: number | null;
  delta_kor: number;
  verdict_conforme: boolean;
  image_scan_initial?: string | null;
  image_scan_entrepot?: string | null;
  gps_lat?: number | null;
  gps_long?: number | null;
  statut_vente: string;
  certificat_pdf_url?: string | null;
  scelle_a: string;
}

/** Rapport persisté côté serveur (table `rapports`). */
export interface RapportData {
  id: string;
  utilisateur_id: string;
  titre: string;
  type_rapport: string;
  periode_debut: string;
  periode_fin: string;
  fichier_url: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  utilisateur_id: string;
  type?: string;
  contenu: string;
  lu: boolean;
  reference_id?: string | null;
  cree_le?: string | null;
  /** Scan associé, résolu par le backend via reference_id. */
  scan?: {
    id: string;
    image_url?: string;
    grade_ia?: string;
    score_kor?: number | null;
    humidite?: number | null;
    defauts?: Record<string, unknown> | null;
  } | null;
}

export interface PredictionResult {
  predicted_grade: string;
  grade_code: string;
  confidence_pct: number;
  confidence_score: number;
  model_loaded?: boolean;
  probabilities: Record<string, number>;
  metrics: {
    kor_lbs: number;
    defect_rate_pct: number;
    calibre_mm: number;
    humidity_pct: number;
    certification: string;
    certification_color: string;
    latency_ms: number;
    model_engine: string;
    inference_mode?: string;
  };
  lot_metadata: {
    producer: string;
    cooperative: string;
    weight_kg: number;
    gps: string;
    timestamp: string;
  };
  // Renseignés lorsque le scan est persisté côté serveur
  scan_id?: string;
  image_url?: string;
  agent_id?: string;
  nom_agent?: string;
  gps_lat?: number | null;
  gps_long?: number | null;
  etape?: string;
}

export interface TransferOrderData {
  id: string;
  numero_bordereau: string;
  cooperative_id?: string;
  entrepot_id?: string | null;
  scan_initial_id: string;
  immatriculation_camion: string;
  nom_chauffeur: string;
  volume_tonnes: number;
  grade_lot: string;
  statut: string;
  qr_payload: string;
  created_at: string;

  // Traçabilité résolue côté serveur
  nom_cooperative?: string | null;
  nom_entrepot?: string | null;
  nom_agent?: string | null;
  scan_initial?: ScanData | null;
  kor_initial?: number | null;
  humidite_initiale?: number | null;
  arbitre?: boolean;

  // Champs de compatibilité ascendante
  lot_id?: string;
  cooperative_depart?: string;
  entrepot_destination?: string;
  tonnage_transfert?: number;
  qr_code_payload?: string;
  date_emission?: string;
}

/** Alias historique conservé pour les écrans déjà écrits. */
export type TransferData = TransferOrderData;

export interface ArbitrageData {
  bordereau_id: string;
  scan_entrepot_image_url?: string;
  scan_entrepot_grade?: string;
  scan_entrepot_kor?: number;
  scan_entrepot_humidite?: number;
  score_kor_entrepot?: number;
  taux_humidite_entrepot?: number;
  verdict_conforme?: boolean;
  notes_arbitre?: string;
  acheteur_id?: string;
}

export interface TraceabilityStats {
  utilisateur: string;
  role: string;
  tonnage_total_collecte: number;
  tonnage_expedie?: number;
  kor_moyen: number;
  qualite_premium_pourcent: number;
  lots_en_transit: number;
  lots_scelles: number;
  total_lots_count?: number;
  total_scans_count?: number;
  total_bordereaux?: number;
  grades: Record<string, string>;
}

function normalizeRole(role?: string): string {
  const cleaned = (role || 'cooperative').toLowerCase().trim();
  if (cleaned === 'usineur') return 'usine';
  if (cleaned === 'institution') return 'admin';
  if (cleaned === 'acheteur' || cleaned === 'exporteur') return 'exportateur';
  return cleaned;
}

function normalizeLotPayload(lot: LotData) {
  const lotCompat = lot as LotData & { grade?: string; grade_qualite?: string; humidite?: number; kor_score?: number; gps_lat?: number; gps_long?: number; nom_producteur?: string; nom_cooperative?: string };
  return {
    grade: lotCompat.grade || lotCompat.grade_qualite || 'Grade A',
    poids_tonnes: typeof lot.poids_tonnes === 'number' ? lot.poids_tonnes : 1,
    score_kor: typeof lotCompat.kor_score === 'number' ? lotCompat.kor_score : undefined,
    humidite: lotCompat.humidite ?? undefined,
    gps_lat: lotCompat.gps_lat ?? undefined,
    gps_long: lotCompat.gps_long ?? undefined,
    nom_producteur: lotCompat.nom_producteur,
    nom_cooperative: lotCompat.nom_cooperative,
  };
}

export interface TransferOrderInput {
  /** Scan bord champ réellement expédié — c'est lui qui porte la traçabilité. */
  scan_initial_id?: string;
  /** UUID de l'entrepôt destinataire (issu de api.auth.listEntites('entrepot')). */
  entrepot_id?: string;
  entrepot_destination?: string;
  cooperative_depart?: string;
  immatriculation_camion?: string;
  nom_chauffeur?: string;
  volume_tonnes?: number;
  tonnage_transfert?: number;
  grade_lot?: string;
}

function normalizeTransferPayload(transfer: TransferOrderInput) {
  const volume = typeof transfer.volume_tonnes === 'number'
    ? transfer.volume_tonnes
    : (typeof transfer.tonnage_transfert === 'number' ? transfer.tonnage_transfert : 1);

  return {
    scan_initial_id: transfer.scan_initial_id || undefined,
    entrepot_id: transfer.entrepot_id || undefined,
    immatriculation_camion: transfer.immatriculation_camion || 'CI-000-XX',
    nom_chauffeur: transfer.nom_chauffeur || 'Chauffeur',
    volume_tonnes: volume,
    grade_lot: transfer.grade_lot || 'Grade A',
    cooperative_depart: transfer.cooperative_depart,
    entrepot_destination: transfer.entrepot_destination,
    tonnage_transfert: volume,
  };
}

function normalizeArbitragePayload(arbitrage: ArbitrageData) {
  return {
    bordereau_id: arbitrage.bordereau_id,
    scan_entrepot_image_url: arbitrage.scan_entrepot_image_url || 'https://storage.nianka.ci/scans/entrepot-placeholder.jpg',
    scan_entrepot_grade: arbitrage.scan_entrepot_grade || 'A',
    scan_entrepot_kor: typeof arbitrage.scan_entrepot_kor === 'number'
      ? arbitrage.scan_entrepot_kor
      : (typeof arbitrage.score_kor_entrepot === 'number' ? arbitrage.score_kor_entrepot : 54.2),
    scan_entrepot_humidite: typeof arbitrage.scan_entrepot_humidite === 'number'
      ? arbitrage.scan_entrepot_humidite
      : (typeof arbitrage.taux_humidite_entrepot === 'number' ? arbitrage.taux_humidite_entrepot : 6.8),
    verdict_conforme: arbitrage.verdict_conforme ?? true,
    notes_arbitre: arbitrage.notes_arbitre,
    acheteur_id: arbitrage.acheteur_id,
  };
}

// Token helper
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nianka_access_token') || localStorage.getItem('token');
  }
  return null;
}

export function setAuthSession(authData: AuthResponse) {
  if (typeof window !== 'undefined' && authData) {
    const authDataCompat = authData as AuthResponse & { token?: string; access_token?: string };
    const tokenStr = typeof authDataCompat.access_token === 'string'
      ? authDataCompat.access_token
      : (authDataCompat.token || authDataCompat.access_token || '');
    if (tokenStr) {
      localStorage.setItem('nianka_access_token', tokenStr);
      localStorage.setItem('token', tokenStr);
    }
    if (authData.user) {
      localStorage.setItem('nianka_user_profile', JSON.stringify(authData.user));
      localStorage.setItem('nianka_user_role', normalizeRole(authData.user.role || 'agent'));
    }
  }
}

export function getCurrentUserProfile(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('nianka_user_profile');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e: unknown) {
        return null;
      }
    }
  }
  return null;
}

export function clearAuthSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nianka_access_token');
    localStorage.removeItem('nianka_user_profile');
    localStorage.removeItem('nianka_user_role');
    localStorage.removeItem('nianka_last_analysis');
    localStorage.removeItem('nianka_last_image');
  }
}

// Universal fetch wrapper
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set default JSON Content-Type unless sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      errorJson = { detail: errorText || response.statusText };
    }

    let errorMessage = `Erreur API (${response.status})`;
    if (errorJson?.detail) {
      if (typeof errorJson.detail === 'string') {
        errorMessage = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorMessage = errorJson.detail.map((err: Record<string, unknown>) => err.msg || err.message || JSON.stringify(err)).join(' | ');
      } else if (typeof errorJson.detail === 'object') {
        errorMessage = JSON.stringify(errorJson.detail);
      }
    } else if (errorJson?.message) {
      errorMessage = typeof errorJson.message === 'string' ? errorJson.message : JSON.stringify(errorJson.message);
    }

    // French error translation for friendly UX
    if (errorMessage.includes('at least 3 characters')) {
      errorMessage = 'Le nom complet doit comporter au moins 3 caractères.';
    } else if (errorMessage.includes('at least 6 characters')) {
      errorMessage = 'Le mot de passe doit comporter au moins 6 caractères.';
    } else if (errorMessage.includes('Field required')) {
      errorMessage = 'Veuillez remplir tous les champs obligatoires.';
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

// API Service Methods
export const api = {
  // Authentication
  auth: {
    login: async (telephone: string, mot_de_passe: string): Promise<AuthResponse> => {
      const res = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          login_input: telephone.trim(),
          telephone: telephone.trim(),
          password: mot_de_passe,
        }),
      });
      setAuthSession(res);
      return res;
    },

    register: async (userData: {
      nom_complet: string;
      telephone: string;
      role: string;
      mot_de_passe: string;
      email?: string;
      organisation?: string;
      /** Coopérative de rattachement — requise métier pour un agent pisteur. */
      cooperative_id?: string;
    }): Promise<AuthResponse> => {
      const cleanPhone = userData.telephone.replace(/[^0-9]/g, '');
      const userEmail = userData.email || `user_${cleanPhone || Date.now()}@nianka.app`;
      const basePseudo = userData.nom_complet.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${cleanPhone}`;
      // Le pseudo est unique en base : on le suffixe avec le numéro pour éviter
      // les collisions entre deux homonymes lors des inscriptions de démonstration.
      const pseudo = `${basePseudo}${cleanPhone.slice(-4)}`;
      const normalizedRole = normalizeRole(userData.role);

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nom_complet: userData.nom_complet,
          pseudo: pseudo,
          email: userEmail,
          password: userData.mot_de_passe,
          role: normalizedRole,
          telephone: userData.telephone,
          cooperative_id: userData.cooperative_id || undefined,
        }),
      });

      // Auto-login to receive AuthResponse with token and profile
      return api.auth.login(userData.telephone, userData.mot_de_passe);
    },

    getMe: async (): Promise<UserProfile> => {
      return apiFetch<UserProfile>('/auth/me');
    },

    /** Met réellement à jour le profil en base (nom, téléphone...). */
    updateProfile: async (data: { nom_complet?: string; telephone?: string }): Promise<UserProfile> => {
      const updated = await apiFetch<UserProfile>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      // Répercute la mise à jour sur le profil mis en cache localement, pour
      // que la barre latérale (nom, initiales) reflète le changement sans
      // attendre une reconnexion.
      if (typeof window !== 'undefined') {
        localStorage.setItem('nianka_user_profile', JSON.stringify(updated));
      }
      return updated;
    },

    listAcheteurs: async (role?: string): Promise<UserProfile[]> => {
      const query = role ? `?role=${encodeURIComponent(role)}` : '';
      return apiFetch<UserProfile[]>(`/auth/acheteurs${query}`);
    },

    /** Annuaire public par rôle : coopératives, entrepôts, usiniers, exportateurs. */
    listEntites: async (role: string): Promise<UserProfile[]> => {
      return apiFetch<UserProfile[]>(`/auth/entites?role=${encodeURIComponent(role)}`);
    },

    listPisteurs: async (): Promise<UserProfile[]> => {
      return apiFetch<UserProfile[]>('/auth/pisteurs');
    },

    rattacherPisteur: async (agent_id: string, cooperative_id?: string): Promise<UserProfile> => {
      return apiFetch<UserProfile>('/auth/pisteurs/rattacher', {
        method: 'PATCH',
        body: JSON.stringify({ agent_id, cooperative_id }),
      });
    },
  },

  // Etapes & Traceability
  etapes: {
    createLot: async (lot: LotData): Promise<LotData> => {
      return apiFetch<LotData>('/etapes/lots', {
        method: 'POST',
        body: JSON.stringify(normalizeLotPayload(lot)),
      });
    },

    getLots: async (): Promise<LotData[]> => {
      return apiFetch<LotData[]>('/etapes/lots');
    },

    getLot: async (id: string): Promise<LotData> => {
      return apiFetch<LotData>(`/etapes/lots/${id}`);
    },

    getScans: async (): Promise<ScanData[]> => {
      return apiFetch<ScanData[]>('/etapes/scans');
    },

    /**
     * Lance l'analyse IA. Le scan est persisté au nom de l'utilisateur connecté
     * et sa coopérative de rattachement est notifiée automatiquement.
     */
    predictQuality: async (formData: FormData): Promise<PredictionResult> => {
      return apiFetch<PredictionResult>('/etapes/predict-quality', {
        method: 'POST',
        body: formData,
      });
    },

    createTransfer: async (transfer: TransferOrderInput): Promise<TransferOrderData> => {
      return apiFetch<TransferOrderData>('/etapes/transfert', {
        method: 'POST',
        body: JSON.stringify(normalizeTransferPayload(transfer)),
      });
    },

    /** Bordereaux visibles par l'utilisateur (expéditions coop / arrivages entrepôt). */
    getTransferts: async (): Promise<TransferOrderData[]> => {
      return apiFetch<TransferOrderData[]>('/etapes/transferts');
    },

    getTransfer: async (identifier: string): Promise<TransferOrderData> => {
      return apiFetch<TransferOrderData>(`/etapes/transfert/${encodeURIComponent(identifier)}`);
    },

    executeArbitrage: async (arbitrage: ArbitrageData) => {
      return apiFetch('/etapes/arbitrage', {
        method: 'POST',
        body: JSON.stringify(normalizeArbitragePayload(arbitrage)),
      });
    },

    /** Catalogue des lots certifiés attribués à l'acheteur connecté (étape 5). */
    getLotsCertifies: async (): Promise<LotCertifie[]> => {
      return apiFetch<LotCertifie[]>('/etapes/lots-certifies');
    },

    /** URL du certificat imprimable (document public vérifiable par QR Code). */
    certificatUrl: (numeroBordereau: string): string =>
      `${API_BASE_URL}/etapes/certificat/${encodeURIComponent(numeroBordereau)}`,

    getStats: async (): Promise<TraceabilityStats> => {
      return apiFetch<TraceabilityStats>('/etapes/stats');
    },
  },

  // Notifications
  notifications: {
    list: async (unreadOnly?: boolean): Promise<NotificationItem[]> => {
      return apiFetch<NotificationItem[]>(`/notifications/${unreadOnly ? '?unread_only=true' : ''}`);
    },
    markRead: async (id: string) => {
      return apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' });
    },
    markAllRead: async () => {
      return apiFetch<{ message: string }>('/notifications/read-all', { method: 'PATCH' });
    },
  },

  // Reports
  rapports: {
    list: async (): Promise<RapportData[]> => {
      return apiFetch<RapportData[]>('/rapports/');
    },
    generate: async (params: { type_rapport: string; periode: string; titre?: string }): Promise<RapportData> => {
      return apiFetch<RapportData>('/rapports/generate', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  },
};
