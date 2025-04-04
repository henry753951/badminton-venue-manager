import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema";

let db: NodePgDatabase<typeof schema> | null;

export function useDb() {
  if (db) {
    return db;
  }

  if (!process.env.DATABASE_URL) throw new Error("Missing DATABASE_URL in runtime config");
  const client = {
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    },
    schema: schema,
  };
  db = drizzle(client);
  return db;
}
