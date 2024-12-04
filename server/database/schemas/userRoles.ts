import { pgTable, integer, primaryKey, uuid, varchar, text } from "drizzle-orm/pg-core";
import { t_users } from "./users";
import { useUUID } from "../../../utils/uuid";
import { relations } from "drizzle-orm";

export const t_roles = pgTable("t_roles", {
  id: varchar("id", { length: 8 })
    .primaryKey()
    .$defaultFn(() => useUUID().shortUUID()),
  name: text("name").notNull().unique(), // 角色名稱 (如 admin, user, superadmin)
  description: text("description"), // 角色描述
});

export const t_userRoles = pgTable(
  "t_user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => t_users.id, { onDelete: "cascade" }), // 關聯到 users 表
    roleId: varchar("role_id", { length: 8 })
      .notNull()
      .references(() => t_roles.id, { onDelete: "cascade" }), // 關聯到 roles 表
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const userRolesRelations = relations(t_userRoles, ({ one }) => ({
  user: one(t_users, { fields: [t_userRoles.userId], references: [t_users.id] }),
  role: one(t_roles, { fields: [t_userRoles.roleId], references: [t_roles.id] }),
}));
