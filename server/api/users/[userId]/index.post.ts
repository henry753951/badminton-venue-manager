import { defineEventHandler, getRouterParam, readBody } from "h3";
import { useDb } from "~/server/utils/db";
import { t_users, t_userRoles } from "~/server/database/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  roles: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
  const db = useDb();
  const userId = getRouterParam(event, "userId");
  const body = await readBody(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "userId 是必填參數",
    });
  }

  const { name, email, roles } = updateSchema.parse(body);

  try {
    await db.transaction(async (trx) => {
      // 更新用戶基本資訊
      if (name || email) {
        await trx
          .update(t_users)
          .set({ name, email })
          .where(eq(t_users.id, userId));
      }

      // 更新用戶角色
      if (roles) {
        await trx.delete(t_userRoles).where(eq(t_userRoles.userId, userId));
        await trx.insert(t_userRoles).values(
          roles.map((roleId) => ({ userId, roleId }))
        );
      }
    });

    return {
      code: "success",
      msg: "用戶已成功更新",
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: "更新用戶失敗",
    });
  }
});