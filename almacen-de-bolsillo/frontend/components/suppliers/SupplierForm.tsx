import { PHONE_COUNTRIES, normalizePhoneContact, type CreateSupplierDto } from "@almacen/shared";
import { SearchSelect } from "@/components/forms/SearchSelect";
import { useAuth } from "@/contexts/auth";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

export type SupplierFormValues = CreateSupplierDto;

type SupplierFormProps = { initialValues?: Partial<SupplierFormValues>;

  submitLabel?: string;

  onSubmit: (values: SupplierFormValues) => Promise<void>;

  onCancel: () => void;
};

const inputClassName = "h-12 rounded-xl border border-gray-300 bg-white px-3 text-base text-black dark:border-gray-700 dark:bg-gray-900 dark:text-white";

export default function SupplierForm({initialValues, submitLabel = "Guardar", onSubmit, onCancel }: SupplierFormProps) {
  const { session } = useAuth();
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialValues?.phoneCountryCode ?? PHONE_COUNTRIES.find((item) => item.country === session?.commerce.country)?.value ?? "+54");
  const saving = useRef(false);
  const [name, setName] =
    useState(
      initialValues?.name ?? "",
    );

  const [cuit, setCuit] =
    useState(
      initialValues?.cuit ?? "",
    );

  const [phone, setPhone] =
    useState(
      initialValues?.phone ?? "",
    );

  const [email, setEmail] =
    useState(
      initialValues?.email ?? "",
    );

  const [address, setAddress] =
    useState(
      initialValues?.address ?? "",
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const handleSubmit = async () => {
    if (saving.current) return;
    const normalizedName =
      name.trim();

    const normalizedCuit =
      cuit.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedName) {
      Alert.alert(
        "Nombre requerido",
        "Ingresá el nombre del proveedor.",
      );
      return;
    }

    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Alert.alert(
        "Email inválido",
        "Ingresá una dirección de email válida.",
      );
      return;
    }

    let contact: ReturnType<typeof normalizePhoneContact>;
    try { contact = normalizePhoneContact(phoneCountryCode, phone); }
    catch (error) { Alert.alert("Teléfono inválido", error instanceof Error ? error.message : "Revisá el teléfono."); return; }
    try {
      saving.current = true;
      setIsSaving(true);

      await onSubmit({
        name: normalizedName,
        cuit: normalizedCuit || null,
        ...contact,
        email: normalizedEmail || null,
        address: address.trim() || null,
      });
    } catch (error) {
      Alert.alert("No se pudo guardar", error instanceof Error ? error.message : "Revisá los datos del proveedor.");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-black"
      behavior={ Platform.OS === "ios" ? "padding" : undefined }
      keyboardVerticalOffset={90}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
            Nombre *
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nombre o razón social"
            autoCapitalize="words"
            className={
              inputClassName
            }
          />
        </View>

        <View>
          <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
            CUIT (opcional)
          </Text>

          <TextInput
            value={cuit}
            onChangeText={setCuit}
            placeholder="CUIT del proveedor"
            className={
              inputClassName
            }
          />
        </View>

        <SearchSelect label="Código de país" value={phoneCountryCode} options={PHONE_COUNTRIES} onChange={setPhoneCountryCode} disabled={isSaving} />
        <View>
          <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
            Teléfono nacional
          </Text>

          <TextInput
            value={phone}
            onChangeText={(value) => setPhone(value.replace(/[^0-9]/g, ""))}
            maxLength={14}
            placeholder="Código de área y número"
            keyboardType="phone-pad"
            className={
              inputClassName
            }
          />
        </View>

        <View>
          <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
            Email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="proveedor@empresa.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className={
              inputClassName
            }
          />
        </View>

        <View>
          <Text className="mb-2 font-semibold text-gray-950 dark:text-white">
            Dirección
          </Text>

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Dirección"
            autoCapitalize="words"
            className={
              inputClassName
            }
          />
        </View>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            disabled={isSaving}
            onPress={onCancel}
            className="flex-1 items-center rounded-xl border border-gray-300 p-4 active:opacity-60 dark:border-gray-700"
          >
            <Text className="font-semibold text-gray-950 dark:text-white">
              Cancelar
            </Text>
          </Pressable>

          <Pressable
            disabled={isSaving}
            onPress={
              handleSubmit
            }
            className={`flex-1 items-center rounded-xl bg-[#111A1A] p-4 active:opacity-75 dark:bg-white ${
              isSaving
                ? "opacity-50"
                : ""
            }`}
          >
            <Text className="font-semibold text-white dark:text-black">
              {isSaving
                ? "Guardando..."
                : submitLabel}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
