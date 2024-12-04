import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema";
import { sql } from "drizzle-orm";

let db: NodePgDatabase<typeof schema> | null;

export function useDb() {
  if (db) {
    db.execute(sql`select 1`).catch(() => {
      db = null;
    });
    return db;
  }

  if (!process.env.DATABASE_URL) throw new Error("Missing db_url in runtime config");
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
