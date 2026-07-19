export type StockMovementType = "PURCHASE" | "SALE" | "MANUAL_ENTRY" | "MANUAL_EXIT" | "ADJUSTMENT";

 export type StockMovement = {
  id: number;
  stockMovementType: StockMovementType;
  productId: number;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  date: Date;
};

export type NewStockMovement = Omit<StockMovement, "id">;
