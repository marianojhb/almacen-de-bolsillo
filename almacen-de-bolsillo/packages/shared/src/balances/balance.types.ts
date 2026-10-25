export type BalanceDto = {
  id: number;
  date: string;
  cashIn: number;
  cashOut: number;
  expectedClosing: number;
  actualClosing: number;
  difference: number;
  opening: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateBalanceDto = Omit<BalanceDto, "id" | "createdAt" | "updatedAt">;
