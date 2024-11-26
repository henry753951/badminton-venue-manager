// /server/api/bookings/index.get.ts

import { defineEventHandler } from "h3";
import { useDb } from "~/server/utils/db";
import { t_bookings } from "~/server/database/schema";
import { eq } from "drizzle-orm";
defineRouteMeta({
  openAPI: {
    tags: ["bookings"],
    description: "獲取預訂",
    parameters: [],
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
                      date: { type: "string" },
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      court: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const db = useDb();
  try {
    const bookings = await db.query.t_bookings.findMany({
      where: eq(t_bookings.userId, event.context.currentUser.id),
      columns: {
        timeSlotId: false,
        userId: false,
      },
      with: {
        timeSlot: {
          columns: {
            courtId: false,
          },
          with: {
            court: true,
          },
        },
      },
    });
    return {
      code: "success",
      msg: "獲取預訂資料成功",
      data: bookings,
    };
  } catch (error: any) {
    return {
      code: "error",
      msg: "無法獲取預訂資料",
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
