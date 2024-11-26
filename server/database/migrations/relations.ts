import { relations } from "drizzle-orm/relations";
import { tTimeSlots, tBookings, tUsers, tCoachLessons, tCourts, tRoles, tCoachLessonCoaches, tUserRoles } from "./schema";

export const tBookingsRelations = relations(tBookings, ({one}) => ({
	tTimeSlot: one(tTimeSlots, {
		fields: [tBookings.timeSlotId],
		references: [tTimeSlots.id]
	}),
	tUser: one(tUsers, {
		fields: [tBookings.userId],
		references: [tUsers.id]
	}),
}));

export const tTimeSlotsRelations = relations(tTimeSlots, ({one, many}) => ({
	tBookings: many(tBookings),
	tCoachLessons: many(tCoachLessons),
	tCourt: one(tCourts, {
		fields: [tTimeSlots.courtId],
		references: [tCourts.id]
	}),
}));

export const tUsersRelations = relations(tUsers, ({one, many}) => ({
	tBookings: many(tBookings),
	tRole: one(tRoles, {
		fields: [tUsers.roleId],
		references: [tRoles.id]
	}),
	tCoachLessonCoaches: many(tCoachLessonCoaches),
	tUserRoles: many(tUserRoles),
}));

export const tCoachLessonsRelations = relations(tCoachLessons, ({one, many}) => ({
	tTimeSlot: one(tTimeSlots, {
		fields: [tCoachLessons.timeSlotId],
		references: [tTimeSlots.id]
	}),
	tCoachLessonCoaches: many(tCoachLessonCoaches),
}));

export const tCourtsRelations = relations(tCourts, ({many}) => ({
	tTimeSlots: many(tTimeSlots),
}));

export const tRolesRelations = relations(tRoles, ({many}) => ({
	tUsers: many(tUsers),
	tUserRoles: many(tUserRoles),
}));

export const tCoachLessonCoachesRelations = relations(tCoachLessonCoaches, ({one}) => ({
	tUser: one(tUsers, {
		fields: [tCoachLessonCoaches.coachId],
		references: [tUsers.id]
	}),
	tCoachLesson: one(tCoachLessons, {
		fields: [tCoachLessonCoaches.coachLessonId],
		references: [tCoachLessons.id]
	}),
}));

export const tUserRolesRelations = relations(tUserRoles, ({one}) => ({
	tRole: one(tRoles, {
		fields: [tUserRoles.roleId],
		references: [tRoles.id]
	}),
	tUser: one(tUsers, {
		fields: [tUserRoles.userId],
		references: [tUsers.id]
	}),
}));