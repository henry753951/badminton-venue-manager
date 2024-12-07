import { eq } from "drizzle-orm";
import { t_courts } from "~/server/database/schema";
import consola from "consola";
import { H3Error } from "h3";

defineRouteMeta({
  openAPI: {
    tags: ["courts"],
    description: "刪除球場",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string" },
                msg: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    const id = getRouterParam(event, "id");
    if (!id) {
      throw createError({
        statusCode: 400,
        message: "id 是必填參數",
      });
    }
    return await db.transaction(async (db) => {
      await db.delete(t_courts).where(eq(t_courts.id, id));
      return { code: "success", msg: "刪除成功" };
    });
  } catch (error: any) {
    consola.error(error);
    if (error instanceof H3Error) {
      setResponseStatus(event, error.statusCode);
      return {
        code: "error",
        msg: error.message,
        data: null,
        details: Object.keys(error).length ? error : error.message,
      };
    }
    // 其他錯誤
    setResponseStatus(event, 500);
    return {
      code: "error",
      msg: "未知錯誤",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
