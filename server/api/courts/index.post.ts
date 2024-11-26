// /server/api/courts/index.post.ts

import { defineEventHandler, readBody } from "h3";
import { useDb } from "~/server/utils/db";
import { t_courts } from "~/server/database/schema";
import { createInsertSchema } from "drizzle-zod";

defineRouteMeta({
  openAPI: {
    tags: ["courts"],
    description: "建立新球場",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "球場名稱",
              },
              location: {
                type: "string",
                description: "球場地點",
              },
            },
            required: ["name", "location"],
          },
        },
      },
    },
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
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    const body = await readBody(event);
    const { name, location } = body as {
      name: string;
      location: string;
    };

    // Schema validation for inserting into `t_courts`
    const t_courts_schema = createInsertSchema(t_courts);
    const t_courts_values = t_courts_schema.parse({
      name: name || null,
      location: location || null,
    });

    // Insert the new court into the database
    const [newCourt] = await db
      .insert(t_courts)
      .values(t_courts_values)
      .returning();

    return {
      code: "success",
      msg: "球場創建成功",
      data: newCourt,
    };
  } catch (error: any) {
    if (
      error
        .toString()
        .includes("duplicate key value violates unique constraint")
    ) {
      return {
        code: "error",
        msg: "球場名稱已存在",
      };
    }
    return {
      code: "error",
      msg: "創建球場失敗",
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
