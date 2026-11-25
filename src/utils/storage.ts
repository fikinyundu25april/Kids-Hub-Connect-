import { createSeedState } from '../data/seedData';
import { AuthSession, KidsHubState } from '../types';

const STATE_STORAGE_KEY = 'kids_hub_connect_state_v1';
const SESSION_STORAGE_KEY = 'kids_hub_connect_session_v1';

export function loadAppState(): KidsHubState {
  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (!raw) {
      const seed = createSeedState();
      window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as Partial<KidsHubState>;
    if (!Array.isArray(parsed.learners) || !Array.isArray(parsed.alerts)) {
      const seed = createSeedState();
      window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return {
      learners: parsed.learners,
      alerts: parsed.alerts,
      dataFreeMode: Boolean(parsed.dataFreeMode),
    };
  } catch {
    return createSeedState();
  }
}

export function saveAppState(state: KidsHubState): void {
  try {
    window.localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}

export function resetAppState(): KidsHubState {
  const seed = createSeedState();
  saveAppState(seed);
  return seed;
}

export function loadAuthSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession | null): void {
  try {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}
