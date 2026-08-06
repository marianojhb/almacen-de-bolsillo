import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useSalesDraft } from "@/contexts/sales-draft";
import { useSales } from "@/contexts/sales";
import { useState } from "react";
import { router } from "expo-router";
import { CreateSalesOrderDto } from "@almacen/shared";

export const NewSaleScreen = () => {
  // contexts
  const { items, totalAmount, removeItem, clearSales } = useSalesDraft();
  const { addSale, refreshSales } = useSales();

  // estilos
  const viewStyle = "flex-row items-center justify-between mb-2";
  const textStyle = "font-bold mr-2";
  const inputStyle = "text-right  rounded-md p-2 w-1/2";

  // form inputs states
  const [inputDiscount, setInputDiscount] = useState("");
  const [metodoDePago, setMetodoDePago] = useState<"EFECTIVO" | "MERCADOPAGO" | "UALA">("EFECTIVO");
  const [numeroFactura, setNumeroFactura] = useState("");

  // buttons states
  const [isSavingSale, setIsSavingSale] = useState(false);

  // pure calculations
  const discount: number = Math.round(Number(totalAmount) * (Number(inputDiscount) / 100) * 100) / 100;
  const baseImponible: number = Math.round((Number(totalAmount) - discount) * 100) / 100; // Significa "...) * 100 / 100": redondea a 2 decimales
  const iva = Math.round(baseImponible * 0.21 * 100) / 100; // 21% de IVA
  const totalConIVA: number = Math.round((baseImponible + iva) * 100) / 100; // sumar el IVA y redondear a 2 decimales

  const isDisabled: boolean = items.length === 0 || isSavingSale;

  async function handleAddSale() {
    const saleData: CreateSalesOrderDto = {
      invoice: numeroFactura,
      sellerId: 3, // por ahora fijo
      paymentMethod: metodoDePago,
      discount: discount,
      iva: iva,
      total: totalConIVA,
      salesOrderItems: items.map((item) => ({
        productId: item.productId,
        shortname: item.shortname,
        longname: item.longname,
        quantity: item.quantity,
        price: item.price,
        discount: 0, // descuento por línea por ahora fijo
        subtotal: item.quantity * item.price,
      })),
    };

    setIsSavingSale(true);
    // 1. Create the sale successfully
    await addSale(saleData);

    // 2. Clear the temporary draft
    clearSales();

    // 3. Reload the sales list
    await refreshSales();

    //4. Navigate to the list
    router.replace("/sales");

    setIsSavingSale(false);
  }
  return (
    <>
      <View className="items-center justify-center">
        <Text className="text-2xl font-bold pt-2">Nueva Venta</Text>
      </View>
      <ScrollView
        className="flex-1 p-2"
        alwaysBounceVertical={false}
        bounces={true}
        contentContainerClassName="flex-grow">
        <Pressable
          className="border rounded p-2 border-gray-300 w-full mb-2"
          onPress={() => {
            router.push("/sales/new/select-products");
          }}>
          <View className="flex-column items-start ">
            <Text className="text-base font-bold pb-2">Items:</Text>

            {items.length === 0 && (
              <Text className="text-sm text-gray-500 dark:text-gray-400">No hay productos agregados </Text>
            )}

            {items.length > 0 &&
              items.map((item) => (
                <View key={item.productId}>
                  <Text>{item.shortname}</Text>
                  <View className="flex-row items-center justify-between w-full">
                    <Text>
                      Cantidad: {item.quantity} ${item.price} c/u
                    </Text>
                    <Text className="ms-auto">
                      {(item.quantity * item.price).toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
                    </Text>
                    <Pressable
                      className="border border-red-500 p-2 px-4 rounded ms-2"
                      onPress={() => {
                        removeItem(item.productId);
                      }}>
                      <Text className="text-red-500 font-bold">x</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

            <Text className="text-base font-bold pt-2 ms-auto">
              Subtotal: {totalAmount.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
            </Text>
          </View>
        </Pressable>

        <View className={viewStyle}>
          <Text className={textStyle}>Número de factura</Text>
          <TextInput
            placeholder="Número de factura"
            className={inputStyle + " border border-gray-300"}
            onChangeText={setNumeroFactura}></TextInput>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Descuento</Text>
          <View className={viewStyle + " gap-[1px]"}>
            <Pressable
              className={`px-4 py-2 rounded-tl rounded-bl ${inputDiscount === "0" ? "bg-slate-300" : "bg-slate-100"}`}
              onPress={() => setInputDiscount("0")}>
              <Text>0%</Text>
            </Pressable>
            <Pressable
              className={`px-4 py-2 rounded-tl rounded-bl ${inputDiscount === "5" ? "bg-slate-300" : "bg-slate-100"}`}
              onPress={() => setInputDiscount("5")}>
              <Text>5%</Text>
            </Pressable>
            <Pressable
              className={`px-4 py-2 rounded-tl rounded-bl ${inputDiscount === "10" ? "bg-slate-300" : "bg-slate-100"}`}
              onPress={() => setInputDiscount("10")}>
              <Text>10%</Text>
            </Pressable>
            <Pressable
              className={`px-4 py-2 rounded-tl rounded-bl ${inputDiscount === "15" ? "bg-slate-300" : "bg-slate-100"}`}
              onPress={() => setInputDiscount("15")}>
              <Text>15%</Text>
            </Pressable>
          </View>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Descuento total (-)</Text>
          <Text className={inputStyle}>
            - {discount.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
          </Text>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Total (sin IVA)</Text>
          <Text className={inputStyle}>
            {baseImponible.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
          </Text>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>IVA</Text>
          <Text className={inputStyle}>{iva.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}</Text>
        </View>

        <View className={viewStyle + " border-t border-gray-300 pt-2 mb-0"}>
          <Text className={textStyle + " text-2xl"}>Total a pagar </Text>
          <Text className={inputStyle + " text-2xl font-bold "}>
            {totalConIVA.toLocaleString("es-AR", { style: "currency", currency: "ARS" })}
          </Text>
        </View>
        <Text className="text-sm text-gray-500">(IVA incluido)</Text>

        <View className="mt-auto">
          <View className="flex-row justify-center items-center gap-x-[1px] mb-2">
            <Pressable
              className={`px-4 py-4 w-26 rounded-tl rounded-bl ${metodoDePago === "EFECTIVO" ? "bg-green-500" : "bg-slate-200"}`}
              onPress={() => setMetodoDePago("EFECTIVO")}>
              <Text className={`${metodoDePago === "EFECTIVO" ? "text-white" : "text-black"}`}>EFECTIVO</Text>
            </Pressable>
            <Pressable
              className={`px-4 py-4 w-26  ${metodoDePago === "MERCADOPAGO" ? "bg-yellow-300" : "bg-slate-200"}`}
              onPress={() => setMetodoDePago("MERCADOPAGO")}>
              <Text className={`${metodoDePago === "MERCADOPAGO" ? "font-bold" : "text-black"}`}>MERCADOPAGO</Text>
            </Pressable>
            <Pressable
              className={` px-4 py-4 w-26 rounded-tr rounded-br ${metodoDePago === "UALA" ? "bg-blue-500" : "bg-slate-200"}`}
              onPress={() => setMetodoDePago("UALA")}>
              <Text className={`${metodoDePago === "UALA" ? "text-white font-bold" : "text-black"}`}>UALA</Text>
            </Pressable>
          </View>
          <Pressable
            className={`rounded-lg p-4 items-center mt-8 ${!isDisabled ? " bg-green-500" : " bg-gray-300"}`}
            onPress={handleAddSale}
            disabled={isDisabled}>
            <Text className="text-white">{isSavingSale ? "Guardando venta..." : "Guardar venta"}</Text>
          </Pressable>
          <Pressable
            className="bg-gray-500 rounded-lg p-4 items-center w-full mt-4"
            onPress={() => {
              clearSales();

              router.back();
            }}>
            <Text className="text-white">Cancelar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
};

export default NewSaleScreen;

/* NOTES

campos que van en nueva venta:

- id de la venta (autogenerado)
- Número de factura opcional
- fecha autogenerado
- vendedor autogenerado (por ahora fijo en 3)
- createdAt autogenerado
- descuento opcional
- iva opcional
- isActive autogenerado true
- Productos (con cantidad y precio unitario)
- Total
- Método de pago EFECTIVO /MERCADOPAGO / UALA




de models:
  id              Int                @id @default(autoincrement()) @map("id_sales_orders_so")
  invoice         String?            @map("invoice_so")
  date            DateTime           @default(now()) @map("date_so")
  sellerId        Int                @default(3) @map("id_user_so")
  createdAt       DateTime           @default(now()) @map("created_at")
  discount        Decimal            @default(0) @map("discount_so") @db.Decimal(10, 2)
  iva             Decimal            @default(0) @map("iva_so") @db.Decimal(10, 2)
  isActive        Boolean            @default(true) @map("is_active_so")
  total           Decimal            @default(0) @map("total_so") @db.Decimal(10, 2)
  updatedAt       DateTime           @updatedAt @map("updated_at")
  paymentMethod   PaymentMethod      @default(EFECTIVO) @map("payment_method_so")
  salesOrderItems SalesOrderItem[]
  seller          User               @relation(fields: [sellerId], references: [id])




*/
