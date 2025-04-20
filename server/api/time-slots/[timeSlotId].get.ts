import { defineEventHandler, getRouterParam } from "h3";
import { useDb } from "~/server/utils/db";
import { t_bookings, t_timeSlots } from "~/server/database/schema";
import { eq } from "drizzle-orm";

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
        court: true,
        booking: {
          with: {
            user: true,
          },
        },
      },
    });

    // 檢查時間槽和預訂是否存在
    if (!timeSlot) {
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
      !event.context.currentUser.roles.includes("admin") &&
      timeSlot.booking.userId !== event.context.currentUser.id
    ) {
      setResponseStatus(event, 403);
      return {
        code: "error",
        msg: "無權查詢此預訂",
        data: null,
      };
    }

    return {
      code: "success",
      msg: "查詢成功",
      data: {
        timeSlot: {
          id: timeSlot.id,
          court: {
            ...timeSlot.court,
          },
          date: timeSlot.date.toISOString().split("T")[0],
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          type: timeSlot.type,
        },
        booking: {
          id: booking?.id,
          user: {
            ...booking?.user,
          },
        },
      },
    };
  } catch (error) {
    console.error("Error fetching time slot:", error);
    setResponseStatus(event, 500);
    return {
      code: "error",
      msg: "伺服器錯誤",
      data: null,
    };
  }
});
