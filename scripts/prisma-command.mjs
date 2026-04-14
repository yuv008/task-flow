import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

if (existsSync(".env")) {
  process.loadEnvFile?.(".env");
}

if (existsSync(".env.local")) {
  process.loadEnvFile?.(".env.local");
}

const prismaArgs = process.argv.slice(2);
const databaseUrl = process.env.DATABASE_URL ?? "";

function resolveSchemaPath(url) {
  if (!url) {
    // No DATABASE_URL in the environment (e.g. CI build before DB is provisioned).
    // Default to the PostgreSQL schema so `prisma generate` can still produce the
    // client without a live connection.
    return "prisma/schema.postgresql.prisma";
  }

  if (url.startsWith("file:")) {
    return "prisma/schema.sqlite.prisma";
  }

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    return "prisma/schema.postgresql.prisma";
  }

  throw new Error(
    "DATABASE_URL must start with file:, postgres://, or postgresql://"
  );
}

const schemaPath = resolveSchemaPath(databaseUrl);
const result = spawnSync(
  "npx",
  ["prisma", ...prismaArgs, "--schema", schemaPath],
  {
    shell: process.platform === "win32",
    stdio: "inherit",
    env: process.env,
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
