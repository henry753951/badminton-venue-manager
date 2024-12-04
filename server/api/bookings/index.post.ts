import { defineEventHandler, readBody } from "h3";
import { useDb } from "~/server/utils/db";
import { t_bookings, t_timeSlots } from "~/server/database/schema";
import { isValidTimeSlot, isStartBeforeEnd, calculateTimeSlots } from "@/utils/validators";
import { and, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期必須是有效的 YYYY-MM-DD 格式"),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, "時間必須是有效的 HH:mm 格式"),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, "時間必須是有效的 HH:mm 格式"),
  courtId: z.string().min(1, "courtId 是必填參數").describe("球場ID"),
});

defineRouteMeta({
  openAPI: {
    tags: ["bookings"],
    description: "創建預訂",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              date: {
                type: "string",
                format: "date",
                description: "日期",
              },
              startTime: {
                type: "string",
                format: "time",
                description: "開始時間",
              },
              endTime: {
                type: "string",
                format: "time",
                description: "結束時間",
              },
              courtId: {
                type: "string",
                description: "球場 ID",
              },
            },
            required: ["date", "startTime", "endTime", "courtId"],
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
                code: { type: "string" },
                msg: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    userId: { type: "string" },
                    timeSlotId: { type: "string" },
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
  const db = useDb();
  const body = await readBody(event);
  if (!event.context.currentUser) {
    setResponseStatus(event, 403);
    return {
      code: "error",
      data: [],
      msg: "請先登入",
    };
  }
  try {
    const { date, startTime, endTime, courtId } = querySchema.parse(body);
    // 啟動事務
    return await db.transaction(async (trx) => {
      // 驗證時間格式
      if (!isValidTimeSlot(startTime) || !isValidTimeSlot(endTime)) {
        throw new Error("開始時間和結束時間必須是30分鐘為單位，例如 09:00, 09:30");
      }

      // 驗證開始時間是否早於結束時間
      if (!isStartBeforeEnd(startTime, endTime)) {
        throw new Error("開始時間必須早於結束時間");
      }

      // 計算所需的時間單位
      const timeSlots = calculateTimeSlots(startTime, endTime);

      // 查找對應的 time_slot_id
      const notAvailableSlots = await trx
        .select()
        .from(t_timeSlots)
        .where(and(eq(t_timeSlots.courtId, courtId), eq(t_timeSlots.date, new Date(date))));

      // 找出不可用的時間段
      const notAvailableTimeSlots = Array.from(
        new Set(
          notAvailableSlots
            .map((slot) => {
              return calculateTimeSlots(slot.startTime, slot.endTime);
            })
            .flat(),
        ),
      );

      // 找出可用的時間段
      const isAvailable = timeSlots.some((slot) => {
        return !notAvailableTimeSlots.includes(slot);
      });

      if (!isAvailable) {
        throw new Error("所選時間不可用");
      }

      // 創建預訂時間段
      const t_timeSlots_schema = createInsertSchema(t_timeSlots);
      const t_timeSlots_values = t_timeSlots_schema.parse({
        courtId: courtId,
        date: new Date(date),
        startTime: startTime,
        endTime: endTime,
        type: "normal",
      });

      const [newTimeSlots] = await trx.insert(t_timeSlots).values(t_timeSlots_values).returning();

      // 創建預訂記錄
      const t_bookings_schema = createInsertSchema(t_bookings);
      const t_bookings_values = t_bookings_schema.parse({
        userId: event.context.currentUser!.id,
        timeSlotId: newTimeSlots.id,
      });

      const [newBookings] = await trx.insert(t_bookings).values(t_bookings_values).returning();

      const currentBookings = await trx
        .select()
        .from(t_timeSlots)
        .where(and(eq(t_timeSlots.courtId, courtId), eq(t_timeSlots.date, new Date(date))));

      // 查看newBookings是否有重疊
      const newBookingTimeSlots = calculateTimeSlots(newTimeSlots.startTime, newTimeSlots.endTime);
      const isOverlap = currentBookings.some((slot) => {
        if (slot.id === newTimeSlots.id) return false;
        const timeSlots = calculateTimeSlots(slot.startTime, slot.endTime);
        return timeSlots.some((slot) => newBookingTimeSlots.includes(slot));
      });
      // 如果有重疊，拋出錯誤
      if (isOverlap) {
        throw new Error("時間段已被預訂");
      }

      // 如果一切成功，返回結果
      return {
        code: "success",
        msg: "預訂成功",
        data: newBookings,
      };
    });
  } catch (error: any) {
    return {
      code: "error",
      msg: "創建預訂失敗",
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
