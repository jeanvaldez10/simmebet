import { RandomnessProvider } from './randomnessProvider';

export interface CoinflipFlipResult {
  clientSeed: string;
  winningSide: 'HEADS' | 'TAILS';
}

export interface CoinflipNewGameSeeds {
  serverSeed: string;
  serverSeedHash: string;
}

export class CoinflipGameStateService {
  private randomnessProvider: RandomnessProvider;

  constructor() {
    this.randomnessProvider = new RandomnessProvider();
  }

  generateNewGameSeeds(): CoinflipNewGameSeeds {
    const serverSeed = this.randomnessProvider.generateServerSeed();
    const serverSeedHash = this.randomnessProvider.hashServerSeed(serverSeed);
    return { serverSeed, serverSeedHash };
  }

  flipCoin(
    serverSeed: string,
    clientSeed: string,
    nonce: number
  ): CoinflipFlipResult {
    const winningSideLower = this.randomnessProvider.flipCoin(
      serverSeed,
      clientSeed,
      nonce
    );
    const winningSide = winningSideLower.toUpperCase() as 'HEADS' | 'TAILS';

    return {
      clientSeed,
      winningSide,
    };
  }

  generateClientSeed(): string {
    return this.randomnessProvider.generateClientSeed();
  }
}

