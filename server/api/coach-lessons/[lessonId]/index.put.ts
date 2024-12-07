import { between, eq, lte, desc, ilike } from "drizzle-orm";
import { H3Error } from "h3";
import {
  t_coachLessonCoaches,
  t_coachLessons,
  t_timeSlots,
  t_users,
} from "~/server/database/schema";
import consola from "consola";
import { z } from "zod";

// 定義更新課程的驗證 Schema
const updateLessonSchema = z.object({
  title: z.string().min(1, "標題不能為空").optional(),
  description: z.string().optional(),
  timeSlotId: z.string().optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["lessons"],
    description: "更新教練課程",
    parameters: [
      {
        in: "path",
        name: "lessonId",
        required: true,
        schema: { type: "string" },
      },
    ],
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              timeSlotId: { type: "string" },
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: "成功更新課程",
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
    },
  },
});

export default defineEventHandler(async (event) => {
  try {
    // 獲取當前登入用戶
    const user = event.context.currentUser;
    if (!user) {
      throw createError({
        statusCode: 401,
        message: "未登入",
      });
    }

    // 獲取路由參數中的 lessonId
    const lessonId = getRouterParam(event, "lessonId");
    if (!lessonId) {
      throw createError({
        statusCode: 400,
        message: "lessonId 是必填參數",
      });
    }

    // 解析請求體
    const body = await readValidatedBody(event, (body) => updateLessonSchema.parse(body));

    const db = useDb();

    // 查詢課程，確認課程是否存在且用戶有權限修改
    const existingLesson = await db.query.t_coachLessons.findFirst({
      where(table, { eq }) {
        return eq(table.id, lessonId);
      },
      with: {
        coaches: {
          with: {
            coach: true,
          },
        },
      },
    });

    // 權限檢查：
    // 1. 課程不存在
    if (!existingLesson) {
      throw createError({
        statusCode: 404,
        message: "課程不存在",
      });
    }

    // 2. 檢查是否為管理員或課程教練
    const isAdmin = user.roles.includes("admin");
    const isCoach = existingLesson.coaches.some((coachLesson) => coachLesson.coach.id === user.id);

    if (!isAdmin && !isCoach) {
      throw createError({
        statusCode: 403,
        message: "您無權修改此課程",
      });
    }

    // 執行更新
    const updatedLesson = await db
      .update(t_coachLessons)
      .set({
        title: body.title,
        description: body.description,
        timeSlotId: body.timeSlotId,
        updated_at: new Date(),
      })
      .where(eq(t_coachLessons.id, lessonId))
      .returning();

    return {
      code: "success",
      msg: "課程更新成功",
      data: updatedLesson[0],
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
      msg: "更新課程失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
