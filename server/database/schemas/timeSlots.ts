import {
  pgTable,
  varchar,
  integer,
  text,
  date,
  time,
  primaryKey,
  check,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { t_courts } from "./courts";
import { relations, sql } from "drizzle-orm";

export const t_timeSlots = pgTable(
  "t_time_slots",
  {
    id: uuid("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    courtId: varchar("court_id", { length: 8 })
      .references(() => t_courts.id)
      .notNull(),
    date: date("date", { mode: "date" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    type: text("type").notNull(), // 'coach' 或 'normal'
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at", {
      mode: "date",
      precision: 3,
    }).$onUpdate(() => new Date()),
  },
  (table) => [check("type_check", sql`${table.type} IN ('coach', 'normal')`)]
);

export const timeSlotsRelations = relations(t_timeSlots, ({ one }) => ({
  court: one(t_courts, {
    fields: [t_timeSlots.courtId],
    references: [t_courts.id],
  }),
}));
