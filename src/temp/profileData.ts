import { Friend, Notification, Position, ProfileData } from "@/types/profile";

// Mock profile data
export const profileData: ProfileData = {
  username: "Michael_Scott",
  walletId: "0x123_5436",
  joinDate: "Mar 2025",
  balance: "$1,543.50",
  activeBets: 13,
  totalBets: 139,
  profit: "$1,654",
  volumeTraded: "$9,453.65",
  reputation: "1,654",
  winRatio: "68.5%",
};

// Optimized positions/bets data
const basePosition = {
  market: "Who will win UEFA this year?",
  image: "/images/cup.png",
  amount: 12.3,
  bought: true,
  profit: 89.0,
  timestamp: "2min ago",
};

const statuses: Array<"Won" | "Ongoing" | "Loss" | "Draw"> = ["Won", "Ongoing", "Loss", "Draw"];

export const positionsData: Position[] = Array(5).fill(null).map((_, i) => ({
  ...basePosition,
  id: (i + 1).toString(),
  status: statuses[i % statuses.length],
  profit: i === 2 ? -89.0 : 89.0, // Third item has negative profit
}));

// Optimized friends data
const baseFriend = {
  username: "Username",
  avatar: "/images/avatar.png",
  profileLoss: "$192.30",
  volumeTraded: "$112.30",
  marketTraded: 12,
};

export const friendsData: Friend[] = Array(7).fill(null).map((_, i) => ({
  ...baseFriend,
  id: (i + 1).toString(),
}));

// Optimized notifications data
const notificationTypes: Array<"win" | "deposit" | "buy" | "sell"> = ["win", "deposit", "buy", "sell"];

export const notificationsData: Notification[] = Array(9).fill(null).map((_, i) => ({
  type: notificationTypes[i % notificationTypes.length],
  amount: "194.00",
  marketId: "Who will win UEFA this year?",
})); 
