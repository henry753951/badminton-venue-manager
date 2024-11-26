import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema";

let db: NodePgDatabase<typeof schema> | null;

export function useDb() {
  const config = useRuntimeConfig();
  if (db) return db;

  if (!config.db_url) throw new Error("Missing db_url in runtime config");
  const client = {
    connection: {
      connectionString: config.db_url,
      ssl: true,
    },
    schema: schema,
  };
  db = drizzle(client);
  return db;
}
