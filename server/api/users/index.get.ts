import { defineEventHandler } from "h3";
import { useDb } from "~/server/utils/db";
import { t_users, t_userRoles, t_roles } from "~/server/database/schema";
import { eq, sql } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDb();

  try {
    const users = await db
      .select({
        id: t_users.id,
        email: t_users.email,
        name: t_users.name,
        avatar_url: t_users.avatar_url,
        created_at: t_users.created_at,
        updated_at: t_users.updated_at,
        roles: sql`array_agg(${t_roles.id})`,
        roles_name: sql`array_agg(${t_roles.description})`,
      })
      .from(t_users)
      .leftJoin(t_userRoles, eq(t_users.id, t_userRoles.userId))
      .leftJoin(t_roles, eq(t_userRoles.roleId, t_roles.id))
      .groupBy(t_users.id);

    return {
      code: "success",
      msg: "Users fetched successfully",
      data: users,
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: "Failed to fetch users",
    });
  }
});