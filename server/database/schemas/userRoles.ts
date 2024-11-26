import {
  pgTable,
  integer,
  primaryKey,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { t_users } from "./users";
import { t_roles } from "./roles";

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
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })]
);
