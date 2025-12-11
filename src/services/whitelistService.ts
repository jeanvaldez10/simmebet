import prisma from "@/lib/prisma";
import type { whitelist_entries as WhitelistEntryModel } from "@prisma/client";

export type WhitelistEntry = WhitelistEntryModel;

// Simple in-memory cache for whitelist entries
const whitelistCache = new Map<string, { isActive: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class WhitelistService {
  /**
   * Check if a user is whitelisted by email
   */
  static async isEmailWhitelisted(email: string): Promise<boolean> {
    try {
      // Normalize email to lowercase for consistent caching and comparison
      const normalizedEmail = email.toLowerCase();
      
      // Check cache first
      const cacheKey = `email:${normalizedEmail}`;
      const cached = whitelistCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.isActive;
      }

      const entry = await prisma.whitelist_entries.findFirst({
        where: { 
          email: { 
            equals: normalizedEmail, 
            mode: 'insensitive' 
          } 
        },
        select: { isActive: true }
      });
      
      const isActive = entry?.isActive === true;
      
      // Cache the result
      whitelistCache.set(cacheKey, { isActive, timestamp: Date.now() });
      
      return isActive;
    } catch {
      return false;
    }
  }

  /**
   * Check if a user is whitelisted by Twitter ID
   */
  static async isTwitterIdWhitelisted(twitterId: string): Promise<boolean> {
    try {
      // Check cache first
      const cacheKey = `twitterId:${twitterId}`;
      const cached = whitelistCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.isActive;
      }

      const entry = await prisma.whitelist_entries.findUnique({
        where: { twitterId },
        select: { isActive: true }
      });
      
      const isActive = entry?.isActive === true;
      
      // Cache the result
      whitelistCache.set(cacheKey, { isActive, timestamp: Date.now() });
      
      return isActive;
    } catch {
      return false;
    }
  }

  /**
   * Check if a user is whitelisted by either email or Twitter ID
   */
  static async isUserWhitelisted(email?: string, twitterId?: string): Promise<boolean> {
    if (!email && !twitterId) {
      return false;
    }

    try {
      // Check by email first if provided
      if (email) {
        const emailWhitelisted = await this.isEmailWhitelisted(email);
        if (emailWhitelisted) {
          return true;
        }
      }

      // Check by Twitter ID if provided
      if (twitterId) {
        const twitterWhitelisted = await this.isTwitterIdWhitelisted(twitterId);
        if (twitterWhitelisted) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Clear cache for a specific user (useful when whitelist status changes)
   */
  static clearUserCache(email?: string, twitterId?: string): void {
    if (email) {
      // Clear cache for both original and normalized email
      whitelistCache.delete(`email:${email}`);
      whitelistCache.delete(`email:${email.toLowerCase()}`);
    }
    if (twitterId) {
      whitelistCache.delete(`twitterId:${twitterId}`);
    }
  }

  /**
   * Clear all cache entries
   */
  static clearAllCache(): void {
    whitelistCache.clear();
  }

  /**
   * Add a user to the whitelist (idempotent - won't fail if already exists)
   */
  static async addToWhitelist(email?: string, twitterId?: string, twitterUsername?: string): Promise<WhitelistEntry> {
    if ((!email || email.trim() === '') && (!twitterId || twitterId.trim() === '') && (!twitterUsername || twitterUsername.trim() === '')) {
      throw new Error("Either email, twitterId, or twitterUsername must be provided");
    }

    // Normalize email to lowercase for consistent comparison
    const normalizedEmail = email ? email.toLowerCase() : undefined;

    // Build where clause to check for any existing entry with any of the provided identifiers
    const whereConditions: { email?: { equals: string; mode: 'insensitive' }; twitterId?: string; twitterUsername?: string }[] = [];
    if (normalizedEmail && normalizedEmail.trim() !== '') {
      whereConditions.push({ 
        email: { 
          equals: normalizedEmail, 
          mode: 'insensitive' as const
        } 
      });
    }
    if (twitterId && twitterId.trim() !== '') whereConditions.push({ twitterId });
    if (twitterUsername && twitterUsername.trim() !== '') whereConditions.push({ twitterUsername });

    console.log('Checking for existing entry with:', { email, twitterId, twitterUsername });
    console.log('Where conditions:', whereConditions);

    // First, try to find an existing entry
    const existingEntry = await prisma.whitelist_entries.findFirst({
      where: {
        OR: whereConditions
      }
    });

    console.log('Found existing entry:', existingEntry);

    if (existingEntry) {
      // If entry exists, update it to be active and return it
      const updatedEntry = await prisma.whitelist_entries.update({
        where: { id: existingEntry.id },
        data: {
          isActive: true,
          updated_at: new Date()
        }
      });
      
      // Clear cache for this user
      this.clearUserCache(email, twitterId);
      
      return updatedEntry;
    }

    // If no existing entry, try to create a new one
    console.log('Creating new entry with:', { email, twitterId, twitterUsername });
    try {
      // First try to find existing entry
      let existingEntry = null;
      
      if (normalizedEmail) {
        existingEntry = await prisma.whitelist_entries.findFirst({
          where: { 
            email: { 
              equals: normalizedEmail, 
              mode: 'insensitive' 
            } 
          }
        });
      } else if (twitterId) {
        existingEntry = await prisma.whitelist_entries.findFirst({
          where: { twitterId }
        });
      } else if (twitterUsername) {
        existingEntry = await prisma.whitelist_entries.findFirst({
          where: { twitterUsername }
        });
      }

        if (existingEntry) {
          // If entry exists, update it to be active and return it
          const updatedEntry = await prisma.whitelist_entries.update({
            where: { id: existingEntry.id },
            data: {
              isActive: true,
              updated_at: new Date()
            }
          });
          
          // Clear cache for this user
          this.clearUserCache(email, twitterId);
          
          return updatedEntry;
        }

      // If no existing entry, create a new one
      const entry = await prisma.whitelist_entries.create({
        data: {
          id: crypto.randomUUID(),
          email: normalizedEmail || null,
          twitterId: twitterId || null,
          twitterUsername: twitterUsername || null,
          isActive: true,
          updated_at: new Date()
        }
      });
      
      // Clear cache for this user
      this.clearUserCache(email, twitterId);
      
      return entry;
    } catch (createError: unknown) {
      // If create fails due to unique constraint, find and return the existing entry
      if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P2002') {
        console.log('Create failed due to unique constraint, finding existing entry');
        
        // Use a fresh query outside the failed transaction
        const existingEntry = await prisma.whitelist_entries.findFirst({
          where: {
            OR: whereConditions
          }
        });

        if (existingEntry) {
          // Update and return the existing entry
          const updatedEntry = await prisma.whitelist_entries.update({
            where: { id: existingEntry.id },
            data: {
              isActive: true,
              updated_at: new Date()
            }
          });
          return updatedEntry;
        }
      }
      throw createError;
    }
  }

  /**
   * Batch add multiple users to the whitelist (idempotent)
   */
  static async batchAddToWhitelist(entries: Array<{email?: string, twitterId?: string, twitterUsername?: string}>): Promise<void> {
    if (entries.length === 0) return;

    try {
      // First, get all existing entries to avoid duplicates
      const normalizedEmails = entries.filter(e => e.email).map(e => e.email!.toLowerCase());
      const existingEntries = await prisma.whitelist_entries.findMany({
        where: {
          OR: [
            { 
              email: { 
                in: normalizedEmails,
                mode: 'insensitive'
              } 
            },
            { twitterId: { in: entries.filter(e => e.twitterId).map(e => e.twitterId!) } },
            { twitterUsername: { in: entries.filter(e => e.twitterUsername).map(e => e.twitterUsername!) } }
          ]
        }
      });

      // Create sets for quick lookup
      const existingEmails = new Set(existingEntries.filter(e => e.email).map(e => e.email!));
      const existingTwitterIds = new Set(existingEntries.filter(e => e.twitterId).map(e => e.twitterId!));
      const existingTwitterUsernames = new Set(existingEntries.filter(e => e.twitterUsername).map(e => e.twitterUsername!));

      // Filter out entries that already exist
      const newEntries = entries.filter(entry => {
        if (entry.email && existingEmails.has(entry.email)) return false;
        if (entry.twitterId && existingTwitterIds.has(entry.twitterId)) return false;
        if (entry.twitterUsername && existingTwitterUsernames.has(entry.twitterUsername)) return false;
        return true;
      });

      // Update existing entries to be active
      const updatePromises = existingEntries.map(entry => 
        prisma.whitelist_entries.update({
          where: { id: entry.id },
          data: {
            isActive: true,
            updated_at: new Date()
          }
        })
      );

      // Create new entries
      const createPromises = newEntries.map(entry =>
        prisma.whitelist_entries.create({
          data: {
            id: crypto.randomUUID(),
            email: entry.email ? entry.email.toLowerCase() : null,
            twitterId: entry.twitterId,
            twitterUsername: entry.twitterUsername,
            isActive: true,
            updated_at: new Date()
          }
        })
      );

      // Execute all operations in parallel
      await Promise.all([...updatePromises, ...createPromises]);

    } catch (error) {
      console.error("Error batch adding users to whitelist:", error);
      throw error;
    }
  }

  /**
   * Remove a user from the whitelist (deactivate)
   */
  static async removeFromWhitelist(email?: string, twitterId?: string, twitterUsername?: string): Promise<boolean> {
    if (!email && !twitterId && !twitterUsername) {
      throw new Error("Either email, twitterId, or twitterUsername must be provided");
    }

    try {
      // Normalize email to lowercase for consistent comparison
      const normalizedEmail = email ? email.toLowerCase() : undefined;

      // Build where clause based on what's provided
      const whereClause: { email?: { equals: string; mode: 'insensitive' }; twitterId?: string; twitterUsername?: string } = {};
      
      if (normalizedEmail) {
        whereClause.email = { 
          equals: normalizedEmail, 
          mode: 'insensitive' as const
        };
      } else if (twitterId) {
        whereClause.twitterId = twitterId;
      } else if (twitterUsername) {
        whereClause.twitterUsername = twitterUsername;
      }
      
      await prisma.whitelist_entries.deleteMany({
        where: whereClause,
      });

      return true;
    } catch (error) {
      console.error("Error removing user from whitelist:", error);
      return false;
    }
  }

  /**
   * Get all whitelist entries
   */
  static async getAllWhitelistEntries(): Promise<WhitelistEntry[]> {
    try {
      const entries = await prisma.whitelist_entries.findMany({
        orderBy: { created_at: 'desc' }
      });

      return entries;
    } catch (error) {
      console.error("Error getting whitelist entries:", error);
      return [];
    }
  }

  /**
   * Get whitelist entries with pagination and search
   */
  static async getWhitelistEntries(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: 'all' | 'email' | 'twitter'
  ): Promise<{
    entries: WhitelistEntry[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      // Build where clause for filtering
      const whereClause: {
        OR?: Array<{
          email?: { contains: string; mode: 'insensitive' };
          twitterId?: { contains: string; mode: 'insensitive' };
        }>;
        email?: { not: null } | undefined;
        twitterId?: { not: null } | undefined;
      } = {};
      
      if (search) {
        whereClause.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { twitterId: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (type === 'email') {
        whereClause.email = { not: null };
      } else if (type === 'twitter') {
        whereClause.twitterId = { not: null };
      }

      const [entries, total] = await Promise.all([
        prisma.whitelist_entries.findMany({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          skip,
          take: limit
        }),
        prisma.whitelist_entries.count({
          where: whereClause
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        entries,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      };
    } catch (error) {
      console.error("Error getting paginated whitelist entries:", error);
      return {
        entries: [],
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      };
    }
  }
}

export const whitelistService = WhitelistService;
