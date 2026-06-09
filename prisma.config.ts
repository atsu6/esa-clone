import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
      const client = createClient({ url: dbUrl });
      return new PrismaLibSql(client);
    },
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
