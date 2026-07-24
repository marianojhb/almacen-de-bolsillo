// @/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router/tabs";
import { Ionicons } from "@expo/vector-icons";

export default function TabScreen() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="sales/index"
        options={{
          title: "Ventas",
          tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Productos",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more/index"
        options={{
          title: "Más",
          tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
