export interface CryptoAmount {
  token: string;
  amount: number;
  formatted: string;
}

export interface ActivityStatsData {
  completed: {
    items: CryptoAmount[];
    count: number;
  };
  pending: {
    items: CryptoAmount[];
    count: number;
  };
}
