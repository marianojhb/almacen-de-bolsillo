// src/config/prisma.ts

import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const connectionUrl = new URL(databaseUrl);
connectionUrl.searchParams.delete('sslmode');
connectionUrl.searchParams.delete('uselibpqcompat');

const adapter = new PrismaPg({
  connectionString: connectionUrl.toString(),
  ssl: {
    rejectUnauthorized: false,
  },
});

export const prisma = new PrismaClient({
  adapter,
});
