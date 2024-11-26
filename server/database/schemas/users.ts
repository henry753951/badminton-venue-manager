import {
  pgTable,
  text,
  integer,
  uuid,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { t_roles } from "./roles";
import { t_userRoles } from "./userRoles";

export const t_users = pgTable("t_users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"), // for local auth
  name: text("name"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
});

export const usersRelations = relations(t_users, ({ many }) => ({
  roles: many(t_userRoles, { relationName: "userRoles" }),
}));
