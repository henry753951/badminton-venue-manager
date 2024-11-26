import { eq } from "drizzle-orm";
import { t_courts } from "~/server/database/schema";

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
      throw new Error("缺少 id");
    }
    return await db.transaction(async (db) => {
      await db.delete(t_courts).where(eq(t_courts.id, id));
      return { code: "success", msg: "刪除成功" };
    });
  } catch (error: any) {
    return {
      code: "error",
      msg: "查詢失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
