import { desc } from "drizzle-orm";
import { t_news } from "~/server/database/schema";
import { H3Error } from "h3";
import consola from "consola";

defineRouteMeta({
  openAPI: {
    tags: ["news"],
    description: "獲取所有最新消息",
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
                  type: "array",
                  items: {
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
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    const newsItems = await db.query.t_news.findMany({
      orderBy: desc(t_news.created_at),
    });

    return {
      code: "success",
      msg: "成功",
      data: newsItems,
    };
  } catch (error: any) {
    consola.error(error);
    setResponseStatus(event, 500);
    return {
      code: "error",
      msg: "未知錯誤",
      data: null,
      details: error.message,
    };
  }
});