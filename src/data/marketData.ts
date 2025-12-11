export type MarketCardType = 
  | 'buy' 
  | 'voted-yes' 
  | 'voted-germany' 
  | 'options' 
  | 'yes-won' 
  | 'germany-won' 
  | 'options-won';

export interface MarketData {
  id: string;
  type: MarketCardType;
  question: string;
  date?: string;
  image?: string;
  rules?: string[];
}

export const marketData: MarketData[] = [
  {
    id: "1",
    type: "buy",
    question: "Will Spain beat Germany on the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "2",
    type: "buy",
    question: "Will Spain beat Germany on the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "3",
    type: "voted-yes",
    question: "Will Spain beat Germany on the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "4",
    type: "voted-germany",
    question: "Will Spain beat Germany on the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "5",
    type: "buy",
    question: "Who will win the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "6",
    type: "yes-won",
    question: "Will Spain beat Germany on the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "7",
    type: "germany-won",
    question: "Will Spain beat Germany on the UEFA finals this year?",
      date: "June 30, 2023",
    image: "/images/football.png"
  },
  {
    id: "8",
    type: "buy",
    question: "Who will win the UEFA finals this year?",
    date: "June 30, 2023",
    image: "/images/football.png"
  }
]; 