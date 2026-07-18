export type StockMovementType = "PURCHASE" | "SALE" | "MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT";

export type StockMovement = {
  productId: number;
  adjustment: number;
  stockMovementType: StockMovementType;
  reason?: string;
  date: Date;
};
