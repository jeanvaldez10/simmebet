-- AlterTable
ALTER TABLE "blackjack_games" ADD COLUMN     "original_pair_bet" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "original_pair_bet_chips" JSONB,
ADD COLUMN     "original_twenty_one_plus_three_bet" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "original_twenty_one_plus_three_bet_chips" JSONB,
ADD COLUMN     "pair_bet" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "pair_bet_chips" JSONB,
ADD COLUMN     "sidebet_results" JSONB,
ADD COLUMN     "twenty_one_plus_three_bet" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "twenty_one_plus_three_bet_chips" JSONB;
