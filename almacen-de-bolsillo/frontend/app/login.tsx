import { router, useLocalSearchParams, type Href } from "expo-router";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginScreen() {
  const { commerceUsername } = useLocalSearchParams<{ commerceUsername?: string }>();
  const initialUsername = typeof commerceUsername === "string" ? commerceUsername : "";
  return (
    <AuthScreen>
      <LoginForm key={initialUsername} initialCommerceUsername={initialUsername} onRegister={() => router.push("/register" as Href)} />
    </AuthScreen>
  );
}
