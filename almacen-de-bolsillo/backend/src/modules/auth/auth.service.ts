import type {
  AuthUser,
  LoginDto,
  SetupStatus,
} from "@almacen/shared";

import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { hashPassword, verifyPassword } from "./password.js";

export class AuthError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const authUserSelect = {
  id: true,
  email: true,
  role: true,
} as const;

async function findOwner() {
  return prisma.user.findFirst({
    where: {
      role: "BUSINESS_OWNER",
    },
    select: {
      id: true,
    },
  });
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const owner = await findOwner();

  return {
    ownerExists: owner !== null,
  };
}

export async function createOwner(
  credentials: LoginDto,
): Promise<AuthUser> {
  const owner = await findOwner();

  if (owner) {
    throw new AuthError(
      409,
      "El comercio ya tiene un dueño registrado.",
    );
  }

  const email = credentials.email.trim().toLowerCase();
  const passwordHash = await hashPassword(credentials.password);

  try {
    return await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "BUSINESS_OWNER",
        isActive: true,
        lastAccess: new Date(),
      },
      select: authUserSelect,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // La restricción de la base también cubre solicitudes simultáneas.
      const existingOwner = await findOwner();

      if (existingOwner) {
        throw new AuthError(
          409,
          "El comercio ya tiene un dueño registrado.",
        );
      }

      throw new AuthError(
        409,
        "El email ya está utilizado por otra cuenta.",
      );
    }

    throw error;
  }
}

export async function login(
  credentials: LoginDto,
): Promise<AuthUser> {
  const email = credentials.email.trim().toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      ...authUserSelect,
      passwordHash: true,
      isActive: true,
      employee: {
        select: {
          isActive: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthError(
      401,
      "Email o contraseña incorrectos.",
    );
  }

  const validPassword = await verifyPassword(
    credentials.password,
    user.passwordHash,
  );

  if (!validPassword) {
    throw new AuthError(
      401,
      "Email o contraseña incorrectos.",
    );
  }

  if (!user.isActive || user.employee?.isActive === false) {
    throw new AuthError(403, "Usuario desactivado.");
  }

  return prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lastAccess: new Date(),
    },
    select: authUserSelect,
  });
}
