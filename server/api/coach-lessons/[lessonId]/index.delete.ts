import { between, eq, lte, desc, ilike } from "drizzle-orm";
import {
  t_coachLessonCoaches,
  t_coachLessons,
  t_timeSlots,
  t_users,
} from "~/server/database/schema";
import consola from "consola";
import { z } from "zod";

defineRouteMeta({
  openAPI: {
    tags: ["lessons"],
    description: "刪除教練課程",
    parameters: [
      {
        in: "path",
        name: "lessonId",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: {
      200: {
        description: "成功刪除課程",
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
      setResponseStatus(event, 401);
      return {
        code: "error",
        msg: "未登入",
        data: null,
      };
    }

    // 獲取路由參數中的 lessonId
    const lessonId = getRouterParam(event, "lessonId");
    if (!lessonId) {
      throw createError({
        statusCode: 400,
        message: "lessonId 是必填參數",
      });
    }

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
        message: "您無權刪除此課程",
      });
    }

    // 刪除課程
    await db.delete(t_coachLessonCoaches).where(eq(t_coachLessonCoaches.coachLessonId, lessonId));
    await db.delete(t_coachLessons).where(eq(t_coachLessons.id, lessonId));

    return {
      code: "success",
      msg: "課程刪除成功",
      data: null,
    };
  } catch (error : any) {
    consola.error("課程刪除失敗", error);
    // 其他錯誤
    return {
      code: "error",
      msg: "課程刪除失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
