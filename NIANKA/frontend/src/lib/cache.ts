/**
 * Cache mémoire des lectures d'API, en « stale-while-revalidate ».
 *
 * Pourquoi ce fichier existe : les 24 écrans de données sont des composants
 * client qui chargent tout dans un `useEffect` au montage. Revenir sur un écran
 * déjà visité relançait donc l'intégralité des appels réseau à zéro, soit
 * 350 ms à 900 ms d'attente à chaque navigation alors que la donnée venait
 * d'être affichée quelques secondes plus tôt.
 *
 * Trois garanties tenues ici :
 *  1. Une donnée déjà connue est rendue IMMÉDIATEMENT (aucune attente réseau),
 *     puis rafraîchie en arrière-plan si elle a dépassé son délai de fraîcheur.
 *  2. Deux appels simultanés sur la même ressource ne déclenchent qu'une seule
 *     requête (le tableau de bord coopérative en lance cinq d'un coup).
 *  3. Le cache est strictement EN MÉMOIRE. Rien n'est écrit dans le navigateur :
 *     aucune donnée d'un compte ne peut survivre à une déconnexion, et l'état
 *     initial du rendu reste identique côté serveur et client (pas de
 *     désynchronisation d'hydratation).
 */

interface Entry {
  data: unknown;
  at: number;
}

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

/**
 * Durée pendant laquelle une donnée déjà chargée est jugée assez fraîche pour
 * être affichée sans attendre le réseau. Au-delà, elle est toujours affichée
 * immédiatement, mais un rafraîchissement part en arrière-plan.
 */
export const DEFAULT_TTL_MS = 30_000;

/**
 * Vide tout le cache. Appelé à la connexion ET à la déconnexion : sans cela,
 * les données du compte précédent resteraient visibles pour le suivant.
 */
export function cacheClear(): void {
  store.clear();
  inflight.clear();
}

/**
 * Invalide les entrées dont la clé commence par `prefix`, ou tout le cache si
 * aucun préfixe n'est donné. Appelé après chaque écriture, pour qu'une action
 * de l'utilisateur ne puisse jamais être suivie d'un affichage périmé.
 */
export function cacheInvalidate(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

function revalidate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, at: Date.now() });
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

/**
 * Lecture passant par le cache. `key` doit identifier la ressource de façon
 * unique (l'URL suffit, paramètres inclus).
 */
export function cachedGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = store.get(key);

  if (hit) {
    // La donnée est connue : on la rend tout de suite. Si elle est périmée et
    // qu'aucun rafraîchissement n'est déjà en cours, on en lance un dont le
    // résultat servira au prochain affichage. Son échec ne doit jamais remonter
    // ici : l'appelant a déjà reçu une valeur utilisable.
    if (Date.now() - hit.at > ttlMs && !inflight.has(key)) {
      void revalidate(key, fetcher).catch(() => undefined);
    }
    return Promise.resolve(hit.data as T);
  }

  // Rien en cache : si la même requête est déjà en vol, on partage sa promesse
  // au lieu d'en émettre une seconde identique.
  const flying = inflight.get(key);
  if (flying) return flying as Promise<T>;

  return revalidate(key, fetcher);
}
