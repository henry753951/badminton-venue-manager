import { H3Error } from "h3";
import consola from "consola";
import { t_coachLessonStudents } from "~/server/database/schema";
import { eq } from "drizzle-orm";

defineRouteMeta({
  openAPI: {
    tags: ["lessons"],
    description: "取消報名教練課程",
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
        description: "成功取消報名課程",
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
    const user = event.context.currentUser;
    if (!user) {
      throw createError({
        statusCode: 200,
        message: "請先登入",
      });
    }

    // 獲取路由參數中的 lessonId
    const lessonId = getRouterParam(event, "lessonId");
    if (!lessonId) {
      throw createError({
        statusCode: 200,
        message: "lessonId 是必填參數",
      });
    }

    const db = useDb();

    // 檢查是否已報名該課程
    const studentLesson = await db.query.t_coachLessonStudents.findFirst({
      where(table, { eq, and }) {
        return and(eq(table.coachLessonId, lessonId), eq(table.studentId, user.id));
      },
    });

    if (!studentLesson) {
      throw createError({
        statusCode: 200,
        message: "尚未報名該課程",
      });
    }

    // 執行取消報名
    await db
      .delete(t_coachLessonStudents)
      .where(eq(t_coachLessonStudents.studentId, studentLesson.studentId));

    return {
      code: "success",
      msg: "取消報名成功",
      data: null,
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
      msg: "取消報名失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
