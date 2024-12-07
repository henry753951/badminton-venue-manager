import { z } from "zod";
import { H3Error } from "h3";
import consola from "consola";
import { format, set } from "date-fns";
import { t_coachLessonStudents } from "~/server/database/schema";
defineRouteMeta({
  openAPI: {
    tags: ["lessons"],
    description: "報名教練課程",
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
        description: "成功報名課程",
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

    const studentLessons_ = await db.query.t_coachLessonStudents.findMany({
      where(table, { eq }) {
        return eq(table.studentId, user.id);
      },
      with: {
        coachLesson: {
          with: {
            timeSlot: true,
          },
        },
      },
    });
    const studentLessons = studentLessons_.map((studentLesson) => studentLesson.coachLesson);

    const lesson = await db.query.t_coachLessons.findFirst({
      where(table, { eq }) {
        return eq(table.id, lessonId);
      },
      with: {
        students: {
          with: {
            student: true,
          },
        },
        timeSlot: true,
      },
    });

    if (!lesson) {
      throw createError({
        statusCode: 200,
        message: "課程不存在",
      });
    }

    // 檢查是否已經報名
    if (studentLessons.some((studentLesson) => studentLesson.id === lesson.id)) {
      throw createError({
        statusCode: 200,
        message: "已報名課程",
      });
    }

    // 檢查是否已滿
    const isFull = lesson.students.length >= lesson.capacity;

    // 檢查是否已過報名時間
    const now = new Date();
    const lessonDate = format(lesson.timeSlot.date, "yyyy-MM-dd");
    const signupEnd = new Date(`${lessonDate}T${lesson.timeSlot.endTime}`);

    if (now > signupEnd) {
      throw createError({
        statusCode: 200,
        message: "報名時間已過",
      });
    }

    // 檢查是否報名其他課程
    // TODO:

    // 執行報名
    await db.insert(t_coachLessonStudents).values({
      coachLessonId: lesson.id,
      studentId: user.id,
    });

    return {
      code: "success",
      msg: "報名課程成功",
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
      msg: "更新課程失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
