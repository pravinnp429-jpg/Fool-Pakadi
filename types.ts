
export interface GameIcon {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Bet {
  iconId: string;
  amount: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  bets: Bet[];
  winningIconId: string;
  winAmount: number;
  payout: number;
}

export type GameStatus = 'idle' | 'spinning' | 'revealing' | 'result';

export interface WalletState {
  balance: number;
  totalWon: number;
  totalBet: number;
}
