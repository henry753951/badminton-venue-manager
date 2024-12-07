import { and, eq, ilike } from "drizzle-orm";
import { t_courts } from "~/server/database/schema";
import { createError, H3Error } from "h3";
import consola from "consola";

defineRouteMeta({
  openAPI: {
    tags: ["courts"],
    description: "查詢單個球場",
    parameters: [
      {
        in: "path",
        name: "id",
        description: "球場ID",
        required: true,
        schema: {
          type: "string",
        },
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
                code: {
                  type: "string",
                },
                msg: {
                  type: "string",
                },
                data: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                    },
                    name: {
                      type: "string",
                    },
                    location: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
      },
      404: {
        description: "未找到球場",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                },
                msg: {
                  type: "string",
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
    const { id } = event.context.params as { id: string };

    // 查找球場，根據 ID
    const [court] = await db.select().from(t_courts).where(eq(t_courts.id, id)).limit(1);

    // 如果没有找到对应的球场
    if (!court) {
      throw createError({
        statusCode: 404,
        message: "未找到球場",
      });
    }

    // 返回球場資料
    return {
      code: "success",
      msg: "查詢成功",
      data: court,
    };
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
