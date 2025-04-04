import { defineEventHandler } from "h3";
import { useDb } from "~/server/utils/db";
import { t_roles } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
    const db = useDb();

    try {
        const roles = await db.select().from(t_roles);
        return {
            code: "success",
            msg: "角色列表獲取成功",
            data: roles,
        };
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            message: "獲取角色列表失敗",
        });
    }
});