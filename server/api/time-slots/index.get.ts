import { defineEventHandler } from "h3";
import { and, eq, between } from "drizzle-orm";
import { t_timeSlots } from "~/server/database/schema";
import { useDb } from "~/server/utils/db";
import { getQuery } from "h3";
import { z } from "zod";

const querySchema = z.object({
  court_id: z.string().min(1, "court_id 是必填參數").describe("球場ID"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate 必須是有效的 YYYY-MM-DD 格式")
    .describe("開始日期"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "endDate 必須是有效的 YYYY-MM-DD 格式")
    .describe("結束日期"),
});

defineRouteMeta({
  openAPI: {
    tags: ["timeSlots"],
    description: "查詢球場的時間段佔用情況",
    parameters: [
      {
        in: "query",
        name: "court_id",
        description: "球場ID",
        required: true,
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "startDate",
        description: "開始日期 (格式：YYYY-MM-DD)",
        required: true,
        schema: {
          type: "string",
          format: "date",
        },
      },
      {
        in: "query",
        name: "endDate",
        description: "結束日期 (格式：YYYY-MM-DD)",
        required: true,
        schema: {
          type: "string",
          format: "date",
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
                code: { type: "string" },
                msg: { type: "string" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", format: "date" },
                      timeSlots: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            startTime: { type: "string", format: "time" },
                            endTime: { type: "string", format: "time" },
                            type: { type: "string" },
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
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    const db = useDb();

    const queryParams = querySchema.parse(getQuery(event));
    const { court_id, startDate, endDate } = queryParams;

    // 將日期字串轉換為 Date 型別
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 查詢資料庫中符合條件的時段資料
    const timeSlots = await db
      .select()
      .from(t_timeSlots)
      .where(
        and(
          eq(t_timeSlots.courtId, court_id),
          between(t_timeSlots.date, start, end)
        )
      )
      .orderBy(t_timeSlots.date, t_timeSlots.startTime);
    // 整理結果，將時間段按日期分組
    const dataMap = new Map<string, { date: string; timeSlots: any[] }>();

    for (const slot of timeSlots) {
      const dateStr = slot.date.toISOString().split("T")[0]; // 提取日期部分
      if (!dataMap.has(dateStr)) {
        dataMap.set(dateStr, {
          date: dateStr,
          timeSlots: [],
        });
      }
      dataMap.get(dateStr)?.timeSlots.push({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type,
      });
    }

    const data = Array.from(dataMap.values());

    // 成功回應
    return {
      code: "success",
      msg: "查詢成功",
      data,
    };
  } catch (error: any) {
    // 錯誤處理
    return {
      code: "error",
      msg: "查詢失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
