/**
 * Utility functions for caching approval status in localStorage
 * This helps avoid repeated approval requests for the same market
 */

export interface ApprovalCacheEntry {
  marketAddress: string;
  userId: string;
  approved: boolean;
  txHash?: string;
  timestamp: number; // When the approval was cached
  expiresAt: number; // When the cache entry expires
}

export interface ApprovalCache {
  [marketAddress: string]: ApprovalCacheEntry;
}


const APPROVAL_CACHE_KEY = 'simmibets_approval_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get the approval cache from localStorage
 */
export function getApprovalCache(): ApprovalCache {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const cached = localStorage.getItem(APPROVAL_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Error reading approval cache from localStorage:', error);
    return {};
  }
}

/**
 * Save the approval cache to localStorage
 */
export function saveApprovalCache(cache: ApprovalCache): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(APPROVAL_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving approval cache to localStorage:', error);
  }
}

/**
 * Check if a user is approved for a specific market (from cache)
 */
export function isMarketApprovedInCache(marketAddress: string, userId: string): boolean {
  const cache = getApprovalCache();
  const entry = cache[marketAddress];
  
  if (!entry) {
    console.log(`[ApprovalCache] No cache entry found for market ${marketAddress}`);
    return false;
  }

  // Check if the entry is for the same user
  if (entry.userId !== userId) {
    console.log(`[ApprovalCache] Cache entry exists but for different user. Expected: ${userId}, Found: ${entry.userId}`);
    return false;
  }

  // Check if the cache entry has expired
  const now = Date.now();
  if (entry.expiresAt && now > entry.expiresAt) {
    console.log(`[ApprovalCache] Cache entry expired for market ${marketAddress}, removing from cache`);
    // Remove expired entry
    delete cache[marketAddress];
    saveApprovalCache(cache);
    return false;
  }

  console.log(`[ApprovalCache] Found valid cache entry for market ${marketAddress}: ${entry.approved}`);
  return entry.approved;
}

/**
 * Cache an approval for a specific market and user
 */
export function cacheMarketApproval(
  marketAddress: string, 
  userId: string, 
  approved: boolean, 
  txHash?: string
): void {
  const cache = getApprovalCache();
  const now = Date.now();
  
  cache[marketAddress] = {
    marketAddress,
    userId,
    approved,
    txHash,
    timestamp: now,
    expiresAt: now + CACHE_DURATION,
  };

  saveApprovalCache(cache);
  console.log(`[ApprovalCache] Cached approval for market ${marketAddress}, expires at ${new Date(now + CACHE_DURATION).toISOString()}`);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCacheEntries(): void {
  const cache = getApprovalCache();
  const now = Date.now();
  let hasExpired = false;

  Object.keys(cache).forEach(marketAddress => {
    const entry = cache[marketAddress];
    if (entry.expiresAt && now > entry.expiresAt) {
      delete cache[marketAddress];
      hasExpired = true;
    }
  });

  if (hasExpired) {
    saveApprovalCache(cache);
    console.log(`[ApprovalCache] Cleared expired cache entries`);
  }
}

/**
 * Clear all cache entries for a specific user
 */
export function clearUserCache(userId: string): void {
  const cache = getApprovalCache();
  let hasCleared = false;

  Object.keys(cache).forEach(marketAddress => {
    const entry = cache[marketAddress];
    if (entry.userId === userId) {
      delete cache[marketAddress];
      hasCleared = true;
    }
  });

  if (hasCleared) {
    saveApprovalCache(cache);
    console.log(`[ApprovalCache] Cleared all cache entries for user ${userId}`);
  }
}

