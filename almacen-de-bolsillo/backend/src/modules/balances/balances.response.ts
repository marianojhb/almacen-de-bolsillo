type DecimalValue = number | string | { toString(): string };

export function balanceValuesResponse<T extends {
  opening: DecimalValue; cashIn: DecimalValue; cashOut: DecimalValue;
  expectedClosing: DecimalValue; actualClosing: DecimalValue; difference: DecimalValue;
}>(balance: T) {
  return {
    ...balance,
    opening: Number(balance.opening), cashIn: Number(balance.cashIn), cashOut: Number(balance.cashOut),
    expectedClosing: Number(balance.expectedClosing), actualClosing: Number(balance.actualClosing),
    difference: Number(balance.difference),
  };
}
