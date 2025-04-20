import { eq } from "drizzle-orm";
import { z } from "zod";
import { t_news } from "~/server/database/schema";
import { H3Error } from "h3";
import consola from "consola";

const updateNewsSchema = z.object({
  title: z.string().min(1, "標題不能為空"),
  summary: z.string().min(1, "摘要不能為空"),
  content: z.string().min(1, "內容不能為空"),
  image_url: z.string().optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["news"],
    description: "更新最新消息",
    parameters: [
      {
        in: "path",
        name: "newsId",
        required: true,
        schema: { type: "string" },
      },
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              content: { type: "string" },
              image_url: { type: "string", nullable: true },
            },
            required: ["title", "summary", "content"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "成功更新消息",
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

    const body = await readValidatedBody(event, (body) => updateNewsSchema.parse(body));
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

    const updatedNews = await db
      .update(t_news)
      .set({
        title: body.title,
        summary: body.summary,
        content: body.content,
        image_url: body.image_url,
      })
      .where(eq(t_news.id, newsId))
      .returning();

    return {
      code: "success",
      msg: "更新成功",
      data: updatedNews[0],
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
      msg: "更新失敗",
      data: null,
      details: error.message,
    };
  }
});
