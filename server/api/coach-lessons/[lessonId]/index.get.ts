import { between, eq, lte, desc, ilike } from "drizzle-orm";
import {
  t_coachLessonCoaches,
  t_coachLessons,
  t_timeSlots,
  t_users,
} from "~/server/database/schema";
import consola from "consola";
import { z } from "zod";

const querySchema = z.object({
  lessonId: z.string().min(1, "lessonId 是必填參數").describe("lesson Id"),
});

defineRouteMeta({
  openAPI: {
    tags: ["lessons"],
    description: "獲取教練課程",
    parameters: [
      {
        in: "query",
        name: "lessonId",
        schema: {
          type: "string",
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
                    properties: {},
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
  const query = {
    lessonId: getRouterParam(event, "lessonId"),
  };
  try {
    const db = useDb();
    const { lessonId } = querySchema.parse(query);

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
        coaches: {
          with: {
            coach: true,
          },
        },
        timeSlot: {
          with: {
            court: true,
          },
        },
      },
    });

    if (!lesson) {
      setResponseStatus(event, 404);
      return {
        code: "error",
        msg: "教練課程不存在",
        data: null,
      };
    }

    const lessonData = {
      ...lesson,
      students: lesson.students.map((student) => student.student),
      coaches: lesson.coaches.map((coach) => coach.coach),
    };

    return {
      code: "success",
      msg: "成功",
      data: lessonData,
    };
  } catch (error: any) {
    return {
      code: "error",
      msg: "獲取教練課程失敗",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
