export type StockMovementType = "PURCHASE" | "SALE" | "MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT";

export type StockMovement = {
  id: number;
  type: StockMovementType;
  productId: number;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdAt: string;
};

export type NewStockMovement = Omit<StockMovement, "id" | "createdAt">;
