import { FreePlaySession, GameMode } from '@/types/games/blackjack/game';

/**
 * Session management utilities for Free Play mode
 * Handles sessionStorage persistence (clears when browser closes)
 */

const STORAGE_KEY = 'blackjack_freeplay_session';
const FREE_PLAY_STARTING_BALANCE = 1000;

/**
 * Generate unique tab ID
 */
export function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create new free play session
 */
export function createFreePlaySession(gameMode: GameMode): FreePlaySession {
  const sessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const timestamp = Date.now();
  const tabId = gameMode === GameMode.FREE_PLAY ? generateTabId() : null;
  const userId = gameMode === GameMode.FREE_PLAY ? 'freeplay_user' : 'dev_user';

  return {
    sessionId,
    balance: FREE_PLAY_STARTING_BALANCE,
    version: 0,
    timestamp,
    expiresAt: 0, // Not used for session-based storage
    activeGameId: null,
    activeTabId: null,
    userId,
    tabId,
  };
}

/**
 * Get existing session or create new one
 * Uses sessionStorage (clears when browser closes)
 * Returns a new session if the existing one is expired or invalid
 */
export function getFreePlaySession(gameMode: GameMode): FreePlaySession {
  if (typeof window === 'undefined') return createFreePlaySession(gameMode);

  const sessionInfo = getSessionInfo();

  // If session doesn't exist or is expired, create a new one
  if (!sessionInfo.exists || sessionInfo.isExpired || !sessionInfo.session) {
    const newSession = createFreePlaySession(gameMode);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    return newSession;
  }

  // Return the existing valid session
  return sessionInfo.session;
}

/**
 * Update balance with optimistic locking
 * Returns success status and current session
 */
export function updateFreePlayBalance(
  newBalance: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tabId: string // Tab ID is passed for consistency but not currently used
): { success: boolean; currentSession: FreePlaySession } {
  const session = getFreePlaySession(GameMode.FREE_PLAY);

  // Increment version for optimistic locking
  const updatedSession: FreePlaySession = {
    ...session,
    balance: newBalance,
    version: session.version + 1,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
    return { success: true, currentSession: updatedSession };
  } catch (error) {
    console.error('[Session] Error updating balance:', error);
    return { success: false, currentSession: session };
  }
}

/**
 * Clear session (for testing/reset)
 */
export function clearFreePlaySession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
    console.log('[Session] Session cleared');
  }
}

/**
 * Update active game ID in session
 */
export function setActiveGame(
  gameMode: GameMode,
  gameId: string | null,
  tabId: string
): { success: boolean } {
  const session = getFreePlaySession(gameMode);

  const updatedSession: FreePlaySession = {
    ...session,
    activeGameId: gameId,
    activeTabId: gameId ? tabId : null,
    version: session.version + 1,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
    return { success: true };
  } catch (error) {
    console.error('[Session] Error setting active game:', error);
    return { success: false };
  }
}

/**
 * Get session info for debugging
 * Returns information about the current session, including expiration status
 * Uses timestamp to calculate expiration (24 hours from timestamp)
 */
export function getSessionInfo(): {
  exists: boolean;
  isExpired: boolean;
  balance: number;
  expiresIn: string;
  session: FreePlaySession | null;
} {
  if (typeof window === 'undefined') {
    return {
      exists: false,
      isExpired: false,
      balance: 0,
      expiresIn: 'N/A',
      session: null,
    };
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {
      exists: false,
      isExpired: false,
      balance: 0,
      expiresIn: 'No session',
      session: null,
    };
  }

  try {
    const session: FreePlaySession = JSON.parse(stored);

    // Calculate expiration based on timestamp (24 hours from session creation/update)
    const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const calculatedExpiresAt = session.timestamp + SESSION_DURATION;
    const isExpired = Date.now() > calculatedExpiresAt;

    // If session is not expired, update its timestamp to extend expiration
    if (!isExpired) {
      const updatedSession: FreePlaySession = {
        ...session,
        timestamp: Date.now(),
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
      // Use updated session for expiration calculation
      const newCalculatedExpiresAt =
        updatedSession.timestamp + SESSION_DURATION;
      const timeRemaining = newCalculatedExpiresAt - Date.now();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const expiresIn = `${hoursRemaining}h ${minutesRemaining}m`;

      return {
        exists: true,
        isExpired: false,
        balance: updatedSession.balance,
        expiresIn,
        session: updatedSession,
      };
    }

    let expiresIn: string;
    if (isExpired) {
      expiresIn = 'Expired';
    } else {
      const timeRemaining = calculatedExpiresAt - Date.now();
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      expiresIn = `${hoursRemaining}h ${minutesRemaining}m`;
    }

    return {
      exists: true,
      isExpired,
      balance: session.balance,
      expiresIn,
      session,
    };
  } catch {
    return {
      exists: true,
      isExpired: true,
      balance: 0,
      expiresIn: 'Error parsing session',
      session: null,
    };
  }
}
