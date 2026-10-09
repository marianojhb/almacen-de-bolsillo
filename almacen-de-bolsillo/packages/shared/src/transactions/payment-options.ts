export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "VIRTUAL_WALLET" | "CREDIT_CARD" | "DEBIT_CARD";
export type WalletProvider = "MERCADOPAGO" | "UALA" | "OTHER";
export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "BANK_TRANSFER", label: "Transferencia" },
  { value: "VIRTUAL_WALLET", label: "Billetera virtual" },
  { value: "CREDIT_CARD", label: "Tarjeta de crédito" },
  { value: "DEBIT_CARD", label: "Tarjeta de débito" },
];
export const WALLET_PROVIDERS: { value: WalletProvider; label: string }[] = [
  { value: "MERCADOPAGO", label: "Mercado Pago" },
  { value: "UALA", label: "Ualá" },
  { value: "OTHER", label: "Otra billetera" },
];
export const paymentLabel = (method: PaymentMethod, wallet?: WalletProvider | null) =>
  method === "VIRTUAL_WALLET"
    ? WALLET_PROVIDERS.find((item) => item.value === wallet)?.label ?? "Billetera virtual"
    : PAYMENT_METHODS.find((item) => item.value === method)?.label ?? method;
