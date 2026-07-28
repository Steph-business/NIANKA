"use client";

import { useEffect, useState } from 'react';
import { getCurrentUserProfile, UserProfile } from './api';

/**
 * Profil de l'utilisateur réellement connecté, lu depuis la session locale.
 *
 * Les tableaux de bord affichaient une identité fixe en dur dans leur barre
 * latérale (ex: "Coop. ANADER" / "CA"), quel que soit le compte réellement
 * connecté — trompeur dès qu'un autre compte du même rôle se connectait.
 */
export function useUserProfile(): UserProfile | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(getCurrentUserProfile());
  }, []);

  return profile;
}

/** Initiales pour l'avatar, dérivées du nom réel ('?' si le profil n'est pas encore chargé). */
export function initialesDe(nom?: string): string {
  if (!nom) return '?';
  return nom.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}
