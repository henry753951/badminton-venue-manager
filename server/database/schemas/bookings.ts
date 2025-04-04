import { pgTable, uuid } from "drizzle-orm/pg-core";
import { t_users } from "./users";
import { t_timeSlots } from "./timeSlots";
import { relations, sql } from "drizzle-orm";

export const t_bookings = pgTable("t_bookings", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .references(() => t_users.id, { onDelete: "cascade" })
    .notNull(),
  timeSlotId: uuid("time_slot_id")
    .references(() => t_timeSlots.id, { onDelete: "cascade" })
    .notNull(),
});

export const bookingsRelations = relations(t_bookings, ({ one }) => ({
  timeSlot: one(t_timeSlots, {
    fields: [t_bookings.timeSlotId],
    references: [t_timeSlots.id],
  }),
}));
