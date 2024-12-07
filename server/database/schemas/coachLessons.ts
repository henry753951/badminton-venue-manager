import { pgTable, integer, text, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { t_timeSlots } from "./timeSlots";
import { t_users } from "./users";
import { primaryKey } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const t_coachLessons = pgTable("t_coach_lessons", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  timeSlotId: uuid("time_slot_id")
    .references(() => t_timeSlots.id, { onDelete: "cascade" })
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

export const t_coachLessonCoaches = pgTable(
  "t_coach_lesson_coaches",
  {
    coachLessonId: uuid("coach_lesson_id")
      .references(() => t_coachLessons.id)
      .notNull(),
    coachId: uuid("coach_id")
      .references(() => t_users.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.coachLessonId, table.coachId] })],
);

export const t_coachLessonStudents = pgTable(
  "t_coach_lesson_students",
  {
    coachLessonId: uuid("coach_lesson_id")
      .references(() => t_coachLessons.id)
      .notNull(),
    studentId: uuid("student_id")
      .references(() => t_users.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.coachLessonId, table.studentId] })],
);

export const lessonsRelations = relations(t_coachLessons, ({ one, many }) => ({
  timeSlot: one(t_timeSlots, {
    fields: [t_coachLessons.timeSlotId],
    references: [t_timeSlots.id],
  }),
  students: many(t_coachLessonStudents),
  coaches: many(t_coachLessonCoaches),
}));

export const coachLessonCoachesRelations = relations(t_coachLessonCoaches, ({ one, many }) => ({
  coachLesson: one(t_coachLessons, {
    fields: [t_coachLessonCoaches.coachLessonId],
    references: [t_coachLessons.id],
  }),
  coach: one(t_users, {
    fields: [t_coachLessonCoaches.coachId],
    references: [t_users.id],
  }),
}));

export const coachLessonStudentsRelations = relations(t_coachLessonStudents, ({ one, many }) => ({
  coachLesson: one(t_coachLessons, {
    fields: [t_coachLessonStudents.coachLessonId],
    references: [t_coachLessons.id],
  }),
  student: one(t_users, {
    fields: [t_coachLessonStudents.studentId],
    references: [t_users.id],
  }),
}));
