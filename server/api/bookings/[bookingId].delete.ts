// /server/api/bookings/[bookingId].delete.ts

import { defineEventHandler } from "h3";
import { useDb } from "~/server/utils/db";
import { t_bookings, t_timeSlots } from "~/server/database/schema";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["bookings"],
    description: "刪除預訂",
    parameters: [
      {
        in: "path",
        name: "bookingId",
        required: true,
        schema: {
          type: "string",
        },
        description: "要刪除的預訂ID",
      },
    ],
    responses: {
      200: {
        description: "成功刪除預訂",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string" },
                msg: { type: "string" },
                data: {
                  type: "object",
                  nullable: true,
                },
              },
            },
          },
        },
      },
      403: {
        description: "未授權刪除",
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
  const db = useDb();
  const bookingId = getRouterParam(event, "bookingId");

  if (!bookingId) {
    setResponseStatus(event, 400);
    return {
      code: "error",
      msg: "缺少預訂ID",
      data: [],
    };
  }

  try {
    // First, check if the booking exists and belongs to the current user
    const existingBooking = await db.query.t_bookings.findFirst({
      where: eq(t_bookings.id, bookingId),
      columns: {
        timeSlotId: true,
        userId: true,
      },
    });

    // Check if booking exists
    if (!existingBooking) {
      setResponseStatus(event, 404);
      return {
        code: "error",
        msg: "找不到指定的預訂",
        data: [],
      };
    }

    // Check if the user has permission to delete
    // Admin can delete any booking, user can only delete their own
    if (
      existingBooking.userId !== event.context.currentUser.id &&
      !event.context.currentUser.roles.includes("admin")
    ) {
      setResponseStatus(event, 403);
      return {
        code: "error",
        msg: "無權刪除此預訂",
        data: [],
      };
    }

    // Delete the booking
    await db.delete(t_bookings).where(eq(t_bookings.id, bookingId));
    await db.delete(t_timeSlots).where(eq(t_timeSlots.id, existingBooking.timeSlotId));

    return {
      code: "success",
      msg: "預訂刪除成功",
      data: null,
    };
  } catch (error: any) {
    console.error("Delete booking error:", error);
    setResponseStatus(event, 500);
    return {
      code: "error",
      msg: "無法刪除預訂",
      data: [],
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
