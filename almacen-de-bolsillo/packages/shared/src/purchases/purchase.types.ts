import type { MeasurementUnit } from "../products/measurement-unit.utils.js";
import type { PaymentMethod, WalletProvider } from "../transactions/payment-options.js";
import type { Product } from "../index.js";
import type { SupplierOption } from "../index.js";

export type PurchaseDraftItem = {
  productId: number;
  shortname: string;
  longname: string | null;
  supplierId: number | null;
  measurementUnit: MeasurementUnit;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number | null;
};

export type PurchaseOrderDto = {
  id: number;
  date: string;
  total: number;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  isActive: boolean;
  paymentMethod: PaymentMethod;
  walletProvider: WalletProvider | null;
};

export type PurchaseOrderItemDto = {
  productId: number;
  purchaseOrderId: number;
  measurementUnit: MeasurementUnit;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
};

export type CreatePurchaseOrderItemDto = {
  productId: number;
  quantity: number;
  price: number;
  discount: number;
};

export type CreatePurchaseOrderDto = {
  total: number;
  supplierId: number;
  userId?: number;
  paymentMethod: PaymentMethod;
  walletProvider: WalletProvider | null;
  items: CreatePurchaseOrderItemDto[];
};

export type PurchaseOrderWithRelationsDto = PurchaseOrderDto & {
  supplier?: SupplierOption;
  purchaseOrdersItems?: PurchaseOrderItemDto[];
};
