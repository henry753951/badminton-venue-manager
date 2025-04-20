import { eq } from "drizzle-orm";
import { t_news } from "~/server/database/schema";
import { H3Error } from "h3";
import consola from "consola";

defineRouteMeta({
  openAPI: {
    tags: ["news"],
    description: "獲取特定最新消息",
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
        description: "成功",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string" },
                msg: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    summary: { type: "string" },
                    content: { type: "string" },
                    image_url: { type: "string", nullable: true },
                    created_at: { type: "string", format: "date" },
                  },
                },
              },
            },
          },
        },
      },
      404: {
        description: "新聞不存在",
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
    const newsId = getRouterParam(event, "newsId");
    if (!newsId) {
      throw createError({
        statusCode: 400,
        message: "newsId 是必填參數",
      });
    }

    const db = useDb();
    const newsItem = await db.query.t_news.findFirst({
      where: eq(t_news.id, newsId),
    });

    if (!newsItem) {
      throw createError({
        statusCode: 404,
        message: "新聞不存在",
      });
    }

    return {
      code: "success",
      msg: "成功",
      data: newsItem,
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
      msg: "未知錯誤",
      data: null,
      details: error.message,
    };
  }
});
