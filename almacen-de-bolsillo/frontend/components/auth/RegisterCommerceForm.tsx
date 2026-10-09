import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { COMMERCE_COUNTRIES, COMMERCE_CURRENCIES, getCommerceCountry, type RegisterCommerceResponse } from "@almacen/shared";
import { SearchSelect } from "@/components/forms/SearchSelect";
import { EmailField } from "./EmailField";
import { registerCommerceRequest } from "@/services/authApi";
import { AuthButton } from "./AuthButton";
import { AuthField } from "./AuthField";
import { validateRegisterForm, type RegisterCommerceFormValues } from "./auth-form.utils";

type RegisterCommerceFormProps = {
  onRegistered: (commerceUsername: string) => void;
  onCancel: () => void;
};

export function RegisterCommerceForm({ onRegistered, onCancel }: RegisterCommerceFormProps) {
  const [values, setValues] = useState<RegisterCommerceFormValues>({
    name: "", commerceUsername: "", country: "AR", currency: "ARS",
    timeZone: "America/Argentina/Buenos_Aires", ownerFirstname: "", ownerLastname: "", ownerDni: "", email: "",
    password: "", confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<RegisterCommerceResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);

  const updateValue = (field: keyof RegisterCommerceFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: field === "commerceUsername" ? value.toLowerCase() : value }));
  };

  const countryOption = getCommerceCountry(values.country);
  const changeCountry = (code: string) => {
    const country = getCommerceCountry(code);
    if (!country) return;
    setValues((current) => ({ ...current, country: code, currency: country.currency, timeZone: country.timeZones[0].value,
      ownerDni: code === "AR" ? current.ownerDni : "" }));
  };

  const handleSubmit = async () => {
    if (submitting.current || registration) return;
    const validation = validateRegisterForm(values);
    if (!validation.ok) { setError(validation.message); return; }
    submitting.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await registerCommerceRequest(validation.data);
      setValues((current) => ({ ...current, password: "", confirmPassword: "" }));
      setRegistration(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo registrar el comercio.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  if (registration) {
    return (
      <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <Text className="text-2xl font-bold text-gray-950 dark:text-white">Comercio registrado</Text>
        <Text className="text-base text-gray-600 dark:text-gray-300">
          {registration.commerce.name} ya está creado. Podés ingresar en modo Comercio con el usuario {registration.commerce.username} y la contraseña que elegiste.
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {registration.owner.firstname} {registration.owner.lastname}, sos el creador del comercio y tenés acceso completo desde Comercio.
        </Text>
        <AuthButton label="Ir a iniciar sesión" onPress={() => onRegistered(registration.commerce.username)} />
      </View>
    );
  }

  return (
    <View className="gap-5">
      <View>
        <Text className="text-2xl font-bold text-gray-950 dark:text-white">Registrar comercio</Text>
        <Text className="mt-2 text-gray-500 dark:text-gray-400">Creá tu comercio y tu cuenta de creador.</Text>
      </View>
      <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <Text className="text-lg font-bold text-gray-950 dark:text-white">Datos del comercio</Text>
        <AuthField label="Nombre del comercio" value={values.name} onChangeText={(v) => updateValue("name", v)}
          placeholder="Nombre de tu comercio" maxLength={100} editable={!isSubmitting} />
        <AuthField label="Usuario del comercio" value={values.commerceUsername} onChangeText={(v) => updateValue("commerceUsername", v)}
          placeholder="Ej.: mi-almacen" autoCapitalize="none" autoCorrect={false} maxLength={40} editable={!isSubmitting} />
        <Text className="-mt-3 text-sm text-gray-500 dark:text-gray-400">Este usuario identifica al comercio al iniciar sesión y siempre se escribe en minúsculas.</Text>
        <EmailField label="Correo del dueño" value={values.email} onChangeText={(v) => updateValue("email", v)}
          placeholder="contacto@ejemplo.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} maxLength={254} editable={!isSubmitting} />
        <SearchSelect label="País" value={values.country} onChange={changeCountry} disabled={isSubmitting}
          options={COMMERCE_COUNTRIES.map((country) => ({ value: country.code, label: country.name }))} />
        <SearchSelect label="Moneda" value={values.currency} onChange={(currency) => updateValue("currency", currency)}
          disabled={isSubmitting} options={COMMERCE_CURRENCIES} />
        <SearchSelect label="Zona horaria" value={values.timeZone} onChange={(timeZone) => updateValue("timeZone", timeZone)}
          disabled={isSubmitting || (countryOption?.timeZones.length ?? 0) <= 1} options={countryOption?.timeZones ?? []} />
        <Text className="-mt-3 text-sm text-gray-500 dark:text-gray-400">
          El país configura la moneda y zona horaria iniciales. Si tiene varias zonas, elegí la de tu localidad.
        </Text>
      </View>
      <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <Text className="text-lg font-bold text-gray-950 dark:text-white">Datos del dueño</Text>
        <AuthField label="Nombre" value={values.ownerFirstname} onChangeText={(v) => updateValue("ownerFirstname", v)}
          placeholder="Tu nombre" autoCapitalize="words" maxLength={80} editable={!isSubmitting} />
        <AuthField label="Apellido" value={values.ownerLastname} onChangeText={(v) => updateValue("ownerLastname", v)}
          placeholder="Tu apellido" autoCapitalize="words" maxLength={80} editable={!isSubmitting} />
        {values.country === "AR" && <AuthField label="DNI" value={values.ownerDni}
          onChangeText={(v) => updateValue("ownerDni", v.replace(/\D/g, "").slice(0, 8).replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
          placeholder="12.345.678" keyboardType="number-pad" maxLength={10} editable={!isSubmitting} />}
      </View>
      <View className="gap-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
        <Text className="text-lg font-bold text-gray-950 dark:text-white">Acceso al comercio</Text>
        <AuthField label="Contraseña" value={values.password} onChangeText={(v) => updateValue("password", v)}
          placeholder="Entre 8 y 128 caracteres" isPassword autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!isSubmitting} />
        <AuthField label="Confirmar contraseña" value={values.confirmPassword} onChangeText={(v) => updateValue("confirmPassword", v)}
          placeholder="Repetí tu contraseña" isPassword autoCapitalize="none" autoCorrect={false} maxLength={128} editable={!isSubmitting} />
      </View>
      {error && <Text accessibilityRole="alert" className="text-sm text-red-600 dark:text-red-400">{error}</Text>}
      <AuthButton label={isSubmitting ? "Registrando..." : "Crear comercio"} loading={isSubmitting} onPress={() => void handleSubmit()} />
      <AuthButton label="Volver al inicio de sesión" secondary disabled={isSubmitting} onPress={onCancel} />
    </View>
  );
}
