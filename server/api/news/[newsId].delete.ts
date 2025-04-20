import { eq } from "drizzle-orm";
import { t_news } from "~/server/database/schema";
import { H3Error } from "h3";
import consola from "consola";

defineRouteMeta({
  openAPI: {
    tags: ["news"],
    description: "刪除最新消息",
    parameters: [
      {
        in: "path",
        name: "newsId",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "成功刪除消息",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string" },
                msg: { type: "string" },
                data: { type: "null" },
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
    const user = event.context.currentUser;
    if (!user || !user.roles.includes("admin")) {
      throw createError({
        statusCode: 403,
        message: "無權限",
      });
    }

    const newsId = getRouterParam(event, "newsId");
    if (!newsId) {
      throw createError({
        statusCode: 400,
        message: "newsId 是必填參數",
      });
    }

    const db = useDb();
    const existingNews = await db.query.t_news.findFirst({
      where: eq(t_news.id, newsId),
    });
    if (!existingNews) {
      throw createError({
        statusCode: 404,
        message: "消息不存在",
      });
    }

    await db.delete(t_news).where(eq(t_news.id, newsId));

    return {
      code: "success",
      msg: "刪除成功",
      data: null,
    };
  } catch (error: any) {
    consola.error(error);
    if (error instanceof H3Error) {
      setResponseStatus(event, error.statusCode);
      return {
        code: "error",
        msg: error.message,
        data: null,
        details: error.message,
      };
    }
    setResponseStatus(event, 500);
    return {
      code: "error",
      msg: "刪除失敗",
      data: null,
      details: error.message,
    };
  }
});
