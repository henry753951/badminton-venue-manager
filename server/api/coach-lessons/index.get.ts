import { between, eq, lte, desc, ilike } from "drizzle-orm";
import {
  t_coachLessonCoaches,
  t_coachLessons,
  t_timeSlots,
  t_users,
} from "~/server/database/schema";
import consola from "consola";
import { z } from "zod";
import { H3Error } from "h3";

const querySchema = z.object({
  userId: z.string().min(1, "userId 是必填參數").describe("教練ID").optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate 必須是有效的 YYYY-MM-DD 格式")
    .optional()
    .describe("開始日期"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "startDate 必須是有效的 YYYY-MM-DD 格式")
    .optional()
    .describe("結束日期"),
  courtId: z.string().optional(),
  name: z.string().optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["lessons"],
    description: "獲取教練課程",
    parameters: [
      {
        in: "query",
        name: "userId",
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "name",
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "startDate",
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "endDate",
        schema: {
          type: "string",
        },
      },
      {
        in: "query",
        name: "courtId",
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
  const query = getQuery(event);
  try {
    const { userId: userId_, ...filter } = querySchema.parse(query);
    const userId = userId_ === "me" ? event.context.currentUser?.id : userId_;

    if (userId_ === "me" && !event.context.currentUser) {
      throw createError({
        statusCode: 401,
        message: "未登入",
      });
    }

    const startDate = filter.startDate ? new Date(filter.startDate) : undefined;
    const endDate = filter.endDate ? new Date(filter.endDate) : undefined;

    const db = useDb();

    const lessons_ = await db.query.t_coachLessonCoaches.findMany({
      where: userId ? eq(t_coachLessonCoaches.coachId, userId) : undefined,
      with: {
        coachLesson: {
          with: {
            timeSlot: {
              with: {
                court: true,
              },
            },
            coaches: {
              with: {
                coach: {
                  columns: {
                    id: true,
                    name: true,
                    avatar_url: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const lessons = lessons_?.map((lesson) => lesson.coachLesson);

    const lessonsData = lessons
      .map((lesson) => {
        return {
          ...lesson,
          coaches: lesson.coaches.map((coach) => {
            return {
              id: coach.coach.id,
              name: coach.coach.name,
              avatar_url: coach.coach.avatar_url,
              email: coach.coach.email,
            };
          }),
        };
      })
      .filter((lesson) => {
        if (startDate && endDate)
          if (startDate <= lesson.timeSlot.date && endDate >= lesson.timeSlot.date) return true;
        if (!startDate && endDate) if (endDate >= lesson.timeSlot.date) return true;
        if (startDate && !endDate) if (startDate <= lesson.timeSlot.date) return true;
        if (!startDate && !endDate) return true;
        return false;
      })
      .filter((lesson) => {
        // name
        if (filter.name) {
          if (lesson.title.includes(filter.name)) return true;
          return false;
        }
        // courtId
        if (filter.courtId) {
          if (lesson.timeSlot.courtId === filter.courtId) return true;
          return false;
        }
        return true;
      })
      .filter((lesson, index, self) => self.findIndex((t) => t.id === lesson.id) === index);

    return {
      code: "success",
      msg: "成功",
      data: lessonsData,
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
      msg: "未知錯誤",
      data: null,
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
