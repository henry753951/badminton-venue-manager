import { and, ilike } from "drizzle-orm";
import { t_courts } from "~/server/database/schema";

defineRouteMeta({
  openAPI: {
    tags: ["courts"],
    description: "查詢球場",
    parameters: [
      {
        in: "query",
        name: "name",
        description: "球場名稱搜尋",
        required: false,
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "location",
        description: "球場地點搜尋",
        required: false,
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
                  type: "array",
                  items: {
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
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    const { name, location } = getQuery(event) as {
      name: string;
      location: string;
    };

    const courts = await db
      .select()
      .from(t_courts)
      .where(
        and(
          name ? ilike(t_courts.name, `%${name}%`) : undefined,
          location ? ilike(t_courts.location, `%${location}%`) : undefined,
        ),
      );

    return {
      code: "success",
      msg: "查詢成功",
      data: courts,
    };
  } catch (error: any) {
    return {
      code: "error",
      msg: "查詢失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
