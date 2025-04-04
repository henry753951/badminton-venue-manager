import { pgTable, foreignKey, uuid, unique, text, timestamp, integer, uniqueIndex, varchar, check, date, time, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const tBookings = pgTable("t_bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	timeSlotId: uuid("time_slot_id").notNull(),
}, (table) => {
	return {
		tBookingsTimeSlotIdTTimeSlotsIdFk: foreignKey({
			columns: [table.timeSlotId],
			foreignColumns: [tTimeSlots.id],
			name: "t_bookings_time_slot_id_t_time_slots_id_fk"
		}).onDelete("cascade"),
		tBookingsUserIdTUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [tUsers.id],
			name: "t_bookings_user_id_t_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const tCoachLessons = pgTable("t_coach_lessons", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	timeSlotId: uuid("time_slot_id").notNull(),
	title: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }),
	capacity: integer().default(10).notNull(),
}, (table) => {
	return {
		tCoachLessonsTimeSlotIdTTimeSlotsIdFk: foreignKey({
			columns: [table.timeSlotId],
			foreignColumns: [tTimeSlots.id],
			name: "t_coach_lessons_time_slot_id_t_time_slots_id_fk"
		}).onDelete("cascade"),
		tCoachLessonsTimeSlotIdUnique: unique("t_coach_lessons_time_slot_id_unique").on(table.timeSlotId),
	}
});

export const tCourts = pgTable("t_courts", {
	id: varchar({ length: 8 }).primaryKey().notNull(),
	name: text().notNull(),
	location: text().notNull(),
	imageUrl: text("image_url"),
}, (table) => {
	return {
		nameIdx: uniqueIndex("nameIdx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	}
});

export const tRoles = pgTable("t_roles", {
	id: varchar({ length: 8 }).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => {
	return {
		tRolesNameUnique: unique("t_roles_name_unique").on(table.name),
	}
});

export const tTimeSlots = pgTable("t_time_slots", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	courtId: varchar("court_id", { length: 8 }).notNull(),
	date: date().notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }),
	type: text().notNull(),
}, (table) => {
	return {
		tTimeSlotsCourtIdTCourtsIdFk: foreignKey({
			columns: [table.courtId],
			foreignColumns: [tCourts.id],
			name: "t_time_slots_court_id_t_courts_id_fk"
		}),
		typeCheck: check("type_check", sql`type = ANY (ARRAY['lesson'::text, 'normal'::text])`),
	}
});

export const tUserOauth = pgTable("t_user_oauth", {
	userId: uuid("user_id").notNull(),
	provider: text().notNull(),
	sub: text().notNull(),
	id: uuid().defaultRandom().primaryKey().notNull(),
}, (table) => {
	return {
		tUserOauthUserIdTUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [tUsers.id],
			name: "t_user_oauth_user_id_t_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const tUsers = pgTable("t_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { precision: 3, mode: 'string' }),
}, (table) => {
	return {
		tUsersEmailUnique: unique("t_users_email_unique").on(table.email),
	}
});

export const tCoachLessonCoaches = pgTable("t_coach_lesson_coaches", {
	coachLessonId: uuid("coach_lesson_id").notNull(),
	coachId: uuid("coach_id").notNull(),
}, (table) => {
	return {
		tCoachLessonCoachesCoachIdTUsersIdFk: foreignKey({
			columns: [table.coachId],
			foreignColumns: [tUsers.id],
			name: "t_coach_lesson_coaches_coach_id_t_users_id_fk"
		}),
		tCoachLessonCoachesCoachLessonIdTCoachLessonsIdFk: foreignKey({
			columns: [table.coachLessonId],
			foreignColumns: [tCoachLessons.id],
			name: "t_coach_lesson_coaches_coach_lesson_id_t_coach_lessons_id_fk"
		}),
		tCoachLessonCoachesCoachLessonIdCoachIdPk: primaryKey({ columns: [table.coachLessonId, table.coachId], name: "t_coach_lesson_coaches_coach_lesson_id_coach_id_pk"}),
	}
});

export const tCoachLessonStudents = pgTable("t_coach_lesson_students", {
	coachLessonId: uuid("coach_lesson_id").notNull(),
	studentId: uuid("student_id").notNull(),
}, (table) => {
	return {
		tCoachLessonStudentsCoachLessonIdTCoachLessonsIdFk: foreignKey({
			columns: [table.coachLessonId],
			foreignColumns: [tCoachLessons.id],
			name: "t_coach_lesson_students_coach_lesson_id_t_coach_lessons_id_fk"
		}),
		tCoachLessonStudentsStudentIdTUsersIdFk: foreignKey({
			columns: [table.studentId],
			foreignColumns: [tUsers.id],
			name: "t_coach_lesson_students_student_id_t_users_id_fk"
		}),
		tCoachLessonStudentsCoachLessonIdStudentIdPk: primaryKey({ columns: [table.coachLessonId, table.studentId], name: "t_coach_lesson_students_coach_lesson_id_student_id_pk"}),
	}
});

export const tUserRoles = pgTable("t_user_roles", {
	userId: uuid("user_id").notNull(),
	roleId: varchar("role_id", { length: 8 }).notNull(),
}, (table) => {
	return {
		tUserRolesRoleIdTRolesIdFk: foreignKey({
			columns: [table.roleId],
			foreignColumns: [tRoles.id],
			name: "t_user_roles_role_id_t_roles_id_fk"
		}).onDelete("cascade"),
		tUserRolesUserIdTUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [tUsers.id],
			name: "t_user_roles_user_id_t_users_id_fk"
		}).onDelete("cascade"),
		tUserRolesUserIdRoleIdPk: primaryKey({ columns: [table.userId, table.roleId], name: "t_user_roles_user_id_role_id_pk"}),
	}
});
