-- Baseline migration to sync local migration history with production database
-- This migration creates all tables that exist in production but don't have migration files
-- Uses IF NOT EXISTS to safely handle tables that already exist

-- Create missing enums
DO $$ BEGIN
    CREATE TYPE "BlackjackGameActionType" AS ENUM ('PLACE_BET', 'START_ROUND', 'HIT', 'STAND', 'DOUBLE', 'SPLIT', 'SURRENDER', 'INSURANCE', 'DECLINE_INSURANCE', 'PLAY_AGAIN', 'START_NEW_GAME', 'RESET_GAME', 'SWITCH_HAND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "HolderRole" AS ENUM ('MAKER_TAKER', 'MAKER_ONLY', 'TAKER_ONLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PARTIALLY_SOLD', 'SOLD', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OptionType" AS ENUM ('LONG', 'SHORT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderSide" AS ENUM ('BID', 'ASK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create options table
CREATE TABLE IF NOT EXISTS "options" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "optionKey" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "optionId" INTEGER NOT NULL,
    "expiry" TEXT NOT NULL,
    "listedOnCreation" BOOLEAN NOT NULL DEFAULT false,
    "optionType" INTEGER NOT NULL,
    "quoteToken" TEXT NOT NULL,
    "strikePrice" TEXT NOT NULL,
    "underlyingToken" TEXT NOT NULL,
    "makerAddress" TEXT NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- Create option_holdings table
CREATE TABLE IF NOT EXISTS "option_holdings" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "role" "HolderRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "option_holdings_pkey" PRIMARY KEY ("id")
);

-- Create option_listings table
CREATE TABLE IF NOT EXISTS "option_listings" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "pricePerOption" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "orderId" TEXT,

    CONSTRAINT "option_listings_pkey" PRIMARY KEY ("id")
);

-- Create option_sales table
CREATE TABLE IF NOT EXISTS "option_sales" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT,
    "buyerId" TEXT,
    "amount" INTEGER NOT NULL,
    "pricePerOption" TEXT NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "buyerAddress" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,

    CONSTRAINT "option_sales_pkey" PRIMARY KEY ("id")
);

-- Create option_exercises table
CREATE TABLE IF NOT EXISTS "option_exercises" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "userId" TEXT,
    "walletAddress" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "strikePrice" TEXT NOT NULL,
    "totalPayment" TEXT NOT NULL,
    "paymentToken" TEXT NOT NULL,
    "payoutToken" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_exercises_pkey" PRIMARY KEY ("id")
);

-- Create option_assets table
CREATE TABLE IF NOT EXISTS "option_assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "amountPerOption" DECIMAL(18,8) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "chartUrl" TEXT,
    "optionType" "OptionType" NOT NULL DEFAULT 'LONG',
    "strikePrice" DECIMAL(18,8),

    CONSTRAINT "option_assets_pkey" PRIMARY KEY ("id")
);

-- Create order_books table
CREATE TABLE IF NOT EXISTS "order_books" (
    "id" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "optionId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_books_pkey" PRIMARY KEY ("id")
);

-- Create order_book_bids table
CREATE TABLE IF NOT EXISTS "order_book_bids" (
    "id" TEXT NOT NULL,
    "orderBookId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "maker" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "filledAmount" TEXT NOT NULL DEFAULT '0',
    "remainingAmount" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_book_bids_pkey" PRIMARY KEY ("id")
);

-- Create order_book_asks table
CREATE TABLE IF NOT EXISTS "order_book_asks" (
    "id" TEXT NOT NULL,
    "orderBookId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "maker" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "filledAmount" TEXT NOT NULL DEFAULT '0',
    "remainingAmount" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_book_asks_pkey" PRIMARY KEY ("id")
);

-- Create order_book_events table
CREATE TABLE IF NOT EXISTS "order_book_events" (
    "id" TEXT NOT NULL,
    "orderBookId" TEXT NOT NULL,
    "orderId" TEXT,
    "eventType" TEXT NOT NULL,
    "maker" TEXT,
    "optionKey" TEXT NOT NULL,
    "price" TEXT,
    "amount" TEXT,
    "filledAmount" TEXT,
    "remainingAmount" TEXT,
    "txHash" TEXT NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_book_events_pkey" PRIMARY KEY ("id")
);

-- Create blackjack_games table
CREATE TABLE IF NOT EXISTS "blackjack_games" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shuffle_id" TEXT NOT NULL,
    "shuffle_salt" TEXT,
    "dealt_card_count" INTEGER NOT NULL DEFAULT 0,
    "game_phase" TEXT NOT NULL DEFAULT 'betting',
    "pending_bet" TEXT NOT NULL DEFAULT '0',
    "initial_bet" TEXT NOT NULL DEFAULT '0',
    "total_wagered" TEXT NOT NULL DEFAULT '0',
    "insurance_bet" TEXT NOT NULL DEFAULT '0',
    "message" TEXT NOT NULL DEFAULT '',
    "can_double" BOOLEAN NOT NULL DEFAULT false,
    "can_split" BOOLEAN NOT NULL DEFAULT false,
    "can_surrender" BOOLEAN NOT NULL DEFAULT false,
    "insurance_offered" BOOLEAN NOT NULL DEFAULT false,
    "insurance_was_offered" BOOLEAN NOT NULL DEFAULT false,
    "dealer_has_blackjack" BOOLEAN NOT NULL DEFAULT false,
    "dealing_step" INTEGER NOT NULL DEFAULT 0,
    "is_dealing" BOOLEAN NOT NULL DEFAULT false,
    "is_dealing_in_progress" BOOLEAN NOT NULL DEFAULT false,
    "last_processed_step" INTEGER NOT NULL DEFAULT 0,
    "dealer_dealing_step" INTEGER NOT NULL DEFAULT 0,
    "is_dealer_dealing" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT,
    "total_payout" TEXT NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "blackjack_games_pkey" PRIMARY KEY ("id")
);

-- Create blackjack_player_hands table
CREATE TABLE IF NOT EXISTS "blackjack_player_hands" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "hand_index" INTEGER NOT NULL,
    "bet" TEXT NOT NULL DEFAULT '0',
    "is_standing" BOOLEAN NOT NULL DEFAULT false,
    "is_busted" BOOLEAN NOT NULL DEFAULT false,
    "is_blackjack" BOOLEAN NOT NULL DEFAULT false,
    "is_doubled" BOOLEAN NOT NULL DEFAULT false,
    "is_surrendered" BOOLEAN NOT NULL DEFAULT false,
    "is_from_split" BOOLEAN NOT NULL DEFAULT false,
    "is_split_aces" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT,
    "payout" TEXT NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blackjack_player_hands_pkey" PRIMARY KEY ("id")
);

-- Create blackjack_dealer_hands table
CREATE TABLE IF NOT EXISTS "blackjack_dealer_hands" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "is_standing" BOOLEAN NOT NULL DEFAULT false,
    "is_busted" BOOLEAN NOT NULL DEFAULT false,
    "is_blackjack" BOOLEAN NOT NULL DEFAULT false,
    "show_all_cards" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blackjack_dealer_hands_pkey" PRIMARY KEY ("id")
);

-- Create blackjack_cards table
CREATE TABLE IF NOT EXISTS "blackjack_cards" (
    "id" TEXT NOT NULL,
    "hand_id" TEXT NOT NULL,
    "hand_type" TEXT NOT NULL,
    "suit" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "dealt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "player_hand_id" TEXT,
    "dealer_hand_id" TEXT,

    CONSTRAINT "blackjack_cards_pkey" PRIMARY KEY ("id")
);

-- Create blackjack_game_actions table
CREATE TABLE IF NOT EXISTS "blackjack_game_actions" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "action_type" "BlackjackGameActionType" NOT NULL,
    "hand_index" INTEGER,
    "amount" TEXT,
    "description" TEXT NOT NULL,
    "game_state_before" TEXT,
    "game_state_after" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blackjack_game_actions_pkey" PRIMARY KEY ("id")
);

-- Add unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "option_holdings_optionId_walletAddress_role_key" ON "option_holdings"("optionId", "walletAddress", "role");
CREATE UNIQUE INDEX IF NOT EXISTS "option_assets_symbol_key" ON "option_assets"("symbol");
CREATE UNIQUE INDEX IF NOT EXISTS "option_assets_tokenAddress_key" ON "option_assets"("tokenAddress");
CREATE UNIQUE INDEX IF NOT EXISTS "order_books_optionKey_key" ON "order_books"("optionKey");
CREATE UNIQUE INDEX IF NOT EXISTS "order_book_bids_orderId_key" ON "order_book_bids"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "order_book_asks_orderId_key" ON "order_book_asks"("orderId");
CREATE UNIQUE INDEX IF NOT EXISTS "order_book_events_txHash_blockNumber_logIndex_eventType_key" ON "order_book_events"("txHash", "blockNumber", "logIndex", "eventType");
CREATE UNIQUE INDEX IF NOT EXISTS "blackjack_player_hands_game_id_hand_index_key" ON "blackjack_player_hands"("game_id", "hand_index");
CREATE UNIQUE INDEX IF NOT EXISTS "blackjack_dealer_hands_game_id_key" ON "blackjack_dealer_hands"("game_id");

-- Add regular indexes
CREATE INDEX IF NOT EXISTS "option_exercises_optionId_idx" ON "option_exercises"("optionId");
CREATE INDEX IF NOT EXISTS "option_exercises_userId_idx" ON "option_exercises"("userId");
CREATE INDEX IF NOT EXISTS "option_exercises_walletAddress_idx" ON "option_exercises"("walletAddress");
CREATE INDEX IF NOT EXISTS "order_book_bids_optionKey_price_idx" ON "order_book_bids"("optionKey", "price");
CREATE INDEX IF NOT EXISTS "order_book_bids_maker_idx" ON "order_book_bids"("maker");
CREATE INDEX IF NOT EXISTS "order_book_bids_status_idx" ON "order_book_bids"("status");
CREATE INDEX IF NOT EXISTS "order_book_asks_optionKey_price_idx" ON "order_book_asks"("optionKey", "price");
CREATE INDEX IF NOT EXISTS "order_book_asks_maker_idx" ON "order_book_asks"("maker");
CREATE INDEX IF NOT EXISTS "order_book_asks_status_idx" ON "order_book_asks"("status");
CREATE INDEX IF NOT EXISTS "order_book_events_optionKey_eventType_idx" ON "order_book_events"("optionKey", "eventType");
CREATE INDEX IF NOT EXISTS "order_book_events_txHash_blockNumber_logIndex_idx" ON "order_book_events"("txHash", "blockNumber", "logIndex");

-- Add foreign keys (with conditional checks)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'options_userId_fkey') THEN
        ALTER TABLE "options" ADD CONSTRAINT "options_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_holdings_optionId_fkey') THEN
        ALTER TABLE "option_holdings" ADD CONSTRAINT "option_holdings_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_holdings_userId_fkey') THEN
        ALTER TABLE "option_holdings" ADD CONSTRAINT "option_holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_listings_optionId_fkey') THEN
        ALTER TABLE "option_listings" ADD CONSTRAINT "option_listings_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_listings_userId_fkey') THEN
        ALTER TABLE "option_listings" ADD CONSTRAINT "option_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_sales_buyerId_fkey') THEN
        ALTER TABLE "option_sales" ADD CONSTRAINT "option_sales_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_sales_listingId_fkey') THEN
        ALTER TABLE "option_sales" ADD CONSTRAINT "option_sales_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "option_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_sales_optionId_fkey') THEN
        ALTER TABLE "option_sales" ADD CONSTRAINT "option_sales_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_sales_sellerId_fkey') THEN
        ALTER TABLE "option_sales" ADD CONSTRAINT "option_sales_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_exercises_optionId_fkey') THEN
        ALTER TABLE "option_exercises" ADD CONSTRAINT "option_exercises_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'option_exercises_userId_fkey') THEN
        ALTER TABLE "option_exercises" ADD CONSTRAINT "option_exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_book_bids_orderBookId_fkey') THEN
        ALTER TABLE "order_book_bids" ADD CONSTRAINT "order_book_bids_orderBookId_fkey" FOREIGN KEY ("orderBookId") REFERENCES "order_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_book_asks_orderBookId_fkey') THEN
        ALTER TABLE "order_book_asks" ADD CONSTRAINT "order_book_asks_orderBookId_fkey" FOREIGN KEY ("orderBookId") REFERENCES "order_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'order_book_events_orderBookId_fkey') THEN
        ALTER TABLE "order_book_events" ADD CONSTRAINT "order_book_events_orderBookId_fkey" FOREIGN KEY ("orderBookId") REFERENCES "order_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blackjack_games_user_id_fkey') THEN
        ALTER TABLE "blackjack_games" ADD CONSTRAINT "blackjack_games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blackjack_player_hands_game_id_fkey') THEN
        ALTER TABLE "blackjack_player_hands" ADD CONSTRAINT "blackjack_player_hands_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "blackjack_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blackjack_dealer_hands_game_id_fkey') THEN
        ALTER TABLE "blackjack_dealer_hands" ADD CONSTRAINT "blackjack_dealer_hands_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "blackjack_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blackjack_cards_player_hand_id_fkey') THEN
        ALTER TABLE "blackjack_cards" ADD CONSTRAINT "blackjack_cards_player_hand_id_fkey" FOREIGN KEY ("player_hand_id") REFERENCES "blackjack_player_hands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blackjack_cards_dealer_hand_id_fkey') THEN
        ALTER TABLE "blackjack_cards" ADD CONSTRAINT "blackjack_cards_dealer_hand_id_fkey" FOREIGN KEY ("dealer_hand_id") REFERENCES "blackjack_dealer_hands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blackjack_game_actions_game_id_fkey') THEN
        ALTER TABLE "blackjack_game_actions" ADD CONSTRAINT "blackjack_game_actions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "blackjack_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

