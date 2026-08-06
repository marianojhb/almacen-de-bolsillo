export type Supplier = {
  id: number;
  name: string;
  cuit: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
};

export type NewSupplier = Omit<Supplier, "id">;