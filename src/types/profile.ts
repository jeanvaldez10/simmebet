/* eslint-disable @typescript-eslint/no-explicit-any */
// Position type for user positions/bets
export type PositionStatus = "Won" | "Loss" | "Draw" | "Ongoing";

export interface Position {
  id: string;
  market: string;
  image: string;
  amount: number;
  bought: boolean;
  profit: number;
  status: PositionStatus;
  timestamp: string;
}

// Friend type for social connections
export interface Friend {
  id: string;
  username: string;
  avatar: string;
  profileLoss: string;
  volumeTraded: string;
  marketTraded: number;
}

// Profile data structure
export interface ProfileData {
  username: string;
  walletId: string;
  joinDate: string;
  balance: string;
  activeBets: number;
  totalBets: number;
  profit: string;
  volumeTraded: string;
  reputation: string;
  winRatio: string;
}

// Tab navigation types
export type ProfileTab =
  | "Positions"
  | "Activity"
  | "Notifications"
  | "Watchlist"
  | "Friends";

export type CreatorTab = "Belief" | "Options";

// Notification types
export type NotificationType =
  | "win"
  | "deposit"
  | "withdraw"
  | "buy"
  | "sell"
  | "bet_request"
  | "bet_success"
  | "bet_failed"
  | "cashout";

export interface Notification {
  type: NotificationType;
  amount: string;
  marketId: string;
}

// Tab component props
export interface PositionsTabProps {
  positions: Position[];
}

export interface WatchlistTabProps {
  positions: Position[];
}

export interface TweetsTabProps {
  tweets: any[];
}

export interface FriendsTabProps {
  friends: Friend[];
}

export interface NotificationsTabProps {
  notifications?: Notification[];
}

export type MarketStatus = "ACTIVE" | "RESOLVED";
