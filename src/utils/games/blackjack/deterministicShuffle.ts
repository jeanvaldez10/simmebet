import crypto from 'crypto';
import { Card } from '@/types/games/blackjack/game';

// Secret salt for deterministic shuffling (should be rotated daily in production)
let SHUFFLE_SALT = process.env.SHUFFLE_SALT || 'default-salt-change-me';

// Store the salt used for each shuffle ID to ensure verification works correctly
const shuffleSaltMap = new Map<string, string>();

// Function to rotate the salt (call this daily)
export function rotateShuffleSalt(): void {
  SHUFFLE_SALT = crypto.randomBytes(32).toString('hex');
}

// Get current salt (for verification purposes only - never expose to client)
export function getCurrentSalt(): string {
  return SHUFFLE_SALT;
}

// Generate a unique salt for each game
export function generateGameSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a deterministic shuffle ID
export function generateShuffleId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const shuffleId = `shuffle_${timestamp}_${random}`;
  
  return shuffleId;
}

// Create a deterministic pseudo-random number generator using seed
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    // Create a hash from the seed string
    const hash = crypto.createHash('sha256').update(seed).digest('hex');
    // Convert first 8 characters to a number
    this.seed = parseInt(hash.substring(0, 8), 16);
  }

  // Generate next random number (0 to 1)
  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  // Generate random integer between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

// Create a standard 52-card deck (unshuffled)
export function createUnshuffledDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

// Deterministic shuffle using Fisher-Yates algorithm with seeded random
export function deterministicShuffle(deck: Card[], shuffleId: string, salt?: string): Card[] {
  const shuffled = [...deck];
  
  // Use the provided salt or fall back to the map or current salt
  const saltForShuffle = salt || shuffleSaltMap.get(shuffleId) || SHUFFLE_SALT;
  const seed = `${shuffleId}:${saltForShuffle}`;
  const rng = new SeededRandom(seed);
  
  // Fisher-Yates shuffle with deterministic random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}



// Create a shuffled deck from a shuffle ID
export function createShuffledDeck(shuffleId: string, salt?: string): Card[] {
  const unshuffledDeck = createUnshuffledDeck();
  return deterministicShuffle(unshuffledDeck, shuffleId, salt);
}

// Verify that a shuffle can be reproduced (for testing/verification)
export function verifyShuffle(shuffleId: string, expectedDeck: Card[], salt?: string): boolean {
  const reproducedDeck = createShuffledDeck(shuffleId, salt);
  
  if (reproducedDeck.length !== expectedDeck.length) {
    return false;
  }
  
  for (let i = 0; i < reproducedDeck.length; i++) {
    const reproduced = reproducedDeck[i];
    const expected = expectedDeck[i];
    
    if (reproduced.suit !== expected.suit || 
        reproduced.rank !== expected.rank) {
      return false;
    }
  }
  
  return true;
}

// Get shuffle verification info (for transparency - shows the shuffle can be verified)
export function getShuffleVerificationInfo(shuffleId: string, revealSalt: boolean = false, shuffleSalt?: string, actualDeck?: Card[]): {
  shuffleId: string;
  canBeVerified: boolean;
  saltHash: string; // Hash of salt for verification without exposing salt
  salt?: string; // Only included when revealSalt is true
  shuffledDeck?: Card[]; // Only included when revealSalt is true
  timestamp: string;
  isSaltRevealed: boolean;
} {
  // Use the provided salt or fall back to the map or current salt
  const saltForShuffle = shuffleSalt || shuffleSaltMap.get(shuffleId) || SHUFFLE_SALT;
  const saltHash = crypto.createHash('sha256').update(saltForShuffle).digest('hex');
  
  const result: {
    shuffleId: string;
    canBeVerified: boolean;
    saltHash: string;
    timestamp: string;
    isSaltRevealed: boolean;
    salt?: string;
    shuffledDeck?: Card[];
  } = {
    shuffleId,
    canBeVerified: true,
    saltHash,
    timestamp: new Date().toISOString(),
    isSaltRevealed: revealSalt
  };
  
  // Only reveal the actual salt and deck when explicitly requested (after game ends)
  if (revealSalt) {
    result.salt = saltForShuffle;
    // Use the actual deck that was used in the game, not regenerate it
    result.shuffledDeck = actualDeck || createShuffledDeck(shuffleId, saltForShuffle);
  }
  
  return result;
}

// Generate a complete verification report with salt revealed
export function generateVerificationReport(shuffleId: string, shuffleSalt?: string): {
  shuffleId: string;
  salt: string;
  saltHash: string;
  seed: string;
  algorithm: string;
  timestamp: string;
  verificationSteps: string[];
} {
  // Use the provided salt or fall back to the map or current salt
  const salt = shuffleSalt || shuffleSaltMap.get(shuffleId) || SHUFFLE_SALT;
  const saltHash = crypto.createHash('sha256').update(salt).digest('hex');
  const seed = `${shuffleId}:${salt}`;
  
  return {
    shuffleId,
    salt,
    saltHash,
    seed,
    algorithm: 'Fisher-Yates with Seeded Random (Linear Congruential Generator)',
    timestamp: new Date().toISOString(),
    verificationSteps: [
      '1. Generate seed: shuffleId + salt',
      '2. Create SHA-256 hash of seed for deterministic random number generation',
      '3. Use Linear Congruential Generator with seed for pseudo-random numbers',
      '4. Apply Fisher-Yates shuffle algorithm with deterministic random numbers',
      '5. Result: Reproducible deck order that can be verified with same shuffleId and salt'
    ]
  };
}
