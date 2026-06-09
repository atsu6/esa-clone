import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async adapter() {
      const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
      // libsql expects file: URLs as-is
      const client = createClient({ url: dbUrl });
      return new PrismaLibSQL(client);
    },
  },
});
