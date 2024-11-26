import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { useUUID } from "../../../utils/uuid";

export const t_roles = pgTable("t_roles", {
  id: varchar("id", { length: 8 })
    .primaryKey()
    .$defaultFn(() => useUUID().shortUUID()),
  name: text("name").notNull().unique(), // 角色名稱 (如 admin, user, superadmin)
  description: text("description"), // 角色描述
});
