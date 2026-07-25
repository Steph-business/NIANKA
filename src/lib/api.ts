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
  role: 'cooperative' | 'entrepot' | 'institution' | 'usineur' | 'admin' | 'acheteur' | 'agent';
  organisation?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface LotData {
  id?: string;
  code_lot?: string;
  nom_producteur: string;
  nom_cooperative: string;
  poids_tonnes: number;
  grade_qualite: string;
  kor_score: number;
  coord_gps?: string;
  date_creation?: string;
  statut?: string;
}

export interface PredictionResult {
  predicted_grade: string;
  grade_code: string;
  confidence_pct: number;
  confidence_score: number;
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
  };
  lot_metadata: {
    producer: string;
    cooperative: string;
    weight_kg: number;
    gps: string;
    timestamp: string;
  };
}

export interface TransferOrderData {
  id?: string;
  numero_bordereau: string;
  lot_id?: string;
  cooperative_depart: string;
  entrepot_destination: string;
  tonnage_transfert: number;
  grade_lot?: string;
  statut?: string;
  qr_code_payload?: string;
  date_emission?: string;
}

export interface ArbitrageData {
  bordereau_id: string;
  score_kor_entrepot: number;
  taux_humidite_entrepot: number;
  verdict_conforme: boolean;
  notes_arbitre?: string;
}

export interface TraceabilityStats {
  utilisateur: string;
  role: string;
  tonnage_total_collecte: number;
  kor_moyen: number;
  qualite_premium_pourcent: number;
  lots_en_transit: number;
  lots_scelles: number;
  grades: Record<string, string>;
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
    const tokenStr = typeof authData.access_token === 'string' 
      ? authData.access_token 
      : ((authData as any).token || (authData as any).access_token);
    if (tokenStr) {
      localStorage.setItem('nianka_access_token', tokenStr);
      localStorage.setItem('token', tokenStr);
    }
    if (authData.user) {
      localStorage.setItem('nianka_user_profile', JSON.stringify(authData.user));
      localStorage.setItem('nianka_user_role', authData.user.role || 'agent');
    }
  }
}

export function getCurrentUserProfile(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('nianka_user_profile');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
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
        errorMessage = errorJson.detail.map((err: any) => err.msg || err.message || JSON.stringify(err)).join(' | ');
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
    }): Promise<AuthResponse> => {
      const cleanPhone = userData.telephone.replace(/[^0-9]/g, '');
      const userEmail = userData.email || `user_${cleanPhone || Date.now()}@nianka.app`;
      const pseudo = userData.nom_complet.toLowerCase().replace(/[^a-z0-9]/g, '') || `user${cleanPhone}`;

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nom_complet: userData.nom_complet,
          pseudo: pseudo,
          email: userEmail,
          password: userData.mot_de_passe,
          role: userData.role,
          telephone: userData.telephone,
        }),
      });

      // Auto-login to receive AuthResponse with token and profile
      return api.auth.login(userData.telephone, userData.mot_de_passe);
    },

    getMe: async (): Promise<UserProfile> => {
      return apiFetch<UserProfile>('/auth/me');
    },
  },

  // Etapes & Traceability
  etapes: {
    createLot: async (lot: LotData): Promise<LotData> => {
      return apiFetch<LotData>('/etapes/lots', {
        method: 'POST',
        body: JSON.stringify(lot),
      });
    },

    getLots: async (): Promise<LotData[]> => {
      return apiFetch<LotData[]>('/etapes/lots');
    },

    getScans: async (): Promise<any[]> => {
      return apiFetch<any[]>('/etapes/scans');
    },

    predictQuality: async (formData: FormData): Promise<PredictionResult> => {
      return apiFetch<PredictionResult>('/etapes/predict-quality', {
        method: 'POST',
        body: formData,
      });
    },

    createTransfer: async (transfer: {
      cooperative_depart: string;
      entrepot_destination: string;
      tonnage_transfert: number;
      lot_id?: string;
    }): Promise<TransferOrderData> => {
      return apiFetch<TransferOrderData>('/etapes/transfert', {
        method: 'POST',
        body: JSON.stringify(transfer),
      });
    },

    getTransfer: async (identifier: string): Promise<TransferOrderData> => {
      return apiFetch<TransferOrderData>(`/etapes/transfert/${identifier}`);
    },

    executeArbitrage: async (arbitrage: ArbitrageData) => {
      return apiFetch('/etapes/arbitrage', {
        method: 'POST',
        body: JSON.stringify(arbitrage),
      });
    },

    getStats: async (): Promise<TraceabilityStats> => {
      return apiFetch<TraceabilityStats>('/etapes/stats');
    },
  },

  // Notifications
  notifications: {
    list: async (unreadOnly?: boolean) => {
      return apiFetch<any[]>(`/notifications/${unreadOnly ? '?unread_only=true' : ''}`);
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
    list: async () => {
      return apiFetch('/rapports/');
    },
    generate: async (params: { type_rapport: string; periode: string }) => {
      return apiFetch('/rapports/generate', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    },
  },
};
