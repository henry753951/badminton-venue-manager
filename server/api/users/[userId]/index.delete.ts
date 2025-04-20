import { defineEventHandler, getRouterParam } from "h3";
import { useDb } from "~/server/utils/db";
import { t_users } from "~/server/database/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const db = useDb();
  const userId = getRouterParam(event, "userId");

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "userId 是必填參數",
    });
  }

  try {
    await db.delete(t_users).where(eq(t_users.id, userId));
    return {
      code: "success",
      msg: "用戶已成功刪除",
    };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      message: "刪除用戶失敗",
    });
  }
});