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
    const startDate = filter.startDate ? new Date(filter.startDate) : undefined;
    const endDate = filter.endDate ? new Date(filter.endDate) : undefined;

    const db = useDb();

    const lessons = await db.query.t_coachLessons.findMany({
      where: filter.name ? ilike(t_coachLessons.title, `%${filter.name}%`) : undefined,
      with: {
        timeSlot: {
          with: {
            court: true,
          },
        },
        coaches: {
          where: userId ? eq(t_coachLessonCoaches.coachId, userId) : undefined,
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
    });

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
      });

    return {
      code: "success",
      msg: "成功",
      data: lessonsData,
    };
  } catch (error: any) {
    return {
      code: "error",
      msg: "獲取教練課程失敗",
      data: [],
      details: Object.keys(error).length ? error : error.message,
    };
  }
});
