import { pgTable, text, integer, uuid, timestamp, varchar, primaryKey } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { t_userRoles } from "./userRoles";

export const t_users = pgTable("t_users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
});

export const t_userOAuth = pgTable(
  "t_user_oauth",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    user_id: uuid("user_id")
      .notNull()
      .references(() => t_users.id, { onDelete: "cascade" }), // 關聯到 users 表
    provider: text("provider").notNull(), // 例如 'google', 'line', 'discord'
    sub: text("sub").notNull(), // 用戶在該提供者中的唯一 ID（如 Google 的 sub, Line 的 userId）
  },
  // (table) => [primaryKey({ columns: [table.user_id, table.provider] })],
);

// 設置外鍵約束，並關聯用戶表
export const userOAuthRelations = relations(t_userOAuth, ({ one }) => ({
  user: one(t_users, { fields: [t_userOAuth.user_id], references: [t_users.id] }), // 用戶關聯
}));

export const usersRelations = relations(t_users, ({ many }) => ({
  roles: many(t_userRoles),
  oauth: many(t_userOAuth),
}));
