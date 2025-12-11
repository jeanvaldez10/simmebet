import crypto from 'crypto';

export interface FlipResult {
  winningSide: 'heads' | 'tails';
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}

export class RandomnessProvider {
  generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  generateClientSeed(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  flipCoin(
    serverSeed: string,
    clientSeed: string,
    nonce: number
  ): 'heads' | 'tails' {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const hash = crypto.createHash('sha256').update(combined).digest('hex');
    
    const firstByte = parseInt(hash.substring(0, 2), 16);
    
    return firstByte % 2 === 0 ? 'heads' : 'tails';
  }

  verifyFlip(
    result: 'heads' | 'tails',
    serverSeed: string,
    clientSeed: string,
    nonce: number
  ): boolean {
    const calculated = this.flipCoin(serverSeed, clientSeed, nonce);
    return calculated === result;
  }
}

