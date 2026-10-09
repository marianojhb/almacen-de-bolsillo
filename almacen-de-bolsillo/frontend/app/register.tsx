import { router, type Href } from "expo-router";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { RegisterCommerceForm } from "@/components/auth/RegisterCommerceForm";

export default function RegisterScreen() {
  return (
    <AuthScreen>
      <RegisterCommerceForm
        onRegistered={(commerceUsername) => router.replace({ pathname: "/login", params: { commerceUsername } } as Href)}
        onCancel={() => router.replace("/login" as Href)}
      />
    </AuthScreen>
  );
}
