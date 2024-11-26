import { pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { useUUID } from "../../../utils/uuid";

export const t_courts = pgTable(
  "t_courts",
  {
    id: varchar("id", { length: 8 })
      .primaryKey()
      .$defaultFn(() => useUUID().shortUUID()),
    name: text("name").notNull(),
    location: text("location").notNull(),
    image_url: text("image_url"),
  },
  (table) => [uniqueIndex("nameIdx").on(table.name)]
);
