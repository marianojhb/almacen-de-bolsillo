import { useMemo } from "react";
import { createCommerceFormat, DEFAULT_COMMERCE_FORMAT } from "@almacen/shared";
import { useAuth } from "@/contexts/auth";

export function useCommerceFormat() {
  const { session } = useAuth();
  const { country, currency, timeZone } = session?.commerce ?? DEFAULT_COMMERCE_FORMAT;
  return useMemo(() => createCommerceFormat({ country, currency, timeZone }), [country, currency, timeZone]);
}
