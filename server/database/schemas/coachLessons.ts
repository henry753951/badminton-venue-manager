import {
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { t_timeSlots } from "./timeSlots";
import { t_users } from "./users";
import { primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const t_coachLessons = pgTable("t_coach_lessons", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  timeSlotId: uuid("time_slot_id")
    .references(() => t_timeSlots.id)
    .unique()
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
});

// 關聯多位教練的多對多關係表
export const coachLessonCoaches = pgTable(
  "t_coach_lesson_coaches",
  {
    coachLessonId: uuid("coach_lesson_id")
      .references(() => t_coachLessons.id)
      .notNull(),
    coachId: uuid("coach_id")
      .references(() => t_users.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.coachLessonId, table.coachId] })]
);
