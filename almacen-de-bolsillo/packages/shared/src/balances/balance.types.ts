export type BalanceDto = {
  id: number;
  date: string;
  cashIn: number;
  cashOut: number;
  expectedClosing: number;
  actualClosing: number;
  difference: number;
  opening: number;
  employeeId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBalanceDto = Omit<BalanceDto, "id" | "employeeId" | "createdAt" | "updatedAt"> & {
  userId: number;
};

export type BalanceHistoryDto = BalanceDto & {
  employee: {
    firstname: string | null;
    lastname: string | null;
    fullname: string | null;
    user: { email: string } | null;
  } | null;
};
