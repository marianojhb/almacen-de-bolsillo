// @/app/(tabs)/_layout.tsx
import { useAuth } from "@/contexts/auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Tabs } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";
import { SalesProvider } from "@/contexts/sales/provider";
import { PurchasesProvider } from "@/contexts/purchases/provider";
import { SuppliersProvider } from "@/contexts/suppliers/provider";
import { ProductsProvider } from "@/contexts/products/provider";
import { EmployeeLinkNotice } from "@/components/auth/EmployeeLinkNotice";
import { View, useColorScheme } from "react-native";
import { EmployeesProvider } from "@/contexts/employees";

export default function TabScreen() {
  const { session } = useAuth();
  const { can } = usePermissions();
  const dataKey = `${session?.user.id}:${session?.permissions.join("|")}`;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View className="flex-1">
    <ProductsProvider key={dataKey}>
      <SuppliersProvider>
        <EmployeesProvider>
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
              <Tabs.Protected guard={session?.isOwner === true && can("dashboard.read")}>
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
              </Tabs.Protected>

              <Tabs.Screen
                name="work-shifts"
                options={{
                  title: can("work_shifts.read") ? "Turnos" : "Mis turnos",
                  headerShown: false,
                  href: session?.isOwner ? null : undefined,
                  tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
                }}
              />
              <Tabs.Protected guard={can("sales.read")}>
                <Tabs.Screen
                  name="sales"
                  options={{
                    title: "Ventas",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />,
                  }}
                />
              </Tabs.Protected>
              <Tabs.Protected guard={can("products.read")}>
                <Tabs.Screen
                  name="products"
                  options={{
                    title: "Productos",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" color={color} size={size} />,
                  }}
                />
              </Tabs.Protected>
              <Tabs.Protected guard={can("purchases.read")}>
                <Tabs.Screen
                  name="purchases"
                  options={{
                    title: "Compras",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
                  }}
                />
              </Tabs.Protected>
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
        </EmployeesProvider>    
      </SuppliersProvider>
    </ProductsProvider>
    <EmployeeLinkNotice />
    </View>
  );
}
