import { defineEventHandler, readBody } from "h3";
import { useDb } from "~/server/utils/db";
import { t_coachLessonCoaches, t_coachLessons, t_timeSlots } from "~/server/database/schema";
import { isValidTimeSlot, isStartBeforeEnd, calculateTimeSlots } from "@/utils/validators";
import { and, desc, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期必須是有效的 YYYY-MM-DD 格式"),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, "時間必須是有效的 HH:mm 格式"),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/, "時間必須是有效的 HH:mm 格式"),
  courtId: z.string().min(1, "courtId 是必填參數").describe("球場ID"),
  lesson: z.object({
    title: z.string().min(1, "title 是必填參數").describe("課程標題"),
    description: z.string().min(1, "description 是必填參數").describe("課程描述"),
  }),
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
              lesson: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "課程標題",
                  },
                  description: {
                    type: "string",
                    description: "課程描述",
                  },
                },
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
      data: null,
      msg: "請先登入",
    };
  }
  try {
    const { date, startTime, endTime, courtId, lesson } = querySchema.parse(body);
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
        type: "lesson",
      });

      const [newTimeSlots] = await trx.insert(t_timeSlots).values(t_timeSlots_values).returning();

      // 創建課程紀錄
      const t_coachLessons_schema = createInsertSchema(t_coachLessons);
      const t_coachLessons_values = t_coachLessons_schema.parse({
        userId: event.context.currentUser!.id,
        timeSlotId: newTimeSlots.id,
        title: lesson.title,
        description: lesson.description,
      });

      const [newLesson] = await trx
        .insert(t_coachLessons)
        .values(t_coachLessons_values)
        .returning();
      await trx.insert(t_coachLessonCoaches).values({
        coachLessonId: newLesson.id,
        coachId: event.context.currentUser!.id,
      });

      const currentLessons = await trx
        .select()
        .from(t_timeSlots)
        .where(and(eq(t_timeSlots.courtId, courtId), eq(t_timeSlots.date, new Date(date))));

      // 查看newLesson是否有重疊
      const newLessonTimeSlots = calculateTimeSlots(newTimeSlots.startTime, newTimeSlots.endTime);
      const isOverlap = currentLessons.some((slot) => {
        if (slot.id === newTimeSlots.id) return false;
        const timeSlots = calculateTimeSlots(slot.startTime, slot.endTime);
        return timeSlots.some((slot) => newLessonTimeSlots.includes(slot));
      });

      // 如果有重疊，拋出錯誤
      if (isOverlap) {
        throw new Error("時間段已被預訂");
      }

      // 如果一切成功，返回結果
      return {
        code: "success",
        msg: "預訂成功",
        data: newLesson,
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
