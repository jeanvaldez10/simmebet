// Constants (identical to the ones in TickMath.sol)
export const Q96 = 1n << 96n;
export const MIN_TICK = -887272;
export const MAX_TICK = 887272;

// The minimum √price returned by getSqrtPriceAtTick(MIN_TICK)
export const MIN_SQRT_PRICE = 4295128739n;
// The maximum √price returned by getSqrtPriceAtTick(MAX_TICK)
export const MAX_SQRT_PRICE = 1461446703485210103287273052203988822378723970342n;

// MAX_SQRT_PRICE - MIN_SQRT_PRICE - 1
export const MAX_SQRT_PRICE_MINUS_MIN_SQRT_PRICE_MINUS_ONE = MAX_SQRT_PRICE - MIN_SQRT_PRICE - 1n;

// Precomputed constants for sqrt(1.0001^2^i) in Q128.128 (20 entries, bits 0..19)
export const TICK_CONSTANTS = [
    0xFFFCB933BD6FAD37AA2D162D1A594001n,
    0xFFF97272373D413259A46990580E213An,
    0xFFF2E50F5F656932EF12357CF3C7FDCCn,
    0xFFE5CACA7E10E4E61C3624EAA0941CD0n,
    0xFFCB9843D60F6159C9DB58835C926644n,
    0xFF973B41FA98C081472E6896DFB254C0n,
    0xFF2EA16466C96A3843EC78B326B52861n,
    0xFE5DEE046A99A2A811C461F1969C3053n,
    0xFCBE86C7900A88AEDCFFC83B479AA3A4n,
    0xF987A7253AC413176F2B074CF7815E54n,
    0xF3392B0822B70005940C7A398E4B70F3n,
    0xE7159475A2C29B7443B29C7FA6E889D9n,
    0xD097F3BDFD2022B8845AD8F792AA5825n,
    0xA9F746462D870FDF8A65DC1F90E061E5n,
    0x70D869A156D2A1B890BB3DF62BAF32F7n,
    0x31BE135F97D08FD981231505542FCFA6n,
    0x9AA508B5B7A84E1C677DE54F3E99BC9n,
    0x5D6AF8DEDB81196699C329225EE604n,
    0x2216E584F5FA1EA926041BEDFE98n,
    0x48A170391F7DC42444E8FA2n,
];

// Magic constants for converting log2 → log_sqrt10001 (Q22.128)
export const LOG_SCALE = 255738958999603826347141n;

// Error bounds (Q128) used when computing tickLow / tickHigh
export const NEGATIVE_ERROR_BOUND = 3402992956809132418596140100660247210n;
export const POSITIVE_ERROR_BOUND = 291339464771989622907027621153398088495n;

export function mostSignificantBit(x: bigint): number {
    if (x <= 0n) {
        throw new Error("mostSignificantBit: input must be positive");
    }
    return x.toString(2).length - 1;
}

export function getTickAtSqrtPrice(sqrtPriceX96: bigint): number {
    // Range check
    if (sqrtPriceX96 < MIN_SQRT_PRICE || sqrtPriceX96 >= MAX_SQRT_PRICE) {
        throw new Error("getTickAtSqrtPrice: sqrt_price out of range");
    }

    // Convert Q64.96 → Q128.128 (left shift 32)
    const price = sqrtPriceX96 << 32n;  // This is now Q128.128

    // Find msb = floor(log2(price))
    const msb = mostSignificantBit(price);

    // Normalize r so that r ∈ [2^127 .. 2^128)
    let r: bigint;
    if (msb >= 128) {
        r = price >> BigInt(msb - 127);
    } else {
        r = price << BigInt(127 - msb);
    }

    // Build log_2 as a signed Q64.64: (msb - 128) << 64
    let log2 = BigInt(msb - 128) << 64n;

    // Iteratively refine log_2 using bits 63 down to 50 (14 iterations)
    for (let i = 0; i < 14; i++) {
        r = (r * r) >> 127n;
        const f = r >> 128n;
        log2 |= f << BigInt(63 - i);
        if (f === 1n) {
            r >>= 1n;
        }
    }

    // Convert from log2 to log_sqrt10001 (Q22.128) by multiplying with LOG_SCALE
    const logSqrt10001 = log2 * LOG_SCALE;

    // Compute provisional integer ticks (Q22.128 >> 128 → int24)
    const tickLow = Number((logSqrt10001 - NEGATIVE_ERROR_BOUND) >> 128n);
    const tickHigh = Number((logSqrt10001 + POSITIVE_ERROR_BOUND) >> 128n);

    // If they coincide, we're done
    if (tickLow === tickHigh) {
        return tickLow;
    }

    // Otherwise, compare getSqrtPriceAtTick(tickHigh) to sqrtPriceX96
    const spHigh = getSqrtPriceAtTick(tickHigh);
    return spHigh <= sqrtPriceX96 ? tickHigh : tickLow;
}

export class SqrtPriceX96 extends Number {
    tick(): Tick {
        return new Tick(2 * Math.log(Number(this) / Number(Q96)) / Math.log(1.0001));
    }

    odds(): Odds {
        return new Odds(1 / (1 + Math.pow(1.0001, -this.tick().valueOf())));
    }
}

export class Odds extends Number {
    sqrtPrice(): SqrtPriceX96 {
        const tick = Math.log(Number(this) / (1 - Number(this))) / Math.log(1.0001);
        return new SqrtPriceX96(Number(getSqrtPriceAtTick(Math.floor(tick))));
    }

    tick(): Tick {
        return new Tick(Math.floor(Math.log(Number(this) / (1 - Number(this))) / Math.log(1.0001)));
    }
}

export class Tick extends Number {
    sqrtPrice(): SqrtPriceX96 {
        return new SqrtPriceX96(Number(getSqrtPriceAtTick(this.valueOf())));
    }

    odds(): Odds {
        const odds = 1 / (1 + Math.pow(1.0001, -this.valueOf()));
        return new Odds(odds);
    }

    nearestTick(boundary: number = 500, lower: boolean = true): Tick {
        if (this.valueOf() % boundary === 0) {
            return this;
        }

        if (lower) {
            return new Tick(this.valueOf() - (this.valueOf() % boundary));
        }
        return new Tick(this.valueOf() + (boundary - (this.valueOf() % boundary)));
    }
}

export function getSqrtPriceAtTick(tick: number): bigint {
    // Ensure tick is within bounds
    if (Math.abs(tick) > MAX_TICK) {
        return BigInt(MAX_TICK);
    }

    const absTick = Math.abs(tick);

    // Base value is 1 << 128
    let price = 1n << 128n;
    if (absTick & 1) {
        price = TICK_CONSTANTS[0];
    }

    for (let i = 1; i < TICK_CONSTANTS.length; i++) {
        if (absTick & (1 << i)) {
            price = (price * TICK_CONSTANTS[i]) >> 128n;
        }
    }

    if (tick > 0) {
        price = (1n << 256n) / price;
    }

    // Convert Q128.128 to Q128.96 (>> 32), rounding up
    const sqrtPriceX96 = (price + ((1n << 32n) - 1n)) >> 32n;

    // Downcast to 160 bits
    if (sqrtPriceX96 >= (1n << 160n)) {
        throw new Error("sqrt_price_x96 doesn't fit in uint160");
    }

    return sqrtPriceX96;
}
