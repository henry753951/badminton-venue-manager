import { defineEventHandler, getRouterParam } from "h3";
import { useDb } from "~/server/utils/db";
import { t_bookings, t_timeSlots } from "~/server/database/schema";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["bookings"],
    description: "使用時間槽ID刪除預訂和相關時間槽",
    parameters: [
      {
        in: "path",
        name: "timeSlotId",
        required: true,
        schema: {
          type: "string",
        },
        description: "要刪除的時間槽ID",
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
                data: { type: "object", nullable: true },
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
      404: {
        description: "找不到相關預訂",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                code: { type: "string" },
                msg: { type: "string" },
                data: { type: "object", nullable: true },
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
  const timeSlotId = getRouterParam(event, "timeSlotId");

  // 檢查用戶是否登入
  if (!event.context.currentUser) {
    setResponseStatus(event, 403);
    return {
      code: "error",
      data: null,
      msg: "請先登入",
    };
  }

  // 檢查 timeSlotId 是否存在
  if (!timeSlotId) {
    setResponseStatus(event, 400);
    return {
      code: "error",
      msg: "缺少時間槽ID",
      data: null,
    };
  }

  try {
    // 查找時間槽及其關聯的預訂
    const timeSlot = await db.query.t_timeSlots.findFirst({
      where: eq(t_timeSlots.id, timeSlotId),
      with: {
        "booking": true
      },
    });

    // 檢查時間槽和預訂是否存在
    if (!timeSlot || !timeSlot.booking) {
      setResponseStatus(event, 404);
      return {
        code: "error",
        msg: "找不到與此時間槽關聯的預訂",
        data: null,
      };
    }

    // 假設一個時間槽只對應一個預訂，取第一個預訂
    const booking = timeSlot.booking;

    // 檢查權限：用戶必須是預訂擁有者或管理員
    if (
      !event.context.currentUser.roles.includes("admin")
    ) {
      setResponseStatus(event, 403);
      return {
        code: "error",
        msg: "無權刪除此預訂",
        data: null,
      };
    }

    // 執行刪除操作
    await db.delete(t_bookings).where(eq(t_bookings.id, booking.id));
    await db.delete(t_timeSlots).where(eq(t_timeSlots.id, timeSlotId));

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
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});