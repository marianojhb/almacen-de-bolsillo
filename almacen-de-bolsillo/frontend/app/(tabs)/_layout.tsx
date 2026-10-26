// @/app/(tabs)/_layout.tsx
import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SalesProvider } from "@/contexts/sales/provider";
import { PurchasesProvider } from "@/contexts/purchases/provider";
import { SuppliersProvider } from "@/contexts/suppliers/provider";
import { ProductsProvider } from "@/contexts/products/provider";
import { useColorScheme } from "react-native";
import { EmployeesProvider } from "@/contexts/employees";
import { WorkShiftsProvider } from "@/contexts/work-shifts";
import { usePermissions } from "@/hooks/usePermissions";
import { NotebookBrand, NotebookScene } from "@/components/ui/notebook";
import { notebook } from "@/constants/notebook";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabScreen() {
  const { can } = usePermissions();
  const segments = useSegments();
  const isTabRoot = segments.length <= 2;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = isDark ? notebook.dark : notebook;
  const insets = useSafeAreaInsets();
  return (
    <ProductsProvider>
      <SuppliersProvider>
        <EmployeesProvider>
          <PurchasesProvider>
              <SalesProvider>
                <WorkShiftsProvider>
                <Tabs
                screenLayout={({ children }) => <NotebookScene>{children}</NotebookScene>}
                screenOptions={{

                  headerStyle: {
                    backgroundColor: palette.paper,
                  },
                  headerTintColor: palette.ink,
                  headerTitle: () => <NotebookBrand />,
                  headerTitleAlign: "left",
                  headerShadowVisible: false,
                  sceneStyle: { backgroundColor: palette.paper },

                  tabBarStyle: {
                    backgroundColor: palette.paper,
                    borderTopColor: palette.border,
                    elevation: 0,
                    height: 64 + Math.max(insets.bottom, 8),
                    paddingTop: 4,
                    paddingBottom: Math.max(insets.bottom, 8),
                  },

                  tabBarActiveTintColor: palette.ink,
                  tabBarInactiveTintColor: palette.muted,
                  tabBarActiveBackgroundColor: palette.selected,
                  tabBarItemStyle: { borderRadius: 14, marginHorizontal: 3 },
                  tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginBottom: 4 },

                  headerTitleStyle: {
                    fontWeight: "900",
                  },

                }}>

                <Tabs.Screen
                  name="index"


                  options={{
                    title: "Dashboard",
                    tabBarLabel: "Inicio",
                    tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={String(color)} size={size} />,
                    headerBackButtonDisplayMode: "minimal",
                    headerStyle: { backgroundColor: palette.paper },
                    headerTintColor: palette.ink,
                    headerTitleStyle: { fontWeight: "900" },
                  }}
                />


                <Tabs.Protected guard={can("sales", "read")}>
                <Tabs.Screen
                  name="sales"
                  options={{
                    title: "Ventas",
                    headerShown: isTabRoot,
                    headerStyle: { backgroundColor: palette.paper },
                    headerTintColor: palette.ink,
                    headerTitleStyle: { fontWeight: "900" },
                    tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={String(color)} size={size} />,
                  }}
                />
                </Tabs.Protected>
                <Tabs.Protected guard={can("products", "read")}>
                <Tabs.Screen
                  name="products"
                  options={{
                    title: "Productos",
                    headerShown: isTabRoot,
                    headerStyle: { backgroundColor: palette.paper },
                    headerTintColor: palette.ink,
                    headerTitleStyle: { fontWeight: "900" },
                    tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" color={String(color)} size={size} />,
                  }}
                />
                </Tabs.Protected>
                <Tabs.Protected guard={can("purchases", "read")}>
                <Tabs.Screen
                  name="purchases"
                  options={{
                    title: "Compras",
                    headerShown: isTabRoot,
                    headerStyle: { backgroundColor: palette.paper },
                    headerTintColor: palette.ink,
                    headerTitleStyle: { fontWeight: "900" },
                    tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={String(color)} size={size} />,
                  }}
                />
                </Tabs.Protected>
                <Tabs.Screen
                  name="more"
                  options={{
                    title: "Más",
                    headerShown: isTabRoot,
                    headerStyle: { backgroundColor: palette.paper },
                    headerTintColor: palette.ink,
                    headerTitleStyle: { fontWeight: "900" },
                    tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" color={String(color)} size={size} />,
                  }}
                />
                </Tabs>
              </WorkShiftsProvider>
            </SalesProvider>
          </PurchasesProvider>
        </EmployeesProvider>
      </SuppliersProvider>
    </ProductsProvider>
  );
}
