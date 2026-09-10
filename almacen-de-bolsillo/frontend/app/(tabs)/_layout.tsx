// @/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";
import { SalesProvider } from "@/contexts/sales/provider";
import { PurchasesProvider } from "@/contexts/purchases/provider";
import { SuppliersProvider } from "@/contexts/suppliers/provider";
import { ProductsProvider } from "@/contexts/products/provider";
import { useColorScheme } from "react-native";

export default function TabScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <ProductsProvider>
      <SuppliersProvider>
        <PurchasesProvider>
          <SalesProvider>
            <Tabs
              screenOptions={{
                headerStyle: {
                  backgroundColor: isDark ? "#111A1A" : "#ffffff",
                },
                headerTintColor: isDark ? "#ffffff" : "#111111",

                tabBarStyle: {
                  backgroundColor: isDark ? "#111A1A" : "#ffffff",
                  borderTopColor: isDark ? "#263333" : "#dddddd",
                },

                tabBarActiveTintColor: isDark ? "#ffffff" : "#111111",
                tabBarInactiveTintColor: isDark ? "#8A9999" : "#777777",

                headerTitleStyle: {
                  fontWeight: "900",
                },
              }}>
              <Tabs.Screen
                name="index"
                options={{
                  title: "Dashboard",
                  tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={color} size={size} />,
                  headerBackButtonDisplayMode: "minimal",
                  headerStyle: { backgroundColor: "#111A1A" },
                  headerTintColor: "#fff",
                  headerTitleStyle: { fontWeight: "900" },
                }}
              />

              <Tabs.Screen
                name="sales"
                options={{
                  title: "Ventas",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />,
                }}
              />
              <Tabs.Screen
                name="products"
                options={{
                  title: "Productos",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />,
                }}
              />
              <Tabs.Screen
                name="purchases"
                options={{
                  title: "Compras",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
                }}
              />
              <Tabs.Screen
                name="more"
                options={{
                  title: "Más",
                  headerShown: false,
                  tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" color={color} size={size} />,
                }}
              />
            </Tabs>
          </SalesProvider>
        </PurchasesProvider>
      </SuppliersProvider>
    </ProductsProvider>
  );
}
