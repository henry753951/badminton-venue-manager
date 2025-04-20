import { date, pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { useUUID } from "../../../utils/uuid";

export const t_news = pgTable(
  "t_news",
  {
    id: varchar("id", { length: 8 })
      .primaryKey()
      .$defaultFn(() => useUUID().shortUUID()),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    image_url: text("image_url"),
    created_at: date("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [],
);
