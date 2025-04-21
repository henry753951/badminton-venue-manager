import { date, json, pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { useUUID } from "../../../utils/uuid";

export const t_settings = pgTable(
  "t_settings",
  {
    id: varchar("id", { length: 8 })
      .primaryKey()
      .$defaultFn(() => useUUID().shortUUID()),
    key: text("key").notNull(),
    value: json("value").notNull(),
  },
  (table) => [],
);
