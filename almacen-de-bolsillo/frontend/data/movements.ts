import type {StockMovement} from "@/types/StockMovement";

export const movements: StockMovement[] = [
  {
    id: 1,
    stockMovementType: "MANUAL_ENTRY",
    productId: 2,
    quantity: 20,
    previousStock: 5,
    newStock: 15,
    date: new Date("2026-05-01"),
  },
  {
    id: 2,
    stockMovementType: "MANUAL_EXIT",
    productId: 2,
    quantity: 40,
    previousStock: 15,
    newStock: 17,
    date: new Date("2026-06-01"),
  },
  {
    id: 3,
    stockMovementType: "MANUAL_EXIT",
    productId: 1,
    quantity: 5,
    previousStock: 17,
    newStock: 22,
    date: new Date("2026-07-01"),
  },
];