export interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  icon?: string; // URL to icon
  color?: string; // Fallback color if no icon
}

export interface Wallet {
  id: string;
  name: string;
  totalBalance: number;
  changeAmount: number;
  changePercent: number;
  tokens: Token[];
  stagedRefreshAmount: number | null;
}

export interface StagedNotification {
  id: string;
  type: 'receive' | 'send';
  amount: number;
  symbol: string;
  delaySeconds: number;
  scheduledAt: number;
}

export interface AppState {
  wallets: Wallet[];
  activeWalletId: string;
}
