import type { BalanceDto, BalanceMovementType, CreateBalanceDto } from "../src/balances/balance.types.js";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;

type Expect<Value extends true> = Value;

type ExpectedBalanceDto = {
  id: number;
  date: string;
  cashIn: number;
  cashOut: number;
  expectedClosing: number;
  actualClosing: number;
  difference: number;
  opening: number;
  movementType: "C" | "R";
  employeeId: number | null;
  createdAt: string;
  updatedAt: string;
};

type ExpectedCreateBalanceDto = Omit<
  ExpectedBalanceDto,
  "id" | "employeeId" | "createdAt" | "updatedAt"
> & {
  userId: number;
};

type BalanceContractMatches = Expect<Equal<BalanceDto, ExpectedBalanceDto>>;
type CreateBalanceContractMatches = Expect<Equal<CreateBalanceDto, ExpectedCreateBalanceDto>>;
type BalanceMovementTypeMatches = Expect<Equal<BalanceMovementType, "C" | "R">>;

export type BalanceContractAssertions = [BalanceContractMatches, CreateBalanceContractMatches, BalanceMovementTypeMatches];
