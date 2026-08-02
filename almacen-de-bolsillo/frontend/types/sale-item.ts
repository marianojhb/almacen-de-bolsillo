export type SaleItem = {
  productId: number;
  salesOrdersItemId: number | null;
  quantity: number;
  shortname: string;
  longname: string;
  price: number;
  subtotal: number;
  discount: number;
};
