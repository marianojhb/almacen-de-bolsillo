export type RegisterCommerceDto = {
  commerce: {
    name: string;
    username: string;
    country: string;
    currency: string;
    timeZone: string;
  };
  owner: {
    firstname: string;
    lastname: string;
    dni: string | null;
    email: string;
    password: string;
  };
};

export type RegisterCommerceResponse = {
  message: string;
  commerce: CommerceSessionInfo;
  owner: {
    id: number;
    firstname: string;
    lastname: string;
  };
  role: {
    id: number;
    name: string;
  };
};

export type CommerceSessionInfo = RegisterCommerceDto["commerce"] & {
  id: number;
};

export type LoginDto =
  | { mode: "commerce"; commerceUsername: string; password: string }
  | { mode: "user"; commerceUsername: string; username: string; password: string };

export type AuthSessionInfo = {
  user: {
    id: number;
    username: string | null;
    email: string;
    name: string;
    lastAccess: string | null;
  };
  commerce: CommerceSessionInfo;
  role: {
    id: number;
    name: string;
  };
  permissions: string[];
  isOwner: boolean;
  employee: { id: number; name: string } | null;
  issuedAt: string;
  expiresAt: string;
};

export type LoginResponse = {
  token: string;
  session: AuthSessionInfo;
};
