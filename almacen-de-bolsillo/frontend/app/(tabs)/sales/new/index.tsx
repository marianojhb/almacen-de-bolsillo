import { View, Text, TextInput, ScrollView, Pressable, Modal, FlatList } from "react-native";
import { useProducts } from "@/contexts/products";
import { useState } from "react";
import { router } from "expo-router";

export const NewSaleScreen = () => {
  // contexts
  const { products } = useProducts();

  // estilos
  const viewStyle = "flex-row items-center justify-between mb-4";
  const textStyle = "text-base font-bold mr-2";
  const inputStyle = " border border-gray-300 rounded-md p-2 w-1/2";

  // form inputs states
  const [inputSubtotal, setInputSubtotal] = useState("");
  const [inputDiscount, setInputDiscount] = useState("");

  const [isVisibleModal, setIsVisibleModal] = useState(false);

  // pure calculations
  const discount: number = Math.round(Number(inputSubtotal) * (Number(inputDiscount) / 100) * 100) / 100;
  const baseImponible: number = Math.round((Number(inputSubtotal) - discount) * 100) / 100; // redondear a 2 decimales

  const iva = Math.round(baseImponible * 0.21 * 100) / 100; // 21% de IVA

  const totalConIVA: number = Math.round((baseImponible + iva) * 100) / 100; // sumar el IVA y redondear a 2 decimales

  return (
    <>
      <View className="items-center justify-center">
        <Text className="text-2xl font-bold">Nueva Venta</Text>
        <Text className="text-lg text-gray-500">Complete los campos para crear una nueva venta</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        <View className={viewStyle}>
          <Text className={textStyle}>Número de factura</Text>
          <TextInput placeholder="Ingrese el número de factura" className={inputStyle}></TextInput>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Subtotal</Text>
          <TextInput
            placeholder="Ingrese el subtotal"
            value={inputSubtotal}
            className={inputStyle}
            onChangeText={setInputSubtotal}></TextInput>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Descuento</Text>
          <View className="flex-row items-center justify-start w-1/2">
            <TextInput
              placeholder="Descuento"
              className={inputStyle}
              value={inputDiscount}
              onChangeText={setInputDiscount}></TextInput>
            <Text>{"  "}%</Text>
          </View>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Descuento total (-)</Text>
          <Text className={inputStyle}>- {discount}</Text>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Total sin IVA</Text>
          <Text className={inputStyle}>{baseImponible}</Text>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>IVA</Text>
          <Text className={inputStyle}>{iva}</Text>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Total con IVA</Text>
          <Text className={inputStyle}>{totalConIVA}</Text>
        </View>

        <View className={viewStyle}>
          <Text className={textStyle}>Método de pago</Text>
          <TextInput placeholder="Ingrese el método de pago" className={inputStyle}></TextInput>
        </View>

        <Pressable
          className="bg-blue-500 rounded-lg p-4 items-center w-full mt-4"
          onPress={() => {
            router.push("/sales/new/select-products");
          }}>
          <Text className="text-white">Agregar productos</Text>
        </Pressable>

        <View className="flex-row items-center justify-between mb-4 mt-4">
          <Text className="text-base font-bold mr-2">Productos agregados</Text>
          <Text className="text-base font-bold mr-2">Total: {totalConIVA}</Text>
        </View>

        <Pressable
          className="bg-blue-500 rounded-lg p-4 items-center w-full mt-4"
          onPress={() => {
            setIsVisibleModal(false);
          }}>
          <Text className="text-white">Guardar venta</Text>
        </Pressable>

        <Pressable
          className="bg-gray-500 rounded-lg p-4 items-center w-full mt-4"
          onPress={() => {
            setIsVisibleModal(false);
          }}>
          <Text className="text-white">Cancelar</Text>
        </Pressable>
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
  salesOrdersItem SalesOrdersItems[]
  seller          User               @relation(fields: [sellerId], references: [id])




*/
