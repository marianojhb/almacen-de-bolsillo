import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// En móvil se conserva el token en SecureStore para recuperar la sesión al abrir
// la app. En web no se persiste: queda solo en la memoria de apiClient y se pierde
// al recargar la página. Nunca guardamos aquí la contraseña ni una copia de permisos.
const TOKEN_KEY = "almacen.session-token";

export async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function deleteStoredToken(): Promise<void> {
  if (Platform.OS === "web") return;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
