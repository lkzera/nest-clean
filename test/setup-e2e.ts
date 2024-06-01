import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import 'dotenv/config';
import { execSync } from 'node:child_process';

const prisma = new PrismaClient();



function generateUniqueDatabaseUrl(schemaId: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provider a DATABASE_URL in env variable');
  }

  const url = new URL(process.env.DATABASE_URL);

  url.searchParams.set('schema', schemaId);

  return url.toString();
}

const schemaId = randomUUID();

beforeAll(async () => {
  const dabaseUrl = generateUniqueDatabaseUrl(schemaId);
  process.env.DATABASE_URL = dabaseUrl;
  execSync('yarn prisma migrate deploy');
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});