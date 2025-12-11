-- CreateEnum
CREATE TYPE "CoinflipGameStatus" AS ENUM ('BETTING', 'BET_PLACED', 'FLIPPING', 'FINISHED', 'ERROR');

-- CreateEnum
CREATE TYPE "CoinflipSide" AS ENUM ('HEADS', 'TAILS');

-- CreateEnum
CREATE TYPE "CoinflipActionType" AS ENUM ('SELECT_SIDE', 'PLACE_BET', 'FLIP', 'PLAY_AGAIN', 'RESET_GAME', 'CANCEL_BET', 'CLEAR', 'DOUBLE');

-- CreateTable
CREATE TABLE "coinflip_games" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "CoinflipGameStatus" NOT NULL DEFAULT 'BETTING',
    "bet_amount" TEXT NOT NULL DEFAULT '0',
    "bet_side" "CoinflipSide",
    "winning_side" "CoinflipSide",
    "payout" TEXT NOT NULL DEFAULT '0',
    "result" TEXT,
    "server_seed" TEXT NOT NULL,
    "server_seed_hash" TEXT NOT NULL,
    "client_seed" TEXT,
    "nonce" INTEGER NOT NULL DEFAULT 0,
    "game_mode" TEXT NOT NULL DEFAULT 'FREE_PLAY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "coinflip_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coinflip_game_actions" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "action_type" "CoinflipActionType" NOT NULL,
    "amount" TEXT,
    "side" "CoinflipSide",
    "description" TEXT NOT NULL,
    "game_state_before" TEXT,
    "game_state_after" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coinflip_game_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coinflip_games_user_id_status_idx" ON "coinflip_games"("user_id", "status");

-- CreateIndex
CREATE INDEX "coinflip_games_user_id_created_at_idx" ON "coinflip_games"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "coinflip_games" ADD CONSTRAINT "coinflip_games_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coinflip_game_actions" ADD CONSTRAINT "coinflip_game_actions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "coinflip_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

